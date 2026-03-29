renderNavbar("Dashboard");
renderFooter();

const tableBody = document.getElementById("tableBody");
const totalProducts = document.getElementById("totalProducts");
const lowStockItems = document.getElementById("lowStockItems");
const totalSuppliers = document.getElementById("totalSuppliers");
const inventoryValue = document.getElementById("inventoryValue");

const summaryCards = document.querySelector(".summary-cards");
const chartContainer = document.querySelector(".inventory-chart .container");
const activitiesContainer = document.querySelector(".activities");
const tableFooter = document.querySelector(".table-footer");

const state = {
	page: 1,
	limit: 5,
	totalCount: 0
};

async function renderDashboard() {
	try {
		const productsResponse = await getData("products");
		const categoriesResponse = await getData("categories");
		const suppliersResponse = await getData("suppliers");
		const stockMovementsResponse = await getData("stockMovements");

		const products = productsResponse.data;
		const categories = categoriesResponse.data;
		const suppliers = suppliersResponse.data;
		const stockMovements = stockMovementsResponse.data;

		renderSummary(products, suppliers);
		renderChart(products, categories);
		renderRecentActivity(products, suppliers, stockMovements);
		renderLowStockTable(products, categories);

	} catch (error) {
		console.error("Failed to render dashboard:", error);
		renderDashboardError();
	}
}

function renderSummary(products, suppliers) {
	const totalProductsCount = products.length;

	const lowStockCount = products.filter(function (product) {
		return product.status === "low_stock" || product.status === "out_of_stock";
	}).length;

	const totalSuppliersCount = suppliers.length;

	const totalInventoryValue = products.reduce(function (total, product) {
		return total + (Number(product.price) * Number(product.quantity));
	}, 0);

	totalProducts.textContent = totalProductsCount;
	lowStockItems.textContent = lowStockCount;
	totalSuppliers.textContent = totalSuppliersCount;
	inventoryValue.innerHTML = `&dollar;${formatNumber(totalInventoryValue)}`;
}

function renderChart(products, categories) {
	if (!chartContainer) return;

	const categoryTotals = categories.map(function (category) {
		const totalQty = products
			.filter(function (product) {
				return String(product.categoryId) === String(category.id);
			})
			.reduce(function (sum, product) {
				return sum + Number(product.quantity);
			}, 0);

		return {
			name: category.name,
			quantity: totalQty
		};
	});

	const maxQty = Math.max(
		...categoryTotals.map(function (item) {
			return item.quantity;
		}),
		1
	);

	chartContainer.innerHTML = categoryTotals
		.map(function (item) {
			const height = Math.max((item.quantity / maxQty) * 180, 10);

			return `
        <div class="chart-col d-flex flex-column justify-content-end align-items-center" style="height: 300px;">
          <div class="level" style="height:${height}px;"></div>
          <small style="margin-top: 8px; text-align: center; line-height: 1.2; min-height: 30px; display: flex; align-items: flex-start; justify-content: center;">
            ${item.name}
          </small>
        </div>
      `;
		})
		.join("");
}

function renderRecentActivity(products, suppliers, stockMovements) {
	if (!activitiesContainer) return;
	if (!stockMovements.length) {
		activitiesContainer.innerHTML = `
      <p>No recent activity available.</p>
    `;
		return;
	}

	const activities = stockMovements
		.slice(-4)
		.reverse()
		.map(function (movement, index) {

			const icons = ["fa-box", "fa-truck", "fa-layer-group", "fa-triangle-exclamation"];
			const iconClasses = ["icon-purple", "icon-green", "icon-yellow", "icon-red"];

			return {
				iconClass: iconClasses[index % iconClasses.length],
				icon: icons[index % icons.length],
				text: movement.title,
				meta: `${movement.createdAt} by ${movement.createdBy}`
			};
		});

	activitiesContainer.innerHTML = activities
		.map(function (activity) {
			return `
        <div class="container d-flex align-items-start">
          <div class="${activity.iconClass} icon d-flex align-items-center justify-content-center">
            <i class="fa-solid ${activity.icon}"></i>
          </div>
          <div class="activity-caption">
            <p>
              ${activity.text}<br>
              <span>${activity.meta}</span>
            </p>
          </div>
        </div>
      `;
		})
		.join("");
}

function renderLowStockTable(products, categories) {
	const flaggedProducts = products.filter(function (product) {
		return product.status === "low_stock" || product.status === "out_of_stock";
	});

	state.totalCount = flaggedProducts.length;

	const start = (state.page - 1) * state.limit;
	const end = start + state.limit;
	const paginatedProducts = flaggedProducts.slice(start, end);

	if (!paginatedProducts.length) {
		tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center">No low stock items found</td>
      </tr>
    `;

		renderLowStockFooter(0, flaggedProducts.length);
		return;
	}

	tableBody.innerHTML = paginatedProducts
		.map(function (product) {
			const category = categories.find(function (cat) {
				return String(cat.id) === String(product.categoryId);
			});

			const categoryName = category ? category.name : "Unknown";
			const stockClass = getStockClass(product.quantity, product.minStock);
			const statusInfo = getStatusInfo(product.status, product.quantity, product.minStock);
			const productIcon = getProductIcon(product.name, categoryName);

			return `
        <tr>
          <td>
            <div class="product-cell">
              <div class="product-icon">
                <i class="fa-solid ${productIcon}"></i>
              </div>
              <div class="product-info">
                <h6>${product.name}</h6>
              </div>
            </div>
          </td>
          <td>${categoryName}</td>
          <td class="${stockClass}">${product.quantity}</td>
          <td>${product.minStock}</td>
          <td><span class="status ${statusInfo.className}">${statusInfo.text}</span></td>
          <td><button class="reorder-btn" data-id="${product.id}">Reorder</button></td>
        </tr>
      `;
		})
		.join("");

	renderLowStockFooter(paginatedProducts.length, flaggedProducts.length);
	attachReorderEvents();
}

function renderLowStockFooter(currentCount, totalCount) {
	if (!tableFooter) return;

	tableFooter.innerHTML = `
    <span>Showing ${currentCount} of ${totalCount} flagged items</span>
    <div class="pagination" id="pagination"></div>
  `;

	const paginationContainer = document.getElementById("pagination");
	renderPagination(paginationContainer, state, rerenderLowStockOnly);
}

async function rerenderLowStockOnly() {
	try {
		const productsResponse = await getData("products");
		const categoriesResponse = await getData("categories");

		renderLowStockTable(productsResponse.data, categoriesResponse.data);
	} catch (error) {
		console.error("Failed to rerender low stock table:", error);
	}
}

function getStatusInfo(status, quantity, minStock) {
	if (status === "out_of_stock" || quantity === 0) {
		return {
			text: "Out of Stock",
			className: "out"
		};
	}

	if (status === "low_stock" || quantity <= minStock) {
		if (quantity <= Math.ceil(minStock / 2)) {
			return {
				text: "Critical",
				className: "critical"
			};
		}

		return {
			text: "Low Stock",
			className: "low"
		};
	}

	return {
		text: "In Stock",
		className: "low"
	};
}

function getProductIcon(productName, categoryName) {
	const name = `${productName} ${categoryName}`.toLowerCase();

	if (name.includes("keyboard")) return "fa-keyboard";
	if (name.includes("mouse")) return "fa-computer-mouse";
	if (name.includes("headset") || name.includes("headphones")) return "fa-headphones";
	if (name.includes("monitor") || name.includes("display")) return "fa-desktop";
	if (name.includes("laptop")) return "fa-laptop";
	if (name.includes("phone") || name.includes("smartphone")) return "fa-mobile-screen";
	if (name.includes("tablet")) return "fa-tablet-screen-button";
	if (name.includes("camera") || name.includes("webcam")) return "fa-camera";
	if (name.includes("printer")) return "fa-print";
	if (name.includes("router")) return "fa-wifi";
	if (name.includes("switch")) return "fa-network-wired";
	if (name.includes("storage") || name.includes("ssd") || name.includes("hdd") || name.includes("flash")) return "fa-hard-drive";
	if (name.includes("chair")) return "fa-chair";
	if (name.includes("desk") || name.includes("table")) return "fa-table";
	if (name.includes("cable")) return "fa-plug";
	if (name.includes("power")) return "fa-bolt";
	return "fa-box";
}

function attachReorderEvents() {
	const reorderButtons = document.querySelectorAll(".reorder-btn");
	reorderButtons.forEach(function (button) {
		button.addEventListener("click", function () {
			const productId = button.dataset.id;
			alert(`Reorder action for product ID: ${productId}`);
		});
	});
}

// ^ Static Events
// function attachStaticEvents() {
// 	const bulkOrderBtn = document.getElementById("bulkOrderBtn");
// 	const viewActivityBtn = document.getElementById("viewActivityBtn");
// 	if (bulkOrderBtn) {
// 		bulkOrderBtn.addEventListener("click", function () {
// 			alert("Bulk order feature will be connected later.");
// 		});
// 	}
// 	if (viewActivityBtn) {
// 		viewActivityBtn.addEventListener("click", function () {
// 			alert("View all activity feature will be connected later.");
// 		});
// 	}
// }

function renderDashboardError() {
	if (summaryCards) {
		summaryCards.innerHTML = `
      <div class="card w-100">
        <h4>Failed to load dashboard data</h4>
        <p>Please make sure json-server is running on port 3000.</p>
      </div>
    `;
	}

	if (chartContainer) {
		chartContainer.innerHTML = `<p class="text-center w-100">Chart unavailable</p>`;
	}

	if (activitiesContainer) {
		activitiesContainer.innerHTML = `<p>No recent activity available.</p>`;
	}

	if (tableBody) {
		tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center">Unable to load low stock items</td>
      </tr>
    `;
	}

	if (tableFooter) {
		tableFooter.innerHTML = "";
	}
}

function formatNumber(number) {
	return Number(number).toLocaleString();
}

renderDashboard();