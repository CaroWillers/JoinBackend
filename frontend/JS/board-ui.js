/**
 * Öffnet das Add Task Popup-Overlay (Modal auf dem Board).
 */
async function boardPopupAddTask() {
    const container = document.getElementById('borad-card-overlay');
    container.innerHTML = boardPopupAddTaskWindow();

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
    container.innerHTML = `<div class="borad-card-popup d-none" id="borad-card-popup" onclick="doNotClose(event)"></div>`;
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
