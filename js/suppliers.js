
renderNavbar("Suppliers");
renderFooter();
renderDataofSuppliers();


let showDatainTable = document.querySelector('tbody');
let searchBySupplierName = document.querySelector('#searchBySupplierName');
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


validateInputAdd_Edit();


//  ////////////// Search By Suppliers Name ////////////////// 

searchBySupplierName.addEventListener('input', async () => {
    let searchInputValue = searchBySupplierName.value;

    let search = await searchByName('suppliers', searchInputValue);
    // console.log(search);
    if (search.length == 0) {
        showDatainTable.classList.add('dataNotMatch')
        showDatainTable.innerHTML = 'No Data Matched!!';
    }
    else {
        showDatainTable.innerHTML = ''
        renderDataAfterFilteration(search);
        showDatainTable.classList.remove('dataNotMatch')

    }

})

///////////////// filter by status /////////////////
formSelect.addEventListener('change', async () => {
    let formSelectFilter = await filterByStatus(formSelect, 'suppliers')
    //   console.log(formSelectFilter)
    showDatainTable.innerHTML = '';
    renderDataAfterFilteration(formSelectFilter);

})



// ///////////////// Logo of Suppliers Name ////////////////////
function firstLatterOfSuppliers(SuppliersName) {
    let arrStr = SuppliersName.split(' ');
    let firstLetter = [];
    for (let index = 0; index < arrStr.length; index++) {
        firstLetter.push(arrStr[index].charAt(0).toUpperCase());
    }
    return (firstLetter.join(''));
}
// console.log(firstLatterOfSuppliers("Global Logistics"))


// ///////////// ^ Get Data form json file //////////////
async function renderDataofSuppliers() {
    let suppliersData = await getData('suppliers')
    //  console.log(suppliersData);
    renderDataAfterFilteration(suppliersData);

}



// //////////////////////  Render Data After Filteration ///////////////////////
function renderDataAfterFilteration(dataAfterFilter) {
    dataAfterFilter.forEach(dataFilter => {
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
                            <div id="statusActive" class="status_active">
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


// ////////////////// validate input ///////////////////

function validateInputAdd_Edit() {
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

    //  ///////// validate Physical Address /////////
    physicalAddress.addEventListener('input', () => validateInputs('^[A-Za-z\\s]{3,40}$', physicalAddress, 'Enter valid Physical Address!!'));

}

// //////////////////////  Post data to json file  /////////////////////////////



// ////////////////  Update $ Delete Suppliers ////////////////////////

showDatainTable.addEventListener('click', (e) => {

// ////////////////  Update existing data in json file  ////////////////////////

    if (e.target.classList.contains('edit_supplier_btn')) {
          let rowDataSupp_ofTarget = e.target.parentElement.parentElement;
          targetID= rowDataSupp_ofTarget.id;
          
        //   console.log(rowDataSupp_ofTarget.children[0].innerText.split(' ')[1])
          let suppName= rowDataSupp_ofTarget.children[0].innerText.split(' ')[1] +" "+rowDataSupp_ofTarget.children[0].innerText.split(' ')[2]
          supplierName.value = suppName;
          contactPerson.value = rowDataSupp_ofTarget.children[1].innerText;
          supplierPhone.value = rowDataSupp_ofTarget.children[2].innerText;
          supplierMail.value = rowDataSupp_ofTarget.children[3].innerText;
          physicalAddress.value = rowDataSupp_ofTarget.children[4].innerText;
          selectStatus.value = rowDataSupp_ofTarget.children[5].innerText;

    }

// //////////////////////  Delete data from jsom file  /////////////////////////

    if(e.target.classList.contains('delete_supplier_btn')) {
         let row = e.target.parentElement.parentElement;
         let currentId = row.id
            if(confirm(`Are You Sure to Delete ${row.children[0].innerText}`)){
                console.log(currentId)
                deleteData('suppliers' ,currentId);
                renderDataofSuppliers();
            }
            else{
                alert("Suppliers wasn't Deleted")
            }
    }
})
// ///////////////  save changing after Edit //////////////////
saveSupplier.addEventListener('click', (e) => {
    e.preventDefault();
    putData('suppliers', targetID, {
                    name: supplierName.value ,
                    contactPerson: contactPerson.value,
                    phone:supplierPhone.value ,
                    email:supplierMail.value,
                    address:physicalAddress.value, 
                    status:selectStatus.value,
                })
    })


