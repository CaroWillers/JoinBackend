/**
 * Validates the user's email address.
 * @returns {boolean} Returns true if the email address is valid, otherwise false.
 */
function validateEmailAddress() {
    let emailInput = document.getElementById("email");
    let email = emailInput.value;
    let pattern = new RegExp('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}');
    let emailMessage = document.getElementById("msgBoxValidateEmail");  

    if (!pattern.test(email)) {
        emailMessage.innerHTML = "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
        emailMessage.style.color = "red";
        return false;
    } else {
        emailMessage.innerHTML = "E-Mail-Adresse ist gültig.";
        emailMessage.style.color = "green";
        return true;
    }
}

async function checkEmailExistence() {
    let emailInput = document.getElementById("email");
    let email = emailInput.value.trim();
    let emailMessage = document.getElementById("msgBoxValidateEmail");

    try {
        const response = await fetch(`${API_URL}/check-email/?email=${email}`);
        const data = await response.json();

        if (data.exists) {
            emailMessage.innerHTML = "Diese E-Mail-Adresse ist bereits registriert.";
            emailMessage.style.color = "red";
            return false;
        } else {
            emailMessage.innerHTML = "E-Mail-Adresse ist verfügbar.";
            emailMessage.style.color = "green";
            return true;
        }
    } catch (error) {
        console.error("Fehler bei der E-Mail-Überprüfung:", error.message);
        emailMessage.innerHTML = "Fehler bei der Überprüfung. Bitte später versuchen.";
        emailMessage.style.color = "red";
        return false;
    }
}

/**
 * Checks the strength of the password entered by the user.
 * @returns {boolean} Returns true if the password meets the strength criteria, otherwise rturns false.
 */
function checkPasswordStrength() {
    let password = document.getElementById("password").value;
    let strengthIndicator = document.getElementById("passwordStrengthMessage");

    let pattern = new RegExp('(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}');

    if (!pattern.test(password)) {
        strengthIndicator.innerHTML = "Password must be at least 8 characters, including one uppercase letter, one lowercase letter, and one number";
        strengthIndicator.style.color = "red";
        return false;
    } else {
        strengthIndicator.innerHTML = "Your password strength is ok";
        strengthIndicator.style.color = "green";
        return true;
    }
}

/**
 * Validates the input to confirm the password entered by the user.
 * @returns {boolean} Returns true if the confirmed password matches the original password, otherwise returns false.
 */
function validateConfirmedPassword() {
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirm_password").value;
    let message = document.getElementById("passwordMatchMessage");

    if (password !== confirmPassword) {
        message.textContent = "Your passwords do not match";
        message.style.color = "red";
        return false;
    } else {
        message.textContent = "Your password is confirmed";
        message.style.color = "green";
        return true;
    }
}

/**
 * Toggles the visibility of the password input field and changes the visibility icon accordingly.
 * @param {string} fieldId - The ID of the password input field.
 */
function togglePassword(fieldId) {
    let input = document.getElementById(fieldId);
    let iconId = (fieldId === "password") ? "passwordIcon" : (fieldId === "newPassword") ? "newPasswordIcon" : "confirmPasswordIcon";
    let icon = document.getElementById(iconId);

    if (input.type === "password") {
        input.type = "text";
        icon.src = "./img/visibility_off.svg";
    } else {
        input.type = "password";
        icon.src = "./img/visibility.svg";
    }
}

/**
 * Changes the visibility icon of the password input field.
 * @param {HTMLElement} inputElement - The password input field element.
 */
function changeLockIcon(inputElement) {
    inputElement.nextElementSibling.src = "./img/visibility_off.svg";
}

/**
 * Checks if the Privacy Policy checkbox is checked before final signup is possible.
 * If the checkbox is not checked, displays an alert message prompting the user to accept the Privacy Policy.
 * @returns {boolean} Returns true if the Privacy Policy checkbox is checked, otherwise false.
 */
function togglePrivacyPolicyCheckbox(buttonElement) {
    let container = buttonElement.closest('.checkboxContainerSignup');
    let realCheckbox = container.querySelector(".realCheckbox");
    let checkboxImage = container.querySelector(".checkboxImage");

    realCheckbox.checked = !realCheckbox.checked;
    checkboxImage.src = realCheckbox.checked ? checkboxImage.getAttribute('data-checked') : checkboxImage.getAttribute('data-unchecked');
}

/**
 * Checks if the Privacy Policy checkbox is checked before final signup is possible
 * If the checkbox is not checked, displays an alert message prompting the user to accept the Privacy Policy.
 * @returns {boolean} Returns true if the Privacy Policy checkbox is checked, otherwise returns false.
 */
function checkPrivacyPolicy() {
    let realCheckbox = document.querySelector(".realCheckbox");
    if (!realCheckbox.checked) {
        alert("Please accept the Privacy Policy conditions");
        return false;
    }
    return true;
}

/**
 * Asynchronously loads user data from storage.
 * @returns {Promise<Array>} A promise that resolves to an array of users if found, otherwise returns an empty array.
 * @throws {Error} Throws an error if there is an issue loading the users.
 */
async function loadUsers() {
    try {
        let result = await getItem('users');
        if (result) {
            let users = JSON.parse(result);
            return users;
        } else {
            console.log("No users found in storage, returning empty array.");
            return [];
        }
    } catch (e) {
        console.error('Loading error:', e);
        return [];
    }
}

function loadGuestUser() {
    let guestData = localStorage.getItem('guestUser');
    if (guestData) {
        return JSON.parse(guestData);
    } else {
        console.error('No guest user data found in local storage.');
        return null;
    }
}

/**
 * Adds a new user after form validation and redirects to login page on success.
 * @async
 * @returns {Promise<void>}
 */
async function addUser() {
    let formData = getSignupFormValues();
    if (!await validateFormData(formData)) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/signup/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: formData.name,
                email: formData.email,
                password: formData.password,
                confirm_password: formData.confirmPassword
            })
        });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Registrierung fehlgeschlagen");
    }    


    alert("Registrierung erfolgreich! Bitte logge dich ein.");
    successfulSignup();
} catch (error) {
    console.error("Fehler bei der Registrierung:", error.message);
    alert(error.message);
}
}


/**
 * Retrieves values from the signup form fields.
 * @returns {Object} An object containing the values of the name, email, password, and confirmPassword fields.
 */
function getSignupFormValues() {
    return {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirm_password').value
    };
}

/**
 * Validates all necessary form data by checking individual field validations and email-specific validations.
 * @param {Object} formData - An object containing user inputs from the form.
 * @returns {Promise<boolean>} A promise that resolves to true if all validations pass, otherwise false.
 */
async function validateFormData({ name, email, password, confirmPassword }) {
    return validateFormFields(name, email, password, confirmPassword) &&
           await validateEmailAndPrivacy(email);
}

/**
 * Validates form fields and displays an alert if any field is empty.
 * @param {string} email - User's email address.
 * @param {string} password - User's password.
 * @param {string} name - User's name.
 * @returns {boolean} - Returns true if all fields are filled, otherwise false.
 */
function validateFormFields(name, email, password, confirmPassword) {
    if (name === "" || email === "" || password === "" || confirmPassword === "") {
        alert("Please fill in all fields.");
        return false;
    }
    if (!validateConfirmedPassword(password, confirmPassword)) {
        alert("Passwords do not match.");
        return false;
    }
    if (!checkPasswordStrength(password)) {
        return false;
    }
    return true;
}

/**
 * Validates an email by checking its format, existence, and user's acceptance of the privacy policy.
 * Each step must pass for registration to proceed.
 * 
 * @param {string} email The email address to be validated.
 * @returns {Promise<boolean>} True if all validations pass, otherwise false.
 * @async
 */
async function validateEmailAndPrivacy(email) {
    if (!validateEmailAddress(email)) {
        return false;
    }
    if (!await checkEmailExistence(email)) {
        return false;
    }
    if (!checkPrivacyPolicy()) {
        alert("Please accept the privacy policy to proceed.");
        return false;
    }
    return true;
}

/**
 * Prüft, ob die Datenschutzerklärung akzeptiert wurde.
 */
function checkPrivacyPolicy() {
    let realCheckbox = document.querySelector(".realCheckbox");
    if (!realCheckbox.checked) {
        alert("Bitte akzeptieren Sie die Datenschutzbestimmungen.");
        return false;
    }
    return true;
}


/**
 * Constructs a user object from the provided form data.
 * @param {Object} formData - An object containing user data.
 * @returns {Object} The constructed user object ready for storage.
 */
function createUserObject({ name, email, password }) {
    return {
        name: name,
        email: email,
        password: password,
        userContacts: contacts
    };
}

/**
 * Handles successful signup by displaying a success message and redirecting the user.
 */
function successfulSignup() {
    let signupModal = document.getElementById("signupModal");
    if (signupModal.style.display !== "block") {
        signupModal.style.display = "block";

        setTimeout(function() {
            if (signupModal.style.display === "block") {
                signupModal.style.display = "none";
                window.location.href = './login.html';
            }
        }, 2000);
    }
}

/**
 * Saves a new user to the storage.
 * @param {Object} user - The user object to be saved.
 * @async
 * @returns {Promise<void>}
 */
async function saveNewUser(user) {
    let users = await loadUsers();
    users.push(user);
    await setItem('users', JSON.stringify(users));
}

