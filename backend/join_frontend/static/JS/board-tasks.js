export let cards = [];

// =====================
// 1. LÄDT DIE AUFGABEN (Tasks)
// =====================
export async function loadBoard() {
    try { 
        await Templates("board");  
        await loadTasks();         
        updateCards();             
    } catch (error) {
        console.error("❌ Fehler beim Laden des Boards:", error);
    }
}

export async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks/`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem('access_token')}`
            }
        });
        const data = await response.json();
        cards = data;  // Setze die geladenen Tasks in die globale Variable
        updateCards();  // Karten nach dem Laden aktualisieren
    } catch (error) {
        console.error("Fehler beim Laden der Aufgaben:", error);
    }
}

// =====================
// 2. BEARBEITEN DER AUFGABEN
// =====================
async function editTask(id) {
    const container = document.getElementById('board-card-popup');
    container.innerHTML = EditTemplate();

    await includeAddTask();
    templateOkBtn(id);  // Optional: Button-Funktion für den Abschluss

    const editBtn = document.getElementById('finish-btn');
    editBtn.classList.add('editTaskButton');

    fillEditForm(id);  // Fülle das Bearbeitungsformular mit den Taskdaten
    document.getElementById('taskCategoryBoxPopup').style.display = 'none';
    document.getElementById('subtasksBox').style.paddingTop = '16px';
}

function fillEditForm(id) {
    const card = cards.find(card => card.id === id);
    document.getElementById('addTaskInputTitle').value = card.title;
    document.getElementById('addTaskDescriptionInput').value = card.description;
    document.getElementById('addTaskDueDateInput').value = card.dueDate;

    setPriorityForEdit(card);
    setAssignedContactsForEdit(card);
    setCategoryForEdit(card);
    setSubtasksForEdit(card);
}

function setPriorityForEdit(card) {
    if (card.priority.urgency === 'Urgent') changePriorityColor('urgentPriorityButton');
    if (card.priority.urgency === 'Medium') changePriorityColor('mediumPriorityButton');
    if (card.priority.urgency === 'Low') changePriorityColor('lowPriorityButton');
}

function setAssignedContactsForEdit(card) {
    selectedAssignedContacts = card.assigned.map(contact => ({
        name: contact.name,
        initials: contact.initials,
        avatarColor: contact.avatarColor
    }));
    showAvatarsOfSelectedContacts();  // Zeige die Avatare der zugewiesenen Kontakte
}

function setCategoryForEdit(card) {
    document.getElementById('selectTaskCategoryTextField').innerText = card.category.name;
}

function setSubtasksForEdit(card) {
    createdSubtasks = card.subtasks.map(subtask => ({ text: subtask.text, done: subtask.done }));
    openCreatedSubtaskBox();  // Zeige die Subtasks an
}

async function editTaskDone(id) {
    const card = cards.find(c => c.id === id);
    const newCardData = collectEditedCardData(id);
    const updatedCard = { ...card, ...newCardData };

    if (!validateEditedTask(updatedCard)) return;

    finishEdit(updatedCard, id);
}

// =====================
// 3. VALIDIERUNG UND AKTUALISIERUNG DER TASKS
// =====================
function collectEditedCardData(id) {
    return {
        title: document.getElementById('addTaskInputTitle').value.trim(),
        description: document.getElementById('addTaskDescriptionInput').value.trim(),
        dueDate: document.getElementById('addTaskDueDateInput').value,
        priority: priorities[0],
        assigned: selectedAssignedContacts,
        subtasks: createdSubtasks,
        category: document.getElementById('selectTaskCategoryTextField').innerText
    };
}

function validateEditedTask(card) {
    const isValid = card.title && card.dueDate && taskCategories.some(c => c.name === card.category);
    if (!isValid) {
        showValidationErrors();
        return false;
    }
    return true;
}

function showValidationErrors() {
    errorMessageIfEmptyTitle();
    errorMessageIfEmptyDueDate();
    errorMessageIfEmptyCategory();
}

function finishEdit(newCard, id) {
    const index = cards.findIndex(c => c.id === id);
    cards.splice(index, 1, newCard);  // Ersetze die alte Karte mit der neuen

    UpdateTaskInRemote(newCard);  // Update den Task im Backend
    emptyArrays();
    bigCard(id);
    updateCards();  // Aktualisiere das Board
}

// =====================
// 4. LÖSCHEN DER AUFGABEN
// =====================
function deleteTask(cardId) {
    const index = cards.findIndex(card => card.id === cardId);
    if (index !== -1) {
        const deletedCard = cards.splice(index, 1)[0];  // Entferne den Task
        updateCards();
        closeCard();
        UpdateTaskInRemote(deletedCard);  // Entferne den Task vom Backend
    } else {
        console.error("Task nicht gefunden:", cardId);
    }
}

// =====================
// 5. KARTENANZEIGE
// =====================
export function updateCards() {
    const columns = ['todo', 'progress', 'feedback', 'done'];
    columns.forEach(column => {
        const container = document.getElementById(column);
        container.innerHTML = '';
        const filteredCards = cards.filter(c => c.place === column);
        if (filteredCards.length === 0) {
            container.innerHTML = `<div class="no-task-div">No tasks in ${column}</div>`;
        } else {
            filteredCards.forEach(card => {
                container.innerHTML += renderCardHTML(card);
            });
        }
    });
}

function renderCardHTML(card) {
    return `
        <div class="board-card-small" draggable="true" onclick="bigCard(${card.id})" ondragstart="startDragging(event, ${card.id})">
            <div style="background-color:${card.category.color};" class="category-card">${card.category.name}</div>
            <div class="card-text">
                <h3 class="card-title">${card.title}</h3>
                <p class="card-description">${card.description}</p>
            </div>
            ${renderSubtaskProgress(card)}
            <div class="icons-area">
                <div class="initial-card-container">${renderAssignedAvatars(card.assigned)}</div>
                <img src="${card.priority.img}" alt="${card.priority.urgency}">
            </div>
        </div>
    `;
}

// =====================
// 6. HILFSFUNKTIONEN
// =====================
function renderSubtaskProgress(card) {
    const total = card.subtasks?.length || 0;
    const done = card.subtasks?.filter(s => s.done).length || 0;
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
    return assigned?.map(user => `
        <div class="user-initals-card" style="background-color:${user.avatarColor};">
            ${user.initials}
        </div>
    `).join('') || '';
}

function emptyArrays() {
    priorities = [];
    selectedAssignedContacts = [];
    createdSubtasks = [];
}

// =====================
// 7. BACKEND-AKTUALISIERUNGEN
// =====================
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

        if (!response.ok) throw new Error("Fehler beim Backend-Update");

        console.log(`✅ Task ${card.id} erfolgreich aktualisiert`);
    } catch (err) {
        console.error("❌ Fehler beim Speichern des Tasks:", err);
    }
}
