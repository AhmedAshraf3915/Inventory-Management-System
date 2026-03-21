renderNavbar("Products");
renderFooter()

// ^ Modal Actions
const addProductBtn = document.querySelector("#addProductBtn")
const editProductBtn = document.querySelector("#editProductBtn")
const modal = document.querySelector("#modal")
const modalOverlay = document.querySelector('#modalOverlay')
const cancelModal = document.querySelector("#cancelBtn")


addProductBtn.addEventListener('click', function () {
	showMoal()
})

editProductBtn.addEventListener('click', function () {
	showMoal()
})

cancelModal.addEventListener("click", function () {
	closeModal()
})

modalOverlay.addEventListener('click', function (e) {
	if (e.target !== modal) {
		closeModal()
	}
})
document.addEventListener('keydown', function (e) {
	console.log(e)
	if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
		closeModal();
	}
})

