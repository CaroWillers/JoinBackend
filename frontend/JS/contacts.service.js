const avatarColors = [
    "rgb(255,122,0)", "rgb(255,70,70)", "rgb(147,39,255)",
    "rgb(110,82,255)", "rgb(252,113,255)", "rgb(255,187,43)",
    "rgb(31,215,193)", "rgb(70,47,138)"
];

let localContacts = [];
let currentUser = localStorage.getItem('currentUserName');
let userEmail = localStorage.getItem("userEmail") || "";

/**
 * Lädt Kontakte aus dem Backend und zeigt sie an.
 */
async function loadContacts() {
    await Templates('contacts');
    await initContacts();
}

/**
 * Lädt Kontakte des aktuellen Benutzers aus dem Backend.
 */ 
async function loadRemoteContacts() {
    try {
        const token = localStorage.getItem("access_token");
        if (!token) throw new Error("Kein Zugriffstoken vorhanden.");

        const response = await fetch(`${API_URL}/contacts/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Fehler beim Laden der Kontakte.");
        localContacts = await response.json();
        return localContacts;
    } catch (err) {
        console.error("❌ Fehler beim Laden:", err);
        return [];
    }
}

/**
 * Erstellt den aktuellen User als Kontakt, wenn noch nicht vorhanden.
 */
async function checkAndCreateSelfAsContact() {
    const exists = localContacts.some(c => c.email === userEmail);
    if (!exists) {
        await createUserAsContact();
    }
}

/**
 * Erstellt beim ersten Login einen initialen Kontakt-Eintrag für den aktuellen Benutzer im Backend.
 */
async function createInitialUserContact() {
    const newContact = generateUserContact(currentUser, userEmail);

    try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${API_URL}/contacts/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newContact)
        });

        if (!response.ok) throw new Error("Fehler beim Erstellen des Kontakts.");
        console.log("✅ Benutzerkontakt erfolgreich erstellt.");
        await fetchRemoteContacts(); // Kontaktliste direkt aktualisieren
    } catch (error) {
        console.error("❌ Fehler beim Erstellen des Benutzerkontakts:", error);
    }
}

/**
 * Generiert ein neues Kontaktobjekt für den gegebenen Namen und die E-Mail-Adresse.
 * @param {string} fullName Der vollständige Benutzername.
 * @param {string} email Die E-Mail-Adresse des Benutzers.
 * @returns {Object} Ein neues Kontaktobjekt.
 */
function generateUserContact(fullName, email) {
    const [firstName, lastName = ""] = fullName.split(" ");
    const initials = firstName.charAt(0).toUpperCase() + (lastName.charAt(0)?.toUpperCase() || "");
    const avatarColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];
    const category = firstName.charAt(0).toUpperCase();

    return {
        name: firstName,
        surname: lastName,
        initials,
        avatarColor,
        category,
        email: email || "guest@guestmail.com",
        phone: "+49"
    };
}

/**
 * Verarbeitet das Erstellen eines neuen Kontakts.
 */
async function handleContactCreate() {
    const fullName = document.getElementById('editContactName').value.trim();
    const [firstName, ...rest] = fullName.split(" ");
    const lastName = rest.join(" ") || "";

    const email = document.getElementById('editContactEmail').value;
    const phone = document.getElementById('editContactPhone').value || "";
    const initials = getInitials(firstName, lastName);
    const avatarColor = getRandomAvatarColor();
    const category = firstName.charAt(0).toUpperCase();

    const newContact = {
        name: firstName,
        surname: lastName,
        email,
        phone,
        initials,
        avatarColor,
        category
    };

    try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${API_URL}/contacts/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newContact)
        });

        if (!response.ok) {
            const errorMsg = await response.text();
            console.error("❌ Fehler beim Erstellen:", errorMsg);
            alert("Fehler beim Erstellen des Kontakts.");
            return;
        }

        const createdContact = await response.json();
        localContacts.push(createdContact);

        closeContactForm();
        initContacts();
        // Optional: showToast("Kontakt erfolgreich erstellt!");

    } catch (error) {
        console.error("❌ Netzwerkfehler:", error);
        alert("Netzwerkfehler beim Erstellen des Kontakts.");
    }
}


/**
 * Speichert einen neuen Kontakt im Backend.
 */
async function createContactInBackend(contact) {
    try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${API_URL}/contacts/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(contact)
        });

        if (!res.ok) throw new Error("Kontakt konnte nicht erstellt werden.");
        console.log("✅ Neuer Kontakt gespeichert.");
        await loadRemoteContacts();
    } catch (err) {
        console.error("❌ Fehler beim Speichern:", err);
    }
}

/**
 * Aktualisiert einen bestehenden Kontakt im Backend.
 */
async function updateContactInBackend(contact) {
    try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${API_URL}/contacts/${contact.id}/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(contact)
        });

        if (!res.ok) throw new Error("Update fehlgeschlagen");
        console.log("✅ Kontakt aktualisiert.");
    } catch (err) {
        console.error("❌ Fehler beim Update:", err);
        throw err;
    }
}

/**
 * Löscht einen Kontakt im Backend.
 */
async function deleteContactInBackend(contactId) {
    try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${API_URL}/contacts/${contactId}/`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Löschen fehlgeschlagen");
        console.log("🗑️ Kontakt gelöscht.");
    } catch (err) {
        console.error("❌ Fehler beim Löschen:", err);
    }
}

/**
 * Aktualisiert alle Kontakte im Backend.
 */
async function updateAllContactsInBackend() {
    try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${API_URL}/contacts/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ contacts: localContacts })
        });

        if (!response.ok) throw new Error("Fehler beim Aktualisieren.");
        console.log("✅ Kontakte aktualisiert.");
        await loadRemoteContacts();
    } catch (err) {
        console.error("❌ Update fehlgeschlagen:", err);
    }
}

 
/**
 * Speichert neue Kontakte im Backend.
 */
async function updateUserContactsInRemote() {
    try {
        let token = localStorage.getItem("access_token");
        if (!token) throw new Error("Kein Token gefunden!");

        const response = await fetch(`${API_URL}/contacts/`, {
            method: "PUT", // PUT wird genutzt, um eine bestehende Liste zu überschreiben
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ contacts: localContacts }) // Sende die Kontakte als JSON-Objekt
        });

        if (!response.ok) throw new Error(`Fehler beim Speichern der Kontakte: ${response.statusText}`);
        console.log("✅ Kontakte erfolgreich im Backend gespeichert.");
        await loadRemoteContacts();
    } catch (error) {
        console.error("❌ Fehler beim Speichern der Kontakte:", error);
    }
}

/**
 * Initialisiert die Anzeige der Kontakte.
 */
async function initContacts() {
    localContacts = await loadRemoteContacts();
    await sortByFirstName();
    let categorizedContacts = await createCategories();
    await renderContactList(categorizedContacts);
}

/**
 * Sortiert `localContacts` alphabetisch nach Vornamen.
 */
async function sortByFirstName() {
    localContacts.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Erstellt Kategorien für Kontakte basierend auf dem ersten Buchstaben des Vornamens.
 */
async function createCategories() {
    let categories = {};
    localContacts.forEach(contact => {
        let initial = contact.name.charAt(0).toUpperCase();
        if (!categories[initial]) {
            categories[initial] = [];
        }
        categories[initial].push(contact);
    });
    return categories;
}

/**
 * Zeigt die Kontakte in der UI an.
 */
async function renderContactList(categories) {
    let contactListHTML = '';
    let index = 0;
    contactListHTML = renderContactCategoryAndEachContact(categories, contactListHTML, index);
    document.getElementById("contactList").innerHTML = `
        <div class="contactBoxForEachLetter">
            ${contactListHTML}
        </div>
    `;
}

/**
 * Erstellt die HTML-Struktur für Kontakt-Kategorien und Kontakte.
 */
function renderContactCategoryAndEachContact(categories, contactListHTML, index) {
    for (let initial in categories) {
        contactListHTML += renderContactCategory(initial);
        categories[initial].forEach(contact => {
            contactListHTML += renderEachContact(contact, index);
            index++;
        });
    }
    return contactListHTML;
}

/**
 * Gibt die HTML-Struktur für eine Kontakt-Kategorie zurück.
 */
function renderContactCategory(initial) {
    return `<div class="contact-category">${initial}</div>`;
}

/**
 * Gibt die HTML-Struktur für einen einzelnen Kontakt zurück.
 */
function renderEachContact(contact, index) {
    return `
        <div class="contact" id="contact-${index}">
            <div class="avatar" style="background-color: ${contact.avatarColor};">
                ${contact.name.charAt(0)}
            </div>
            <div class="contact-info">
                <p>${contact.name}</p>
                <p>${contact.email}</p>
            </div>
        </div>
    `;
}

 