renderNavbar("Orders");
<<<<<<< HEAD
renderFooter()
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector(".order-search-input");
  
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        const value = this.value.toLowerCase();
        console.log("Searching for:", value);
        // later can filter rows/cards
      });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector(".order-search-input");
  
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        const value = this.value.toLowerCase();
        console.log("Searching for:", value);
      });
    }
  
    const orderItemsBody = document.getElementById("orderItemsBody");
    const addProductRowBtn = document.getElementById("addProductRowBtn");
    const subtotalValue = document.getElementById("subtotalValue");
    const totalValue = document.getElementById("totalValue");
  
    function formatCurrency(value) {
      return `$${value.toFixed(2)}`;
    }
  
    function calculateTotals() {
      if (!orderItemsBody || !subtotalValue || !totalValue) return;
  
      const rows = orderItemsBody.querySelectorAll("tr");
      let subtotal = 0;
  
      rows.forEach((row) => {
        const qtyInput = row.querySelector(".qty-input");
        const costInput = row.querySelector(".cost-input");
  
        const qty = parseFloat(qtyInput?.value) || 0;
        const cost = parseFloat(costInput?.value) || 0;
  
        subtotal += qty * cost;
      });
  
      subtotalValue.textContent = formatCurrency(subtotal);
      totalValue.textContent = formatCurrency(subtotal);
    }
  
    function attachRowEvents(row) {
      const removeBtn = row.querySelector(".remove-row-btn");
      const inputs = row.querySelectorAll(".qty-input, .cost-input");
  
      if (removeBtn) {
        removeBtn.addEventListener("click", function () {
          const rows = orderItemsBody.querySelectorAll("tr");
          if (rows.length > 1) {
            row.remove();
            calculateTotals();
          }
        });
      }
  
      inputs.forEach((input) => {
        input.addEventListener("input", calculateTotals);
      });
    }
  
    if (orderItemsBody) {
      orderItemsBody.querySelectorAll("tr").forEach(attachRowEvents);
    }
  
    if (addProductRowBtn && orderItemsBody) {
      addProductRowBtn.addEventListener("click", function () {
        const row = document.createElement("tr");
  
        row.innerHTML = `
          <td>
            <input type="text" class="form-control item-input" placeholder="Enter product name">
          </td>
          <td>
            <input type="number" class="form-control item-input qty-input" value="1" min="1">
          </td>
          <td>
            <input type="number" class="form-control item-input cost-input" value="0.00" min="0" step="0.01">
          </td>
          <td class="text-end">
            <button type="button" class="remove-row-btn" aria-label="Remove row">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </td>
        `;
  
        orderItemsBody.appendChild(row);
        attachRowEvents(row);
        calculateTotals();
      });
    }
  
    calculateTotals();
});
=======
renderFooter();

const state = {
  page: 1,
  limit: 5,
  totalCount: 0,
  search: "",
  orders: [],
};

const dom = {
  tableBody: document.getElementById("ordersTableBody"),
  mobileContainer: document.getElementById("ordersMobile"),
  searchInput: document.querySelector(".order-search-input"),
  resultsText: document.querySelector(".results-text"),
  pagination: document.querySelector(".pagination-custom"),
  modalElement: document.getElementById("createOrderModal"),
  form: document.getElementById("createOrderForm"),
  supplierSelect: document.getElementById("supplierSelect"),
  orderDate: document.getElementById("orderDate"),
  orderItemsBody: document.getElementById("orderItemsBody"),
  subtotalValue: document.getElementById("subtotalValue"),
  totalValue: document.getElementById("totalValue"),
  addRowBtn: document.getElementById("addProductRowBtn"),
  saveBtn: document.querySelector(".modal-save-btn"),
};

const modalInstance = window.bootstrap && dom.modalElement
  ? bootstrap.Modal.getOrCreateInstance(dom.modalElement)
  : null;

initOrdersPage();

function initOrdersPage() {
  prepareSupplierSelect();
  attachEventListeners();
  resetOrderForm();
  loadSuppliers();
  loadOrders();
}

function attachEventListeners() {
  dom.searchInput?.addEventListener("input", handleSearch);
  dom.addRowBtn?.addEventListener("click", addProductRow);
  dom.saveBtn?.addEventListener("click", createOrder);
  dom.form?.addEventListener("submit", function (event) {
    event.preventDefault();
    createOrder();
  });

  dom.orderItemsBody?.addEventListener("input", function () {
    updateOrderTotals();
  });

  dom.orderItemsBody?.addEventListener("click", function (event) {
    const removeButton = event.target.closest(".remove-row-btn");
    if (!removeButton) return;

    const rows = dom.orderItemsBody.querySelectorAll("tr");
    const row = removeButton.closest("tr");

    if (rows.length === 1) {
      row.outerHTML = createItemRow();
    } else {
      row.remove();
    }

    updateOrderTotals();
  });

  dom.tableBody?.addEventListener("click", handleOrderAction);
  dom.mobileContainer?.addEventListener("click", handleOrderAction);

  dom.modalElement?.addEventListener("hidden.bs.modal", function () {
    resetOrderForm();
  });
}

async function loadSuppliers() {
  try {
    const { data } = await getData("suppliers");
    if (!Array.isArray(data) || !data.length) return;

    const supplierNames = data
      .map((supplier) => (
        supplier?.name ||
        supplier?.supplierName ||
        supplier?.companyName ||
        supplier?.contactPerson ||
        ""
      ).trim())
      .filter(Boolean);

    if (!supplierNames.length) return;

    const uniqueSupplierNames = Array.from(new Set(supplierNames));
    const currentValue = dom.supplierSelect.value;

    dom.supplierSelect.innerHTML = [
      '<option value="" disabled>Select a supplier</option>',
      ...uniqueSupplierNames.map((name) => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`),
    ].join("");

    dom.supplierSelect.value = currentValue && uniqueSupplierNames.includes(currentValue)
      ? currentValue
      : "";
  } catch (error) {
    console.error("Unable to load suppliers:", error);
  }
}

function prepareSupplierSelect() {
  if (!dom.supplierSelect) return;

  const firstOption = dom.supplierSelect.options[0];
  if (firstOption) {
    firstOption.value = "";
    firstOption.disabled = true;
  }

  dom.supplierSelect.value = "";
}

async function loadOrders() {
  try {
    const { data } = await getData("orders");
    state.orders = normalizeOrders(Array.isArray(data) ? data : []);
    renderPage();
  } catch (error) {
    console.error("Unable to load orders:", error);
    state.orders = [];
    renderPage();
  }
}

function normalizeOrders(orders) {
  return orders
    .map((order) => {
      const items = Array.isArray(order.items)
        ? order.items.map((item) => ({
            product: item.product || item.name || "",
            qty: Number(item.qty ?? item.quantity ?? 0),
            cost: Number(item.cost ?? item.price ?? 0),
          }))
        : [];

      const calculatedQuantity = items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
      const calculatedTotal = items.reduce((sum, item) => sum + ((Number(item.qty) || 0) * (Number(item.cost) || 0)), 0);

      return {
        ...order,
        id: order.id ?? generateOrderId(),
        supplier: order.supplier || "Unknown Supplier",
        date: order.date || new Date().toISOString().split("T")[0],
        items,
        itemsCount: Number(order.itemsCount ?? order.itemCount ?? calculatedQuantity) || 0,
        totalCost: Number(order.totalCost ?? order.total ?? calculatedTotal) || 0,
        status: order.status || "Pending",
      };
    })
    .sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });
}

function handleSearch(event) {
  state.search = event.target.value.trim().toLowerCase();
  state.page = 1;
  renderPage();
}

function getFilteredOrders() {
  if (!state.search) return state.orders;

  return state.orders.filter(function (order) {
    return String(order.id).toLowerCase().includes(state.search)
      || String(order.supplier).toLowerCase().includes(state.search);
  });
}

function getPaginatedOrders(orders) {
  const startIndex = (state.page - 1) * state.limit;
  return orders.slice(startIndex, startIndex + state.limit);
}

function renderPage() {
  const filteredOrders = getFilteredOrders();
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / state.limit));

  if (state.page > totalPages) {
    state.page = totalPages;
  }

  state.totalCount = filteredOrders.length;

  const paginatedOrders = getPaginatedOrders(filteredOrders);
  renderOrders(paginatedOrders);
  renderResultsText(filteredOrders.length, paginatedOrders.length);
  renderPagination(filteredOrders.length);
}

function renderOrders(orders) {
  dom.tableBody.innerHTML = "";
  dom.mobileContainer.innerHTML = "";

  if (!orders.length) {
    dom.tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-5 text-muted">
          No orders found. Create a new order to get started.
        </td>
      </tr>
    `;

    dom.mobileContainer.innerHTML = `
      <div class="text-center py-4 px-3 bg-white rounded-3 shadow-sm text-muted">
        No orders found. Create a new order to get started.
      </div>
    `;
    return;
  }

  dom.tableBody.innerHTML = orders.map(renderTableRow).join("");
  dom.mobileContainer.innerHTML = orders.map(renderMobileCard).join("");
}

function renderTableRow(order) {
  return `
    <tr>
      <td class="fw-semibold">${escapeHtml(String(order.id))}</td>
      <td><span class="supplier-link">${escapeHtml(order.supplier)}</span></td>
      <td>${formatDate(order.date)}</td>
      <td>${order.itemsCount}</td>
      <td class="fw-semibold">${formatCurrency(order.totalCost)}</td>
      <td>
        <span class="status-badge ${getStatusClass(order.status)}">
          <span class="dot"></span> ${escapeHtml(order.status)}
        </span>
      </td>
      <td class="text-center">
        <button class="action-btn delete" data-action="delete" data-order-id="${escapeHtml(String(order.id))}" aria-label="Delete order ${escapeHtml(String(order.id))}">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </td>
    </tr>
  `;
}

function renderMobileCard(order) {
  return `
    <div class="order-mobile-card">
      <div class="mobile-top">
        <div>
          <h6 class="mb-1">${escapeHtml(String(order.id))}</h6>
          <span class="supplier-link">${escapeHtml(order.supplier)}</span>
        </div>
        <span class="status-badge ${getStatusClass(order.status)}">
          <span class="dot"></span> ${escapeHtml(order.status)}
        </span>
      </div>

      <div class="mobile-details">
        <div><strong>Date:</strong> ${formatDate(order.date)}</div>
        <div><strong>Items:</strong> ${order.itemsCount}</div>
        <div><strong>Total:</strong> ${formatCurrency(order.totalCost)}</div>
      </div>

      <div class="actions mobile-actions">
        <button class="action-btn delete" data-action="delete" data-order-id="${escapeHtml(String(order.id))}" aria-label="Delete order ${escapeHtml(String(order.id))}">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    </div>
  `;
}

function renderResultsText(totalItems, currentPageItemsCount) {
  if (!dom.resultsText) return;

  if (!totalItems) {
    dom.resultsText.textContent = "Showing 0 of 0 orders";
    return;
  }

  const start = (state.page - 1) * state.limit + 1;
  const end = start + currentPageItemsCount - 1;
  dom.resultsText.textContent = `Showing ${start} to ${end} of ${totalItems} orders`;
}

function renderPagination(totalItems) {
  if (!dom.pagination) return;

  const totalPages = Math.ceil(totalItems / state.limit);

  if (!totalItems || totalPages <= 1) {
    dom.pagination.innerHTML = "";
    return;
  }

  const pageButtons = [];

  pageButtons.push(`
    <button class="page-btn" data-page-nav="prev" ${state.page === 1 ? "disabled" : ""}>
      <i class="fa-solid fa-angle-left"></i>
    </button>
  `);

  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
    pageButtons.push(`
      <button class="page-btn ${pageNumber === state.page ? "active" : ""}" data-page="${pageNumber}">
        ${pageNumber}
      </button>
    `);
  }

  pageButtons.push(`
    <button class="page-btn" data-page-nav="next" ${state.page === totalPages ? "disabled" : ""}>
      <i class="fa-solid fa-angle-right"></i>
    </button>
  `);

  dom.pagination.innerHTML = pageButtons.join("");

  dom.pagination.querySelectorAll("[data-page]").forEach(function (button) {
    button.addEventListener("click", function () {
      state.page = Number(button.dataset.page);
      renderPage();
    });
  });

  const prevButton = dom.pagination.querySelector('[data-page-nav="prev"]');
  const nextButton = dom.pagination.querySelector('[data-page-nav="next"]');

  prevButton?.addEventListener("click", function () {
    if (state.page > 1) {
      state.page -= 1;
      renderPage();
    }
  });

  nextButton?.addEventListener("click", function () {
    if (state.page < totalPages) {
      state.page += 1;
      renderPage();
    }
  });
}

function addProductRow() {
  dom.orderItemsBody.insertAdjacentHTML("beforeend", createItemRow());
  updateOrderTotals();
}

function createItemRow() {
  return `
    <tr>
      <td>
        <input type="text" class="form-control item-input product-input" placeholder="Product name">
      </td>
      <td>
        <input type="number" class="form-control item-input qty-input" min="1" step="1" placeholder="0">
      </td>
      <td>
        <input type="number" class="form-control item-input cost-input" min="0" step="0.01" placeholder="0.00">
      </td>
      <td class="text-end">
        <button type="button" class="remove-row-btn" aria-label="Remove row">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </td>
    </tr>
  `;
}

function collectOrderItems() {
  const rows = Array.from(dom.orderItemsBody.querySelectorAll("tr"));
  const items = [];

  for (const row of rows) {
    const productInput = row.querySelector(".product-input") || row.querySelector('input[type="text"]');
    const qtyInput = row.querySelector(".qty-input");
    const costInput = row.querySelector(".cost-input");

    const product = productInput.value.trim();
    const qtyValue = qtyInput.value;
    const costValue = costInput.value;
    const isBlankRow = !product && qtyValue === "" && costValue === "";

    [productInput, qtyInput, costInput].forEach(function (input) {
      input.setCustomValidity("");
    });

    if (isBlankRow) {
      continue;
    }

    const qty = Number(qtyValue);
    const cost = Number(costValue);

    if (!product) {
      productInput.setCustomValidity("Enter a product name.");
      productInput.reportValidity();
      productInput.setCustomValidity("");
      return null;
    }

    if (!Number.isFinite(qty) || qty <= 0) {
      qtyInput.setCustomValidity("Quantity must be greater than 0.");
      qtyInput.reportValidity();
      qtyInput.setCustomValidity("");
      return null;
    }

    if (!Number.isFinite(cost) || cost < 0) {
      costInput.setCustomValidity("Cost must be 0 or more.");
      costInput.reportValidity();
      costInput.setCustomValidity("");
      return null;
    }

    items.push({
      product,
      qty,
      cost: Number(cost.toFixed(2)),
      lineTotal: Number((qty * cost).toFixed(2)),
    });
  }

  if (!items.length) {
    const firstProductInput = dom.orderItemsBody.querySelector(".product-input") || dom.orderItemsBody.querySelector('input[type="text"]');
    firstProductInput?.setCustomValidity("Add at least one product.");
    firstProductInput?.reportValidity();
    firstProductInput?.setCustomValidity("");
    return null;
  }

  return items;
}

function updateOrderTotals() {
  const rows = Array.from(dom.orderItemsBody.querySelectorAll("tr"));
  const subtotal = rows.reduce(function (sum, row) {
    const qty = Number(row.querySelector(".qty-input")?.value || 0);
    const cost = Number(row.querySelector(".cost-input")?.value || 0);
    return sum + (qty * cost);
  }, 0);

  dom.subtotalValue.textContent = formatCurrency(subtotal);
  dom.totalValue.textContent = formatCurrency(subtotal);
}

function resetOrderForm() {
  dom.form?.reset();
  prepareSupplierSelect();

  if (dom.orderDate) {
    dom.orderDate.value = new Date().toISOString().split("T")[0];
  }

  dom.orderItemsBody.innerHTML = createItemRow();
  updateOrderTotals();
}

async function createOrder() {
  const supplier = dom.supplierSelect.value.trim();

  dom.supplierSelect.setCustomValidity("");

  if (!supplier) {
    dom.supplierSelect.setCustomValidity("Please select a supplier.");
    dom.supplierSelect.reportValidity();
    dom.supplierSelect.setCustomValidity("");
    return;
  }

  const items = collectOrderItems();
  if (!items) return;

  const totalQuantity = items.reduce(function (sum, item) {
    return sum + item.qty;
  }, 0);

  const totalCost = items.reduce(function (sum, item) {
    return sum + item.lineTotal;
  }, 0);

  const order = {
    id: generateOrderId(),
    supplier,
    date: dom.orderDate.value || new Date().toISOString().split("T")[0],
    items,
    itemsCount: totalQuantity,
    totalCost: Number(totalCost.toFixed(2)),
    status: "Pending",
  };

  const originalButtonText = dom.saveBtn.innerHTML;
  dom.saveBtn.disabled = true;
  dom.saveBtn.innerHTML = "Saving...";

  try {
    await postData("orders", order);
    state.page = 1;
    state.search = "";
    if (dom.searchInput) dom.searchInput.value = "";
    modalInstance?.hide();
    resetOrderForm();
    await loadOrders();
  } catch (error) {
    console.error("Unable to create order:", error);
    alert("Unable to save the order. Please try again.");
  } finally {
    dom.saveBtn.disabled = false;
    dom.saveBtn.innerHTML = originalButtonText;
  }
}

async function handleOrderAction(event) {
  const deleteButton = event.target.closest('[data-action="delete"]');
  if (!deleteButton) return;

  const orderId = deleteButton.dataset.orderId;
  await deleteOrder(orderId);
}

async function deleteOrder(orderId) {
  const confirmed = window.confirm(`Delete order ${orderId}?`);
  if (!confirmed) return;

  try {
    await deleteData("orders", orderId);
    await loadOrders();
  } catch (error) {
    console.error("Unable to delete order:", error);
    alert("Unable to delete the order. Please try again.");
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);
}

function formatDate(dateString) {
  if (!dateString) return "-";

  const parsedDate = new Date(dateString);
  if (Number.isNaN(parsedDate.getTime())) {
    return escapeHtml(String(dateString));
  }

  return parsedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function generateOrderId() {
  return `PO-${Date.now().toString().slice(-8)}`;
}

function getStatusClass(status) {
  return String(status || "pending")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
>>>>>>> amer-from-ahmed
