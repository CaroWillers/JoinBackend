
/**
 * Initializes the application after a startup animation.
 * It checks if a user is logged in (based on localStorage).
 * If not, it starts an animation and redirects to the login page.
 * If logged in, it loads user data, tasks, contacts, and other necessary data.
 */
async function init() {
    if (!localStorage.getItem("isLoggedIn")) {
        insertAnimation();
        await startAnimation();
    } else {
        await hideStartAnimation();
        await fetchUserData();
        await mobileGreeting();
        await loadTasks();
        await summaryLoad();
        await loadRemoteContactsOfLoggedInUser();
        greetUser();
    }
}

/**
 * Fetches user data from the backend based on stored authentication token.
 */
async function fetchUserData() {
    try {
        let token = localStorage.getItem("authToken");
        if (!token) {
            logout();
            return;
        }

        let response = await fetch(`${API_URL}/auth/user/`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            logout();
            return;
        }

        let userData = await response.json();
        localStorage.setItem("currentUserName", userData.name);
        localStorage.setItem("userEmail", userData.email);
    } catch (error) {
        console.error("Fehler beim Laden des Benutzers:", error);
    }
}

/**
 * Hides the start animation after a successful login.
 */
async function hideStartAnimation() {
    let overlay = document.getElementById("overlay");
    if (localStorage.getItem("isLoggedIn")) {
        overlay.classList.add("d-none");
    }
}

/**
 * Inserts the startup animation overlay.
 */
function insertAnimation() {
    let overlay = document.getElementById("overlay");
    overlay.classList.remove("d-none");
    overlay.innerHTML = `
        <img src="./img/logoNegative.png" alt="Negative Logo" class="overlay-logo">
    `;
}

/**
 * Simulates a startup animation and redirects to the login page.
 */
async function startAnimation() {
    return new Promise((resolve) => {
        setTimeout(() => {
            window.location.href = "login.html";
            document.getElementById("overlay").classList.add("d-none");
            resolve();
        }, 1200);
    });
}

/**
 * Displays a greeting message based on the current time of day.
 */
function greetUser() {
    let userName = localStorage.getItem("currentUserName") || "Guest";
    let greetingElement = document.getElementById("greeting");

    let currentHour = new Date().getHours();
    let greetingText =
        currentHour < 12 ? "Good morning" :
        currentHour < 18 ? "Good afternoon" :
        "Good evening";

    greetingElement.textContent = `${greetingText}, ${userName}!`;
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
    if (userName === "Guest") {
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
    content.innerHTML = `<div class="template-container" include-html="./Templates/${template}.html"></div>`;
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
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUserName");
    localStorage.removeItem("userEmail");
    window.location.href = "login.html";
}
