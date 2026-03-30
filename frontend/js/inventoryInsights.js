renderNavbar("InventoryInsights");
renderFooter();

const state = {
	inventorySort: "value",
	lowStockExpanded: false,
	products: [],
	categories: [],
	suppliers: []
};

const elements = {
	lowStockCount: document.getElementById("lowStockCount"),
	lowStockTrend: document.getElementById("lowStockTrend"),
	outOfStockCount: document.getElementById("outOfStockCount"),
	outOfStockTrend: document.getElementById("outOfStockTrend"),
	inventoryValueTotal: document.getElementById("inventoryValueTotal"),
	inventoryValueTrend: document.getElementById("inventoryValueTrend"),
	totalProductsCount: document.getElementById("totalProductsCount"),
	totalProductsTrend: document.getElementById("totalProductsTrend"),
	lowStockTableBody: document.getElementById("lowStockTableBody"),
	lowStockMobileList: document.getElementById("lowStockMobileList"),
	inventoryValueTableBody: document.getElementById("inventoryValueTableBody"),
	inventoryValueMobileList: document.getElementById("inventoryValueMobileList"),
	inventoryValueSort: document.getElementById("inventoryValueSort"),
	toggleLowStockAlerts: document.getElementById("toggleLowStockAlerts")
};

function normalizeNumber(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
}

function normalizeText(value, fallback = "—") {
	if (value === null || value === undefined) return fallback;
	const text = String(value).trim();
	return text || fallback;
}

function escapeHtml(value) {
	return String(value)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function formatCurrency(value) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(normalizeNumber(value));
}

function formatCount(value) {
	return new Intl.NumberFormat("en-US").format(normalizeNumber(value));
}

function formatDate(dateString) {
	if (!dateString) return "—";
	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) return normalizeText(dateString);
	return date.toLocaleDateString("en-CA");
}

function getMaps() {
	const categoriesMap = new Map(
		state.categories.map((category) => [String(category.id), category.name])
	);
	const suppliersMap = new Map(
		state.suppliers.map((supplier) => [String(supplier.id), supplier.name])
	);
	return { categoriesMap, suppliersMap };
}

function isOutOfStock(product) {
	const quantity = normalizeNumber(product.quantity);
	const status = String(product.status || "").toLowerCase();
	return quantity <= 0 || status === "out_of_stock";
}

function isLowStock(product) {
	if (isOutOfStock(product)) return true;
	const quantity = normalizeNumber(product.quantity);
	const minStock = normalizeNumber(product.minStock);
	const status = String(product.status || "").toLowerCase();
	return status === "low_stock" || (minStock > 0 && quantity <= minStock);
}

function getLowStockSeverity(product) {
	if (isOutOfStock(product)) {
		return {
			label: "OUT OF STOCK",
			badgeClass: "critical",
			qtyClass: "qty-danger",
			priority: 0
		};
	}

	const quantity = normalizeNumber(product.quantity);
	const minStock = Math.max(normalizeNumber(product.minStock), 1);
	const isCritical = quantity <= Math.max(1, Math.floor(minStock / 2));

	return isCritical
		? {
			label: "CRITICAL",
			badgeClass: "critical",
			qtyClass: "qty-danger",
			priority: 1
		}
		: {
			label: "WARNING",
			badgeClass: "warning",
			qtyClass: "qty-warning",
			priority: 2
		};
}

function enrichProducts() {
	const { categoriesMap, suppliersMap } = getMaps();

	return state.products.map((product) => {
		const quantity = normalizeNumber(product.quantity);
		const price = normalizeNumber(product.price);
		const cost = normalizeNumber(product.cost);
		const minStock = normalizeNumber(product.minStock);
		return {
			...product,
			quantity,
			price,
			cost,
			minStock,
			categoryName: categoriesMap.get(String(product.categoryId)) || "Unknown Category",
			supplierName: suppliersMap.get(String(product.supplierId)) || "Unknown Supplier",
			totalValue: quantity * price,
			totalCostValue: quantity * cost,
			createdAtFormatted: formatDate(product.createdAt)
		};
	});
}

function getLowStockProducts() {
	return enrichProducts()
		.filter(isLowStock)
		.sort((first, second) => {
			const firstSeverity = getLowStockSeverity(first);
			const secondSeverity = getLowStockSeverity(second);
			if (firstSeverity.priority !== secondSeverity.priority) {
				return firstSeverity.priority - secondSeverity.priority;
			}
			if (first.quantity !== second.quantity) return first.quantity - second.quantity;
			if (first.minStock !== second.minStock) return second.minStock - first.minStock;
			return first.name.localeCompare(second.name);
		});
}

function getSortedInventoryProducts() {
	const products = enrichProducts();
	const sortBy = state.inventorySort;

	return products.sort((first, second) => {
		if (sortBy === "quantity") {
			if (second.quantity !== first.quantity) return second.quantity - first.quantity;
			return second.totalValue - first.totalValue;
		}

		if (sortBy === "price") {
			if (second.price !== first.price) return second.price - first.price;
			return second.totalValue - first.totalValue;
		}

		if (second.totalValue !== first.totalValue) return second.totalValue - first.totalValue;
		return second.quantity - first.quantity;
	});
}

function renderInsightCards() {
	const products = enrichProducts();
	const lowStockProducts = products.filter(isLowStock);
	const outOfStockProducts = products.filter(isOutOfStock);
	const criticalLowStockCount = lowStockProducts.filter((product) => getLowStockSeverity(product).priority <= 1).length;
	const warningLowStockCount = Math.max(lowStockProducts.length - criticalLowStockCount, 0);
	const totalInventoryValue = products.reduce((sum, product) => sum + product.totalValue, 0);
	const averageInventoryValue = products.length ? totalInventoryValue / products.length : 0;

	elements.lowStockCount.textContent = formatCount(lowStockProducts.length);
	elements.lowStockTrend.textContent = lowStockProducts.length
		? `${formatCount(criticalLowStockCount)} critical • ${formatCount(warningLowStockCount)} warning`
		: "Everything is above reorder level";
	elements.lowStockTrend.className = `insight-trend ${lowStockProducts.length ? "negative" : "positive"}`;

	elements.outOfStockCount.textContent = formatCount(outOfStockProducts.length);
	elements.outOfStockTrend.textContent = outOfStockProducts.length
		? `${formatCount(outOfStockProducts.length)} unavailable right now`
		: "All tracked products are available";
	elements.outOfStockTrend.className = `insight-trend ${outOfStockProducts.length ? "negative" : "positive"}`;

	elements.inventoryValueTotal.textContent = formatCurrency(totalInventoryValue);
	elements.inventoryValueTrend.textContent = `${formatCurrency(averageInventoryValue)} average value per product`;
	elements.inventoryValueTrend.className = "insight-trend positive";

	elements.totalProductsCount.textContent = formatCount(products.length);
	elements.totalProductsTrend.textContent = `${formatCount(state.categories.length)} categories • ${formatCount(state.suppliers.length)} suppliers`;
	elements.totalProductsTrend.className = "insight-trend purple-text";
}

function renderLowStockReport() {
	const lowStockProducts = getLowStockProducts();
	const visibleProducts = state.lowStockExpanded ? lowStockProducts : lowStockProducts.slice(0, 5);

	if (!lowStockProducts.length) {
		elements.lowStockTableBody.innerHTML = `
			<tr>
				<td colspan="7" class="text-center py-4">No low stock alerts found.</td>
			</tr>
		`;

		elements.lowStockMobileList.innerHTML = `
			<div class="report-mobile-item">
				<p class="mb-0">No low stock alerts found.</p>
			</div>
		`;

		elements.toggleLowStockAlerts.textContent = "No Alerts";
		elements.toggleLowStockAlerts.classList.add("disabled");
		elements.toggleLowStockAlerts.setAttribute("aria-disabled", "true");
		return;
	}

	elements.toggleLowStockAlerts.classList.remove("disabled");
	elements.toggleLowStockAlerts.removeAttribute("aria-disabled");
	elements.toggleLowStockAlerts.textContent =
		lowStockProducts.length <= 5
			? `${formatCount(lowStockProducts.length)} alert${lowStockProducts.length > 1 ? "s" : ""}`
			: state.lowStockExpanded
				? "Show Top Alerts"
				: `View All Alerts (${formatCount(lowStockProducts.length)})`;

	elements.lowStockTableBody.innerHTML = visibleProducts
		.map((product) => {
			const severity = getLowStockSeverity(product);
			return `
				<tr>
					<td class="fw-semibold">${escapeHtml(normalizeText(product.name))}</td>
					<td>${escapeHtml(normalizeText(product.sku))}</td>
					<td>${escapeHtml(normalizeText(product.categoryName))}</td>
					<td>${escapeHtml(normalizeText(product.supplierName))}</td>
					<td class="${severity.qtyClass}">${formatCount(product.quantity)}</td>
					<td>${formatCount(product.minStock)}</td>
					<td>
						<span class="table-badge ${severity.badgeClass}">${severity.label}</span>
					</td>
				</tr>
			`;
		})
		.join("");

	elements.lowStockMobileList.innerHTML = visibleProducts
		.map((product) => {
			const severity = getLowStockSeverity(product);
			return `
				<div class="report-mobile-item">
					<h6>${escapeHtml(normalizeText(product.name))}</h6>
					<p><strong>SKU:</strong> ${escapeHtml(normalizeText(product.sku))}</p>
					<p><strong>Category:</strong> ${escapeHtml(normalizeText(product.categoryName))}</p>
					<p><strong>Supplier:</strong> ${escapeHtml(normalizeText(product.supplierName))}</p>
					<p><strong>Quantity:</strong> <span class="${severity.qtyClass}">${formatCount(product.quantity)}</span></p>
					<p><strong>Reorder Level:</strong> ${formatCount(product.minStock)}</p>
					<span class="table-badge ${severity.badgeClass}">${severity.label}</span>
				</div>
			`;
		})
		.join("");
}

function renderInventoryValueReport() {
	const products = getSortedInventoryProducts();

	if (!products.length) {
		elements.inventoryValueTableBody.innerHTML = `
			<tr>
				<td colspan="6" class="text-center py-4">No products available.</td>
			</tr>
		`;

		elements.inventoryValueMobileList.innerHTML = `
			<div class="report-mobile-item">
				<p class="mb-0">No products available.</p>
			</div>
		`;
		return;
	}

	elements.inventoryValueTableBody.innerHTML = products
		.map((product) => `
			<tr>
				<td class="fw-semibold">${escapeHtml(normalizeText(product.name))}</td>
				<td>${escapeHtml(normalizeText(product.sku))}</td>
				<td>${escapeHtml(normalizeText(product.categoryName))}</td>
				<td>${formatCurrency(product.price)}</td>
				<td>${formatCount(product.quantity)}</td>
				<td class="fw-bold">${formatCurrency(product.totalValue)}</td>
			</tr>
		`)
		.join("");

	elements.inventoryValueMobileList.innerHTML = products
		.map((product) => `
			<div class="report-mobile-item">
				<h6>${escapeHtml(normalizeText(product.name))}</h6>
				<p><strong>SKU:</strong> ${escapeHtml(normalizeText(product.sku))}</p>
				<p><strong>Category:</strong> ${escapeHtml(normalizeText(product.categoryName))}</p>
				<p><strong>Price:</strong> ${formatCurrency(product.price)}</p>
				<p><strong>Quantity:</strong> ${formatCount(product.quantity)}</p>
				<p><strong>Total Value:</strong> <span class="fw-bold">${formatCurrency(product.totalValue)}</span></p>
			</div>
		`)
		.join("");
}

function renderErrorState(message) {
	const fallbackMessage = normalizeText(message, "Unable to load inventory data.");

	elements.lowStockCount.textContent = "—";
	elements.outOfStockCount.textContent = "—";
	elements.inventoryValueTotal.textContent = "—";
	elements.totalProductsCount.textContent = "—";
	elements.lowStockTrend.textContent = fallbackMessage;
	elements.outOfStockTrend.textContent = fallbackMessage;
	elements.inventoryValueTrend.textContent = fallbackMessage;
	elements.totalProductsTrend.textContent = fallbackMessage;

	elements.lowStockTableBody.innerHTML = `
		<tr>
			<td colspan="7" class="text-center py-4">${escapeHtml(fallbackMessage)}</td>
		</tr>
	`;
	elements.inventoryValueTableBody.innerHTML = `
		<tr>
			<td colspan="6" class="text-center py-4">${escapeHtml(fallbackMessage)}</td>
		</tr>
	`;
	elements.lowStockMobileList.innerHTML = `
		<div class="report-mobile-item">
			<p class="mb-0">${escapeHtml(fallbackMessage)}</p>
		</div>
	`;
	elements.inventoryValueMobileList.innerHTML = `
		<div class="report-mobile-item">
			<p class="mb-0">${escapeHtml(fallbackMessage)}</p>
		</div>
	`;
	elements.toggleLowStockAlerts.textContent = "Unable to Load Alerts";
	elements.toggleLowStockAlerts.classList.add("disabled");
}

function attachEventListeners() {
	elements.inventoryValueSort.addEventListener("change", (event) => {
		state.inventorySort = event.target.value;
		renderInventoryValueReport();
	});

	elements.toggleLowStockAlerts.addEventListener("click", (event) => {
		event.preventDefault();
		if (!getLowStockProducts().length || getLowStockProducts().length <= 5) return;
		state.lowStockExpanded = !state.lowStockExpanded;
		renderLowStockReport();
	});
}

async function loadInventoryInsights() {
	try {
		const [productsResponse, categoriesResponse, suppliersResponse] = await Promise.all([
			getData("products"),
			getData("categories"),
			getData("suppliers")
		]);

		state.products = Array.isArray(productsResponse.data) ? productsResponse.data : [];
		state.categories = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [];
		state.suppliers = Array.isArray(suppliersResponse.data) ? suppliersResponse.data : [];

		renderInsightCards();
		renderLowStockReport();
		renderInventoryValueReport();
	} catch (error) {
		console.error("Failed to load inventory insights:", error);
		renderErrorState("Unable to connect to the database. Make sure json-server is running on port 3000.");
	}
}

attachEventListeners();
loadInventoryInsights();