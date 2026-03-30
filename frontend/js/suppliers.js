// selectors
let showDatainTable = document.querySelector("tbody");
let searchSuppliersByName = document.querySelector("#searchBySupplierName");
let formSelect = document.querySelector("#formSelect");
let exportData = document.getElementById("downloadData");
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
let filteredSuppliersData = [];
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
    totalCount: 0,
    sortOrder: null // null | "asc" | "desc"
};

// -----------------------------
// Render only current table page
// -----------------------------
function renderTable() {
    const start = (state.page - 1) * state.limit;
    const end = start + state.limit;
    const paginatedData = filteredSuppliersData.slice(start, end);

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

// -----------------------------
// Render table + pagination
// -----------------------------
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

function clearValidation(input) {
    input.setCustomValidity("");
    input.style.border = "";
}

function resetFormFields() {
    supplierName.value = "";
    contactPerson.value = "";
    supplierPhone.value = "";
    supplierMail.value = "";
    physicalAddress.value = "";
    selectStatus.value = "";

    clearValidation(supplierName);
    clearValidation(contactPerson);
    clearValidation(supplierPhone);
    clearValidation(supplierMail);
    clearValidation(physicalAddress);
    clearValidation(selectStatus);
}

function escapeCSVValue(value) {
    const stringValue = String(value ?? "");
    if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
    ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
}

function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

// -----------------------------
// Search + Filter + Sort logic
// -----------------------------
function applyFilters() {
    let result = [...allSuppliersData];

    const searchValue = searchSuppliersByName.value.trim().toLowerCase();
    const selectedStatus = formSelect.value.trim();

    // search by supplier name
    if (searchValue !== "") {
        result = result.filter(function (supplier) {
            return supplier.name.toLowerCase().includes(searchValue);
        });
    }

    // filter by status
    if (selectedStatus !== "" && selectedStatus.toLowerCase() !== "all") {
        result = result.filter(function (supplier) {
            return supplier.status.toLowerCase() === selectedStatus.toLowerCase();
        });
    }

    // sort by supplier name
    if (state.sortOrder === "asc") {
        result.sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });
    } else if (state.sortOrder === "desc") {
        result.sort(function (a, b) {
            return b.name.localeCompare(a.name);
        });
    }

    filteredSuppliersData = result;
    state.totalCount = filteredSuppliersData.length;
    renderSuppliersPage();
}

// -----------------------------
// Validation
// -----------------------------
function validateInputs(regexForValidInput, inputElement, messageShowForUser) {
    const inputValue = inputElement.value.trim();

    if (regexForValidInput.test(inputValue)) {
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
        selectValidate.setCustomValidity("Please select value");
        selectValidate.reportValidity();
        selectValidate.style.border = "2px solid rgba(255, 89, 89, 0.89)";
    } else {
        selectValidate.setCustomValidity("");
        selectValidate.style.border = "2px solid rgb(0, 208, 59)";
    }
}

function validateSupplierForm() {
    validateInputs(
        /^[A-Za-z\s]{3,60}$/,
        supplierName,
        "Please Enter Valid Supplier Name"
    );

    validateInputs(
        /^[A-Za-z\s]{3,60}$/,
        contactPerson,
        "Please Enter Valid Contact Person"
    );

    validateInputs(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        supplierMail,
        "Please enter a valid email"
    );

    validateInputs(
        /^01[0125][0-9]{8}$/,
        supplierPhone,
        "Enter valid Egyptian phone number"
    );

    validateInputs(
        /^.{3,100}$/,
        physicalAddress,
        "Enter valid Physical Address"
    );

    validateSelect(selectStatus);

    return (
        supplierName.checkValidity() &&
        contactPerson.checkValidity() &&
        supplierMail.checkValidity() &&
        supplierPhone.checkValidity() &&
        physicalAddress.checkValidity() &&
        selectStatus.checkValidity()
    );
}

function setupInputValidation() {
    supplierName.addEventListener("input", function () {
        validateInputs(
            /^[A-Za-z\s]{3,60}$/,
            supplierName,
            "Please Enter Valid Supplier Name"
        );
    });

    contactPerson.addEventListener("input", function () {
        validateInputs(
            /^[A-Za-z\s]{3,60}$/,
            contactPerson,
            "Please Enter Valid Contact Person"
        );
    });

    supplierMail.addEventListener("input", function () {
        validateInputs(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            supplierMail,
            "Please enter a valid email"
        );
    });

    supplierPhone.addEventListener("input", function () {
        validateInputs(
            /^01[0125][0-9]{8}$/,
            supplierPhone,
            "Enter valid Egyptian phone number"
        );
    });

    selectStatus.addEventListener("change", function () {
        validateSelect(selectStatus);
    });

    physicalAddress.addEventListener("input", function () {
        validateInputs(
            /^.{3,100}$/,
            physicalAddress,
            "Enter valid Physical Address"
        );
    });
}

// -----------------------------
// Load data
// -----------------------------
async function loadAndRenderSuppliers() {
    try {
        let suppliersData = (await getData("suppliers")).data;

        allSuppliersData = suppliersData;
        state.page = 1;

        applyFilters();
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
searchSuppliersByName.addEventListener("input", function () {
    state.page = 1;
    applyFilters();
});

// -----------------------------
// Filter by status
// -----------------------------
formSelect.addEventListener("change", function () {
    state.page = 1;
    applyFilters();
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
// click 1 => asc
// click 2 => desc
// click 3 => reset
// -----------------------------
sortSupplierName.addEventListener("click", function () {
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

// -----------------------------
// Export suppliers data
// Exports current filtered/sorted data
// -----------------------------
exportData.addEventListener("click", function () {
    if (!filteredSuppliersData.length) {
        alert("No supplier data available to export.");
        return;
    }

    const headers = [
        "ID",
        "Supplier Name",
        "Contact Person",
        "Phone",
        "Email",
        "Address",
        "Status"
    ];

    const rows = filteredSuppliersData.map(function (supplier) {
        return [
            escapeCSVValue(supplier.id),
            escapeCSVValue(supplier.name),
            escapeCSVValue(supplier.contactPerson),
            escapeCSVValue(supplier.phone),
            escapeCSVValue(supplier.email),
            escapeCSVValue(supplier.address),
            escapeCSVValue(supplier.status)
        ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const fileName = `suppliers-${new Date().toISOString().slice(0, 10)}.csv`;

    downloadFile(csvContent, fileName, "text/csv;charset=utf-8;");
});

// -----------------------------
// Add supplier
// -----------------------------
addSupplier.addEventListener("click", function () {
    targetID = null;
    resetFormFields();
});

// -----------------------------
// Save supplier
// -----------------------------
saveSupplier.addEventListener("click", async function (e) {
    e.preventDefault();

    if (!validateSupplierForm()) return;

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
            await putData("suppliers", targetID, {
                id: String(targetID),
                ...supplierObject
            });
        } else {
            const freshSuppliers = (await getData("suppliers")).data;
            const newSupplierId = getNextSupplierId(freshSuppliers);

            await postData("suppliers", {
                id: String(newSupplierId),
                ...supplierObject
            });
        }

        resetFormFields();
        targetID = null;
        await loadAndRenderSuppliers();
    } catch (error) {
        console.error("Save failed:", error);
    }
});

// -----------------------------
// Edit / Delete
// -----------------------------
showDatainTable.addEventListener("click", async function (e) {
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

            clearValidation(supplierName);
            clearValidation(contactPerson);
            clearValidation(supplierPhone);
            clearValidation(supplierMail);
            clearValidation(physicalAddress);
            clearValidation(selectStatus);
        } catch (error) {
            console.error("Edit failed:", error);
        }
    }

    // Delete
    if (deleteBtn) {
        let row = deleteBtn.closest("tr");
        let currentId = row.id;
        let supplierRowName = row.children[0].innerText.trim();

        if (confirm(`Are You Sure to Delete ${supplierRowName} ?`)) {
            try {
                await deleteData("suppliers", currentId);
                await loadAndRenderSuppliers();

                const maxPage = Math.ceil(state.totalCount / state.limit) || 1;
                if (state.page > maxPage) {
                    state.page = maxPage;
                }

                applyFilters();
            } catch (error) {
                console.error("Delete failed:", error);
            }
        } else {
            alert("Supplier wasn't deleted");
        }
    }
});