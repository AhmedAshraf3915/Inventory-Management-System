renderNavbar("Categories");
renderFooter();

// DOM
const tableBody = document.getElementById("categoriesTableBody");
const searchInput = document.getElementById("categorySearch");
const paginationContainer = document.getElementById("pagination");
const tableInfo = document.getElementById("inventoryTableInfo");

const addCategoryBtn = document.getElementById("addCategoryBtn");

// Main modal
const modal = document.getElementById("categoryModal");
const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalCloseBtn = document.getElementById("modalClose");
const cancelBtn = document.getElementById("cancelBtn");
const saveCategoryBtn = document.getElementById("saveCategoryBtn");

// Form inputs
const categoryNameInput = document.getElementById("categoryName");
const categoryDescriptionInput = document.getElementById("categoryDescription");
const categoryProductsInput = document.getElementById("categoryProducts");
const categoryStatusInput = document.getElementById("categoryStatus");

// Confirm modal
const confirmModal = document.getElementById("confirmModal");
const confirmMessage = document.getElementById("confirmMessage");
const confirmOk = document.getElementById("confirmOk");
const confirmCancel = document.getElementById("confirmCancel");
const confirmClose = document.getElementById("confirmClose");

// Data
let categoriesData = [];
let filteredData = [];
let editCategoryId = null;

// State
const state = {
  page: 1,
  limit: 5,
  totalCount: 0
};


// Confirm modal functions
function showConfirmModal(message, onConfirm) {
  confirmMessage.textContent = message;
  confirmModal.classList.remove("hidden");
  modalOverlay.classList.remove("hidden");

  function cleanup() {
    confirmOk.removeEventListener("click", handleConfirm);
    confirmCancel.removeEventListener("click", handleCancel);
    confirmClose.removeEventListener("click", handleCancel);
  }

  function hideConfirmModal() {
    confirmModal.classList.add("hidden");
    modalOverlay.classList.add("hidden");
  }

  function handleConfirm() {
    hideConfirmModal();
    cleanup();
    onConfirm();
  }

  function handleCancel() {
    hideConfirmModal();
    cleanup();
  }

  confirmOk.addEventListener("click", handleConfirm);
  confirmCancel.addEventListener("click", handleCancel);
  confirmClose.addEventListener("click", handleCancel);
}

function resetModal() {
  editCategoryId = null;
  modalTitle.textContent = "Add New Category";
  categoryNameInput.value = "";
  categoryDescriptionInput.value = "";
  categoryProductsInput.value = "";
  categoryStatusInput.value = "";
}

function openAddModal() {
  resetModal();
  showModal();
}

function openEditModal(id) {
  const category = categoriesData.find(function (cat) {
    return String(cat.id) === String(id);
  });

  if (!category) return;

  editCategoryId = id;
  modalTitle.textContent = "Edit Category";
  categoryNameInput.value = category.name || "";
  categoryDescriptionInput.value = category.description || "";
  categoryProductsInput.value = category.productsCount ?? 0;
  categoryStatusInput.value = category.status || "inactive";

  showModal();
}

async function loadCategories() {
  try {
    const categoriesResponse = await getData("categories");
    const productsResponse = await getData("products");

    const categories = categoriesResponse.data || [];
    const products = productsResponse.data || [];

    categoriesData = categories.map(function (cat) {
      const realCount = products.filter(function (product) {
        return String(product.categoryId) === String(cat.id);
      }).length;

      return {
        ...cat,
        description: cat.description || "No description provided",
        productsCount: cat.productsCount ?? realCount,
        status: cat.status || (realCount > 0 ? "active" : "inactive")
      };
    });

    categoriesData.sort(function (a, b) {
      return (a.name || "").localeCompare(b.name || "");
    });

    filteredData = [...categoriesData];
    state.page = 1;
    renderCategoriesPage();
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

function renderCategoriesPage() {
  state.totalCount = filteredData.length;

  const totalPages = Math.ceil(state.totalCount / state.limit) || 1;

  if (state.page > totalPages) {
    state.page = totalPages;
  }

  const startIndex = (state.page - 1) * state.limit;
  const endIndex = startIndex + state.limit;
  const pageData = filteredData.slice(startIndex, endIndex);

  if (!pageData.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center">No categories found.</td>
      </tr>
    `;
  } else {
    tableBody.innerHTML = pageData
      .map(function (cat) {
        return `
          <tr data-id="${cat.id}">
            <td>
              <div class="category-cell">
                <div class="category-icon icon-purple-bg">
                  <i class="fa-solid fa-box"></i>
                </div>
                <span class="category-name">${cat.name || "-"}</span>
              </div>
            </td>
            <td class="category-desc">${cat.description || "-"}</td>
            <td class="products-count">${cat.productsCount ?? 0}</td>
            <td>
              <span class="cat-status ${cat.status}">
                ${cat.status}
              </span>
            </td>
            <td>
              <div class="action-btns d-flex gap-2">
                <button class="action-btn edit-btn" data-id="${cat.id}" type="button">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button class="action-btn delete-btn" data-id="${cat.id}" type="button">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");
  }

  updateTableInfo();
  renderPagination();
  bindTableActions();
}

function updateTableInfo() {
  if (!filteredData.length) {
    tableInfo.textContent = "Showing 0 of 0 categories";
    return;
  }

  const startItem = (state.page - 1) * state.limit + 1;
  const endItem = Math.min(state.page * state.limit, filteredData.length);

  tableInfo.textContent = `Showing ${startItem}-${endItem} of ${filteredData.length} categories`;
}

function renderPagination() {
  const totalPages = Math.ceil(state.totalCount / state.limit) || 1;

  let html = `
    <button class="page-btn" type="button" data-page="prev" ${state.page === 1 ? "disabled" : ""}>
      Prev
    </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="page-btn ${state.page === i ? "active" : ""}" type="button" data-page="${i}">
        ${i}
      </button>
    `;
  }

  html += `
    <button class="page-btn" type="button" data-page="next" ${state.page === totalPages ? "disabled" : ""}>
      Next
    </button>
  `;

  paginationContainer.innerHTML = html;

  const pageButtons = paginationContainer.querySelectorAll(".page-btn");

  pageButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const pageValue = btn.dataset.page;

      if (pageValue === "prev" && state.page > 1) {
        state.page--;
      } else if (pageValue === "next" && state.page < totalPages) {
        state.page++;
      } else if (!isNaN(pageValue)) {
        state.page = Number(pageValue);
      }

      renderCategoriesPage();
    });
  });
}

function bindTableActions() {
  const editButtons = document.querySelectorAll(".edit-btn");
  const deleteButtons = document.querySelectorAll(".delete-btn");

  editButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      openEditModal(btn.dataset.id);
    });
  });

  deleteButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      deleteCategory(btn.dataset.id);
    });
  });
}

function applySearch() {
  const query = searchInput.value.trim().toLowerCase();

  filteredData = categoriesData.filter(function (cat) {
    return (
      (cat.name || "").toLowerCase().includes(query) ||
      (cat.description || "").toLowerCase().includes(query) ||
      (cat.status || "").toLowerCase().includes(query)
    );
  });

  state.page = 1;
  renderCategoriesPage();
}

async function saveCategory() {
  const name = categoryNameInput.value.trim();
  const description = categoryDescriptionInput.value.trim();
  const productsCount = parseInt(categoryProductsInput.value) || 0;
  const status = categoryStatusInput.value || "inactive";

  if (!name) {
    alert("Category name is required");
    return;
  }

  const categoryData = {
    name,
    description,
    productsCount,
    status
  };

  try {
    if (editCategoryId) {
      await putData("categories", editCategoryId, categoryData);
    } else {
      await postData("categories", categoryData);
    }

    closeModal();
    resetModal();
    await loadCategories();
  } catch (error) {
    console.error("Error saving category:", error);
  }
}

function deleteCategory(id) {
  showConfirmModal("Are you sure you want to delete this category?", async function () {
    try {
      await deleteData("categories", id);
      await loadCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  });
}

// Events
addCategoryBtn.addEventListener("click", openAddModal);
modalCloseBtn.addEventListener("click", function () {
  closeModal();
  resetModal();
});
cancelBtn.addEventListener("click", function () {
  closeModal();
  resetModal();
});
modalOverlay.addEventListener("click", function () {
  closeModal();
  resetModal();
  confirmModal.classList.add("hidden");
  modalOverlay.classList.add("hidden");
});

saveCategoryBtn.addEventListener("click", saveCategory);
searchInput.addEventListener("input", applySearch);

// Init
loadCategories();