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
        <div class="board-card-small" draggable="true" ondragstart="drag(event, ${card.id})" id="card-${card.id}">
            <div class="card-category" style="background-color: ${card.category.color}">
                ${card.category.name}
            </div>
            <h4 class="card-title">${card.title}</h4>
            <p class="card-description">${card.description}</p>
            <div class="card-footer">
                <div class="due-date">${card.dueDate}</div>
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
