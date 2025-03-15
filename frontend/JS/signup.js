/**
 * Validates the user's email address.
 * @returns {boolean} Returns true if the email address is valid, otherwise false.
 */
function validateEmailAddress() {
    let emailInput = document.getElementById("email");
    let email = emailInput.value.trim();
    let emailMessage = document.getElementById("msgBoxValidateEmail");  
    let pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

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

/**
 * Checks if the email already exists via backend.
 * @returns {Promise<boolean>} A promise that resolves to true if the email exists, otherwise false.
 */
async function checkEmailExistence() {
    let emailInput = document.getElementById("email");
    let email = emailInput.value.trim();
    let emailMessage = document.getElementById("msgBoxValidateEmail");

    try {
        let response = await fetch(`${API_URL}/auth/check-email/?email=${email}`);
        let data = await response.json();
        
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
        console.error("Fehler beim Überprüfen der E-Mail:", error);
        emailMessage.innerHTML = "Fehler bei der Überprüfung.";
        emailMessage.style.color = "red";
        return false;
    }
}


/**
 * Checks the strength of the password.
 * @returns {boolean} Returns true if the password meets the strength criteria, otherwise false.
 */
function checkPasswordStrength() {
    let password = document.getElementById("password").value;
    let strengthIndicator = document.getElementById("passwordStrengthMessage");
    let pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

    if (!pattern.test(password)) {
        strengthIndicator.innerHTML = "Mind. 8 Zeichen, 1 Großbuchstabe, 1 Kleinbuchstabe, 1 Zahl.";
        strengthIndicator.style.color = "red";
        return false;
    } else {
        strengthIndicator.innerHTML = "Passwort ist stark.";
        strengthIndicator.style.color = "green";
        return true;
    }
}

/**
 * Validates that both passwords match.
 * @returns {boolean} True if the passwords match, otherwise false.
 */
function validateConfirmedPassword() {
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirm_password").value;
    let message = document.getElementById("passwordMatchMessage");

    if (password !== confirmPassword) {
        message.textContent = "Passwörter stimmen nicht überein.";
        message.style.color = "red";
        return false;
    } else {
        message.textContent = "Passwort bestätigt.";
        message.style.color = "green";
        return true;
    }
}

/**
 * Toggles password visibility.
 */
function togglePassword(fieldId) {
    let input = document.getElementById(fieldId);
    input.type = input.type === "password" ? "text" : "password";
}

/**
 * Checks if Privacy Policy is accepted.
 * @returns {boolean} Returns true if accepted, otherwise false.
 */
function checkPrivacyPolicy() {
    let checkbox = document.querySelector(".realCheckbox");
    if (!checkbox.checked) {
        alert("Bitte akzeptiere die Datenschutzbestimmungen.");
        return false;
    }
    return true;
}

function changeLockIcon(inputElement) {
    inputElement.nextElementSibling.src = "./img/visibility_off.svg";
}

function togglePrivacyPolicyCheckbox(buttonElement) {
    let container = buttonElement.closest('.checkboxContainerSignup');
    let realCheckbox = container.querySelector(".realCheckbox");
    let checkboxImage = container.querySelector(".checkboxImage");

    realCheckbox.checked = !realCheckbox.checked;
    checkboxImage.src = realCheckbox.checked ? checkboxImage.getAttribute('data-checked') : checkboxImage.getAttribute('data-unchecked');
}


/**
 * Registers a new user.
 * @async
 * @returns {Promise<void>}
 */
async function registerUser() {
    let formData = getSignupFormValues();
    if (!await validateFormData(formData)) {
        return;
    }

    try {
        let response = await fetch(`${API_URL}/register/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        let data = await response.json();
        if (response.ok) {
            saveUserSession(data, formData.rememberMe);
            successfulSignup();
        } else {
            alert(data.error || "Registrierung fehlgeschlagen.");
        }
    } catch (error) {
        console.error("Fehler bei der Registrierung:", error);
    }
}

/**
 * Retrieves values from the signup form fields.
 */
function getSignupFormValues() {
    return {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value,
        confirmPassword: document.getElementById("confirm_password").value,
        rememberMe: document.getElementById("rememberCheckbox").checked
    };
}

/**
 * Validates form fields and email before signup.
 */
async function validateFormData({ name, email, password, confirmPassword }) {
    return validateFormFields(name, email, password, confirmPassword) &&
           await checkEmailExistence() &&
           checkPrivacyPolicy();
}

/**
 * Validates if form fields are filled correctly.
 */
function validateFormFields(name, email, password, confirmPassword) {
    if (!name || !email || !password || !confirmPassword) {
        alert("Bitte fülle alle Felder aus.");
        return false;
    }
    if (!validateConfirmedPassword()) {
        alert("Passwörter stimmen nicht überein.");
        return false;
    }
    if (!checkPasswordStrength()) {
        return false;
    }
    return true;
}

/**
 * Saves user session in localStorage.
 */
function saveUserSession(data, rememberMe) {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("currentUserName", data.name);
    localStorage.setItem("userType", "regular");

    if (rememberMe) {
        localStorage.setItem("rememberedEmail", data.email);
    }
}

/**
 * Displays a signup success message and redirects to login.
 */
function successfulSignup() {
    let signupModal = document.getElementById("signupModal");
    signupModal.style.display = "block";

    setTimeout(() => {
        signupModal.style.display = "none";
        window.location.href = "./login.html";
    }, 2000);
}
