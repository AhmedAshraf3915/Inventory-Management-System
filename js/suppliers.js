//  selector 
let showDatainTable = document.querySelector('tbody');
let searchSuppliersByName = document.querySelector('#searchBySupplierName');
let formSelect = document.querySelector('#formSelect');
let addSupplier = document.querySelector('#addSupplier');
let modal = document.querySelector('.modal')
let supplierName = document.querySelector('#supplierName');
let contactPerson = document.querySelector('#contactPerson');
let supplierMail = document.querySelector('#supplierMail');
let supplierPhone = document.querySelector('#supplierPhone');
let selectStatus = document.querySelector('#select');
let physicalAddress = document.querySelector('textarea');
let saveSupplier = document.querySelector('#saveSupplier');
let targetID = null;
const paginationContainer = document.querySelector("#pagination");
let allSuppliersData = [];
let sortSupplierName = document.querySelector('#sortSupplierName');


// data
renderNavbar("Suppliers");
loadAndRenderSuppliers();
setupInputValidation();
renderFooter();

// & pagination state
const state = {
    page: 1,
    limit: 5,
    totalCount: 0
};
////// pagination ////// 
function renderTable() {
    const start = (state.page - 1) * state.limit;
    const end = start + state.limit;

    const paginatedData = allSuppliersData.slice(start, end);

    showDatainTable.innerHTML = "";
    renderSuppliersRows(paginatedData);
}

///// Logo of Suppliers Name /////
function firstLatterOfSuppliers(SuppliersName) {
    let arrStr = SuppliersName.split(' ');
    let firstLetter = [];
    for (let index = 0; index < arrStr.length; index++) {
        firstLetter.push(arrStr[index].charAt(0).toUpperCase());
    }
    return (firstLetter.join(''));
}
// console.log(firstLatterOfSuppliers("Global Logistics"))

////// ^ Get Data form json file /////
async function loadAndRenderSuppliers() {
    let suppliersData = (await getData('suppliers')).data;
    //  console.log(suppliersData);
    allSuppliersData = suppliersData;
    state.page = 1;
    state.totalCount = suppliersData.length
    renderTable();
    renderPagination(paginationContainer, state, renderTable);


}
//  //// Search By Suppliers Name ///// 

searchSuppliersByName.addEventListener('input', async () => {
    let searchInputValue = searchSuppliersByName.value;

    let search = await searchByName('suppliers', searchInputValue);
    allSuppliersData = search;
    state.page = 1;
    state.totalCount = search.length;
    // console.log(search);
    if (search.length == 0) {
        showDatainTable.classList.add('dataNotMatch')
        showDatainTable.innerHTML = 'No Data Matched!!';
    }
    else {
        showDatainTable.innerHTML = ''
        renderTable()
        showDatainTable.classList.remove('dataNotMatch');
        renderPagination(paginationContainer, state, renderTable);

    }

})

//// filter by status ////
formSelect.addEventListener('change', async () => {
    let formSelectFilter = await filterByStatus(formSelect, 'suppliers')
    //   console.log(formSelectFilter)
    allSuppliersData = formSelectFilter;

    state.page = 1;
    state.totalCount = formSelectFilter.length;

    showDatainTable.innerHTML = '';
    renderTable()
    renderPagination(paginationContainer, state, renderTable);

})

// ///  Render Data In InnerHTML ///
function renderSuppliersRows(dataAfterFilter) {
    dataAfterFilter.forEach(dataFilter => {
        let statusClass = dataFilter.status === 'Active' ? 'status_active' : 'status_inactive';
        showDatainTable.innerHTML += `
                    <tr id=${dataFilter.id}>
                            <td>
                            <p> <span class="first-latter rounded-4 text-center p-2" id="firstLatter">${firstLatterOfSuppliers(dataFilter.name)}</span> ${dataFilter.name}
                            </p>
                            </td>
                            <td>${dataFilter.contactPerson}</td>
                            <td>${dataFilter.phone}</td>
                            <td><a href="http://gmail.com">${dataFilter.email}</a></td>
                            <td>${dataFilter.address}</td>
                            <td>
                            <div class=${statusClass}>
                                 ${dataFilter.status} 
                            </div> <!--status_active-->
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
            `

    });
}

///// sort Supplier Name ////
sortSupplierName.addEventListener('click', () => {
    allSuppliersData.sort((a, b) => a.name.localeCompare(b.name));
    state.page = 1;
    renderTable();
    renderPagination(paginationContainer, state, renderTable);
});

////// validate input //////

function setupInputValidation() {
    // ///////// validate SuppliersName /////////
    supplierName.addEventListener('input', () => validateInputs('^[A-Za-z\\s]{3,60}$', supplierName, 'Please Enter Valid Supplier Name :\n  Must Name contains at  -> from 3 character to 40 character!!!'));

    //  ///////// validate contactPerson /////////
    contactPerson.addEventListener('input', () => validateInputs('^[A-Za-z\\s]{3,60}$', contactPerson, 'Please Enter Valid Contact Person :\n  Must Name contains at  -> from 3 character to 40 character!!!'));

    //  ///////// validate Email /////////
    supplierMail.addEventListener('input', () => validateInputs('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', supplierMail, `Please include an '@' in the email address. '${supplierMail.value}' is missing an '@'!!!`));

    //  ///////// validate Phone /////////
    supplierPhone.addEventListener('input', () => validateInputs('^01[0125][0-9]{8}$', supplierPhone, 'Enter valid Egyptian phone number!!'));

    //  ///////// validate select /////////
    selectStatus.addEventListener('change', () => {
        validateSelect(selectStatus);
    });

    ///// validate Physical Address /////
    physicalAddress.addEventListener('input', () => validateInputs('^[A-Za-z\\s]{3,40}$', physicalAddress, 'Enter valid Physical Address!!'));

}

/////  Post data to json file  ////
addSupplier.addEventListener('click', () => {
    let newSupplierId = 20;

    supplierName.value = '';
    contactPerson.value = ''
    supplierPhone.value = ''
    supplierMail.value = ''
    physicalAddress.value = ''
    selectStatus.value = ''

    saveSupplier.addEventListener('click', (e) => {
        e.preventDefault();
        postData('suppliers', {
            id: newSupplierId++,
            name: supplierName.value,
            contactPerson: contactPerson.value,
            phone: supplierPhone.value,
            email: supplierMail.value,
            address: physicalAddress.value,
            status: selectStatus.value,
        })
    }, { once: true });

})

/////  Update $ Delete Suppliers ///////

showDatainTable.addEventListener('click', (e) => {

    /////  Update existing data in json file /////

    let editBtn = e.target.closest('.edit_supplier_btn');
    let deleteBtn = e.target.closest('.delete_supplier_btn');
    if (editBtn) {
        let rowDataSupp_ofTarget = editBtn.closest('tr');
        targetID = rowDataSupp_ofTarget.id;

        //   console.log(rowDataSupp_ofTarget.children[0].innerText.split(' ')[1])
        let suppName = rowDataSupp_ofTarget.children[0].innerText.split(' ')[1] + " " + rowDataSupp_ofTarget.children[0].innerText.split(' ')[2]
        supplierName.value = suppName;
        contactPerson.value = rowDataSupp_ofTarget.children[1].innerText;
        supplierPhone.value = rowDataSupp_ofTarget.children[2].innerText;
        supplierMail.value = rowDataSupp_ofTarget.children[3].innerText;
        physicalAddress.value = rowDataSupp_ofTarget.children[4].innerText;
        selectStatus.value = rowDataSupp_ofTarget.children[5].innerText;

        //  save changing after Edit 
        saveSupplier.addEventListener('click', (e) => {
            e.preventDefault();
            putData('suppliers', targetID, {
                name: supplierName.value,
                contactPerson: contactPerson.value,
                phone: supplierPhone.value,
                email: supplierMail.value,
                address: physicalAddress.value,
                status: selectStatus.value,
            })
        }, { once: true });

    }

    /////  Delete data from jsom file  /////

    if (deleteBtn) {
        let row = deleteBtn.closest('tr');
        let currentId = row.id
        if (confirm(`Are You Sure to Delete ${row.children[0].innerText}`)) {
            // console.log(currentId)
            deleteData('suppliers', currentId);
            loadAndRenderSuppliers();
        }
        else {
            alert("Suppliers wasn't Deleted");
        }
    }
})

