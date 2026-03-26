let signInBtn = document.querySelector('#signInBtn');
let userEmail = document.querySelector('#userEmail');
let userPass = document.querySelector('#userPass');
let checkCorrectorNot = document.querySelector('#checkCorrectorNot');

// /////////////  validate inputs ///////////////////



signInBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    userEmail.addEventListener('input', validateInputs('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', userEmail, `Please include an '@' in the email address. '${userEmail.value}' is missing an '@'!!!`))
    userPass.addEventListener('input', validateInputs('^(?=.*[A-Z])(?=.*\\d).{3,}$', userPass, `Please match the requested format:\n Must contains 3 characters, 1 capital letter and 1 number at least`))

    let adminData = await getData('admins');

    //  ///// check Match data or not ////
    let userCorrectData = adminData.find((userName) => userEmail.value == userName.email && userPass.value == userName.password)

    if (userCorrectData) {
        localStorage.setItem('userName', JSON.stringify(userCorrectData.name));
        checkCorrectorNot.innerHTML = '';
        checkCorrectorNot.classList.remove('incorrect');

        setTimeout(() => {
            window.location = "dashboard.html"
        }, 1000);
    }

    else {

        checkCorrectorNot.innerHTML = 'Email or Password incorrect';
        checkCorrectorNot.classList.add('incorrect');
        userEmail.style.border = '2px solid rgba(255, 89, 89, 0.89)';
        userPass.style.border = '2px solid rgba(255, 89, 89, 0.89)';

    }
})

