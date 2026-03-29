renderNavbar("Products");
renderFooter();

// ===============================
// State
// ===============================
const state = {
	page: 1,
	limit: 5,
	totalCount: 0,
	editingId: null
};

// ===============================
// Selectors
// ===============================
const tableBody = document.getElementById("tableBody");
const paginationContainer = document.getElementById("pagination");
const searchByProductName = document.getElementById("searchByProductName");
const formSelect = document.getElementById("formSelect");

const addProductBtn = document.getElementById("addProductBtn");
const exportBtn = document.getElementById("exportBtn");

const modal = document.getElementById("modal");
const modalOverlay = document.getElementById("modalOverlay");
const modalType = document.getElementById("modalType");

const productForm = document.getElementById("productData");
const productName = document.getElementById("productName");
const SKU = document.getElementById("productSKU");
const productPrice = document.getElementById("productPrice");
const categorySelect = document.getElementById("category");
const supplierSelect = document.getElementById("supplier");
const initialQty = document.getElementById("initialQty");
const reorderLevel = document.getElementById("reorderLevel");
const cancelBtn = document.getElementById("cancelBtn");
const saveProduct = document.getElementById("saveProduct");
const sortBtn = document.querySelector('.sorting');


// ===============================
// Helpers
// ===============================
function getCurrentDate() {
	const today = new Date();
	return today.toISOString().split("T")[0];
}

function escapeHTML(value) {
	return String(value)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function resetForm() {
	productForm.reset();
	state.editingId = null;
	modalType.textContent = "Add";

	[
		productName,
		SKU,
		productPrice,
		categorySelect,
		supplierSelect,
		initialQty,
		reorderLevel
	].forEach(function (field) {
		field.setCustomValidity("");
		field.style.border = "";
	});
}

function calculateStatus(quantity, minStock) {
	if (quantity === 0) return "out_of_stock";
	if (quantity <= minStock) return "low_stock";
	return "in_stock";
}

function getStockClass(status) {
	const normalized = String(status || "").toLowerCase();

	if (normalized === "out_of_stock") return "stock-critical";
	if (normalized === "low_stock") return "stock-warning";
	return "stock-normal";
}

function getStatusText(status) {
	const normalized = String(status || "").toLowerCase();

	if (normalized === "in_stock") return "In Stock";
	if (normalized === "low_stock") return "Low Stock";
	if (normalized === "out_of_stock") return "Out of Stock";
	return "Unknown";
}

function getProductIcon(category) {
	const cat = String(category || "").toLowerCase();

	if (cat.includes("accessories")) return "fa-headphones";
	if (cat.includes("displays")) return "fa-desktop";
	if (cat.includes("computers")) return "fa-laptop";
	if (cat.includes("furniture")) return "fa-chair";
	if (cat.includes("office")) return "fa-print";
	if (cat.includes("network")) return "fa-network-wired";
	if (cat.includes("storage")) return "fa-hard-drive";
	if (cat.includes("mobile")) return "fa-mobile-screen";
	if (cat.includes("camera")) return "fa-camera";
	if (cat.includes("power")) return "fa-plug";

	return "fa-box";
}

function filterProductsByStatus(products, filterValue) {
	if (!filterValue) return products;

	return products.filter(function (product) {
		return String(product.status || "").toLowerCase() === filterValue.toLowerCase();
	});
}

// ===============================
// Maps
// ===============================
async function getCategoriesMap() {
	const response = await getData("categories");
	const categories = response.data;

	const map = {};
	categories.forEach(function (cat) {
		map[String(cat.id)] = cat.name;
	});

	return map;
}

async function getSuppliersMap() {
	const response = await getData("suppliers");
	const suppliers = response.data;

	const map = {};
	suppliers.forEach(function (supp) {
		map[String(supp.id)] = supp.name;
	});

	return map;
}

// ===============================
// Select rendering
// ===============================
async function renderCategoriesSelect() {
	const categoriesMap = await getCategoriesMap();

	let html = `<option value="" selected>Select</option>`;
	for (const [id, name] of Object.entries(categoriesMap)) {
		html += `<option value="${escapeHTML(id)}">${escapeHTML(name)}</option>`;
	}

	categorySelect.innerHTML = html;
}

async function renderSuppliersSelect() {
	const suppliersMap = await getSuppliersMap();

	let html = `<option value="" selected>Select</option>`;
	for (const [id, name] of Object.entries(suppliersMap)) {
		html += `<option value="${escapeHTML(id)}">${escapeHTML(name)}</option>`;
	}

	supplierSelect.innerHTML = html;
}

// ===============================
// Validation
// ===============================
function getProductFormData() {
	validateInputs(
		/^[A-Za-z0-9\s]{3,}$/,
		productName,
		"Product name must be at least 3 characters"
	);

	validateInputs(
		/^[A-Za-z0-9-]{3,}$/,
		SKU,
		"SKU must contain letters, numbers or -"
	);

	validateInputs(
		/^\d+(\.\d{1,2})?$/,
		productPrice,
		"Enter a valid price"
	);

	validateInputs(
		/^\d+$/,
		initialQty,
		"Quantity must be a valid number"
	);

	validateInputs(
		/^\d+$/,
		reorderLevel,
		"Reorder level must be a valid number"
	);

	validateSelect(categorySelect);
	validateSelect(supplierSelect);

	const allValid =
		productName.checkValidity() &&
		SKU.checkValidity() &&
		productPrice.checkValidity() &&
		initialQty.checkValidity() &&
		reorderLevel.checkValidity() &&
		categorySelect.checkValidity() &&
		supplierSelect.checkValidity();

	if (!allValid) return null;

	const quantity = Number(initialQty.value);
	const minStock = Number(reorderLevel.value);

	return {
		name: productName.value.trim(),
		sku: SKU.value.trim(),
		categoryId: String(categorySelect.value),
		supplierId: String(supplierSelect.value),
		price: Number(productPrice.value),
		quantity: quantity,
		minStock: minStock,
		status: calculateStatus(quantity, minStock),
		createdAt: getCurrentDate()
	};
}

// ^ Build Product stock movement

function buildAddProductStockMovement(createdProduct) {
	const rawUserName = localStorage.getItem("userName");
	const actor = rawUserName ? JSON.parse(rawUserName) : "Admin";

	return {
		productId: String(createdProduct.id),
		productName: createdProduct.name,
		type: "PRODUCT_ADDED",
		action: "IN",
		quantity: Number(createdProduct.quantity),
		previousQuantity: 0,
		newQuantity: Number(createdProduct.quantity),
		title: `${createdProduct.name} added to inventory`,
		reason: "Initial stock",
		createdAt: new Date().toISOString(),
		createdBy: actor
	};
}

// ===============================
// Form fill for edit
// ===============================
function fillFormWithProduct(product) {
	productName.value = product.name || "";
	SKU.value = product.sku || "";
	productPrice.value = product.price ?? "";
	categorySelect.value = String(product.categoryId ?? "");
	supplierSelect.value = String(product.supplierId ?? "");
	initialQty.value = product.quantity ?? "";
	reorderLevel.value = product.minStock ?? "";
}

// ^ Sort functionality (sort / return original order)
let isSortedByName = false;
let originalProductsOrder = [];

sortBtn.addEventListener("click", async function () {
	const productsResponse = await getData("products");
	let products = productsResponse.data;

	const searchValue = searchByProductName.value.trim().toLowerCase();
	const filterValue = formSelect.value;

	if (searchValue) {
		products = products.filter(function (product) {
			return String(product.name || "")
				.toLowerCase()
				.includes(searchValue);
		});
	}

	products = filterProductsByStatus(products, filterValue);

	if (!isSortedByName) {
		originalProductsOrder = [...products];

		products.sort(function (a, b) {
			return String(a.name || "").localeCompare(String(b.name || ""));
		});

		isSortedByName = true;
	} else {
		products = [...originalProductsOrder];
		isSortedByName = false;
	}

	state.page = 1;
	state.totalCount = products.length;

	const categoryMap = await getCategoriesMap();

	const start = (state.page - 1) * state.limit;
	const end = start + state.limit;
	const paginatedProducts = products.slice(start, end);

	if (!paginatedProducts.length) {
		tableBody.innerHTML = `
			<tr>
				<td colspan="7" style="text-align:center;">No products found</td>
			</tr>
		`;
		renderPagination(paginationContainer, state, renderProducts);
		return;
	}

	tableBody.innerHTML = paginatedProducts
		.map(function (product) {
			const categoryName = categoryMap[String(product.categoryId)] || "Unknown";
			const stockClass = getStockClass(product.status);
			const statusText = getStatusText(product.status);
			const iconClass = getProductIcon(categoryName);

			return `
				<tr>
					<td>
						<div class="product-cell">
							<div class="product-icon">
								<i class="fa-solid ${iconClass}"></i>
							</div>
							<div class="product-info">
								<h6>${escapeHTML(product.name)}</h6>
							</div>
						</div>
					</td>
					<td>${escapeHTML(categoryName)}</td>
					<td>$${Number(product.price).toLocaleString()}</td>
					<td class="${stockClass}">${product.quantity}</td>
					<td class="status ${stockClass}">
						<i class="fa-solid fa-circle"></i> ${statusText}
					</td>
					<td>
						<button class="editProductBtn" data-id="${product.id}">Edit</button>
					</td>
					<td>
						<button class="removeProductBtn" data-id="${product.id}">Remove</button>
					</td>
				</tr>
			`;
		})
		.join("");

	renderPagination(paginationContainer, state, renderProducts);
});

//^ Render products

async function renderProducts() {
	try {
		const productsResponse = await getData("products");
		let products = productsResponse.data;

		const searchValue = searchByProductName.value.trim().toLowerCase();
		const filterValue = formSelect.value;

		if (searchValue) {
			products = products.filter(function (product) {
				return String(product.name || "")
					.toLowerCase()
					.includes(searchValue);
			});
		}

		products = filterProductsByStatus(products, filterValue);

		state.totalCount = products.length;

		const categoryMap = await getCategoriesMap();

		const start = (state.page - 1) * state.limit;
		const end = start + state.limit;
		const paginatedProducts = products.slice(start, end);

		if (!paginatedProducts.length) {
			tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;">No products found</td>
        </tr>
      `;
			renderPagination(paginationContainer, state, renderProducts);
			return;
		}

		tableBody.innerHTML = paginatedProducts
			.map(function (product) {
				const categoryName = categoryMap[String(product.categoryId)] || "Unknown";
				const stockClass = getStockClass(product.status);
				const statusText = getStatusText(product.status);
				const iconClass = getProductIcon(categoryName);

				return `
          <tr>
            <td>
              <div class="product-cell">
                <div class="product-icon">
                  <i class="fa-solid ${iconClass}"></i>
                </div>
                <div class="product-info">
                  <h6>${escapeHTML(product.name)}</h6>
                </div>
              </div>
            </td>
            <td>${escapeHTML(categoryName)}</td>
            <td>$${Number(product.price).toLocaleString()}</td>
            <td class="${stockClass}">${product.quantity}</td>
            <td class="status ${stockClass}">
              <i class="fa-solid fa-circle"></i> ${statusText}
            </td>
            <td>
              <button class="editProductBtn" data-id="${product.id}">Edit</button>
            </td>
            <td>
              <button class="removeProductBtn" data-id="${product.id}">Remove</button>
            </td>
          </tr>
        `;
			})
			.join("");

		renderPagination(paginationContainer, state, renderProducts);
	} catch (error) {
		console.error(error);
		tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; color:red;">Failed to load products</td>
      </tr>
    `;
	}
}

// ===============================
// Add / Update
// ===============================
saveProduct.addEventListener("click", async function (e) {
	e.preventDefault();

	const productObject = getProductFormData();
	if (!productObject) return;

	try {
		if (state.editingId) {
			const oldProductResponse = await getData(`products/${state.editingId}`);
			const oldProduct = oldProductResponse.data;

			const updatedProduct = {
				...oldProduct,
				...productObject
			};

			await putData("products", state.editingId, updatedProduct);
		} else {
			const createdProduct = await postData("products", productObject);

			const stockMovementObject = buildAddProductStockMovement(createdProduct);
			await postData("stockMovements", stockMovementObject);
		}

		closeModal();
		resetForm();
		state.page = 1;
		await renderProducts();
	} catch (error) {
		console.error(error);
		alert("Failed to save product");
	}
});

// ===============================
// Event delegation
// ===============================
document.addEventListener("click", async function (e) {
	const editBtn = e.target.closest(".editProductBtn");
	if (editBtn) {
		try {
			const id = editBtn.dataset.id;
			const response = await getData(`products/${id}`);
			const product = response.data;

			state.editingId = id;
			modalType.textContent = "Edit";
			fillFormWithProduct(product);
			showModal();
		} catch (error) {
			console.error(error);
			alert("Failed to load product data");
		}
		return;
	}

	const removeBtn = e.target.closest(".removeProductBtn");
	if (removeBtn) {
		const id = removeBtn.dataset.id;
		const confirmed = confirm("Are you sure you want to remove this product?");
		if (!confirmed) return;

		try {
			await deleteData("products", id);

			const possiblePages = Math.ceil((state.totalCount - 1) / state.limit);
			if (state.page > possiblePages && state.page > 1) {
				state.page--;
			}

			await renderProducts();
		} catch (error) {
			console.error(error);
			alert("Failed to remove product");
		}
	}
});

// ===============================
// Modal actions
// ===============================
addProductBtn.addEventListener("click", function () {
	resetForm();
	modalType.textContent = "Add";
	showModal();
});

cancelBtn.addEventListener("click", function (e) {
	e.preventDefault();
	closeModal();
	resetForm();
});

modalOverlay.addEventListener("click", function () {
	closeModal();
	resetForm();
});

document.addEventListener("keydown", function (e) {
	if (e.key === "Escape" && !modal.classList.contains("hidden")) {
		closeModal();
		resetForm();
	}
});

// ===============================
// Search / filter
// ===============================
searchByProductName.addEventListener("input", function () {
	state.page = 1;
	renderProducts();
});

formSelect.addEventListener("change", function () {
	state.page = 1;
	renderProducts();
});


// ^ Export button 

exportBtn.addEventListener("click", async function () {
	try {
		let products = (await getData("products")).data;
		const categoryMap = await getCategoriesMap();
		const suppliersMap = await getSuppliersMap();

		const searchValue = searchByProductName.value.trim().toLowerCase();
		const filterValue = formSelect.value;

		if (searchValue) {
			products = products.filter(function (product) {
				return String(product.name || "")
					.toLowerCase()
					.includes(searchValue);
			});
		}

		products = filterProductsByStatus(products, filterValue);

		const csvRows = [
			[
				"ID",
				"Name",
				"SKU",
				"Category",
				"Supplier",
				"Price",
				"Quantity",
				"Min Stock",
				"Status",
				"Created At"
			].join(",")
		];

		products.forEach(function (product) {
			csvRows.push([
				`"${product.id || ""}"`,
				`"${String(product.name || "").replaceAll('"', '""')}"`,
				`"${String(product.sku || "").replaceAll('"', '""')}"`,
				`"${String(categoryMap[String(product.categoryId)] || "").replaceAll('"', '""')}"`,
				`"${String(suppliersMap[String(product.supplierId)] || "").replaceAll('"', '""')}"`,
				`"${product.price || ""}"`,
				`"${product.quantity || ""}"`,
				`"${product.minStock || ""}"`,
				`"${getStatusText(product.status)}"`,
				`"${product.createdAt || ""}"`
			].join(","));
		});

		const blob = new Blob([csvRows.join("\n")], {
			type: "text/csv;charset=utf-8;"
		});

		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "products-export.csv";
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	} catch (error) {
		console.error(error);
		alert("Failed to export products");
	}
});

//^ Initialization

document.addEventListener("DOMContentLoaded", async function () {
	await renderCategoriesSelect();
	await renderSuppliersSelect();
	await renderProducts();
});