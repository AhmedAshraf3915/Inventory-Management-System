renderNavbar("Products");
renderFooter()

// & pagination state
const state = {
	page: 1,
	limit: 5,
	totalCount: 0
};

// ^ Check validation for product modal inputs 
function getProductFormData() {
	validateInputs(/^[A-Za-z0-9\s]{3,}$/, productName, "Product name must be at least 3 characters");
	validateInputs(/^[A-Za-z0-9-]{3,}$/, SKU, "SKU must contain letters, numbers or -");
	validateInputs(/^\d+(\.\d{1,2})?$/, productPrice, "Enter a valid price");
	validateInputs(/^\d+$/, initialQty, "Quantity must be a valid number");
	validateInputs(/^\d+$/, reorderLevel, "Reorder level must be a valid number");

	validateSelect(productCategory);
	validateSelect(productSupplier);

	const allValid =
		productName.checkValidity() &&
		SKU.checkValidity() &&
		productPrice.checkValidity() &&
		initialQty.checkValidity() &&
		reorderLevel.checkValidity() &&
		productCategory.checkValidity() &&
		productSupplier.checkValidity();

	if (!allValid) {
		return null;
	}

	const productObject = {
		name: productName.value.trim(),
		sku: SKU.value.trim(),
		price: Number(productPrice.value),
		category: categorySelect.value,
		supplier: supplierSelect.value,
		initialQty: Number(initialQty.value),
		reorderLevel: Number(reorderLevel.value),
		createdAt: `${getCurrentDate()}`
	};

	return productObject;
}


// & Get date helper for >> createdAt field
function getCurrentDate() {
	let today = new Date()
	today = (today.toISOString()).slice(0, today.toISOString().indexOf('T'))
	return today;
}

const addProductBtn = document.querySelector("#addProductBtn");

// * Products Selectors
const tableBody = document.querySelector("#tableBody");
const paginationContainer = document.getElementById("pagination");
const searchByProductName = document.getElementById("searchByProductName");
const formSelect = document.getElementById("formSelect");

// * Modal selectors
const modal = document.querySelector("#modal");
const modalOverlay = document.querySelector("#modalOverlay");
const productName = document.getElementById('productName')
const SKU = document.getElementById('productSKU')
const productPrice = document.getElementById('productPrice')
const categorySelect = document.getElementById('category')
const supplierSelect = document.getElementById('supplier')
const initialQty = document.getElementById('initialQty')
const reorderLevel = document.getElementById('reorderLevel')
const cancelModal = document.querySelector("#cancelBtn");
const saveProduct = document.getElementById('saveProduct')


// & Products Helpers
function getStockClass(status) {
	if (!status) return "stock-normal";

	status = status.toLowerCase();

	if (status === "out_of_stock") return "stock-critical";
	if (status === "low_stock") return "stock-warning";
	if (status === "in_stock") return "stock-normal";

	return "stock-normal";
}

function getStatusText(status) {
	if (!status) return "Unknown";

	status = status.toLowerCase();

	if (status === "in_stock") return "In Stock";
	if (status === "low_stock") return "Low Stock";
	if (status === "out_of_stock") return "Out of Stock";

	return status;
}

function getProductIcon(category) {
	const cat = category.toLowerCase();

	if (cat.includes("electronics")) return "fa-keyboard";
	if (cat.includes("storage")) return "fa-box";
	if (cat.includes("accessories")) return "fa-headphones";
	if (cat.includes("office")) return "fa-briefcase";
	return "fa-box";
}

// ^ render categories in select
async function renderCategoriesSelect() {
	let html = ``
	const categoriesData = await getCategoriesMap();
	console.log(categoriesData)
	for ([key, value] of Object.entries(categoriesData)) {
		console.log(key, value)
		html += `<option value="${key}">${value}</option>`;
	}
	categorySelect.innerHTML += html;
}
async function renderSuppliersSelect() {
	let html = ``
	const suppliersData = await getSuppliersMap();
	console.log(suppliersData)
	for ([key, value] of Object.entries(suppliersData)) {
		console.log(key, value)
		html += `<option value="${key}">${value}</option>`;
	}
	supplierSelect.innerHTML += html;
}

// ^ Modal Actions

addProductBtn.addEventListener("click", function () {
	showModal();
});

cancelModal.addEventListener("click", function () {
	closeModal();
});

modalOverlay.addEventListener("click", function (e) {
	if (e.target === modalOverlay) {
		closeModal();
	}
});

document.addEventListener("click", function (e) {
	if (e.target.classList.contains("editProductBtn")) {
		showModal();
	}
});

document.addEventListener('keydown', function (e) {
	if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
		closeModal();
	}
})

// ^ Page load
document.addEventListener("DOMContentLoaded", function () {
	renderCategoriesSelect()
	renderSuppliersSelect()
	renderProducts();
});

// ^ Search listener
searchByProductName.addEventListener("input", function () {
	state.page = 1;
	renderProducts();
});

// ^ Filter Listener
formSelect.addEventListener("change", function () {
	state.page = 1;
	renderProducts();
});

// * Filter Function according to quantity
function filterProductsByStatus(products, filterValue) {
	if (filterValue === "") return products;

	return products.filter(function (product) {
		return (product.status || "")
			.toLowerCase()
			=== filterValue.toLowerCase();
	});
}

// & Get categories
async function getCategoriesMap() {
	const categoriesResponse = await getData("categories");
	const categories = categoriesResponse.data;

	const categoryMap = {};
	categories.forEach(function (cat) {
		categoryMap[cat.id] = cat.name;
	});
	return categoryMap;
}


async function getSuppliersMap() {
	const suppliersResponse = await getData("suppliers")
	const suppliers = suppliersResponse.data

	const suppliersMap = {}
	suppliers.forEach(function (supp) {
		suppliersMap[supp.id] = supp.name;
	})
	return suppliersMap;
}


// & Rendering Data Function

async function renderProducts() {
	try {


		let products = [];
		const searchValue = searchByProductName.value.trim();
		const filterValue = formSelect.value;

		if (searchValue !== "" || filterValue !== "") {
			let allProducts = (await getData("products")).data;

			//^  SEARCH
			if (searchValue !== "") {
				allProducts = allProducts.filter(function (product) {
					return (product.name || "")
						.toLowerCase()
						.includes(searchValue);
				});
			}

			// ^  FILTER
			if (filterValue !== "") {
				allProducts = filterProductsByStatus(allProducts, filterValue);
			}

			state.totalCount = allProducts.length;

			let start = (state.page - 1) * state.limit;
			let end = start + state.limit;

			products = allProducts.slice(start, end);
		} else {
			const productsResponse = await getData(
				"products",
				`?_page=${state.page}&_per_page=${state.limit}`
			);

			products = productsResponse.data.data;
			state.totalCount = productsResponse.data.items;
		}

		const categoryMap = await getCategoriesMap()

		if (!products.length) {
			tableBody.innerHTML = `
				<tr>
					<td colspan="7" style="text-align:center;">No products found</td>
				</tr>
			`;

			renderPagination(paginationContainer, state, renderProducts);
			return;
		}

		tableBody.innerHTML = products
			.map(function (product) {
				const categoryName = categoryMap[product.categoryId] || "Unknown";
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
									<h6>${product.name}</h6>
								</div>
							</div>
						</td>
						<td>${categoryName}</td>
						<td>${product.price}</td>
						<td class="${stockClass}">${product.quantity}</td>
						<td class="status ${stockClass}">
							<i class="fa-solid fa-circle"></i> ${statusText}
						</td>
						<td>
							<button class="editProductBtn" data-type="Edit" data-id="${product.id}">Edit</button>
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
		tableBody.innerHTML = `
			<tr>
				<td colspan="7" style="text-align:center; color:red;">Failed to load products</td>
			</tr>
		`;
		console.error(error);
	}
}



// addProductBtn.addEventListener('click', function (e) {
// 	e.preventDefault()


// })