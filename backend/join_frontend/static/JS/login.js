import { API_URL } from './config.js';
import { greetUser } from "./script.js";

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
        alert("Bitte E-Mail und Passwort eingeben.");
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
        setUserSession({ name: data.user.username }, { access: data.access, refresh: data.refresh });

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
    const loginModal = document.getElementById("loginModal");
    if (loginModal.style.display !== "block") {
        loginModal.style.display = "block";

        setTimeout(() => {
            loginModal.style.display = "none";
            localStorage.setItem("isLoggedIn", "true");
            sessionStorage.removeItem("hasVisited");  
            window.location.href = ROUTES.summary;
        }, 1000);
    }
}


/**
 * Sets up the user session in localStorage with the user's information and tokens.
 * @param {Object} user - The user object, should contain at least 'username' and 'email'.
 * @param {Object} tokens - An object with 'access' and 'refresh' tokens.
 */
function setUserSession(user, tokens) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUserName', user.username || user.name || 'Guest');
    localStorage.setItem('userEmail', user.email || '');
    localStorage.setItem('userType', user.type || 'regular');
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
}


/**
 * Speichert das Passwort im localStorage, wenn "Angemeldet bleiben" aktiv ist.
 */
async function rememberPassword(email, password, remember) {
    if (!remember) return;
    localStorage.setItem('rememberedEmail', email);
    localStorage.setItem('rememberedPassword', password);
}


function loadRememberedPassword() {
    if (skipLoginForGuestUser()) return;  

    let email = document.getElementById('email').value.trim();
    if (!email) return;

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
 * Toggles the checkbox that states if the Privacy Policy was accepted or not and updatates the checkbox image. 
 */
function toggleRememberMeCheckbox(inputElement) { 
    let checkboxImage = inputElement.parentElement.querySelector('.checkboxImage');
    checkboxImage.src = inputElement.checked 
        ? '/static/img/checked-icon.svg'
        : '/static/img/unchecked-icon.svg';
}

document.addEventListener("DOMContentLoaded", () => {
    const rememberBox = document.getElementById("rememberCheckbox");
    if (rememberBox && rememberBox.checked) {
        toggleRememberMeCheckbox(rememberBox);
    }
});


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

document.addEventListener("DOMContentLoaded", () => {
    const guestBtn = document.getElementById("guestLoginBtn");
    if (guestBtn) {
        guestBtn.addEventListener("click", guestLogin);
    }
});


/**
 * Initiates a guest login by setting tokens and user data, then redirects.
 */
async function guestLogin() {
    try {
        const response = await fetch(`${API_URL}/guest-login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Guest login failed");
        }

        setUserSession({ name: data.user.username }, { access: data.access, refresh: data.refresh });
        successfulLogin(); 
        greetUser();

    } catch (error) {
        console.error("Guest login failed:", error.message);
        alert("Gast-Login fehlgeschlagen. Bitte versuche es erneut.");
    }
}


/**
 * Sets guest session information and stores dummy tokens.
 */
function setGuestLogin(tokens) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUserName', 'Guest');
    localStorage.setItem('userType', 'guest');

    // Tokens setzen (auch wenn es Dummy-Werte sind, der Rest des Codes erwartet sie)
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
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
                window.location.href = '/index.html';
                greetUser();  
            }
        }, 2000);
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
    localStorage.clear();

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
                window.location.href = ROUTES.login;
            }
        }, 2000);
    }
 }
	
 document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const passwordIcon = document.getElementById("passwordIcon");
    const rememberCheckbox = document.getElementById("rememberCheckbox");
    const guestBtn = document.getElementById("guestLoginBtn");
    const signupBtn = document.getElementById("signupBtn");
    const privacyBtn = document.getElementById("privacyPolicyBtn");
    const legalBtn = document.getElementById("legalNoticeBtn");

    // 📩 Beim Tippen in E-Mail-Feld: gespeicherte Daten ggf. laden
    emailInput?.addEventListener("keyup", loadRememberedPassword);

    // 🔒 Icon-Wechsel bei Passwort-Fokus
    passwordInput?.addEventListener("focus", () => {
        clearPasswordError();
        changeLockIcon(passwordInput); // optional: eigenes Icon-Handling
    });

    // 🔐 Passwort anzeigen/verstecken
    passwordIcon?.addEventListener("click", () => togglePassword("password"));

    // ✅ Checkbox-Logik für "Remember Me"
    rememberCheckbox?.addEventListener("change", () => {
        toggleRememberMeCheckbox(rememberCheckbox);
        handleRememberMeChange();
    });

    // 🚀 Login bei Submit
    loginForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        login();
    });

    // 👥 Gast-Login
    guestBtn?.addEventListener("click", guestLogin);

    // 🔄 Weiterleitungen
    signupBtn?.addEventListener("click", () => window.location.href = ROUTES.signup);
    privacyBtn?.addEventListener("click", () => window.location.href = "{% static 'privacyPolicyLogin.html' %}?ref=login");
    legalBtn?.addEventListener("click", () => window.location.href = "{% static 'legalNoticeLogin.html' %}?ref=login");
});
