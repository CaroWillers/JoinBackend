/**
 * Attempts to log in the user by sending credentials to the backend.
 * If successful, user data is stored and login is processed.
 */
async function login() {
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value;
    let rememberMe = document.getElementById("rememberCheckbox").checked;

    if (!validateEmail(email) || !password) {
        showEmailNotRegisteredMessage("Bitte gültige E-Mail und Passwort eingeben.");
        return;
    }

    try {
        let response = await fetch(`${API_URL}/login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, rememberMe })
        });

        let data = await response.json();

        if (!response.ok) {
            if (data.error === "Email not registered") {
                showEmailNotRegisteredMessage("Diese E-Mail ist nicht registriert.");
            } else {
                wrongPasswordMessage();
            }
            return;
        }

        saveUserSession(data, rememberMe);
        successfulLogin();
    } catch (error) {
        console.error("Login failed:", error);
        showEmailNotRegisteredMessage("Verbindungsfehler. Versuche es später erneut.");
    }
}

/**
 * Speichert die Benutzerdaten und den Token in localStorage.
 */
function saveUserSession(data, rememberMe) {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("token", data.token);
    localStorage.setItem("currentUserName", data.user.name);
    localStorage.setItem("userEmail", data.user.email);
    localStorage.setItem("userType", "regular");

    if (rememberMe) {
        localStorage.setItem("rememberedEmail", data.user.email);
    } else {
        localStorage.removeItem("rememberedEmail");
    }
}

/**
 * Zeigt eine Fehlermeldung an, falls die E-Mail nicht registriert ist oder andere Fehler auftreten.
 */
function showEmailNotRegisteredMessage(message) {
    let emailField = document.getElementById("email");
    emailField.classList.add("error");
    document.getElementById("emailError").innerText = message;
    document.getElementById("emailError").style.display = "block";
}

/**
 * Zeigt eine Fehlermeldung bei falschem Passwort.
 */
function wrongPasswordMessage() {
    let passwordField = document.getElementById("password");
    passwordField.classList.add("error");
    document.getElementById("passwordError").style.display = "block";
}

/**
 * Löscht die Fehlermeldung bei erneuter Eingabe.
 */
function clearPasswordError() {
    let passwordField = document.getElementById("password");
    passwordField.classList.remove("error");
    document.getElementById("passwordError").style.display = "none";
    passwordField.value = "";  
}

/**
 * Falls der Nutzer "Remember Me" aktiviert hat, füllt das Feld automatisch aus.
 */
document.addEventListener("DOMContentLoaded", function () {
    let rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
        document.getElementById("email").value = rememberedEmail;
        document.getElementById("rememberCheckbox").checked = true;
    }
});

/**
 * Zeigt eine Erfolgsmeldung für den Login an und leitet weiter.
 */
function successfulLogin() {
    let loginModal = document.getElementById("loginModal");
    if (loginModal.style.display !== "block") {
        loginModal.style.display = "block";

        setTimeout(() => {
            loginModal.style.display = "none";
            window.location.href = "./index.html";
            greetUser();
        }, 2000);
    }
}

/**
 * Zeigt die Initialen des Users an.
 */
function UserInitials(userName) {
    const userInitialsContainer = document.getElementById("user-initals");
    if (userName) {
        const names = userName.split(" ");
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
 * Begrüßt den User nach Login basierend auf der Tageszeit.
 */
async function greetUser() {
    const userType = localStorage.getItem("userType") || "guest";
    const userName = localStorage.getItem("currentUserName") || "Guest";
    const greetingElement = document.getElementById("greeting");

    let currentHour = new Date().getHours();
    let greetingText = currentHour < 12 ? "Good morning" :
        currentHour < 18 ? "Good afternoon" : "Good evening";

    greetingElement.textContent = userType === "guest"
        ? `${greetingText}, dear guest!`
        : `${greetingText}, ${userName}!`;

    UserInitials(userName);
}

/**
 * Logout-Funktion, die den User abmeldet und weiterleitet.
 */
function logout() {
    ["isLoggedIn", "currentUserName", "userType", "token", "rememberedEmail"].forEach(item => {
        localStorage.removeItem(item);
    });

    successfulLogout();
}

/**
 * Zeigt eine Erfolgsmeldung für den Logout an und leitet weiter.
 */
function successfulLogout() {
    let logoutModal = document.getElementById("successfulLogoutModal");
    if (logoutModal.style.display !== "block") {
        logoutModal.style.display = "block";

        setTimeout(() => {
            logoutModal.style.display = "none";
            window.location.href = "./login.html";
        }, 2000);
    }
}

/**
 * E-Mail-Validierung.
 */
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
