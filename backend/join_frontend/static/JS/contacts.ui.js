import {
    loadRemoteContacts,
    getInitials,
    getRandomAvatarColor
  } from './contacts.service.js';
  
  export { 
    initContacts,
    renderContactList,
    openAddContactForm,
    openContactInfo,
    closeContactDetails,
    editContact,
    deleteContact
  };
  

// =====================
// 🔁 INIT & SORTING
// =====================

/**
 * Initialisiert die Kontaktliste und rendert sie.
 */
async function initContacts() {
    const contacts = await loadRemoteContacts();
    await sortContactsByFirstName(contacts);
    const categories = await categorizeContacts(contacts);
    renderContactList(categories);
  }  

/**
 * Sortiert Kontakte alphabetisch nach Vornamen.
 */
async function sortContactsByFirstName() {
    localContacts.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Gruppiert Kontakte nach dem Anfangsbuchstaben des Vornamens.
 * @returns {Object} Gruppenweise sortierte Kontakte.
 */
async function categorizeContacts() {
    const grouped = {};
    for (const contact of localContacts) {
        const letter = contact.name.charAt(0).toUpperCase();
        grouped[letter] = grouped[letter] || [];
        grouped[letter].push(contact);
    }
    return grouped;
}

// =====================
// 🧱 RENDER CONTACT LIST
// =====================

/**
 * Rendert alle Kontaktgruppen in die DOM.
 * @param {Object} categories - Kategorisierte Kontakte.
 */
function renderContactList(categories) {
    let html = "";
    let index = 0;

    for (const initial in categories) {
        html += `<div class="contact-category">${initial}</div>`;
        for (const contact of categories[initial]) {
            const initials = contact.initials || getInitials(contact.name ?? "", contact.surname ?? "");
            const avatarColor = contact.avatarColor || getRandomAvatarColor();

            html += `
                <div class="contact" id="contact(${index})" onclick="openContactInfo(${index})">
                    <div class="avatar" style="background-color: ${avatarColor};">${initials}</div>
                    <div class="contactNameAndEmail">
                        <p class="contactName">${contact.name} ${contact.surname || ""}</p>
                        <p class="contactEmail" id="contactEmail(${index})">${contact.email}</p>
                    </div>
                </div>
            `;
            index++;
        }
    }

    document.getElementById("contactList").innerHTML = `<div class="contactBoxForEachLetter">${html}</div>`;
}

/**
 * Erzeugt Initialen aus Vor- und Nachname.
 * @param {string} firstName
 * @param {string} lastName
 * @returns {string} Initialen
 */
function getInitials(firstName = "", lastName = "") {
    return (
        (firstName?.charAt(0).toUpperCase() || "") +
        (lastName?.charAt(0).toUpperCase() || "")
    );
}

/**
 * Gibt eine zufällige Avatarfarbe zurück.
 * @returns {string} Farbwert als String
 */
function getRandomAvatarColor() {
    const colors = [
        "rgb(255,122,0)", "rgb(255,70,70)", "rgb(147,39,255)",
        "rgb(110,82,255)", "rgb(252,113,255)", "rgb(255,187,43)",
        "rgb(31,215,193)", "rgb(70,47,138)"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// =====================
// 👤 CONTACT DETAILS (RIGHT PANEL)
// =====================

/**
 * Öffnet das Kontakt-Detailfeld.
 * @param {number} index - Index des Kontakts.
 */
function openContactInfo(index) {
    document.getElementById('contactInfo').classList.add('showContactDetailsContainer');
    renderContactDetails(index);
    highlightSelectedContact(index);  
}


/**
 * Hebt den aktuell ausgewählten Kontakt visuell hervor.
 * @param {number} index
 */
function highlightSelectedContact(index) {
    if (typeof toggleIndex !== 'undefined' && toggleIndex !== null) {
        const prev = document.getElementById(`contact(${toggleIndex})`);
        const prevEmail = document.getElementById(`contactEmail(${toggleIndex})`);
        if (prev) prev.classList.remove('contactClicked');
        if (prevEmail) prevEmail.style.color = "rgba(69, 137, 255, 1)";
    }

    const current = document.getElementById(`contact(${index})`);
    const currentEmail = document.getElementById(`contactEmail(${index})`);
    if (current) current.classList.add('contactClicked');
    if (currentEmail) currentEmail.style.color = "white";

    toggleIndex = index;
}

/**
 * Rendert die Details eines Kontakts im rechten Panel.
 * @param {number} index
 */
function renderContactDetails(index) {
    const contact = localContacts[index];
    const initials = contact.initials || getInitials(contact.name, contact.surname);
    const avatarColor = contact.avatarColor || getRandomAvatarColor();

    document.getElementById('contactInfoContactDetails').innerHTML = `
        <div class="contactInfoAvatarAndName">
            <div class="contactInfoAvatar" style="background-color: ${avatarColor};">${initials}</div>
            <div class="contactInfoName">${contact.name} ${contact.surname || ""}</div>
        </div>

        <div class="editContactMenuDesktop" style="margin-top: 12px;">
            <div class="editContact" onclick="editContact(${index})">
                <img src="./img/editContactIcon.svg" alt="Edit Icon" />
                <span>Edit</span>
            </div>
            <div class="deleteContact" onclick="deleteContact(${index})">
                <img src="./img/deleteContactIcon.svg" alt="Delete Icon" />
                <span>Delete</span>
            </div>
        </div>

        <div class="contactInfoEmailAndPhone">
            <div class="contactInfoEmail">
                <p>Email</p>
                <a href="mailto:${contact.email}">${contact.email}</a>
            </div>
            <div class="contactInfoPhone">
                <p>Phone</p>
                <span>${contact.phone || "-"}</span>
            </div>
        </div>
    `;
}

/**
 * Öffnet das Formular mit vorausgefüllten Kontaktdaten zur Bearbeitung.
 * @param {number} index - Index des zu bearbeitenden Kontakts.
 */
function editContact(index) {
    const contact = localContacts[index];

    const container = document.getElementById('addEditContact');
    const card = document.getElementById('addEditContactCard');

    // Formular anzeigen
    container.style.display = 'flex';
    setTimeout(() => {
        card.classList.add('showAddEditContactContainer');
    }, 25);

    // Avatar setzen
    document.getElementById('avatarIcon').style.backgroundColor = contact.avatarColor;
    document.getElementById('avatarIcon').innerHTML = `
        ${contact.initials}
    `;

    // Daten vorausfüllen
    document.getElementById('addAndEditContactHeadline').innerText = 'Edit contact';
    document.getElementById('addContactSubheadline').style.display = 'none';

    document.getElementById('editContactName').value = `${contact.name} ${contact.surname || ""}`.trim();
    document.getElementById('editContactEmail').value = contact.email;
    document.getElementById('editContactPhone').value = contact.phone || "";

    // Buttons rendern
    document.getElementById('addEditContactButtons').innerHTML = renderEditButtonsHTML(index);
    card.onclick = (e) => e.stopPropagation();
}

/**
 * Rendert die Edit-Buttons (Save & Delete) im Formular.
 * @param {number} index
 * @returns {string} HTML
 */
function renderEditButtonsHTML(index) {
    return `
        <button type="button" class="deleteEditContactButton" onclick="deleteContact(${index})">
            <p>Delete</p>
        </button>
        <button type="submit" class="saveEditContactButton" onclick="saveEditedContact(${index})">
            <p>Save</p>
            <img src="./img/createTaskCheckIcon.svg">
        </button>
    `;
}

/**
 * Speichert bearbeitete Kontaktdaten.
 * @param {number} index
 */
async function saveEditedContact(index) {
    const fullName = document.getElementById('editContactName').value.trim();
    const [firstName, ...rest] = fullName.split(" ");
    const lastName = rest.join(" ") || null;

    const email = document.getElementById('editContactEmail').value;
    const phone = document.getElementById('editContactPhone').value || null;
    const initials = getInitials(firstName, lastName);
    const avatarColor = localContacts[index].avatarColor || getRandomAvatarColor();

    const updatedContact = {
        ...localContacts[index],
        name: firstName,
        surname: lastName,
        email,
        phone,
        initials,
        avatarColor,
        category: firstName.charAt(0).toUpperCase()
    };

    try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${API_URL}/contacts/${updatedContact.id}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedContact)
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("❌ Backend Fehler:", err);
            throw new Error("Update fehlgeschlagen");
        }

        const savedContact = await response.json();
        localContacts[index] = savedContact;
        
        showContactSavedModal();
        closeContactForm();
        initContacts();
    } catch (e) {
        alert("Fehler beim Speichern. Bitte versuch es erneut.");
        console.error(e);
    }
}

/**
 * Aktualisiert einen Kontakt im Backend.
 * @param {number} index
 */
async function updateContactInBackend(index) {
    const contact = localContacts[index];

    const response = await fetch(`http://localhost:8000/contacts/${contact.id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(contact)
    });

    if (!response.ok) {
        console.error("Fehler beim Aktualisieren des Kontakts im Backend:", await response.text());
        throw new Error("Update fehlgeschlagen");
    }

    return await response.json();
}


/**
 * Löscht einen Kontakt im Backend.
 * @param {number} index
 */
async function deleteContact(index) {
    const confirmed = confirm("Wirklich löschen?");
    if (!confirmed) return;

    const contact = localContacts[index];

    try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${API_URL}/contacts/${contact.id}/`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error("Fehler beim Löschen:", await response.text());
            alert("Löschen fehlgeschlagen");
            return;
        }

        localContacts.splice(index, 1);
        closeContactForm();
        closeContactDetails();
        initContacts();
    } catch (err) {
        alert("Fehler beim Löschen. Bitte versuch es erneut.");
        console.error("❌ Fehler beim Löschen:", err);
    }
}


/**
 * Schließt das Kontakt-Detailfenster.
 */
function closeContactDetails() {
    document.getElementById('contactInfo').classList.remove('showContactDetailsContainer');
}

// =====================
// ➕ ADD CONTACT FORM
// =====================

function showAddContactCard() {
    openAddContactForm();
}

/**
 * Öffnet das Add-Contact-Formular.
 */
function openAddContactForm() {
    const container = document.getElementById('addEditContact');
    const card = document.getElementById('addEditContactCard');

    container.style.display = 'flex';
    setTimeout(() => {
        card.classList.add('showAddEditContactContainer');
    }, 25);

    renderEmptyContactForm();
    card.onclick = (event) => event.stopPropagation();
}

/**
 * Baut das/ leere Kontaktformular für "Add contact".
 */
function renderEmptyContactForm() {
    document.getElementById('addAndEditContactHeadline').innerHTML = 'Add contact';
    document.getElementById('addContactSubheadline').style.display = 'flex';
    document.getElementById('avatarIcon').style.backgroundColor = 'rgba(209, 209, 209, 1)';
    document.getElementById('avatarIcon').innerHTML = '<img src="./img/addContactAvatar.svg">';
    document.getElementById('editContactName').value = '';
    document.getElementById('editContactEmail').value = '';
    document.getElementById('editContactPhone').value = '';
    document.getElementById('addEditContactButtons').innerHTML = renderAddButtonsHTML();
}


/**
 * Gibt die HTML-Buttons für das Formular zurück.
 * @returns {string}
 */
function renderAddButtonsHTML() {
    return `
        <button type="button" class="cancelCreateContactButton" onclick="closeContactForm()">
            <p>Cancel</p>
            <span class="taskIcon">X</span>
        </button>
        <button type="submit" class="createContactButton" onclick="handleCreateContact()">
            <p>Create contact</p>
            <img src="./img/createTaskCheckIcon.svg">
        </button>
    `;
}

/**
 * Schließt das Add/Edit-Formular.
 */
function closeContactForm() {
    const card = document.getElementById('addEditContactCard');
    const container = document.getElementById('addEditContact');

    card.classList.remove('showAddEditContactContainer');
    setTimeout(() => {
        container.style.display = 'none';
    }, 125);
}

/**
 * Alternative Methode zum Schließen (legacy support).
 */
function hideAddContactCard() {
    document.getElementById("addEditContactCard").classList.remove("showAddEditContactContainer");
    setTimeout(() => {
        document.getElementById("addEditContact").style.display = "none";
    }, 125);
}

// =====================
// 🔁 HILFSVARIABLEN
// =====================

/** Merkt sich den aktuell ausgewählten Kontakt */
let toggleIndex = null;

function showContactSavedModal() {
    const modal = document.getElementById("contactSavedModal");
    modal.style.display = "block";

    setTimeout(() => {
        modal.style.display = "none";
    }, 2500);
}
