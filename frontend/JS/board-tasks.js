async function loadBoard() {
    try { 
        await Templates("board");  
 
        await loadTasks();
 
        updateCards();
    } catch (error) {
        console.error("❌ Fehler beim Laden des Boards:", error);
    }
}


async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks/`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('access_token')}`
            }
        });
        const data = await response.json();
        cards = data;  
        updateCards();  
    } catch (error) {
        console.error("Fehler beim Laden der Aufgaben:", error);
    }
}

function updateCards() {
    const columns = ['todo', 'progress', 'feedback', 'done'];
    for (let column of columns) {
        const container = document.getElementById(column);
        if (!container) {
            console.warn(`⚠️ updateCards: #${column} noch nicht im DOM`);
            continue;
        } 
    }
}


/**
 * Öffnet das Bearbeiten-Fenster für einen Task mit bestimmter ID.
 */
async function editTask(id) {
    const container = document.getElementById('borad-card-popup');
    container.innerHTML = EditTemplate();

    await includeAddTask();
    await templateOkBtn(id); // optional: button-Funktion

    const editBtn = document.getElementById('finish-btn');
    editBtn.classList.add('editTaskButton');

    TaskTextInEdit(id);
    document.getElementById('taskCategoryBoxPopup').style.display = 'none';
    document.getElementById('subtasksBox').style.paddingTop = '16px';
}

/**
 * Befüllt das Bearbeitungsformular mit den Taskdaten.
 */
function TaskTextInEdit(id) {
    const card = cards.find(card => card.id === id);
    document.getElementById('addTaskInputTitle').value = card.title;
    document.getElementById('addTaskDescriptionInput').value = card.description;
    document.getElementById('addTaskDueDateInput').value = card.dueDate;

    priorityEdit(card);
    isAssignedEdit(card);
    document.getElementById('selectTaskCategoryTextField').innerHTML = card.category.name;
    subtaskEdit(card);
}

/**
 * Setzt die Priorität im Bearbeitungsmodus.
 */
function priorityEdit(card) {
    if (card.priority.urgency === 'Urgent') changePriorityColor('urgentPriorityButton');
    if (card.priority.urgency === 'Medium') changePriorityColor('mediumPriorityButton');
    if (card.priority.urgency === 'Low') changePriorityColor('lowPriorityButton');
}

/**
 * Zeigt zugewiesene Kontakte an.
 */
function isAssignedEdit(card) {
    selectedAssignedContacts = [];

    for (const contact of card.assigned) {
        selectedAssignedContacts.push({
            name: contact.name,
            initials: contact.initials,
            avatarColor: contact.avatarColor
        });
    }

    showAvatarsOfSelectedContacts();
}

/**
 * Fügt alle Subtasks aus dem bestehenden Card-Objekt hinzu.
 */
function subtaskEdit(card) {
    createdSubtasks = [];
    for (const subtask of card.subtasks) {
        createdSubtasks.push({ text: subtask.text, done: subtask.done });
    }
    openCreatedSubtaskBox();
}

/**
 * Speichert die Änderungen eines bearbeiteten Tasks.
 */
function editTaskDone(id) {
    const card = cards.find(c => c.id === id);
    let place = card.place;
    let category = card.category.name;

    deleteUneditTask(id);

    const title = errorMessageIfEmptyTitle();
    const dueDate = errorMessageIfEmptyDueDate();
    const priority = priorities[0];
    const assigned = selectedAssignedContacts;
    const description = document.getElementById('addTaskDescriptionInput').value.trim();
    const subtasks = createdSubtasks;

    if (!checkErrors(title, dueDate, category)) return;

    const priorityImg = priorityImgCheck(priority);
    const matchingCategory = taskCategories.find(c => c.name === category);
    const categoryColor = matchingCategoryCheck(matchingCategory);

    const newCard = createCardObject(id, place, category, categoryColor, title, description, dueDate, subtasks, assigned, priority, priorityImg);
    finishEdit(newCard, id);
}

/**
 * Fügt den neuen Task ins Array ein, schließt das Popup und aktualisiert alles.
 */
function finishEdit(newCard, id) {
    cards.push(newCard);
    UpdateTaskInRemote();
    emptyArrays();
    bigCard(id);
    updateCards();
}

/**
 * Validiert die wichtigsten Felder.
 */
function checkErrors(title, dueDate, category) {
    const validCategory = taskCategories.some(c => c.name === category);
    if (!title || !dueDate || !validCategory) {
        errorMessageIfEmptyTitle();
        errorMessageIfEmptyDueDate();
        errorMessageIfEmptyCategory();
        return false;
    }
    return true;
}

/**
 * Gibt das passende Bild zur Priorität zurück.
 */
function priorityImgCheck(priority) {
    if (priority === 'Urgent') return './img/priorityHighInactive.svg';
    if (priority === 'Medium') return './img/priorityMediumInactive.svg';
    if (priority === 'Low') return './img/priorityLowInactive.svg';
}

/**
 * Gibt die Farbe einer Kategorie zurück (falls vorhanden).
 */
function matchingCategoryCheck(category) {
    if (category) return category.categoryColor;
    console.error("Kategorie nicht gefunden!");
}

/**
 * Erstellt ein neues Karten-Objekt (Task).
 */
function createCardObject(id, place, category, categoryColor, title, description, dueDate, subtasks, assigned, priority, priorityImg) {
    return {
        id,
        place,
        category: { name: category, color: categoryColor },
        title,
        description,
        dueDate,
        subtasks,
        assigned,
        priority: { urgency: priority, img: priorityImg }
    };
}

/**
 * Entfernt den alten Task vor dem Update.
 */
function deleteUneditTask(id) {
    const index = cards.findIndex(c => c.id === id);
    if (index !== -1) cards.splice(index, 1);
}

/**
 * Entfernt einen Task vollständig (z. B. bei Löschen).
 */
function deleteTask(cardId) {
    const index = cards.findIndex(card => card.id === cardId);
    if (index !== -1) {
        cards.splice(index, 1);
        updateCards();
        closeCard();
        UpdateTaskInRemote();
    } else {
        console.error("Task nicht gefunden:", cardId);
    }
}

/**
 * Setzt globale Arrays zurück.
 */
function emptyArrays() {
    priorities = [];
    selectedAssignedContacts = [];
    createdSubtasks = [];
}


function renderCardHTML(card) {
    return `
        <div class="board-card-small" draggable="true" onclick="bigCard(${card.id})" ondragstart="startDragging(${card.id})">
            <div style="background-color:${card.category.color};" class="category-card">
                ${card.category.name}
            </div>
            <div class="card-text">
                <h3 class="card-title">${card.title}</h3>
                <p class="card-description">${card.description}</p>
            </div>
            ${renderSubtaskProgress(card)}
            <div class="icons-area">
                <div class="initial-card-container">
                    ${renderAssignedAvatars(card.assigned)}
                </div>
                <img src="${card.priority.img}" alt="${card.priority.urgency}">
            </div>
        </div>
    `;
}


function updateCards() {
    const columns = ['todo', 'progress', 'feedback', 'done'];
    for (let column of columns) {
        const container = document.getElementById(column);
        container.innerHTML = '';
        const filteredCards = cards.filter(c => c.place === column);
        if (filteredCards.length === 0) {
            container.innerHTML = `<div class="no-task-div">No tasks ${column}</div>`;
        } else {
            for (let card of filteredCards) {
                container.innerHTML += renderCardHTML(card);
            }
        }
    }
}

async function loadBoard() {
    try { 
        await Templates("board");  
 
        await loadTasks();
 
        updateCards();
    } catch (error) {
        console.error("❌ Fehler beim Laden des Boards:", error);
    }
}


async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks/`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('access_token')}`
            }
        });
        const data = await response.json();
        cards = data;  
        updateCards();  
    } catch (error) {
        console.error("Fehler beim Laden der Aufgaben:", error);
    }
}

function updateCards() {
    const columns = ['todo', 'progress', 'feedback', 'done'];
    for (let column of columns) {
        const container = document.getElementById(column);
        if (!container) {
            console.warn(`⚠️ updateCards: #${column} noch nicht im DOM`);
            continue;
        } 
    }
}


/**
 * Öffnet das Bearbeiten-Fenster für einen Task mit bestimmter ID.
 */
async function editTask(id) {
    const container = document.getElementById('borad-card-popup');
    container.innerHTML = EditTemplate();

    await includeAddTask();
    await templateOkBtn(id); // optional: button-Funktion

    const editBtn = document.getElementById('finish-btn');
    editBtn.classList.add('editTaskButton');

    TaskTextInEdit(id);
    document.getElementById('taskCategoryBoxPopup').style.display = 'none';
    document.getElementById('subtasksBox').style.paddingTop = '16px';
}

/**
 * Befüllt das Bearbeitungsformular mit den Taskdaten.
 */
function TaskTextInEdit(id) {
    const card = cards.find(card => card.id === id);
    document.getElementById('addTaskInputTitle').value = card.title;
    document.getElementById('addTaskDescriptionInput').value = card.description;
    document.getElementById('addTaskDueDateInput').value = card.dueDate;

    priorityEdit(card);
    isAssignedEdit(card);
    document.getElementById('selectTaskCategoryTextField').innerHTML = card.category.name;
    subtaskEdit(card);
}

/**
 * Setzt die Priorität im Bearbeitungsmodus.
 */
function priorityEdit(card) {
    if (card.priority.urgency === 'Urgent') changePriorityColor('urgentPriorityButton');
    if (card.priority.urgency === 'Medium') changePriorityColor('mediumPriorityButton');
    if (card.priority.urgency === 'Low') changePriorityColor('lowPriorityButton');
}

/**
 * Zeigt zugewiesene Kontakte an.
 */
function isAssignedEdit(card) {
    selectedAssignedContacts = [];

    for (const contact of card.assigned) {
        selectedAssignedContacts.push({
            name: contact.name,
            initials: contact.initials,
            avatarColor: contact.avatarColor
        });
    }

    showAvatarsOfSelectedContacts();
}

/**
 * Fügt alle Subtasks aus dem bestehenden Card-Objekt hinzu.
 */
function subtaskEdit(card) {
    createdSubtasks = [];
    for (const subtask of card.subtasks) {
        createdSubtasks.push({ text: subtask.text, done: subtask.done });
    }
    openCreatedSubtaskBox();
}

/**
 * Speichert die Änderungen eines bearbeiteten Tasks.
 */
function editTaskDone(id) {
    const card = cards.find(c => c.id === id);
    let place = card.place;
    let category = card.category.name;

    deleteUneditTask(id);

    const title = errorMessageIfEmptyTitle();
    const dueDate = errorMessageIfEmptyDueDate();
    const priority = priorities[0];
    const assigned = selectedAssignedContacts;
    const description = document.getElementById('addTaskDescriptionInput').value.trim();
    const subtasks = createdSubtasks;

    if (!checkErrors(title, dueDate, category)) return;

    const priorityImg = priorityImgCheck(priority);
    const matchingCategory = taskCategories.find(c => c.name === category);
    const categoryColor = matchingCategoryCheck(matchingCategory);

    const newCard = createCardObject(id, place, category, categoryColor, title, description, dueDate, subtasks, assigned, priority, priorityImg);
    finishEdit(newCard, id);
}

/**
 * Fügt den neuen Task ins Array ein, schließt das Popup und aktualisiert alles.
 */
function finishEdit(newCard, id) {
    cards.push(newCard);
    UpdateTaskInRemote(newCard);  
    emptyArrays();
    bigCard(id);
    updateCards();
}


/**
 * Validiert die wichtigsten Felder.
 */
function checkErrors(title, dueDate, category) {
    const validCategory = taskCategories.some(c => c.name === category);
    if (!title || !dueDate || !validCategory) {
        errorMessageIfEmptyTitle();
        errorMessageIfEmptyDueDate();
        errorMessageIfEmptyCategory();
        return false;
    }
    return true;
}

/**
 * Gibt das passende Bild zur Priorität zurück.
 */
function priorityImgCheck(priority) {
    if (priority === 'Urgent') return './img/priorityHighInactive.svg';
    if (priority === 'Medium') return './img/priorityMediumInactive.svg';
    if (priority === 'Low') return './img/priorityLowInactive.svg';
}

/**
 * Gibt die Farbe einer Kategorie zurück (falls vorhanden).
 */
function matchingCategoryCheck(category) {
    if (category) return category.categoryColor;
    console.error("Kategorie nicht gefunden!");
}

/**
 * Erstellt ein neues Karten-Objekt (Task).
 */
function createCardObject(id, place, category, categoryColor, title, description, dueDate, subtasks, assigned, priority, priorityImg) {
    return {
        id,
        place,
        category: { name: category, color: categoryColor },
        title,
        description,
        dueDate,
        subtasks,
        assigned,
        priority: { urgency: priority, img: priorityImg }
    };
}

/**
 * Entfernt den alten Task vor dem Update.
 */
function deleteUneditTask(id) {
    const index = cards.findIndex(c => c.id === id);
    if (index !== -1) cards.splice(index, 1);
}

/**
 * Entfernt einen Task vollständig (z. B. bei Löschen).
 */
function deleteTask(cardId) {
    const index = cards.findIndex(card => card.id === cardId);
    if (index !== -1) {
        const deletedCard = cards[index];  
        cards.splice(index, 1);
        updateCards();
        closeCard();
        UpdateTaskInRemote(deletedCard);  
    } else {
        console.error("Task nicht gefunden:", cardId);
    }
}


/**
 * Setzt globale Arrays zurück.
 */
function emptyArrays() {
    priorities = [];
    selectedAssignedContacts = [];
    createdSubtasks = [];
}


function renderCardHTML(card) {
    return `
        <div class="board-card-small" draggable="true" onclick="bigCard(${card.id})" ondragstart="startDragging(event, ${card.id})">
            <div style="background-color:${card.category.color};" class="category-card">
                ${card.category.name}
            </div>
            <div class="card-text">
                <h3 class="card-title">${card.title}</h3>
                <p class="card-description">${card.description}</p>
            </div>
            ${renderSubtaskProgress(card)}
            <div class="icons-area">
                <div class="initial-card-container">
                    ${renderAssignedAvatars(card.assigned)}
                </div>
                <img src="${card.priority.img}" alt="${card.priority.urgency}">
            </div>
        </div>
    `;
}


function updateCards() {
    const columns = ['todo', 'progress', 'feedback', 'done'];
    for (let column of columns) {
        const container = document.getElementById(column);
        container.innerHTML = '';
        const filteredCards = cards.filter(c => c.place === column);
        if (filteredCards.length === 0) {
            container.innerHTML = `<div class="no-task-div">No tasks ${column}</div>`;
        } else {
            for (let card of filteredCards) {
                container.innerHTML += renderCardHTML(card);
            }
        }
    }
}

/**
 * Aktualisiert eine einzelne Task im Backend.
 * Wird z. B. nach Drag & Drop oder Editieren verwendet.
 */
async function UpdateTaskInRemote(card) {
    if (!card || !card.id) {
        console.error("❌ Kein gültiges Card-Objekt übergeben an UpdateTaskInRemote");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/tasks/${card.id}/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            },
            body: JSON.stringify(card)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Fehler beim Backend-Update:", errorText);
            return;
        }

        console.log(`✅ Task ${card.id} erfolgreich aktualisiert`);
    } catch (err) {
        console.error("❌ Fehler beim Speichern des Tasks:", err);
    }
}



function UpdateSingleTask(card) {
    fetch(`${API_URL}/tasks/${card.id}/`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify(card)
    })
    .then(res => {
        if (!res.ok) throw new Error(`❌ Fehler beim Speichern von Task ID ${card.id}`);
    })
    .catch(err => console.error("Fehler beim Speichern:", err));
}


function renderSubtaskProgress(card) {
    if (!card.subtasks || card.subtasks.length === 0) return '';

    const total = card.subtasks.length;
    const done = card.subtasks.filter(s => s.done).length;
    const percent = Math.round((done / total) * 100);

    return `
        <div class="progressbar-area">
            <div class="progressbar">
                <div class="progress-color" style="width:${percent}%"></div>
            </div>
            <p>${done}/${total} Subtasks</p>
        </div>
    `;
}

function renderAssignedAvatars(assigned) {
    if (!assigned || assigned.length === 0) return '';

    return assigned.map(user => {
        return `
            <div class="user-initals-card" style="background-color:${user.avatarColor};">
                ${user.initials}
            </div>
        `;
    }).join('');
}


function renderSubtaskProgress(card) {
    if (!card.subtasks || card.subtasks.length === 0) return '';

    const total = card.subtasks.length;
    const done = card.subtasks.filter(s => s.done).length;
    const percent = Math.round((done / total) * 100);

    return `
        <div class="progressbar-area">
            <div class="progressbar">
                <div class="progress-color" style="width:${percent}%"></div>
            </div>
            <p>${done}/${total} Subtasks</p>
        </div>
    `;
}

function renderAssignedAvatars(assigned) {
    if (!assigned || assigned.length === 0) return '';

    return assigned.map(user => {
        return `
            <div class="user-initals-card" style="background-color:${user.avatarColor};">
                ${user.initials}
            </div>
        `;
    }).join('');
}
