import { TemplateLoader } from "./template-loader.js";
import { loadRemoteContacts } from "./contacts.service.js";
import { summaryLoad } from "./summary.js";
import { loadTasks, updateCards } from "./tasks.js"; 
import {
    loadContacts,
    initContacts,
    getInitials,
    getRandomAvatarColor
  } from "./contacts.service.js";
  
  import {
    openAddContactForm,
    openContactInfo,
    closeContactDetails,
    renderContactList
  } from "./contacts.ui.js";
  


window.addEventListener('DOMContentLoaded', async () => {
    await TemplateLoader.load('board');
  });

/**
 * Entry point for index.html.
 * Animation only shows once when user visits the app for the first time (not logged in).
 */
window.addEventListener("DOMContentLoaded", () => {
    let isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    let hasVisited = sessionStorage.getItem("hasVisited") === "true";

    // ➤ Zeige Startanimation nur einmal bei Erstbesuch ohne Login
    if (!isLoggedIn && !hasVisited) {
        sessionStorage.setItem("hasVisited", "true");
        init();
    }
 
    if (isLoggedIn) {
        loadAppAfterLogin();
    }
});

/**
 * Initializes the app with the startup animation and redirects to login.
 * Only called once on first visit if user is not logged in.
 */
async function init() {
    insertAnimation();  
    await delay(1200);  
    window.location.href = "/login/";
}

/**
 * Loads the app after successful login:
 * - Loads user data, tasks, contacts
 * - Shows summary/dashboard
 */
async function loadAppAfterLogin() {
    showLoadingOverlay();  

    try {
        await fetchUserData();
        await loadRemoteContacts();
        await TemplateLoader.load("board");
        await waitForElement("#greeting");
        greetUser();    
        await loadTasks();
        await summaryLoad();
        await mobileGreeting(); 

    } catch (err) {
        console.error("❌ Error while loading app data:", err);
    } finally {
        hideLoadingOverlay();
        hideStartAnimation();  
    }
}

function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const interval = 50;
        let elapsed = 0;

        const check = () => {
            const element = document.querySelector(selector);
            if (element) return resolve(element);

            elapsed += interval;
            if (elapsed >= timeout) return reject(`Timeout: ${selector} nicht gefunden.`);
            setTimeout(check, interval);
        };

        check();
    });
}


/**
 * Fetches user data from the backend based on stored authentication token.
 */
async function fetchUserData() {
    try {
        const token = localStorage.getItem("access_token");

        if (!token) {
            console.warn("Kein Token. Weiterleitung.");
            return logout();
        }

        const response = await fetch(`${API_URL}/user/`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
            console.warn("Token ungültig. Weiterleitung.");
            return logout();
        }

        const userData = await response.json();
        localStorage.setItem("currentUserName", userData.username);
        localStorage.setItem("userEmail", userData.email);

    } catch (err) {
        console.error("Fehler beim Benutzerladen:", err);
    }
}

/**
 * Zeigt das Logo auf dem Overlay.
 */
function insertAnimation() {
    const overlay = document.getElementById("overlay");
    
    if (!overlay) {
        console.warn("⚠️ Overlay element not found!");
        return;
    }
    overlay.classList.remove("d-none");
    overlay.innerHTML = `
        <img src="/static/img/logoNegative.png" alt="Startup Logo" class="overlay-logo">
    `;
}


/**
 * Blendet das Logo-Overlay nach dem Login aus.
 */
function hideStartAnimation() {
    const overlay = document.getElementById("overlay");
    overlay.classList.add("d-none");
    overlay.innerHTML = ''; // optional: leeren
}

/**
 * Zeigt die Animation und leitet nach 1.2s zur Login-Seite.
 */
async function showStartupAnimationThenRedirect() {
    insertAnimation();
    await delay(1200);
    window.location.href = "/login/";
}

/**
 * Kleiner Helper für Delay (Wartezeit).
 * @param {number} ms - Millisekunden
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Lädt das Board-Template und danach alle Tasks.
 */
async function loadBoard() {
    try { 
        await Templates("board");  
 
        await loadTasks();
 
        updateCards();
    } catch (error) {
        console.error("❌ Fehler beim Laden des Boards:", error);
    }
}

function showLoadingOverlay() {
    document.getElementById("loadingOverlay")?.classList.remove("d-none");
}

function hideLoadingOverlay() {
    document.getElementById("loadingOverlay")?.classList.add("d-none");
}


/**
 * Displays a greeting message based on the current time of day.
 */
function greetUser() {
    const userType = localStorage.getItem("userType") || sessionStorage.getItem("userType") || "guest";
    const userName = localStorage.getItem("currentUserName") || sessionStorage.getItem("currentUserName") || "Guest";
    const greetingElement = document.getElementById("greeting");

    let currentHour = new Date().getHours();
    let greetingText =
        currentHour < 12 ? "Good morning" :
        currentHour < 18 ? "Good afternoon" :
        "Good evening";

    if (greetingElement) {
        greetingElement.textContent = userType === "guest"
            ? `${greetingText}, dear guest!`
            : `${greetingText}, ${userName}!`;
    }
}

/**
 * Displays a greeting and additional actions for mobile users.
 */
async function mobileGreeting() {
    if (window.innerWidth < 800) {
        await TemplateGreetMobile();
        await greetUserMobile();
        return new Promise((resolve) => setTimeout(resolve, 1200));
    }
}

/**
 * Displays a greeting message based on the current time of day.
 */
function greetUserMobile() {
    let userName = localStorage.getItem("currentUserName");
    let greetingElement = document.getElementById("greeting-mobile");
    let currentHour = new Date().getHours();
    let greetingText = "Welcome";

    if (currentHour < 12) {
        greetingText = "Good morning";
    } else if (currentHour < 18) {
        greetingText = "Good afternoon";
    } else {
        greetingText = "Good evening";
    }
    GuestOrUser(greetingElement, userName, greetingText);
}

/**
 * Updates the greeting based on whether the user is a guest or a registered user.
 */
function GuestOrUser(greetingElement, userName, greetingText) {
    if (userName === 'Gast') {
        greetingElement.textContent = `${greetingText}`;
    } else {
        let greetingElementUser = document.getElementById("greeting-mobile-user");
        greetingElementUser.textContent = `${greetingText},`;
        greetingElement.textContent = `${userName}`;
        greetingElement.style.color = "#005DFF";
    }
}

// **NAVIGATION**
/**
 * Fetches and includes external HTML templates.
 */
async function includeHTML() {
    let includeElements = document.querySelectorAll("[include-html]");
    for (let element of includeElements) {
        let file = element.getAttribute("include-html");
        let response = await fetch(file);
        element.innerHTML = response.ok ? await response.text() : "Page not found";
    }
    if (document.getElementById("greeting")) {
        greetUser();
    }
}

/**
 * Loads the specified template file.
 */
async function Templates(template) {
    const content = document.getElementById("content");
    if (!content) return console.warn("⚠️ #content fehlt!");

    const response = await fetch(`/static/Templates/${template}.html`);
    if (!response.ok) {
        content.innerHTML = `<p class="error">⚠️ Could not load template: ${template}</p>`;
        return;
    }

    const html = await response.text();
    content.innerHTML = html;
    await includeHTML();  
}


/**
 * Opens and closes navigation dropdowns.
 */
function openDropdown() {
    document.getElementById("navigation-overlay").classList.remove("d-none");
}

function closeDropdown() {
    document.getElementById("navigation-overlay").classList.add("d-none");
}

/**
 * Loads help page via dropdown.
 */
function dropdownHelp() {
    Templates("help");
    closeDropdown();
}

/**
 * Handles navigation item highlighting.
 */
document.addEventListener("DOMContentLoaded", () => {
    navigationClick();
    clickedLegalPart();
    resetNavigationItems();
});

/**
 * Adds click event listeners to navigation items.
 */
function navigationClick() {
    document.querySelectorAll(".navigation-item").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelector(".navigation-item-clicked")?.classList.remove("navigation-item-clicked");
            btn.classList.add("navigation-item-clicked");
            resetNavigationItems();
            navigationClickImg();
        });
    });
}

/**
 * Resets all navigation items.
 */
function resetNavigationItems() {
    document.querySelectorAll(".navigation-item").forEach((item) => {
        item.querySelector(".clicked")?.classList.add("d-none");
        item.querySelector(".unclicked")?.classList.remove("d-none");
    });
}

/**
 * Handles image change when navigation is clicked (for mobile).
 */
function navigationClickImg() {
    let clickedItem = document.querySelector(".navigation-item-clicked");
    if (window.innerWidth < 800 && clickedItem) {
        let unclickedImage = clickedItem.querySelector(".unclicked");
        let clickedImage = clickedItem.querySelector(".clicked.d-none");
        if (unclickedImage && clickedImage) {
            unclickedImage.classList.add("d-none");
            clickedImage.classList.remove("d-none");
        }
    }
}

/**
 * Highlights clicked legal navigation items.
 */
function clickedLegalPart() {
    document.querySelectorAll(".navigation-legal div").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelector(".navigation-legal-clicked")?.classList.remove("navigation-legal-clicked");
            btn.classList.add("navigation-legal-clicked");
        });
    });
}

/**
 * Removes navigation highlights when dropdown is clicked.
 */
function removeNavHighlightOnDropdown() {
    document.querySelectorAll(".dropdown-container a").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelector(".navigation-item-clicked")?.classList.remove("navigation-item-clicked");
            resetNavigationItems();
        });
    });
}

/**
 * Removes highlight on help section click.
 */
function removeNavHighlightOnHelp() {
    document.querySelectorAll(".help").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelector(".navigation-item-clicked")?.classList.remove("navigation-item-clicked");
            resetNavigationItems();
        });
    });
}

/**
 * Removes highlights when the logo is clicked.
 */
function removeNavHighlightOnLogo() {
    document.querySelectorAll(".navLogo").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelector(".navigation-item-clicked")?.classList.remove("navigation-item-clicked");
            resetNavigationItems();
        });
    });
}

/**
 * Logs out the user and clears local storage.
 */
function logout() {
    console.log("Nutzer wird ausgeloggt...");

    ["isLoggedIn", "access_token", "refresh_token", "currentUserName", "userEmail", "userType"]
        .forEach(item => localStorage.removeItem(item));

    sessionStorage.clear();
    
    window.location.href = ROUTES.login;
}