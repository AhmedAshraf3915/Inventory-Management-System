<<<<<<< HEAD
renderNavbar("Categories");
renderFooter()
=======
// DOM Elements
const tableBody = document.getElementById("categoriesTableBody");
const modal = document.getElementById("categoryModal");
const addBtn = modal.querySelector(".add-category-btn");
const cancelBtn = document.getElementById("cancelBtn");
const closeBtn = document.getElementById("modalClose");
const searchInput = document.getElementById("categorySearch");
const addCategoryBtn = document.getElementById("addCategoryBtn");
const paginationContainer = document.querySelector(".table-footer .pagination");

renderNavbar("Category");
renderFooter();

// Data
let categoriesData = [];
let filteredData = [];
let editCategoryId = null;

// Pagination state
const state = { page: 1, limit: 5, totalCount: 0 };

// Custom confirm
function showConfirm(message, onConfirm, onCancel = null) {
  const confirmModal = document.getElementById("confirmModal");
  document.getElementById("confirmMessage").textContent = message;
  confirmModal.classList.add("show");

  const okBtn = document.getElementById("confirmOk");
  const cancelBtn = document.getElementById("confirmCancel");
  const closeBtn = document.getElementById("confirmClose");

  const close = () => confirmModal.classList.remove("show");

  const handleOk = () => {
    close();
    onConfirm();
    cleanup();
  };
  const handleCancel = () => {
    close();
    if (onCancel) onCancel();
    cleanup();
  };

  const cleanup = () => {
    okBtn.removeEventListener("click", handleOk);
    cancelBtn.removeEventListener("click", handleCancel);
    closeBtn.removeEventListener("click", handleCancel);
  };

  okBtn.addEventListener("click", handleOk);
  cancelBtn.addEventListener("click", handleCancel);
  closeBtn.addEventListener("click", handleCancel);
}

// Load categories
async function loadCategories() {
  try {
    const { data } = await getData("categories");
    const { data: products } = await getData("products");

    categoriesData = (data || []).map((cat) => {
      const realCount = products.filter((p) => p.categoryId == cat.id).length;
      const productsCount = cat.productsCount ?? realCount;
      const status = productsCount > 0 ? "active" : "inactive";
      return {
        ...cat,
        productsCount,
        status,
        description: cat.description || "No description provided",
      };
    });

    categoriesData.sort((a, b) => a.name.localeCompare(b.name));
    filteredData = [...categoriesData];
    state.page = 1;
    renderCategoriesPage();
  } catch (err) {
    console.error(err);
  }
}

// Render table
function renderCategoriesPage() {
  const pageData = filteredData.slice(
    (state.page - 1) * state.limit,
    state.page * state.limit,
  );

  tableBody.innerHTML = pageData.length
    ? pageData
      .map(
        (cat) => `
        <tr data-id="${cat.id}">
          <td>
            <div class="category-cell">
              <div class="category-icon icon-purple-bg"><i class="fa-solid fa-box"></i></div>
              <span class="category-name">${cat.name || "-"}</span>
            </div>
          </td>
          <td class="category-desc">${cat.description || "-"}</td>
          <td class="products-count">${cat.productsCount}</td>
          <td><span class="cat-status ${cat.status}">${cat.status}</span></td>
          <td>
            <div class="action-btns d-flex gap-2">
              <button class="action-btn edit-btn"><i class="fa-solid fa-pen"></i></button>
              <button class="action-btn delete-btn"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>
        </tr>`,
      )
      .join("")
    : `<tr><td colspan="5" class="text-center">No categories found.</td></tr>`;

  document.getElementById("categoriesCount").textContent =
    `Total Categories: ${filteredData.length}`;

  state.totalCount = filteredData.length;
  renderPagination(paginationContainer, state, renderCategoriesPage);

  document
    .querySelectorAll(".edit-btn")
    .forEach((btn) =>
      btn.addEventListener("click", (e) =>
        openEditModal(e.target.closest("tr").dataset.id),
      ),
    );
  document
    .querySelectorAll(".delete-btn")
    .forEach((btn) =>
      btn.addEventListener("click", (e) =>
        deleteCategory(e.target.closest("tr").dataset.id),
      ),
    );
}

// Search
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase().trim();
  filteredData = categoriesData.filter((cat) =>
    [cat.name, cat.description, cat.status].some((val) =>
      (val || "").toLowerCase().includes(query),
    ),
  );
  state.page = 1;
  renderCategoriesPage();
});

// Open edit modal
function openEditModal(id) {
  editCategoryId = id;
  const cat = categoriesData.find((c) => c.id == id);
  if (!cat) return;

  const inputs = modal.querySelectorAll(".cat-input");
  inputs[0].value = cat.name || "";
  inputs[1].value = cat.description || "";
  inputs[2].value = cat.productsCount ?? 0;
  inputs[3].value = cat.status || "inactive";

  modal.querySelector("h4").textContent = "Edit Category";
  modal.classList.add("show");
}

// Reset modal
function resetModal() {
  editCategoryId = null;
  modal.querySelectorAll(".cat-input").forEach((input) => (input.value = ""));
  modal.querySelector("h4").textContent = "Add New Category";
}

// Save category
addBtn.addEventListener("click", async () => {
  const inputs = modal.querySelectorAll(".cat-input");
  const name = inputs[0].value.trim();
  const description = inputs[1].value.trim();
  const productsCount = parseInt(inputs[2].value) || 0;
  const status = inputs[3].value || "inactive";

  if (!name) return showConfirm("Category name is required", () => { }, null);

  try {
    await (editCategoryId
      ? putData("categories", editCategoryId, {
        name,
        description,
        productsCount,
        status,
      })
      : postData("categories", { name, description, productsCount, status }));

    modal.classList.remove("show");
    resetModal();
    loadCategories();
  } catch (err) {
    console.error(err);
  }
});

// Delete category
async function deleteCategory(id) {
  showConfirm("Are you sure you want to delete this category?", async () => {
    try {
      await deleteData("categories", id);
      loadCategories();
    } catch (err) {
      console.error(err);
    }
  });
}

// Modal open/close
addCategoryBtn.addEventListener("click", () => {
  resetModal();
  modal.classList.add("show");
});
cancelBtn.addEventListener("click", () => {
  modal.classList.remove("show");
  resetModal();
});
closeBtn.addEventListener("click", () => {
  modal.classList.remove("show");
  resetModal();
});
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("show");
    resetModal();
  }
});

// Initialize
loadCategories();
>>>>>>> amer-from-ahmed
