
// login.js - Optimierte Version mit Backend-Anbindung

/**
 * Prüft, ob eine E-Mail bereits existiert, indem die Backend-API abgefragt wird.
 * @param {string} email - Zu überprüfende E-Mail-Adresse.
 * @returns {Promise<boolean>} Ein Promise, das true zurückgibt, wenn die E-Mail existiert, sonst false.
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
 * Versucht, den Benutzer über die API einzuloggen.
 * Falls erfolgreich, werden die Authentifizierungs-Tokens gespeichert.
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
 * Zeigt eine Fehlermeldung, wenn das Passwort falsch eingegeben wurde.
 */
function wrongPasswordMessage() {
    let passwordField = document.getElementById('password');
    passwordField.classList.add('error');
    document.getElementById('passwordError').style.display = 'block';
}

/**
 * Löscht den Fehlerzustand des Passwortfeldes.
 */
function clearPasswordError() {
    let passwordField = document.getElementById('password');
    passwordField.classList.remove('error');
    document.getElementById('passwordError').style.display = 'none';
    passwordField.value = '';  
}

/**
 * Zeigt die Login-Bestätigung an und leitet zur Hauptseite weiter.
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
 * Speichert den eingeloggten Benutzer im localStorage.
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
 * Lädt das gespeicherte Passwort, falls der Benutzer "Angemeldet bleiben" aktiviert hat.
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
 * Lädt gespeicherte Passwörter, wenn die Seite geladen wird.
 */
document.addEventListener('DOMContentLoaded', function() {
    const emailElement = document.getElementById('email');
    if (emailElement) {
        loadRememberedPassword();
    }
});

/**
 * Loggt den Benutzer aus und entfernt die gespeicherten Tokens.
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
 * Zeigt eine Bestätigung für den Logout an und leitet zur Login-Seite weiter.
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
