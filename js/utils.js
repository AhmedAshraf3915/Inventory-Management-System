// * json-server --watch db.json --port 3000

// Fun for NavBar
function renderNavbar(activePage) {
  // Top NavBar
  const topNavbar = `
    <nav class="navbar navbar-expand-lg px-4" style="background-color: var(--primary); height: var(--topbar-height);">

        <a class="navbar-brand d-flex align-items-center gap-2 fw-bold text-white" href="dashboard.html">
            <img src="assets/logo.png" alt="InvenTrack" width="32" height="32" class="rounded-circle" />
            InvenTrack
        </a>

        <div class="ms-auto d-flex align-items-center gap-3">
            <i class="fas fa-bell fs-5 text-white"></i>
            <div>
                <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" width="34" height="34" class="rounded-circle border border-white" role="button" data-bs-toggle="dropdown" alt="profile" />
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="#">Profile</a></li>
                    <li><hr class="dropdown-divider" /></li>
                    <li><a class="dropdown-item text-danger" href="index.html">Logout</a></li>
                </ul>
            </div>
        </div>

    </nav>
  `;

  //   Second NavBar
  const pages = [
    { label: "Dashboard", icon: "fa-gauge", href: "dashboard.html" },
    { label: "Products", icon: "fa-box", href: "products.html" },
    { label: "Categories", icon: "fa-tags", href: "categories.html" },
    { label: "Suppliers", icon: "fa-truck", href: "suppliers.html" },
    { label: "Orders", icon: "fa-cart-shopping", href: "orders.html" },
    { label: "InventoryInsights", icon: "fa-chart-bar", href: "inventoryInsights.html" },
    { label: "InventoryOverview", icon: "fa-chart-bar", href: "inventoryOverview.html" },
  ];

  const navItems = pages
    .map(
      (page) => `
    <li class="nav-item">
        <a class="nav-link ${activePage === page.label ? "active" : ""}" href="${page.href}">
            <i class="fas ${page.icon} me-1"></i>${((page.label).split('y')).join('y ')}
        </a>
    </li>
  `,
    )
    .join("");

  const secondNavbar = `
    <nav class="navbar navbar-expand-lg px-4" style="background-color: #fff; border-bottom: 2px solid #e5e0f5;">

             <a class="nav-link active d-flex d-lg-none align-items-center gap-2 fw-semibold" style="color: var(--primary);" href="#">
                <i class="fas ${pages.find((p) => p.label === activePage)?.icon} me-1"></i>${activePage}
             </a>

             <button class="navbar-toggler ms-auto" type="button" data-bs-toggle="collapse" data-bs-target="#secondNavMenu">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="secondNavMenu">
                <ul class="navbar-nav flex-row flex-wrap gap-1 me-auto">
                    ${navItems}
                </ul>
            </div>

    </nav>
  `;

  document.getElementById("top-navbar").innerHTML = topNavbar;
  document.getElementById("second-navbar").innerHTML = secondNavbar;
}

function renderFooter() {
  const footer = `
    <div class="container">
      <p>copyright@invenTrack.com</p>
    </div>
 `
  document.getElementById('footer').innerHTML = footer;
}

// * Modal Helpers

const closeModal = function () {
  modal.classList.add('hidden')
  modalOverlay.classList.add('hidden')
}
const showModal = function () {
  modal.classList.remove('hidden')
  modalOverlay.classList.remove('hidden')
}

// * Search functionality (Should be suitable for all pages)


// ^ search By Name
async function searchByName(endpoint, searchInputValue) {
  let pageData = (await getData(`${endpoint}`)).data
  let dataAfterFilteration = pageData.filter((data) => {
    return data.name.toLowerCase().includes(searchInputValue.toLowerCase());
  });
  return dataAfterFilteration;
}

// ^ filter By Status
async function filterByStatus(selectValue, endpoint) {
  let pageData = (await getData(`${endpoint}`)).data
  if (!selectValue.value || selectValue.value !== 'all') {
    return pageData.filter((data) => {
      return data.status.toLowerCase() === selectValue.value.toLowerCase()
    });
  }
  else {
    return pageData
  }
}



// * Sort Functionality (Should be suitable for all pages)




// * Pagination

// ~ notes for pagination in Yur HTML you should only add this html tag at the same level of your table of data
// * <div id="pagination" class="container w-50 d-flex align-items-center justify-content-between"> </div > 

// & Calculate total pages number
function getTotalPages(totalCount, limit) {
  return Math.ceil(totalCount / limit);
}

// & Rendering Pagination
// ^ Container > is the pagination container you want buttons inside 
// ^ state > I added it in each js page so you can control pagination state using one VARIABLE (Object) istead ot multiple Variables
// ^ onPageChange > is a parameter representing the renderTable function which is used to render data in the table from the json file

// ! Don't forget to call it every time (After rendering data and if no products found also but not in < network error > (Getting data from json file))

function renderPagination(container, state, onPageChange) {
  if (!container) {
    console.error("Pagination container not found");
    return;
  }

  container.innerHTML = "";

  const totalPages = Math.ceil(state.totalCount / state.limit);

  if (totalPages <= 1) return;

  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Prev";
  prevBtn.classList.add('prevBtn')
  prevBtn.disabled = state.page === 1;
  prevBtn.addEventListener("click", function () {
    if (state.page > 1) {
      state.page--;
      onPageChange();
    }
  });
  container.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.classList.add('pagePaginateBtn')
    btn.textContent = i;

    if (i === state.page) {
      btn.classList.add("active");
      btn.classList.add('colored')
    }

    btn.addEventListener("click", function () {
      state.page = i;
      onPageChange();
    });

    container.appendChild(btn);
  }

  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.classList.add('nextBtn')
  nextBtn.disabled = state.page === totalPages;
  nextBtn.addEventListener("click", function () {
    if (state.page < totalPages) {
      state.page++;
      onPageChange();
    }
  });
  container.appendChild(nextBtn);
}


// * Validation 

function validateInputs(regexForValidInput, inputElement, messageShowForUser) {
  const value = inputElement.value.trim();

  if (regexForValidInput.test(value)) {
    inputElement.setCustomValidity("");
    inputElement.style.border = "2px solid rgb(0, 208, 59)";
  } else {
    inputElement.setCustomValidity(messageShowForUser);
    inputElement.reportValidity();
    inputElement.style.border = "2px solid rgba(255, 89, 89, 0.89)";
  }
}

function validateSelect(selectValidate) {
  if (selectValidate.value === "") {
    selectValidate.setCustomValidity("Please select a value");
    selectValidate.reportValidity();
    selectValidate.style.border = "2px solid rgba(255, 89, 89, 0.89)";
  } else {
    selectValidate.setCustomValidity("");
    selectValidate.style.border = "2px solid rgb(0, 208, 59)";
  }
}


// * Get Stock Class 

function getStockClass(quantity, minStock) {
  if (quantity === 0) return "stock-critical";
  if (quantity <= minStock) return "stock-critical";
  return "stock-normal";
}