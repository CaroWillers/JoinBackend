/**
 * This function is the main entry point for creating a new task.
 * It gathers data from the form, validates it, and builds a new task object.
 * If validation fails, it displays error messages and exits.
 * Otherwise, it adds the new task to the board, resets the form, and displays a success popup.
 */
function createTask() {
    let taskData = getTaskData();
    let id = giveId();
    let place = boardPlace === "" ? 'todo' : boardPlace;
    if (!validateTaskData(taskData)) {
        return;
    }
    let priorityImg = getPriorityImagePath(taskData.priority);
    let categoryColor = getCategoryColor(taskData.category);
    let newCard = buildTemplateForArrayInput(id, place, taskData.category, categoryColor, taskData.title, taskData.description, taskData.dueDate, taskData.subtasks, taskData.assigned, taskData.priority, priorityImg);
    addTaskToBoard(newCard);
    resetCreateTaskFormInputs();
    CreatedPopUpOptions();
}

/**
 * Generates a unique ID for a new card.
 * 
 * @returns {number} A unique ID for the new card.
 */
function giveId() {
    if (cards.length === 0) {
        return 0; // Return 0 if no cards exist
    }
    let highestId = cards.reduce((maxId, currentCard) => Math.max(maxId, currentCard.id), 0);
    let missingIds = [];// Find any missing IDs in the sequence (gaps between existing IDs)
    for (let i = 0; i <= highestId; i++) {
        if (!cards.find(card => card.id === i)) {
            missingIds.push(i);
        }
    }
    if (missingIds.length > 0) {
        return missingIds[0];
    }
    return highestId + 1;// If no missing IDs exist, return the highest ID + 1
}

/**
 * Selects and displays the appropriate popup based on element availability.
 * 
 * @returns {void} (nothing returned)
 */
function CreatedPopUpOptions() {
    if (document.getElementById('taskCreatedButtonContainer')) {
        showTaskCreatedPopUp();
    } else {
        showTaskCreatedPopUpBoard();
    }
}

/**
 * This function gathers data from the create task form and returns an object containing the task details.
 * It retrieves title, due date, category, assigned contacts, description, and subtasks using relevant functions.
 */
function getTaskData() {
    return {
        title: errorMessageIfEmptyTitle(),
        dueDate: errorMessageIfEmptyDueDate(),
        priority: priorities[0],
        category: document.getElementById('selectTaskCategoryTextField').innerText.trim(),
        assigned: selectedAssignedContacts,
        description: document.getElementById('addTaskDescriptionInput').value.trim(),
        subtasks: createdSubtasks,
    }
}

/**
 * This function validates the provided task data.
 * It checks for missing title, due date, or invalid category.
 * If any are missing, it displays corresponding error messages and returns false.
 * Otherwise, it returns true.
 */
function validateTaskData(taskData) {
    if (!taskData.title || !taskData.dueDate || !taskCategories.some(categoryObj => categoryObj.name === taskData.category)) {
        errorMessageIfEmptyTitle();
        errorMessageIfEmptyDueDate();
        errorMessageIfEmptyCategory();
        return false;
    }
    return true;
}

/**
 * This function takes the priority urgency level (e.g., 'Urgent', 'Medium', 'Low') and returns the corresponding image path for the priority icon.
 */
function getPriorityImagePath(priority) {
    if (priority == 'Urgent') {
        return './img/priorityHighInactive.svg';
    } else if (priority == 'Medium') {
        return './img/priorityMediumInactive.svg';
    } else {
        return './img/priorityLowInactive.svg';
    }
}

/**
 * This function takes the selected category name and finds the corresponding category object from the `taskCategories` array.
 * If a match is found, it returns the category color. Otherwise, it logs an error message.
 */
function getCategoryColor(category) {
    let matchingCategory = taskCategories.find(categoryObj => categoryObj.name === category);
    if (matchingCategory) {
        return matchingCategory.categoryColor;
    } else {
        console.error("Error: Category color not found");
    }
}

/**
 * This function builds a new task object with the provided details.
 * It constructs the object with properties like `id`, `place`, `category` (including name and color), `title`, `description`, `dueDate`, `subtasks`, `assigned contacts`, and `priority` (including urgency and image path).
 */
function buildTemplateForArrayInput(id, place, category, categoryColor, title, description, dueDate, subtasks, assigned, priority, priorityImg) {
    return {
        id: id,
        place: place,
        category: {
            name: category,
            color: categoryColor
        },
        title: title,
        description: description,
        dueDate: dueDate,
        subtasks: subtasks,
        assigned: assigned,
        priority: {
            urgency: priority,
            img: priorityImg
        }
    }
}

/**
 * This function adds the provided new task object (presumably containing task details) to the `cards` array.
 * The `cards` array likely represents the collection of tasks displayed on the board.
 * Additionally, it calls the `UpdateTaskInRemote` function (assumed to be defined elsewhere) to potentially update the task data remotely.
 * 
 * @param {Object} newCard - The new task object to be added to the board.
 */
function addTaskToBoard(newCard) {
    cards.push(newCard);
    UpdateTaskInRemote();
}

/**
 * This function resets the input fields and state of the create task form.
 * It clears the `boardPlace` variable (presumably holding the selected board location),
 * resets the `priorities` array (likely containing available priorities),
 * clears the `selectedAssignedContacts` array (presumably holding selected contacts),
 * and empties the `createdSubtasks` array (likely containing created subtasks).
 */
function resetCreateTaskFormInputs() {
    boardPlace = "";
    priorities = [];
    selectedAssignedContacts = [];
    createdSubtasks = [];
}

/**
 * This function displays a popup notification for successfully creating a new task.
 * It manipulates the styles of DOM elements with specific IDs to achieve the visual effect.
 * - Sets the display of the container element (`taskCreatedButtonContainer`) to "flex".
 * - Uses `setTimeout` to schedule adding the 'showTaskCreatedButtonContainer' class to the button element (`taskCreatedButton`) with a 20ms delay.
 * - Uses another `setTimeout` to schedule removing the class and hiding the container element after 800ms.
 * - Finally, it calls the `loadBoard` function (assumed to be defined elsewhere) with another 20ms delay, potentially to refresh the board view.
 */
function showTaskCreatedPopUp() {
    document.getElementById('taskCreatedButtonContainer').style.display = "flex";
    setTimeout(() => {
        document.getElementById('taskCreatedButton').classList.add('showTaskCreatedButtonContainer');
    }, 20);
    setTimeout(() => {
        document.getElementById('taskCreatedButton').classList.remove('showTaskCreatedButtonContainer');
        document.getElementById('taskCreatedButtonContainer').style.display = "none";
    }, 800);
    setTimeout(() => {
        loadBoard();
    }, 820);
}

/**
 * Displays a temporary popup board indicating task creation and reloads the board.
 * 
 * @returns {void} (nothing returned)
 */
function showTaskCreatedPopUpBoard() {
    document.getElementById('taskCreatedButtonContainerBoard').style.display = "flex";
    setTimeout(() => {
        document.getElementById('taskCreatedButtonContainerBoard').style.display = "none";
    }, 800);
    setTimeout(() => {
        loadBoard();
        closeCardAddTaskPopup();
    }, 820);
};