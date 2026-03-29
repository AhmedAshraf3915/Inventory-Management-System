renderNavbar("InventoryOverview");
renderFooter();

const emptyState = document.getElementById("emptyState");
const inventoryTable = document.getElementById("inventoryTable");
const inventoryBody = document.getElementById("inventoryBody");
const inventorySearch = document.getElementById("inventorySearch");
const inventoryTableInfo = document.getElementById("inventoryTableInfo");
const inventoryPagination = document.getElementById("pagination");
const filterBtn = document.getElementById("inventoryFilterBtn");

const productModal = document.getElementById("productModal");
const addProductBtn = document.getElementById("addProductBtn");
const addFirstBtn = document.getElementById("addFirstBtn");
const modalCloseBtn = document.getElementById("modalClose");
const cancelBtn = document.getElementById("cancelBtn");
const saveOverviewProductBtn = document.getElementById("saveOverviewProduct");

const overviewProductName = document.getElementById("overviewProductName");
const overviewCategory = document.getElementById("overviewCategory");
const overviewSku = document.getElementById("overviewSku");
const overviewQuantity = document.getElementById("overviewQuantity");
const overviewPrice = document.getElementById("overviewPrice");

const exportBtn = document.querySelector(".export-btn");
const tabs = document.querySelectorAll(".inv-tab");

const state = {
	page: 1,
	limit: 5,
	totalCount: 0,
	activeTab: "all",
	search: ""
};

let allProducts = [];
let allCategories = [];

function openOverviewModal() {
	if (!productModal) return;
	productModal.classList.add("show");
}

function closeOverviewModal() {
	if (!productModal) return;
	productModal.classList.remove("show");
	resetModalForm();
}

function resetModalForm() {
	if (overviewProductName) overviewProductName.value = "";
	if (overviewCategory) overviewCategory.value = "";
	if (overviewSku) overviewSku.value = "";
	if (overviewQuantity) overviewQuantity.value = "";
	if (overviewPrice) overviewPrice.value = "";

	clearValidationStyle(overviewProductName);
	clearValidationStyle(overviewCategory);
	clearValidationStyle(overviewSku);
	clearValidationStyle(overviewQuantity);
	clearValidationStyle(overviewPrice);
}

function clearValidationStyle(element) {
	if (!element) return;
	element.style.border = "";
	element.setCustomValidity("");
}

function getCurrentDate() {
	return new Date().toISOString().split("T")[0];
}

function calculateStatus(quantity, minStock) {
	if (quantity === 0) return "out_of_stock";
	if (quantity <= minStock) return "low_stock";
	return "in_stock";
}

function getCategoryName(categoryId) {
	const category = allCategories.find(function (cat) {
		return String(cat.id) === String(categoryId);
	});

	return category ? category.name : "Unknown";
}

function getStatusBadge(product) {
	if (product.status === "out_of_stock" || Number(product.quantity) === 0) {
		return `<span class="badge rounded-pill text-bg-danger">Out of Stock</span>`;
	}

	if (product.status === "low_stock") {
		return `<span class="badge rounded-pill text-bg-warning">Low Stock</span>`;
	}

	if (product.status === "archived") {
		return `<span class="badge rounded-pill text-bg-secondary">Archived</span>`;
	}

	return `<span class="badge rounded-pill text-bg-success">In Stock</span>`;
}

function getStockCellClass(product) {
	return Number(product.quantity) <= Number(product.minStock) ? "text-danger fw-bold" : "fw-bold";
}

function getFilteredProducts(products) {
	let result = [...products];

	if (state.activeTab === "low") {
		result = result.filter(function (product) {
			return product.status === "low_stock";
		});
	} else if (state.activeTab === "out") {
		result = result.filter(function (product) {
			return product.status === "out_of_stock";
		});
	} else if (state.activeTab === "archived") {
		result = result.filter(function (product) {
			return product.status === "archived";
		});
	}
	if (state.search) {
		result = result.filter(function (product) {
			const name = String(product.name || "").toLowerCase();
			const sku = String(product.sku || "").toLowerCase();
			const category = String(getCategoryName(product.categoryId) || "").toLowerCase();

			return (
				name.includes(state.search) ||
				sku.includes(state.search) ||
				category.includes(state.search)
			);
		});
	}

	return result;
}

function paginateArray(array, page, limit) {
	const start = (page - 1) * limit;
	const end = start + limit;
	return array.slice(start, end);
}

function toggleEmptyState(showEmpty) {
	if (!emptyState || !inventoryTable) return;

	if (showEmpty) {
		emptyState.classList.remove("d-none");
		inventoryTable.classList.add("d-none");
	} else {
		emptyState.classList.add("d-none");
		inventoryTable.classList.remove("d-none");
	}
}

async function loadCategoriesIntoModal() {
	const categoriesResponse = await getData("categories");
	allCategories = categoriesResponse.data || [];

	if (!overviewCategory) return;

	overviewCategory.innerHTML = `<option value="">Select Category</option>`;

	overviewCategory.innerHTML += allCategories
		.map(function (category) {
			return `<option value="${category.id}">${category.name}</option>`;
		})
		.join("");
}

function renderInventoryTable(products) {
	if (!inventoryBody) return;

	inventoryBody.innerHTML = products
		.map(function (product) {
			return `
        <tr>
          <td><strong>${product.name}</strong></td>
          <td>${getCategoryName(product.categoryId)}</td>
          <td>${product.sku}</td>
          <td class="${getStockCellClass(product)}">${product.quantity}</td>
          <td>$${Number(product.price).toLocaleString()}</td>
          <td>${getStatusBadge(product)}</td>
          <td>
            <button class="filter-btn delete-product-btn" data-id="${product.id}" type="button">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
		})
		.join("");

	bindDeleteButtons();
}

function renderOverviewFooter(totalCount, currentCount) {
	if (inventoryTableInfo) {
		const start = totalCount === 0 ? 0 : (state.page - 1) * state.limit + 1;
		const end = totalCount === 0 ? 0 : start + currentCount - 1;
		inventoryTableInfo.textContent = `Showing ${start}-${end} of ${totalCount} items`;
	}

	if (inventoryPagination) {
		inventoryPagination.innerHTML = "";
		renderPagination(inventoryPagination, state, renderInventoryOverview);
	}
}

async function renderInventoryOverview() {
	try {
		const productsResponse = await getData("products");
		const categoriesResponse = await getData("categories");

		allProducts = productsResponse.data || [];
		allCategories = categoriesResponse.data || [];

		const filteredProducts = getFilteredProducts(allProducts);
		state.totalCount = filteredProducts.length;

		toggleEmptyState(filteredProducts.length === 0);

		if (filteredProducts.length === 0) {
			inventoryTable.classList.remove("d-none");
			emptyState.classList.add("d-none");

			inventoryBody.innerHTML = `
    <tr>
      <td colspan="7" class="text-center py-5">
        <div class="d-flex flex-column align-items-center gap-3">
          <h5 class="m-0">No matching products found</h5>
          <p class="m-0 text-muted">
            No results for "<strong>${inventorySearch.value.trim()}</strong>".
            Would you like to add a new product or stay on this page?
          </p>
          <div class="d-flex gap-3 mt-2">
            <button type="button" class="add-product-btn" id="searchAddProductBtn">
              <i class="fa-solid fa-plus"></i> Add Product
            </button>
            <button type="button" class="filter-btn" id="stayOnPageBtn">
              Stay Here
            </button>
          </div>
        </div>
      </td>
    </tr>
  `;

			if (inventoryTableInfo) {
				inventoryTableInfo.textContent = "Showing 0 of 0 items";
			}

			if (inventoryPagination) {
				inventoryPagination.innerHTML = "";
			}

			const searchAddProductBtn = document.getElementById("searchAddProductBtn");
			const stayOnPageBtn = document.getElementById("stayOnPageBtn");

			if (searchAddProductBtn) {
				searchAddProductBtn.addEventListener("click", function () {
					openOverviewModal();
				});
			}

			if (stayOnPageBtn) {
				stayOnPageBtn.addEventListener("click", function () {
					inventorySearch.value = "";
					state.search = "";
					state.page = 1;

					renderInventoryOverview();
				});
			}

			return;
		}

		const paginatedProducts = paginateArray(filteredProducts, state.page, state.limit);
		renderInventoryTable(paginatedProducts);
		renderOverviewFooter(filteredProducts.length, paginatedProducts.length);
	} catch (error) {
		console.error("Failed to render inventory overview:", error);
		showOverviewError();
	}
}

function showOverviewError() {
	toggleEmptyState(true);

	if (emptyState) {
		emptyState.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon-wrap">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h3 class="fw-bold mt-4 mb-2">Failed to load inventory</h3>
        <p class="empty-desc">
          Please make sure json-server is running and api.js is included before this file.
        </p>
      </div>
    `;
	}
}

function buildOverviewProductObject() {
	validateInputs(
		/^[A-Za-z0-9\s\-]{3,}$/,
		overviewProductName,
		"Product name must be at least 3 characters"
	);

	validateSelect(overviewCategory);

	validateInputs(
		/^[A-Za-z0-9\-]{3,}$/,
		overviewSku,
		"SKU must contain letters, numbers or -"
	);

	validateInputs(
		/^\d+$/,
		overviewQuantity,
		"Quantity must be a valid number"
	);

	validateInputs(
		/^\d+(\.\d{1,2})?$/,
		overviewPrice,
		"Enter a valid price"
	);

	const allValid =
		overviewProductName.checkValidity() &&
		overviewCategory.checkValidity() &&
		overviewSku.checkValidity() &&
		overviewQuantity.checkValidity() &&
		overviewPrice.checkValidity();

	if (!allValid) return null;

	const quantity = Number(overviewQuantity.value);
	const minStock = 5;

	return {
		name: overviewProductName.value.trim(),
		categoryId: String(overviewCategory.value),
		sku: overviewSku.value.trim(),
		quantity: quantity,
		price: Number(overviewPrice.value),
		minStock: minStock,
		supplierId: "",
		status: calculateStatus(quantity, minStock),
		createdAt: getCurrentDate()
	};
}

async function handleSaveOverviewProduct() {
	const productObject = buildOverviewProductObject();
	if (!productObject) return;

	try {
		await postData("products", productObject);
		closeOverviewModal();
		state.page = 1;
		await renderInventoryOverview();
	} catch (error) {
		console.error("Failed to save product:", error);
		alert("Failed to save product");
	}
}

function bindDeleteButtons() {
	const deleteButtons = document.querySelectorAll(".delete-product-btn");

	deleteButtons.forEach(function (button) {
		button.addEventListener("click", async function () {
			const productId = this.dataset.id;
			const confirmed = confirm("Are you sure you want to delete this product?");
			if (!confirmed) return;

			try {
				await deleteData("products", productId);

				const newTotal = Math.max(state.totalCount - 1, 0);
				const totalPages = getTotalPages(newTotal, state.limit);

				if (state.page > totalPages && totalPages > 0) {
					state.page = totalPages;
				}

				await renderInventoryOverview();
			} catch (error) {
				console.error("Failed to delete product:", error);
				alert("Failed to delete product");
			}
		});
	});
}

function exportInventoryData() {
	const filteredProducts = getFilteredProducts(allProducts);

	if (!filteredProducts.length) {
		alert("No inventory data to export");
		return;
	}

	const rows = filteredProducts.map(function (product) {
		return {
			Product: product.name,
			Category: getCategoryName(product.categoryId),
			SKU: product.sku,
			Stock: product.quantity,
			Price: product.price,
			Status: product.status
		};
	});

	const headers = Object.keys(rows[0]);
	const csv = [
		headers.join(","),
		...rows.map(function (row) {
			return headers
				.map(function (header) {
					return `"${String(row[header]).replace(/"/g, '""')}"`;
				})
				.join(",");
		})
	].join("\n");

	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");

	link.href = url;
	link.download = "inventory-overview.csv";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

function bindEvents() {
	if (addProductBtn) addProductBtn.addEventListener("click", openOverviewModal);
	if (addFirstBtn) addFirstBtn.addEventListener("click", openOverviewModal);
	if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeOverviewModal);
	if (cancelBtn) cancelBtn.addEventListener("click", closeOverviewModal);

	if (productModal) {
		productModal.addEventListener("click", function (e) {
			if (e.target === productModal) {
				closeOverviewModal();
			}
		});
	}

	if (inventorySearch) {
		inventorySearch.addEventListener("input", function () {
			state.search = inventorySearch.value.trim().toLowerCase();
			state.page = 1;
			renderInventoryOverview();
		});
	}

	tabs.forEach(function (tab) {
		tab.addEventListener("click", function () {
			tabs.forEach(function (btn) {
				btn.classList.remove("active");
			});

			this.classList.add("active");
			state.activeTab = this.dataset.tab;
			state.page = 1;
			renderInventoryOverview();
		});
	});

	if (saveOverviewProductBtn) {
		saveOverviewProductBtn.addEventListener("click", handleSaveOverviewProduct);
	}

	if (exportBtn) {
		exportBtn.addEventListener("click", exportInventoryData);
	}
}

async function initInventoryOverview() {
	bindEvents();

	try {
		await loadCategoriesIntoModal();
	} catch (error) {
		console.error("Failed to load categories:", error);
	}

	await renderInventoryOverview();
}

initInventoryOverview();