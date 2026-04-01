renderNavbar("Categories");
renderFooter();

// Selectors
const tableBody = document.getElementById("categoriesTableBody");
const searchInput = document.getElementById("searchByCategoryName");
const formSelect = document.getElementById("formSelect");
const sortCategoryName = document.getElementById("sortCategoryName");
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
let allCategoriesData = [];
let filteredCategoriesData = [];
let editCategoryId = null;

// State
const state = {
  page: 1,
  limit: 5,
  totalCount: 0,
  sortOrder: null, // null | "asc" | "desc"
};

// Helpers
function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getCategoryIconClass(name) {
  const categoryName = String(name || "").toLowerCase();

  if (categoryName.includes("elect")) return "icon-purple-bg";
  if (categoryName.includes("food") || categoryName.includes("groc"))
    return "icon-green-bg";
  if (categoryName.includes("office") || categoryName.includes("station"))
    return "icon-yellow-bg";
  if (categoryName.includes("mobile") || categoryName.includes("tech"))
    return "icon-blue-bg";
  return "icon-red-bg";
}

function getCategoryIcon(name) {
  const categoryName = String(name || "").toLowerCase();

  if (categoryName.includes("elect")) return "fa-tv";
  if (categoryName.includes("food") || categoryName.includes("groc"))
    return "fa-basket-shopping";
  if (categoryName.includes("office") || categoryName.includes("station"))
    return "fa-pen";
  if (categoryName.includes("mobile") || categoryName.includes("tech"))
    return "fa-mobile-screen";
  return "fa-box";
}

function resetModal() {
  editCategoryId = null;
  modalTitle.textContent = "Add New Category";

  categoryNameInput.value = "";
  categoryDescriptionInput.value = "";
  categoryProductsInput.value = "";
  categoryStatusInput.value = "";

  categoryNameInput.setCustomValidity("");
  categoryDescriptionInput.setCustomValidity("");
  categoryProductsInput.setCustomValidity("");
  categoryStatusInput.setCustomValidity("");

  categoryNameInput.style.border = "";
  categoryDescriptionInput.style.border = "";
  categoryProductsInput.style.border = "";
  categoryStatusInput.style.border = "";
}

function openAddModal() {
  resetModal();
  showModal();
}

function openEditModal(id) {
  const category = allCategoriesData.find(function (cat) {
    return String(cat.id) === String(id);
  });

  if (!category) return;

  editCategoryId = id;
  modalTitle.textContent = "Edit Category";
  categoryNameInput.value = category.name || "";
  categoryDescriptionInput.value = category.description || "";
  categoryProductsInput.value = category.productsCount ?? 0;
  categoryStatusInput.value = String(
    category.status || "inactive",
  ).toLowerCase();

  showModal();
}

function updateTableInfo() {
  if (!filteredCategoriesData.length) {
    tableInfo.textContent = "Showing 0 to 0 of 0 entries";
    return;
  }

  const start = (state.page - 1) * state.limit + 1;
  const end = Math.min(state.page * state.limit, filteredCategoriesData.length);

  tableInfo.textContent = `Showing ${start} to ${end} of ${filteredCategoriesData.length} entries`;
}

// Confirm modal
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

// Render rows
function renderCategoryRows(data) {
  tableBody.innerHTML = "";

  if (!data.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="dataNotMatch">No Data Matched!!</td>
      </tr>
    `;
    return;
  }

  data.forEach(function (cat) {
    const iconBg = getCategoryIconClass(cat.name);
    const iconClass = getCategoryIcon(cat.name);
    const statusValue = String(cat.status || "inactive").toLowerCase();
    const statusText = statusValue === "active" ? "Active" : "Inactive";

    tableBody.innerHTML += `
      <tr data-id="${cat.id}">
        <td>
          <div class="category-cell">
            <div class="category-icon ${iconBg}">
              <i class="fa-solid ${iconClass}"></i>
            </div>
            <span class="category-name">${escapeHTML(cat.name || "-")}</span>
          </div>
        </td>
        <td>
          <p class="category-desc mb-0">${escapeHTML(cat.description || "-")}</p>
        </td>
        <td>
          <span class="products-count">${cat.productsCount ?? 0}</span>
        </td>
        <td>
          <span class="cat-status ${statusValue}">
            ${statusText}
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
  });
}

// Render current table page
function renderTable() {
  const start = (state.page - 1) * state.limit;
  const end = start + state.limit;
  const paginatedData = filteredCategoriesData.slice(start, end);

  renderCategoryRows(paginatedData);
  updateTableInfo();
}

// Render full page
function renderCategoriesPage() {
  renderTable();
  renderPagination(paginationContainer, state, renderCategoriesPage);
}

// Search + Filter + Sort
function applyFilters() {
  let result = [...allCategoriesData];

  const searchValue = searchInput.value.trim().toLowerCase();
  const selectedStatus = formSelect.value.trim().toLowerCase();

  // Search by category name or description
  if (searchValue !== "") {
    result = result.filter(function (cat) {
      return (
        String(cat.name || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(cat.description || "")
          .toLowerCase()
          .includes(searchValue)
      );
    });
  }

  // Filter by status
  if (selectedStatus !== "" && selectedStatus !== "all") {
    result = result.filter(function (cat) {
      return String(cat.status || "").toLowerCase() === selectedStatus;
    });
  }

  // Sort by category name only
  if (state.sortOrder === "asc") {
    result.sort(function (a, b) {
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
  } else if (state.sortOrder === "desc") {
    result.sort(function (a, b) {
      return String(b.name || "").localeCompare(String(a.name || ""));
    });
  }

  filteredCategoriesData = result;
  state.totalCount = filteredCategoriesData.length;
  renderCategoriesPage();
}

// Load categories
async function loadCategories() {
  try {
    const categoriesResponse = await getData("categories");
    const productsResponse = await getData("products");

    const categories = categoriesResponse.data || [];
    const products = productsResponse.data || [];

    allCategoriesData = categories.map(function (cat) {
      const realCount = products.filter(function (product) {
        return String(product.categoryId) === String(cat.id);
      }).length;

      return {
        ...cat,
        description: cat.description || "No description provided",
        productsCount: cat.productsCount ?? realCount,
        status: String(
          cat.status || (realCount > 0 ? "active" : "inactive"),
        ).toLowerCase(),
      };
    });

    state.page = 1;
    applyFilters();
  } catch (error) {
    console.error("Error loading categories:", error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center">Failed to load categories</td>
      </tr>
    `;
    paginationContainer.innerHTML = "";
    tableInfo.textContent = "Showing 0 to 0 of 0 entries";
  }
}

// Save category
async function saveCategory() {
  validateInputs(
    /^[A-Za-z0-9\s&-]{3,50}$/,
    categoryNameInput,
    "Please enter a valid category name",
  );

  validateInputs(
    /^.{3,150}$/,
    categoryDescriptionInput,
    "Please enter a valid description",
  );

  validateInputs(
    /^\d+$/,
    categoryProductsInput,
    "Please enter a valid products count",
  );

  validateSelect(categoryStatusInput);

  const isValid =
    categoryNameInput.checkValidity() &&
    categoryDescriptionInput.checkValidity() &&
    categoryProductsInput.checkValidity() &&
    categoryStatusInput.checkValidity();

  if (!isValid) return;

  const categoryData = {
    name: categoryNameInput.value.trim(),
    description: categoryDescriptionInput.value.trim(),
    productsCount: parseInt(categoryProductsInput.value) || 0,
    status: categoryStatusInput.value.toLowerCase(),
  };

  try {
    if (editCategoryId) {
      const oldCategory = allCategoriesData.find(function (cat) {
        return String(cat.id) === String(editCategoryId);
      });

      await putData("categories", editCategoryId, {
        id: String(editCategoryId),
        ...(oldCategory || {}),
        ...categoryData,
      });
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

// Delete category
function deleteCategory(id) {
  showConfirmModal(
    "Are you sure you want to delete this category?",
    async function () {
      try {
        await deleteData("categories", id);
        await loadCategories();

        const maxPage = Math.ceil(state.totalCount / state.limit) || 1;
        if (state.page > maxPage) {
          state.page = maxPage;
        }

        applyFilters();
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    },
  );
}

// Table actions
tableBody.addEventListener("click", function (e) {
  const editBtn = e.target.closest(".edit-btn");
  const deleteBtn = e.target.closest(".delete-btn");

  if (editBtn) {
    openEditModal(editBtn.dataset.id);
  }

  if (deleteBtn) {
    deleteCategory(deleteBtn.dataset.id);
  }
});

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

searchInput.addEventListener("input", function () {
  state.page = 1;
  applyFilters();
});

formSelect.addEventListener("change", function () {
  state.page = 1;
  applyFilters();
});

sortCategoryName.addEventListener("click", function () {
  if (state.sortOrder === null) {
    state.sortOrder = "asc";
  } else if (state.sortOrder === "asc") {
    state.sortOrder = "desc";
  } else {
    state.sortOrder = null;
  }

  state.page = 1;
  applyFilters();
});

// Init
loadCategories();
