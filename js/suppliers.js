// selectors
let showDatainTable = document.querySelector("tbody");
let searchSuppliersByName = document.querySelector("#searchBySupplierName");
let formSelect = document.querySelector("#formSelect");
let addSupplier = document.querySelector("#addSupplier");
let modal = document.querySelector(".modal");
let supplierName = document.querySelector("#supplierName");
let contactPerson = document.querySelector("#contactPerson");
let supplierMail = document.querySelector("#supplierMail");
let supplierPhone = document.querySelector("#supplierPhone");
let selectStatus = document.querySelector("#select");
let physicalAddress = document.querySelector("textarea");
let saveSupplier = document.querySelector("#saveSupplier");
let targetID = null;
const paginationContainer = document.querySelector("#pagination");
let allSuppliersData = [];
let sortSupplierName = document.querySelector("#sortSupplierName");

// initial render
renderNavbar("Suppliers");
loadAndRenderSuppliers();
setupInputValidation();
renderFooter();

// pagination state
const state = {
    page: 1,
    limit: 5,
    totalCount: 0
};

// -----------------------------
// Pagination
// -----------------------------
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
    prevBtn.classList.add("prevBtn");
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
        btn.classList.add("pagePaginateBtn");
        btn.textContent = i;

        if (i === state.page) {
            btn.classList.add("active", "colored");
        }

        btn.addEventListener("click", function () {
            state.page = i;
            onPageChange();
        });

        container.appendChild(btn);
    }

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.classList.add("nextBtn");
    nextBtn.disabled = state.page === totalPages;
    nextBtn.addEventListener("click", function () {
        if (state.page < totalPages) {
            state.page++;
            onPageChange();
        }
    });
    container.appendChild(nextBtn);
}

// render only current table page
function renderTable() {
    const start = (state.page - 1) * state.limit;
    const end = start + state.limit;
    const paginatedData = allSuppliersData.slice(start, end);

    showDatainTable.innerHTML = "";

    if (paginatedData.length === 0) {
        showDatainTable.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;">No Data Matched!!</td>
      </tr>
    `;
        return;
    }

    renderSuppliersRows(paginatedData);
}

// render table + pagination together
function renderSuppliersPage() {
    renderTable();
    renderPagination(paginationContainer, state, renderSuppliersPage);
}

// -----------------------------
// Helpers
// -----------------------------
function firstLatterOfSuppliers(suppliersName) {
    let arrStr = suppliersName.trim().split(" ");
    let firstLetter = [];

    for (let index = 0; index < arrStr.length; index++) {
        if (arrStr[index]) {
            firstLetter.push(arrStr[index].charAt(0).toUpperCase());
        }
    }

    return firstLetter.join("");
}

function getNextSupplierId(data) {
    if (!data.length) return 1;

    let maxId = Math.max(...data.map((item) => Number(item.id)));
    return maxId + 1;
}

// -----------------------------
// Load data
// -----------------------------
async function loadAndRenderSuppliers() {
    try {
        let suppliersData = (await getData("suppliers")).data;

        allSuppliersData = suppliersData;
        state.page = 1;
        state.totalCount = suppliersData.length;

        renderSuppliersPage();
    } catch (error) {
        console.error("Failed to load suppliers:", error);
        showDatainTable.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;">Failed to load suppliers</td>
      </tr>
    `;
        paginationContainer.innerHTML = "";
    }
}

// -----------------------------
// Search by supplier name
// -----------------------------
searchSuppliersByName.addEventListener("input", async () => {
    try {
        let searchInputValue = searchSuppliersByName.value.trim();

        let search = await searchByName("suppliers", searchInputValue);

        allSuppliersData = search;
        state.page = 1;
        state.totalCount = search.length;

        if (search.length === 0) {
            showDatainTable.classList.add("dataNotMatch");
            showDatainTable.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;">No Data Matched!!</td>
        </tr>
      `;
            paginationContainer.innerHTML = "";
            return;
        }

        showDatainTable.classList.remove("dataNotMatch");
        renderSuppliersPage();
    } catch (error) {
        console.error("Search failed:", error);
    }
});

// -----------------------------
// Filter by status
// -----------------------------
formSelect.addEventListener("change", async () => {
    try {
        let formSelectFilter = await filterByStatus(formSelect, "suppliers");

        allSuppliersData = formSelectFilter;
        state.page = 1;
        state.totalCount = formSelectFilter.length;

        if (formSelectFilter.length === 0) {
            showDatainTable.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;">No Data Matched!!</td>
        </tr>
      `;
            paginationContainer.innerHTML = "";
            return;
        }

        renderSuppliersPage();
    } catch (error) {
        console.error("Filter failed:", error);
    }
});

// -----------------------------
// Render rows
// -----------------------------
function renderSuppliersRows(dataAfterFilter) {
    dataAfterFilter.forEach((dataFilter) => {
        let statusClass =
            dataFilter.status === "Active" ? "status_active" : "status_inactive";

        showDatainTable.innerHTML += `
      <tr id="${dataFilter.id}">
        <td>
          <p>
            <span class="first-latter rounded-4 text-center p-2" id="firstLatter">
              ${firstLatterOfSuppliers(dataFilter.name)}
            </span>
            ${dataFilter.name}
          </p>
        </td>
        <td>${dataFilter.contactPerson}</td>
        <td>${dataFilter.phone}</td>
        <td><a href="mailto:${dataFilter.email}">${dataFilter.email}</a></td>
        <td>${dataFilter.address}</td>
        <td>
          <div class="${statusClass}">
            ${dataFilter.status}
          </div>
        </td>
        <td>
          <button class="btn edit_supplier_btn" data-bs-toggle="modal" data-bs-target="#exampleModal" id="editSupplierBtn">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="btn delete_supplier_btn" id="deleteSupplierBtn">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
    });
}

// -----------------------------
// Sort by supplier name
// -----------------------------
sortSupplierName.addEventListener("click", () => {
    allSuppliersData.sort((a, b) => a.name.localeCompare(b.name));
    state.page = 1;
    renderSuppliersPage();
});

// -----------------------------
// Validation
// -----------------------------
function setupInputValidation() {
    supplierName.addEventListener("input", () =>
        validateInputs(
            "^[A-Za-z\\s]{3,60}$",
            supplierName,
            "Please Enter Valid Supplier Name"
        )
    );

    contactPerson.addEventListener("input", () =>
        validateInputs(
            "^[A-Za-z\\s]{3,60}$",
            contactPerson,
            "Please Enter Valid Contact Person"
        )
    );

    supplierMail.addEventListener("input", () =>
        validateInputs(
            "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
            supplierMail,
            "Please enter a valid email"
        )
    );

    supplierPhone.addEventListener("input", () =>
        validateInputs(
            "^01[0125][0-9]{8}$",
            supplierPhone,
            "Enter valid Egyptian phone number"
        )
    );

    selectStatus.addEventListener("change", () => {
        validateSelect(selectStatus);
    });

    physicalAddress.addEventListener("input", () =>
        validateInputs(
            "^.{3,100}$",
            physicalAddress,
            "Enter valid Physical Address"
        )
    );
}

// -----------------------------
// Add supplier
// -----------------------------
addSupplier.addEventListener("click", () => {
    targetID = null;

    supplierName.value = "";
    contactPerson.value = "";
    supplierPhone.value = "";
    supplierMail.value = "";
    physicalAddress.value = "";
    selectStatus.value = "";
});

// single save handler for add + edit
saveSupplier.addEventListener("click", async (e) => {
    e.preventDefault();

    try {
        const supplierObject = {
            name: supplierName.value.trim(),
            contactPerson: contactPerson.value.trim(),
            phone: supplierPhone.value.trim(),
            email: supplierMail.value.trim(),
            address: physicalAddress.value.trim(),
            status: selectStatus.value
        };

        if (targetID) {
            await putData("suppliers", targetID, supplierObject);
        } else {
            const freshSuppliers = (await getData("suppliers")).data;
            const newSupplierId = getNextSupplierId(freshSuppliers);

            await postData("suppliers", {
                id: newSupplierId,
                ...supplierObject
            });
        }

        await loadAndRenderSuppliers();
    } catch (error) {
        console.error("Save failed:", error);
    }
});

// -----------------------------
// Edit / Delete
// -----------------------------
showDatainTable.addEventListener("click", async (e) => {
    let editBtn = e.target.closest(".edit_supplier_btn");
    let deleteBtn = e.target.closest(".delete_supplier_btn");

    // Edit
    if (editBtn) {
        let rowDataSupp_ofTarget = editBtn.closest("tr");
        targetID = rowDataSupp_ofTarget.id;

        try {
            const supplier = allSuppliersData.find(
                (item) => String(item.id) === String(targetID)
            );

            if (!supplier) return;

            supplierName.value = supplier.name;
            contactPerson.value = supplier.contactPerson;
            supplierPhone.value = supplier.phone;
            supplierMail.value = supplier.email;
            physicalAddress.value = supplier.address;
            selectStatus.value = supplier.status;
        } catch (error) {
            console.error("Edit failed:", error);
        }
    }

    // Delete
    if (deleteBtn) {
        let row = deleteBtn.closest("tr");
        let currentId = row.id;

        if (confirm(`Are You Sure to Delete ${row.children[0].innerText.trim()} ?`)) {
            try {
                await deleteData("suppliers", currentId);

                // if deleting last item on page, go back one page if needed
                if (
                    state.page > 1 &&
                    (state.page - 1) * state.limit >= allSuppliersData.length - 1
                ) {
                    state.page--;
                }

                await loadAndRenderSuppliers();
            } catch (error) {
                console.error("Delete failed:", error);
            }
        } else {
            alert("Suppliers wasn't Deleted");
        }
    }
});