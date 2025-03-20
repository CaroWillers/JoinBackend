/**
 * Checks if an email already exists in the user data.
 * @param {string} email - Email address to check against the existing users.
 * @returns {Promise<boolean>} A promise that resolves to true if the email exists, otherwise false.
 */
async function checkIfEmailExists(email) {
    try {
        const response = await fetch(`${API_URL}/check-email/?email=${email}`);
        const data = await response.json();
        return data.exists;
    } catch (error) {
        console.error("Fehler bei der E-Mail-Überprüfung:", error.message);
        return false;
    }
}

/**
 * Attempts to log in the user by comparing the provided credentials with stored users.
 * Sets local storage items if the credentials are valid, otherwise displays an error message.
 * @async
 * @returns {Promise<void>}
 */
async function login() {
    let email = document.getElementById('email').value.trim();
    let password = document.getElementById('password').value;
    let rememberMe = document.getElementById('rememberCheckbox').checked;

    if (!email || !password) {
        alert("Bitte geben Sie eine gültige E-Mail und ein Passwort ein.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Login fehlgeschlagen");
        }

        console.log("Login erfolgreich:", data);
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        setUserLogin({ name: data.user.username });

        if (rememberMe) {
            await rememberPassword(email, password, true);
        }

        successfulLogin();
    } catch (error) {
        console.error("Fehler beim Login:", error.message);
        wrongPasswordMessage();
    }
}

/**
 * Displays an error message when the password is entered incorrectly.
 */
function wrongPasswordMessage() {
    let passwordField = document.getElementById('password');
    passwordField.classList.add('error');
    document.getElementById('passwordError').style.display = 'block';
}

/**
 * Clears the error state and message when the password field is focused.
 */
function clearPasswordError() {
    let passwordField = document.getElementById('password');
    passwordField.classList.remove('error');
    document.getElementById('passwordError').style.display = 'none';
    passwordField.value = '';  
}

/**
 * Displays the login modal.
 */
function successfulLogin() {
    let loginModal = document.getElementById("loginModal");
    if (loginModal.style.display !== "block") {
        loginModal.style.display = "block";

        setTimeout(function() {
            if (loginModal.style.display === "block") {
                loginModal.style.display = "none";
                window.location.href = './index.html';
                greetUser();
            }
        }, 2000);
    }
}

/**
 * Sets up the user session in localStorage with the user's information.
 * @param {Object} user - The user object with at least a 'name' property.
 */
function setUserLogin(user) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUserName', user.name);
    localStorage.setItem('userType', 'regular');
}

/**
 * Speichert das Passwort im localStorage, wenn "Angemeldet bleiben" aktiv ist.
 */
async function rememberPassword(email, password, remember) {
    if (!remember) return;
    localStorage.setItem('rememberedEmail', email);
    localStorage.setItem('rememberedPassword', password);
}

/**
 * Prüft, ob das aktuelle Login für einen Gast ist.
 */
function skipLoginForGuestUser() {
    return localStorage.getItem('userType') === 'guest';
}

/**
 * Toggles the checkbox that states if the Privacy Policy was accepted or not and updatates the checkbox image.
 * Toggles the state of a checkbox and updates the image icon to checked or not checked
 * This function is used on login and signup pages to handle user interaction with the checkboxes,
 * such as remembering passwords and accepting privacy policies. 
* @param {HTMLElement} buttonElement - On click of this button, the state of the checkbox will be toggled.
 */
function toggleCheckbox(inputElement) {
    if (inputElement.type === 'checkbox') {
        let checkboxImage = inputElement.nextElementSibling.querySelector(".checkboxImage");
        checkboxImage.src = inputElement.checked ? checkboxImage.getAttribute('data-checked') : checkboxImage.getAttribute('data-unchecked');
    }
}

/**
 * Handles the change event for the "Remember Me" checkbox.
 * Fetches email from the DOM and toggles the remember password setting based on the checkbox state.
 */
function handleRememberMeChange() {
    let email = document.getElementById('email').value;
    let remember = document.getElementById('rememberCheckbox').checked;
    rememberPassword(email, remember);
}

/**
 * Updates the user's password in local storage if the "Remember Me" checkbox is checked.
 * @param {string} email - User's email address to identify the user.
 * @param {string} password - Password to be remembered.
 * @param {boolean} remember - Flag to determine whether to remember or forget the password.
 * @async
 * @returns {Promise<void>}
 */
async function rememberPassword(email, password, remember) {
    let users = await loadUsers();
    let user = users.find(u => u.email === email);
    if (user) {
        user.rememberMe = remember;
        if (remember) {
            user.password = password;
        }
        await setItem('users', JSON.stringify(users));
    }
}

/**
 * Toggles the visibility and state of a custom checkbox UI element.
 * @param {HTMLElement} label - The label element associated with the checkbox.
 */
function toggleRememberMeCheckbox(inputElement) { 
    let checkboxImage = inputElement.parentElement.querySelector('.checkboxImage');
    checkboxImage.src = inputElement.checked ? checkboxImage.getAttribute('data-checked') : checkboxImage.getAttribute('data-unchecked');
}

/**
 * Checks if the current user session is for a guest to decide on skipping password restoration.
 * @returns {boolean} True if the user is a guest, otherwise false.
 */
function skipLoginForGuestUser() {
    if (localStorage.getItem('userType') === 'guest') {
        console.log('Guest user detected; password restoration skipped.');
        return true;
    }
    return false;
}

/**
 * Automatically fills in the password field and checks the "Remember Me" checkbox if the user's email is remembered.
 * Calls a separate function to determine if this action should be skipped for guest users.
 * @async
 */
function loadRememberedPassword() {
    if (skipLoginForGuestUser()) return;

    let email = document.getElementById('email').value.trim();
    if (email.length === 0) return;

    let rememberedEmail = localStorage.getItem('rememberedEmail');
    let rememberedPassword = localStorage.getItem('rememberedPassword');

    if (email === rememberedEmail) {
        document.getElementById('password').value = rememberedPassword;
        document.getElementById('rememberCheckbox').checked = true;
    } else {
        document.getElementById('password').value = '';
        document.getElementById('rememberCheckbox').checked = false;
    }
}



/**
 * Loads remembered password if the email input field is present.
 * This function is triggered when the DOM content is loaded.
 */
document.addEventListener('DOMContentLoaded', function() {
    const emailElement = document.getElementById('email');
    if (emailElement) {
        loadRememberedPassword();
    }
});

/**
 * Displays a message in the message box based on the URL parameters.
 * This function is triggered when the DOM content is loaded.
 */
document.addEventListener('DOMContentLoaded', function () { 
    let urlParams = new URLSearchParams(window.location.search);
    let msg = urlParams.get('msg');
    if (msg) {
        document.getElementById('msgBox').innerHTML = msg;
    }
});

/**
 * Sets up the session for a guest user and calls greetUser to display a welcome message.
 */
async function guestLogin() { 
    setGuestLogin();
    successfulGuestLogin();
}

/**
 * Sets up the session for a guest user by storing necessary data in local storage.
 */
function setGuestLogin() {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUserName', 'Guest');
    localStorage.setItem('userType', 'guest');
}

/**
 * Displays a modal confirming guest login, then redirects to the homepage and greets the user.
 */
function successfulGuestLogin() {
    let loginModal = document.getElementById("succesfulGuestLoginModal");
    if (loginModal.style.display !== "block") {
        loginModal.style.display = "block";

        setTimeout(function() {
            if (loginModal.style.display === "block") {
                loginModal.style.display = "none";
                window.location.href = './index.html';
                greetUser();  
            }
        }, 2000);
    }
}

/**
 * Displays a greeting message based on the current time of day to the logged-in user.
 */
async function greetUser() {
    const userType = localStorage.getItem('userType') || 'guest';
    const userName = localStorage.getItem('currentUserName') || 'Guest';
    const greetingElement = document.getElementById('greeting');
    const greetingUserElement = document.getElementById('greeting-user');

    let currentHour = new Date().getHours();
    let greetingText = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

    if (userType === 'guest') {
        // Gastbenutzer
        greetingElement.textContent = `${greetingText}, dear guest!`;
        greetingElement.style.color = '#000'; // Optional: Gastfarbe
    } else {
        // Registrierter Benutzer
        greetingElement.textContent = `${greetingText}, ${userName}!`; // Benutzername wird eingefügt
        greetingElement.style.color = '#4589FF'; // Registrierter Benutzer
    }

    // Initialen anzeigen
    UserInitials(userName); 
}




/**
 * Displays user initials based on the provided user name on the board.
 * @param {string} userName - The full name of the user.
 */
function UserInitials(userName) {
    const userInitialsContainer = document.getElementById('user-initals');

    if (userName) {
        const names = userName.split(' ');
        let initials = names[0].substring(0, 1).toUpperCase();

        if (names.length > 1) {
            initials += names[names.length - 1].substring(0, 1).toUpperCase();
        }

        userInitialsContainer.innerText = initials;
    } else {
        userInitialsContainer.innerText = "G"; // Standardwert für Gast
    }
}

/**
 * Logs out the current user by clearing session-related data and redirecting to the login page.
 */
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUserName');
    localStorage.removeItem('userType');
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPassword'); 
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    successfulLogout();
}

/**
 * Displays a modal to confirm a successful logout and redirects the user to the login page.
 * The modal is displayed briefly before redirecting the user, providing visual feedback that
 * the logout has been processed.
 */
function successfulLogout() {
    let logoutModal = document.getElementById("successfulLogoutModal");
    if (logoutModal.style.display !== "block") {
        logoutModal.style.display = "block";

        setTimeout(function() {
            if (logoutModal.style.display === "block") {
                logoutModal.style.display = "none";
                window.location.href = './login.html';
            }
        }, 2000);
    }
 }
	