renderNavbar("Orders");
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