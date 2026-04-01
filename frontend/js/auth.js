let signInBtn = document.querySelector("#signInBtn");
let userEmail = document.querySelector("#userEmail");
let userPass = document.querySelector("#userPass");
let checkCorrectorNot = document.querySelector("#checkCorrectorNot");

// // /////////////  validate inputs ///////////////////

userEmail.addEventListener("input", function () {
  validateInputs(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    userEmail,
    `Please include an '@' in the email address. '${userEmail.value}' is missing an '@'!!!`
  );
});

userPass.addEventListener("input", function () {
  validateInputs(
    /^(?=.*[A-Z])(?=.*\d).{3,}$/,
    userPass,
    "Please match the requested format:\nMust contain at least 3 characters, 1 capital letter and 1 number."
  );
});


signInBtn.addEventListener("click", async function (e) {
  e.preventDefault();
  validateInputs(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    userEmail,
    `Please include an '@' in the email address. '${userEmail.value}' is missing an '@'!!!`
  );
  validateInputs(
    /^(?=.*[A-Z])(?=.*\d).{3,}$/,
    userPass,
    "Please match the requested format:\nMust contain at least 3 characters, 1 capital letter and 1 number."
  );

  const allValid = userEmail.checkValidity() && userPass.checkValidity();

  if (!allValid) return;

  try {
    let adminResponse = await getData("admins");
    let adminData = adminResponse.data;

    let userCorrectData = adminData.find(function (user) {
      return (
        userEmail.value.trim() === user.email &&
        userPass.value.trim() === user.password
      );
    });

    if (userCorrectData) {
      localStorage.setItem("userName", JSON.stringify(userCorrectData.name));
      checkCorrectorNot.innerHTML = "";
      checkCorrectorNot.classList.remove("incorrect");

      window.location = "dashboard.html";
    } else {
      checkCorrectorNot.innerHTML = "Email or Password incorrect";
      checkCorrectorNot.classList.add("incorrect");
      userEmail.style.border = "2px solid rgba(255, 89, 89, 0.89)";
      userPass.style.border = "2px solid rgba(255, 89, 89, 0.89)";
    }
  } catch (error) {
    console.error(error);
    checkCorrectorNot.innerHTML = "Failed to sign in";
    checkCorrectorNot.classList.add("incorrect");
  }
});