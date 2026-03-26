// * json-server --watch db.json --port 3000

// Fun for NavBar
let profileName = JSON.parse(localStorage.getItem('userName'));

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
                    <li><a class="dropdown-item" href="#">${profileName}</a></li>
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
    { label: "Reports", icon: "fa-chart-bar", href: "reports.html" },
  ];

  const navItems = pages
    .map(
      (page) => `
    <li class="nav-item">
        <a class="nav-link ${activePage === page.label ? "active" : ""}" href="${page.href}">
            <i class="fas ${page.icon} me-1"></i>${page.label}
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
const showMoal = function () {
  modal.classList.remove('hidden')
  modalOverlay.classList.remove('hidden')
}
