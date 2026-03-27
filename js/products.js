renderNavbar("Products");
renderFooter()

// & pagination state
const state = {
	page: 1,
	limit: 5,
	totalCount: 0
};

// * Modal Selectors
const addProductBtn = document.querySelector("#addProductBtn");
const modal = document.querySelector("#modal");
const modalOverlay = document.querySelector("#modalOverlay");
const cancelModal = document.querySelector("#cancelBtn");

// * Products Selectors
const tableBody = document.querySelector("#tableBody");
const paginationContainer = document.getElementById("pagination");


// & Products Helpers
function getStockClass(quantity) {
	if (quantity <= 10) return "stock-critical";
	return "stock-normal";
}

function getStatusText(quantity) {
	if (quantity <= 10) return "Low Stock";
	return "In Stock";
}

function getProductIcon(category) {
	const cat = category.toLowerCase();

	if (cat.includes("electronics")) return "fa-keyboard";
	if (cat.includes("storage")) return "fa-box";
	if (cat.includes("accessories")) return "fa-headphones";
	if (cat.includes("office")) return "fa-briefcase";
	return "fa-box";
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

document.addEventListener("DOMContentLoaded", function () {
	console.log(tableBody)
	renderProducts();
});


// & Rendering Data Function

async function renderProducts() {
	try {
		const productsResponse = await getData(
			"products",
			`?_page=${state.page}&_per_page=${state.limit}`
		);

		const categoriesResponse = await getData("categories");

		const products = productsResponse.data.data;
		const categories = categoriesResponse.data;

		state.totalCount = productsResponse.data.items;

		const categoryMap = {};

		categories.forEach(function (cat) {
			categoryMap[cat.id] = cat.name;
		});

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
				const stockClass = getStockClass(product.quantity);
				const statusText = getStatusText(product.quantity);
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
		tableBody.innerHTML = `
			<tr>
				<td colspan="7" style="text-align:center ; color:red;">Failed to load products</td>
			</tr>
		`;
		console.error(error);
	}
}
