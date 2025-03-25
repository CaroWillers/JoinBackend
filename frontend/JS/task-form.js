let cards = [];
let boardPlace = "";
let priorities = [];
let selectedAssignedContacts = [];
let createdSubtasks = [];

/**
 * Holt alle Daten aus dem Task-Formular.
 * @returns {Object} Taskdaten
 */
function getTaskData() {
    return {
        title: getValidatedTitle(),
        dueDate: getValidatedDueDate(),
        priority: priorities[0], // z.B. 'urgent', 'medium', 'low'
        category: document.getElementById('selectTaskCategoryTextField').innerText.trim(),
        assigned: selectedAssignedContacts,
        description: document.getElementById('addTaskDescriptionInput').value.trim(),
        subtasks: createdSubtasks
    };
}

/**
 * Validiert alle Pflichtfelder des Formulars.
 * @param {Object} taskData - Die zu prüfenden Daten
 * @returns {boolean}
 */
function validateTaskData(taskData) {
    const validCategory = taskCategories.some(category => category.name === taskData.category);
    const allValid = taskData.title && taskData.dueDate && validCategory;

    if (!allValid) {
        getValidatedTitle();
        getValidatedDueDate();
        validateCategory();
        return false;
    }
    return true;
}

/**
 * Holt & validiert den Titel.
 */
function getValidatedTitle() {
    const input = document.getElementById('addTaskInputTitle');
    const message = document.querySelector('.errorMessageIfEmptyTitle');
    const value = input.value.trim();

    if (value === "") {
        message.style.visibility = 'visible';
        input.value = '';
        return false;
    } else {
        message.style.visibility = 'hidden';
        return value;
    }
}

/**
 * Holt & validiert das Due Date.
 */
function getValidatedDueDate() {
    const input = document.getElementById('addTaskDueDateInput');
    const message = document.querySelector('.errorMessageIfEmptyDueDate');
    const today = getCurrentDate();

    if (!input.value) {
        showError(message, 'This field is required');
        return;
    }

    if (input.value < today) {
        showError(message, 'Past date! Select a valid future date');
        return;
    }

    message.style.visibility = 'hidden';
    return input.value;
}

/**
 * Zeigt eine Fehlermeldung im Feld.
 */
function showError(messageEl, text) {
    messageEl.innerText = text;
    messageEl.style.visibility = 'visible';
}

/**
 * Zeigt Fehler bei ungültiger Kategorie.
 */
function validateCategory() {
    const message = document.querySelector('.errorMessageIfEmptyCategory');
    message.style.visibility = 'visible';
}

/**
 * Gibt das aktuelle Datum im Format YYYY-MM-DD zurück.
 */
function getCurrentDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

/**
 * Setzt das min-Datum im Kalender auf heute.
 */
function setMinDueDate() {
    document.getElementById('addTaskDueDateInput').min = getCurrentDate();
}

/**
 * Setzt die ausgewählte Priorität.
 * @param {string} priorityId
 */
function changePriorityColor(priorityId) {
    priorities = [];
    priorities.push(document.getElementById(priorityId).getAttribute('data-priority'));

    resetAllPriorityButtons();
    document.getElementById(priorityId).classList.add('clicked');
}

/**
 * Setzt alle Priority-Buttons auf Standard zurück.
 */
function resetAllPriorityButtons() {
    const buttons = ['urgentPriorityButton', 'mediumPriorityButton', 'lowPriorityButton'];
    buttons.forEach(id => {
        const btn = document.getElementById(id);
        btn.classList.remove('clicked');
    });
}

/**
 * Setzt das gesamte Formular zurück.
 */
function resetCreateTaskFormInputs() {
    boardPlace = "";
    priorities = [];
    selectedAssignedContacts = [];
    createdSubtasks = [];
}

function resetAddTaskForm() {
    resetCreateTaskFormInputs();
    document.getElementById('addTaskInputTitle').value = '';
    document.getElementById('addTaskDescriptionInput').value = '';
    document.getElementById('addTaskDueDateInput').value = '';
    document.getElementById('assignContactsDropdown').value = '';
    document.getElementById('selectTaskCategoryTextField').innerText = 'Select task category';
    document.getElementById('addTaskSubtasksInput').value = '';
    document.getElementById('createdSubTasksBox').innerHTML = '';
    document.getElementById('createdSubTasksBox').style.display = 'none';
}

function toggleSelectTaskCategoryDropdown() {
    const dropdown = document.getElementById('dropdownSelectTasksCategory');
    dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
}

function closeTaskCategoryDropdown() {
    document.getElementById('dropdownSelectTasksCategory').style.display = 'none';
}
