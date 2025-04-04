/**
 * Öffnet das Add Task Popup-Overlay (Modal auf dem Board).
 */
async function boardPopupAddTask() {
    const container = document.getElementById('board-card-overlay');
    container.innerHTML = boardPopupAddTask();

    container.classList.remove('d-none');
    document.body.classList.add('body-noscroll-class');
    container.style.justifyContent = "flex-end";
    container.style.alignItems = "flex-start";

    document.getElementById('addTask-popup-container').innerHTML = `
        <div class="fullHeight" include-AddTask="./Templates/add_task-popup.html"> </div>
    `;

    await includeAddTask();
    changePriorityColor('mediumPriorityButton');
}

/**
 * Inkludiert ein externes HTML-Template, z.B. für das Add Task Popup.
 */
async function includeAddTask() {
    const elements = document.querySelectorAll('[include-AddTask]');
    for (const el of elements) {
        const file = el.getAttribute("include-AddTask");
        const resp = await fetch(file);
        el.innerHTML = resp.ok ? await resp.text() : "Page not found.";
    }
}

/**
 * Schließt das Add Task Popup.
 */
function closeCardAddTaskPopup() {
    const container = document.getElementById('borad-card-overlay');
    container.classList.add('d-none');
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
    container.innerHTML = `<div class="board-card-popup d-none" id="borad-card-popup" onclick="doNotClose(event)"></div>`;
    document.body.classList.remove('body-noscroll-class');

    // Reset
    priorities = [];
    selectedAssignedContacts = [];
    createdSubtasks = [];
    boardPlace = "";
}

/**
 * Holt die Suchanfrage.
 */
function getSearchQuery() {
    return document.getElementById('search').value.toLowerCase();
}

/**
 * Holt die Card-Container (ToDo, Progress etc.)
 */
function getCardContainers() {
    return [
        document.getElementById('todo'),
        document.getElementById('progress'),
        document.getElementById('feedback'),
        document.getElementById('done')
    ];
}

/**
 * Führt die Suche in allen Karten durch.
 */
function handleSearch() {
    const query = getSearchQuery();
    const containers = getCardContainers();
    const hasMatch = searchCards(query, containers);
    NoMatchFound(hasMatch, query);
}

/**
 * Sucht nach Cards anhand von Query-String.
 */
function searchCards(query, containers) {
    let hasMatch = false;
    for (const container of containers) {
        for (const card of container.querySelectorAll('.board-card-small')) {
            const title = card.querySelector('.card-title')?.textContent.toLowerCase() || "";
            const desc = card.querySelector('.card-description')?.textContent.toLowerCase() || "";
            const combined = `${title} ${desc}`;
            if (combined.includes(query)) {
                card.classList.remove('d-none');
                hasMatch = true;
            } else {
                card.classList.add('d-none');
            }
        }
    }
    return hasMatch;
}

/**
 * Zeigt "Keine Ergebnisse" an, wenn keine Cards gefunden wurden.
 */
function NoMatchFound(hasMatch, query) {
    const container = document.getElementById('no-search-results');
    if (!hasMatch && query !== '') {
        container.innerText = 'No matching task found.';
    } else {
        container.innerText = '';
    }
}

/**
 * Stoppt das Schließen von Popups, wenn innerhalb des Popups geklickt wird.
 */
function doNotClose(event) {
    event.stopPropagation();
}


function bigCard(id) {
    if (!cards || !Array.isArray(cards)) {
        console.error("❌ cards ist nicht definiert oder kein Array");
        return;
    }

    const card = cards.find(card => card.id === id);

    if (!card) {
        console.error(`❌ Task mit ID ${id} nicht gefunden`);
        return;
    }

    const overlay = document.getElementById('board-card-overlay');
    const container = document.getElementById('board-card-popup');

    overlay.classList.remove('d-none');
    container.classList.remove('d-none');
    document.body.classList.add('body-noscroll-class');

    container.innerHTML = BigCardTemplate(card, id);
    renderAssignedToBigCard(card.assigned);
    renderSubtasksToBigCard(card.subtasks, card.id);
    renderDueDateFormatted(card.dueDate);
}


function bigCardAssigned(card) {
    const container = document.getElementById('bigCardAssignedContacts');
    container.innerHTML = card.assigned.map(user => `
        <div class="contact-line">
            <div class="user-initals-card" style="background-color:${user.avatarColor};">
                ${user.initials}
            </div>
            <span>${user.name}</span>
        </div>
    `).join('');
}
function bigCardSubtasksCheck(card) {
    const container = document.getElementById('bigCardSubtasks');
    if (!card.subtasks || card.subtasks.length === 0) {
        container.innerHTML = `<p>Keine Subtasks</p>`;
        return;
    }

    container.innerHTML = card.subtasks.map(subtask => `
        <div class="subtask-line">
            <img src="./img/${subtask.done ? 'checked' : 'unchecked'}.svg" alt="${subtask.done ? 'Done' : 'Not done'}">
            <span>${subtask.text}</span>
        </div>
    `).join('');
}

function renderAssignedToBigCard(assigned) {
    const container = document.getElementById('assigned-container');
    container.innerHTML = assigned.map(user => {
        return bigCardAssignedTemplate(user, user.initials);
    }).join('');
}

function renderSubtasksToBigCard(subtasks, cardId) {
    const container = document.getElementById('board-task-subtasks-container');
    if (!subtasks || subtasks.length === 0) {
        container.innerHTML = '<p>No subtasks</p>';
        return;
    }
    container.innerHTML = subtasks.map((subtask, i) => {
        const img = `./img/${subtask.done ? 'checked' : 'unchecked'}.svg`;
        return bigCardSubtaskTemplate(subtask.text, img, subtask.done, i, cardId);
    }).join('');
}


function renderDueDateFormatted(dateString) {
    const dueDateEl = document.getElementById('due-date');
    if (dueDateEl) {
        const date = new Date(dateString);
        dueDateEl.innerText = date.toLocaleDateString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
}

function dueDateConvert(card) {
    const dateSpan = document.querySelector('.dateSpan');
    if (dateSpan) {
        const date = new Date(card.dueDate);
        dateSpan.innerText = date.toLocaleDateString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
}

function closeCard() {
    const overlay = document.getElementById('board-card-overlay');
    overlay.classList.add('d-none');
    overlay.innerHTML = `<div class="board-card-popup d-none" id="board-card-popup" onclick="doNotClose(event)"></div>`;
    document.body.classList.remove('body-noscroll-class');
}