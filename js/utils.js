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




// * Search functionality (Should be suitable for all pages)

/**
 * 
 * @param {*} endpoint :--> from api (http://localhost:3000/${endpoint})
 * @param {*} searchInputValue :--> search input Selector
 * @param {*} dataInInnerHTML :--> tbody (table)
 * @returns 
 */ 
    //  search By Name
async function searchByName(endpoint, searchInputValue, dataInnerHTML) {
  let pageData = await getData(`${endpoint}`)
  let dataAfterFilteration = pageData.filter((data) => {
    return data.name.toLowerCase().includes(searchInputValue.toLowerCase()) || data.contactPerson.toLowerCase().includes(searchInputValue.toLowerCase()) || data.email.toLowerCase().includes(searchInputValue.toLowerCase()) 
  });

    dataInnerHTML.innerHTML = ''
    return dataAfterFilteration;

}

  //  filter By Status
async function filterByStatus(selectValue , endpoint) {
  let pageData = await getData(`${endpoint}`)
  if (selectValue.value !== '') {
    return pageData.filter((data) => {
      return data.status.toLowerCase() === selectValue.value.toLowerCase()
    });
  }
}





// * Sort Functionality (Should be suitable for all pages)




// * Pagination



// * ID lookup





// * Validation 

//  /////////////// Validate Name for any ////////////////

/**
 * 
 * @param {*} regexForValidInput : 
 *      for Name :--> ^[A-Za-z\\s]{3,60}$
 *      for Price || Cost :--> ^(100|[1-9][0-9]{2,})$
 *      for Initial quentity:--> ^(1|[1-9][0-9]{2,})$
 * @param {*} NameValidate : 
 *       NameInputValidate :--> input Selector
 * @param {*} messageShowForUser 
 *       messageShowForUser :--> message shown through Validate 
 *       for Name :--> Please Enter Valid ${any Name} :\n  Must Name contains at  -> from 3 character to 40 character!!!
 *       for Price || Cost :-->  Value Must be large than or equal 100
 *       for Initial quentity :--> ...
 * 
 */

function validateInputs(regexForValidInput, NameInputValidate, messageShowForUser) {
  const constraints = `${regexForValidInput}`;
  const constraintRegex = new RegExp(constraints, "");

  if (constraintRegex.test(NameInputValidate.value)) {

    NameInputValidate.setCustomValidity("");
    NameInputValidate.checkValidity()
    NameInputValidate.style.border = '2px solid rgb(0, 208, 59)';

  }
  else {

    NameInputValidate.setCustomValidity(`${messageShowForUser}`);
    NameInputValidate.reportValidity();
    NameInputValidate.style.border = '2px solid rgba(255, 89, 89, 0.89)';

  }
}

function validateSelect(selectValidate) {

  if (selectValidate.value == '') {
    selectValidate.setCustomValidity('please select value')
    selectValidate.reportValidity();
  }

  else {
    selectValidate.setCustomValidity("");
    selectValidate.reportValidity()
  }

}
