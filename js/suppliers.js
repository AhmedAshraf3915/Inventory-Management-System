
renderNavbar("Suppliers");
renderFooter();
renderDataofSuppliers();



let showDatainTable = document.querySelector('tbody');



//  ////////////// Search By Suppliers Name ////////////////// 

let searchBySupplierName = document.querySelector('#searchBySupplierName');
searchBySupplierName.addEventListener('input', async () => {
    let searchInputValue = searchBySupplierName.value;

    let search = await searchByName('suppliers', searchInputValue);
    // console.log(search);
     if (search.length == 0) {
         showDatainTable.classList.add('dataNotMatch')
         showDatainTable.innerHTML = 'No Data Matched!!';
     }
     else{
        showDatainTable.innerHTML=''
        renderDataAfterFilteration(search);  
         showDatainTable.classList.remove('dataNotMatch')

     }
   
})

///////////////// filter by status /////////////////
let formSelect = document.querySelector('#formSelect');
formSelect.addEventListener('change' ,async()=>{
      let formSelectFilter =await filterByStatus(formSelect , 'suppliers')
    //   console.log(formSelectFilter)
      showDatainTable.innerHTML='';
      renderDataAfterFilteration(formSelectFilter) ;
  
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
    //  console.log(suppliersData)
    renderDataAfterFilteration(suppliersData);
}

//  //////////////////  Validate inputs ///////////////////

let modal = document.querySelector('.modal')
modal.addEventListener('shown.bs.modal', function () {
    // ///////// validate SuppliersName /////////
    let supplierNameValidate = document.querySelector('#supplierName');
    supplierNameValidate.addEventListener('input', ()=> validateInputs('^[A-Za-z\\s]{3,60}$', supplierNameValidate ,'Please Enter Valid Supplier Name :\n  Must Name contains at  -> from 3 character to 40 character!!!'));

   //  ///////// validate contactPerson /////////
    let contactPersonValidate = document.querySelector('#contactPerson');
    contactPersonValidate.addEventListener('input', ()=> validateInputs('^[A-Za-z\\s]{3,60}$', contactPersonValidate ,'Please Enter Valid Contact Person :\n  Must Name contains at  -> from 3 character to 40 character!!!'));

     //  ///////// validate Email /////////
    let emailValidate = document.querySelector('#email');
    emailValidate.addEventListener('input', ()=> validateInputs('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', emailValidate ,`Please include an '@' in the email address. '${emailValidate.value}' is missing an '@'!!!`));

     //  ///////// validate Phone /////////
    let phoneValidate = document.querySelector('#Phone');
    phoneValidate.addEventListener('input', ()=> validateInputs('^01[0125][0-9]{8}$', phoneValidate ,'Enter valid Egyptian phone number!!'));

     //  ///////// validate select /////////
    // let selectValidate = document.querySelector('#select');
    // selectValidate.validateSelect(selectValidate)

    //  ///////// validate Physical Address /////////
    let physicalAddressValidate = document.querySelector('#physicalAddress');
    physicalAddressValidate.addEventListener('input', ()=> validateInputs('^[A-Za-z0-9\\u0600-\\u06FF\\s,.\\-#]{10,150}$', physicalAddressValidate ,'Enter valid Physical Address!!'));

})



// //////////////////////  Render Data After Filteration ///////////////////////
function renderDataAfterFilteration(dataAfterFilter){
        dataAfterFilter.forEach(dataFilter => {
           showDatainTable.innerHTML += `
                    <tr>
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
                                <p> <span class="dot-color"> </span> ${dataFilter.status} </p>
                            </div> <!--status_active-->
                            </td>
                            <td>
                            <button class="btn" data-bs-toggle="modal" data-bs-target="#exampleModal" id="editSupplierBtn">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button class="btn" id="deleteSupplierBtn">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                            </td>
                </tr>
            `
    });
}

// //////////////////////  Post data to json file  /////////////////////////////
let addSupplier = document.querySelector('#addSupplier');

// ////////////////  Update existing data in json file  ////////////////////////


// //////////////////////  Delete data from jsom file  /////////////////////////
