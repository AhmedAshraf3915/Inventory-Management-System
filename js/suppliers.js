renderNavbar("Suppliers");



// ///////////////// Logo of Suppliers Name ////////////////////
function firstLatterOfSuppliers(SuppliersName){
    let arrStr = SuppliersName.split(' ');
    let firstLetter=[];
    for (let index = 0; index < arrStr.length; index++) {
        firstLetter.push(arrStr[index].charAt(0).toUpperCase());
    }
    return(firstLetter.join(''));
}
console.log(firstLatterOfSuppliers("Global Logistics"))