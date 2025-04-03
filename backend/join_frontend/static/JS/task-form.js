let cards = [];
let boardPlace = "";
let priorities = [];
let selectedAssignedContacts = [];
let createdSubtasks = [];
let taskCategories = [];

async function loadAddTasks() {
    try {
        await Templates("addTask");        
        await includeHTML();              
        await delay(20);                   

        resetAddTaskForm();               
        setMinDueDate();
        await loadTaskCategories(); 
        renderCategoryOptions();          
       

    } catch (err) {
        console.error("❌ Fehler beim Laden des Add Task-Formulars:", err);
    }
}

async function loadTaskCategories() {
    try {
        const res = await fetch(`${API_URL}/tasks/categories/`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        });

        if (!res.ok) throw new Error("Kategorien konnten nicht geladen werden");
        taskCategories = await res.json();
    } catch (err) {
        console.error("❌ Fehler beim Laden der Kategorien:", err.message);
    }
}

/**
 * Rendert die verfügbaren Task-Kategorien in das Dropdown-Menü.
 * Diese Funktion wird z. B. beim Laden des AddTask-Templates aufgerufen.
 */
function renderCategoryOptions() {
    const container = document.getElementById('dropdownSelectTasksCategory');
    if (!container) {
        console.warn("⚠️ Kategorie-Dropdown (#dropdownSelectTasksCategory) nicht gefunden.");
        return;
    }

    container.innerHTML = ''; // Vorherige Einträge entfernen
    taskCategories.forEach((category, i) => {
        container.innerHTML += `
            <div class="task-category-option" onclick="selectCategory('${category.name}', '${category.categoryColor}', ${category.id})">
                <div class="category-color" style="background-color: ${category.categoryColor};"></div>
                <span>${category.name}</span>
            </div>
        `;
    });
}

/**
 * Wählt eine Kategorie aus dem Dropdown aus und aktualisiert das Label.
 * @param {string} name - Name der Kategorie
 * @param {string} color - Farbe der Kategorie
 */
function selectCategory(name, color, id) {
    const label = document.getElementById('selectTaskCategoryTextField');
    label.innerText = name;
    label.setAttribute("data-id", id);  
    label.style.color = color;

    closeTaskCategoryDropdown();
}

/**
 * Holt alle Daten aus dem Task-Formular.
 * @returns {Object} Taskdaten
 */
function getTaskData() {
    const categoryField = document.getElementById('selectTaskCategoryTextField');
    return {
        title: getValidatedTitle(),
        dueDate: getValidatedDueDate(),
        priority: priorities[0],
        category: {
            id: parseInt(categoryField.getAttribute("data-id")),
            name: categoryField.innerText.trim()
        },
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
/**
 * Setzt oder entfernt die ausgewählte Priorität (Toggle).
 * @param {string} priorityId
 */
function changePriorityColor(priorityId) {
    const config = {
        urgentPriorityButton: "clickedUrgentButton",
        mediumPriorityButton: "clickedMediumButton",
        lowPriorityButton: "clickedLowButton"
    };

    const selectedButton = document.getElementById(priorityId);
    const selectedClass = config[priorityId];

    // Falls bereits aktiv → toggle aus
    if (selectedButton.classList.contains(selectedClass)) {
        selectedButton.classList.remove(selectedClass);
        priorities = [];
        return;
    }

    // Alle zurücksetzen
    Object.keys(config).forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.remove(config[id]);
    });

    // Aktiven Button setzen
    selectedButton.classList.add(selectedClass);
    const selectedPriority = selectedButton.getAttribute('data-priority');
    priorities = [selectedPriority];
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

function toggleAssignToDropdown() {
    var content = document.getElementById("dropdowncontacts");
    if (content.style.display == "none") {
        openAssignToDropdown();
    } else {
        closeAssignToDropdown();
    }
}

function closeOnClickOutside(event) {
    const assignedToBox = document.getElementById('assignedToBox');
    const targetElement = event.target;
    if (!assignedToBox.contains(targetElement)) {
        closeAssignToDropdown();
    }
}

function openAssignToDropdown() {
    document.getElementById("dropdowncontacts").style.display = "block";
    document.getElementById("avatarsOfSelectedContacts").style.display = "flex";
}

function closeAssignToDropdown() {
    document.getElementById("dropdowncontacts").style.display = "none";
    document.getElementById("avatarsOfSelectedContacts").style.display = "none";
}

function errorMessageIfEmptyTitle() {
    let titleInput = document.getElementById('addTaskInputTitle');
    let errorMessage = document.querySelector('.errorMessageIfEmptyTitle');
    let title = titleInput.value.trim();
    if (title === "" || /^\s+$/.test(title)) {
        errorMessage.style.visibility = 'visible';
        document.getElementById('addTaskInputTitle').value = '';
        highlightErrorMessage(errorMessage);
        return false;
    } else {
        errorMessage.style.visibility = 'hidden';
        return title;
    }
}

function errorMessageIfEmptyDueDate() {
    const dueDateInput = document.getElementById('addTaskDueDateInput');
    const errorMessage = document.querySelector('.errorMessageIfEmptyDueDate');
    const today = new Date().toISOString().split('T')[0];

    if (!dueDateInput.value) {
        errorMessage.innerText = "This field is required";
        errorMessage.style.visibility = 'visible';
        highlightErrorMessage(errorMessage);
        return false;
    }

    if (dueDateInput.value < today) {
        errorMessage.innerText = "Date cannot be in the past!";
        errorMessage.style.visibility = 'visible';
        highlightErrorMessage(errorMessage);
        return false;
    }

    errorMessage.style.visibility = 'hidden';
    return dueDateInput.value;
}


function highlightErrorMessage(element) {
    element.style.transition = 'transform 0.2s ease';
    element.style.transform = 'scale(1.05)';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 150);
}
