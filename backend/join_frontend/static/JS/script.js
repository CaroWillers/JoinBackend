// ===================
// IMPORTS
// ===================

// CORE
import { API_URL } from './config.js';
import { TemplateLoader } from "./template-loader.js";

// BOARD
import { loadBoard } from "./board/board-tasks.js";
import { initBoardEventListeners } from './board/board.events.js';
import { closeBigCard } from './board/board-popup.js';

// CONTACTS
import { loadRemoteContacts, loadContacts } from "./contacts/contacts.service.js";
import { initContactEventListeners } from './contacts/contacts.events.js';

// TASKS
import { registerTaskFormEvents } from './tasks/task-form.events.js';

// SUMMARY & OTHER PAGES
import { summaryLoad } from "./summary.js";
import { initSummaryEvents } from './summary.events.js';
import { initHelpEvents } from './help.events.js';
import { initLegalNoticeEvents } from './legal_notice.events.js';
import { initPrivacyPolicyEvents } from './privacy_legal.events.js';



// ===================
// INITIALISIERUNG
// ===================

function initializeAllEvents() {
  initBoardEventListeners();
  registerTaskFormEvents();
  initContactEventListeners();
  initSummaryEvents();
  initHelpEvents();
  initLegalNoticeEvents();
  initPrivacyPolicyEvents();
}

// ===================
// DOM READY
// ===================

document.addEventListener('DOMContentLoaded', async () => {
  initializeAllEvents();

  // Navigation
  document.getElementById('navSummary')?.addEventListener('click', summaryLoad);
  document.getElementById('navBoard')?.addEventListener('click', () => TemplateLoader.load('board'));
  document.getElementById('navContacts')?.addEventListener('click', loadContacts);
  document.getElementById('navLogo')?.addEventListener('click', summaryLoad);
  document.getElementById('helpIcon')?.addEventListener('click', () => TemplateLoader.load('help'));

  // Dropdown
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  document.getElementById('dropdownHelp')?.addEventListener('click', dropdownHelp);
  document.getElementById('dropdownPrivacyPolicy')?.addEventListener('click', dropdownPrivacyPolicy);
  document.getElementById('dropdownLegalNotice')?.addEventListener('click', dropdownLegalNotice);
  document.getElementById('user-initals')?.addEventListener('click', openDropdown);

  // Board Popup Handling
  document.getElementById('board-card-overlay')?.addEventListener('click', closeBigCard);
  document.getElementById('board-card-popup')?.addEventListener('click', e => e.stopPropagation());

  // Navigation Highlight Management
  navigationClick();
  clickedLegalPart();
  resetNavigationItems();
  removeNavHighlightOnDropdown();
  removeNavHighlightOnHelp();
  removeNavHighlightOnLogo();

  // Startseite: automatisch Board laden
  if (window.location.pathname.includes('index')) {
    await TemplateLoader.load('board');
    await loadBoard();
  }
});

// ===================
// LOGIN / ANIMATION
// ===================

window.addEventListener("DOMContentLoaded", () => {
  let isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  let hasVisited = sessionStorage.getItem("hasVisited") === "true";

  if (!isLoggedIn && !hasVisited) {
    sessionStorage.setItem("hasVisited", "true");
    init();
  }

  if (isLoggedIn) {
    loadAppAfterLogin();
  }
});

async function init() {
  insertAnimation();
  await delay(1200);
  window.location.href = "/login/";
}

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

async function fetchUserData() {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return logout();

    const response = await fetch(`${API_URL}/user/`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) return logout();

    const userData = await response.json();
    localStorage.setItem("currentUserName", userData.username);
    localStorage.setItem("userEmail", userData.email);

  } catch (err) {
    console.error("Fehler beim Benutzerladen:", err);
  }
}

// ===================
// ANIMATION / LOADER
// ===================

function insertAnimation() {
  const overlay = document.getElementById("overlay");
  if (!overlay) return;
  overlay.classList.remove("d-none");
  overlay.innerHTML = `
    <img src="/static/img/logoNegative.png" alt="Startup Logo" class="overlay-logo">
  `;
}

function hideStartAnimation() {
  const overlay = document.getElementById("overlay");
  overlay.classList.add("d-none");
  overlay.innerHTML = '';
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function showLoadingOverlay() {
  document.getElementById("loadingOverlay")?.classList.remove("d-none");
}

function hideLoadingOverlay() {
  document.getElementById("loadingOverlay")?.classList.add("d-none");
}


// ===================
// BEGRÜSSUNG
// ===================

export async function greetUser() {
  const userType = localStorage.getItem('userType') || 'guest';
  const userName = localStorage.getItem('currentUserName') || 'Guest';
  const greetingElement = document.getElementById('greeting');

  let currentHour = new Date().getHours();
  let greetingText =
    currentHour < 12 ? "Good morning" :
    currentHour < 18 ? "Good afternoon" : "Good evening";

  const firstName = userName.split(" ")[0];  

  greetingElement.textContent =
    userType === 'guest'
      ? `${greetingText}, dear guest!`
      : `${greetingText}, ${firstName}!`;

  greetingElement.style.color = userType === 'guest' ? '#000' : '#4589FF';

  UserInitials(userName);
}


export function UserInitials(userName) {
  const userInitialsContainer = document.getElementById('user-initals');
  if (!userName) return userInitialsContainer.innerText = "G";

  const names = userName.split(' ');
  let initials = names[0][0].toUpperCase();
  if (names.length > 1) initials += names[names.length - 1][0].toUpperCase();

  userInitialsContainer.innerText = initials;
}

async function mobileGreeting() {
  if (window.innerWidth < 800) {
    await TemplateGreetMobile();
    greetUserMobile();
    return new Promise(resolve => setTimeout(resolve, 1200));
  }
}

function greetUserMobile() {
  let userName = localStorage.getItem("currentUserName");
  let greetingElement = document.getElementById("greeting-mobile");
  let currentHour = new Date().getHours();
  let greetingText = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";
  GuestOrUser(greetingElement, userName, greetingText);
}

function GuestOrUser(greetingElement, userName, greetingText) {
  if (userName === 'Gast') {
    greetingElement.textContent = `${greetingText}`;
  } else {
    document.getElementById("greeting-mobile-user").textContent = `${greetingText},`;
    greetingElement.textContent = `${userName}`;
    greetingElement.style.color = "#005DFF";
  }
}

// ===================
// NAVIGATION UND TEMPLATE
// ===================

async function Templates(template) {
  const content = document.getElementById("content");
  if (!content) return;

  const response = await fetch(`/static/Templates/${template}.html`);
  if (!response.ok) {
    content.innerHTML = `<p class="error">⚠️ Could not load template: ${template}</p>`;
    return;
  }

  const html = await response.text();
  content.innerHTML = html;
  await includeHTML();
}

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

function openDropdown() {
  document.getElementById("navigation-overlay").classList.remove("d-none");
}

function closeDropdown() {
  document.getElementById("navigation-overlay").classList.add("d-none");
}

function dropdownHelp() {
  Templates("help");
  closeDropdown();
}

// ===================
// NAVIGATION UI
// ===================

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

function resetNavigationItems() {
  document.querySelectorAll(".navigation-item").forEach((item) => {
    item.querySelector(".clicked")?.classList.add("d-none");
    item.querySelector(".unclicked")?.classList.remove("d-none");
  });
}

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

function clickedLegalPart() {
  document.querySelectorAll(".navigation-legal div").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelector(".navigation-legal-clicked")?.classList.remove("navigation-legal-clicked");
      btn.classList.add("navigation-legal-clicked");
    });
  });
}

function removeNavHighlightOnDropdown() {
  document.querySelectorAll(".dropdown-container a").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelector(".navigation-item-clicked")?.classList.remove("navigation-item-clicked");
      resetNavigationItems();
    });
  });
}

function removeNavHighlightOnHelp() {
  document.querySelectorAll(".help").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelector(".navigation-item-clicked")?.classList.remove("navigation-item-clicked");
      resetNavigationItems();
    });
  });
}

function removeNavHighlightOnLogo() {
  document.querySelectorAll(".navLogo").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelector(".navigation-item-clicked")?.classList.remove("navigation-item-clicked");
      resetNavigationItems();
    });
  });
}

// ===================
// LOGOUT
// ===================

function logout() {
  console.log("Nutzer wird ausgeloggt...");
  ["isLoggedIn", "access_token", "refresh_token", "currentUserName", "userEmail", "userType"].forEach(key => localStorage.removeItem(key));
  sessionStorage.clear();
  window.location.href = ROUTES.login;
}
