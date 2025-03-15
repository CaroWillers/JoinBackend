/**
 * This function handles the assignment or unassignment of a contact based on the contact index.
 * @param {number} contactIndex - The index of the contact in the selectedAssignedContacts array.
 * @param {string} fullName - The full name of the contact.
 * @param {string} initials - The initials of the contact.
 * @param {string} avatarColor - The avatar color of the contact.
 * @param {number} i - The index of the contact in the list.
 */
function handleContactAssignment(contactIndex, fullName, initials, avatarColor, i) {
    if (contactIndex === -1) {
        let selectedContact = { name: fullName, initials: initials, avatarColor: avatarColor };
        selectedAssignedContacts.push(selectedContact);
        checkAssignContact(i);
    } else {
        selectedAssignedContacts.splice(contactIndex, 1);
        uncheckAssignContact(i);
    }
}

/**
 * This function updates the visual representation of a contact in the "Assign To" dropdown menu to reflect its assigned state (selected).
 * It targets specific elements based on dynamic IDs constructed using `dropdownEachContact(i)` and `assignToContactName(i)`.
 * It sets the background color of the contact container, text color of the contact name, and calls `changeCheckBoxStyle` to update the checkbox image (likely to checked).
 * Finally, it calls `showAvatarsOfSelectedContacts` to potentially update the assigned contacts avatar list.
 * 
 * @param {number} i - The index of the contact in the list.
 */
function checkAssignContact(i) {
    document.getElementById(`dropdownEachContact(${i})`).style.backgroundColor = "rgba(69, 137, 255, 1)";
    document.getElementById(`assignToContactName(${i})`).style.color = "white";
    changeCheckBoxStyle(i);
    showAvatarsOfSelectedContacts();
}

/**
 * This function updates the visual representation of a contact in the "Assign To" dropdown menu to reflect its unassigned state (unselected).
 * It targets specific elements based on dynamic IDs constructed using `dropdownEachContact(i)` and `assignToContactName(i)`.
 * It sets the background color of the contact container and text color of the contact name back to defaults.
 * It calls `changeBackCheckBoxStyle` to update the checkbox image (likely to unchecked).
 * Finally, it calls `showAvatarsOfSelectedContacts` to potentially update the assigned contacts avatar list.
 * 
 * @param {number} i - The index of the contact in the list.
 */
function uncheckAssignContact(i) {
    document.getElementById(`dropdownEachContact(${i})`).style.backgroundColor = "white";
    document.getElementById(`assignToContactName(${i})`).style.color = "black";
    changeBackCheckBoxStyle(i);
    showAvatarsOfSelectedContacts();
}

/**
 * This function updates the list of assigned contacts' avatars displayed below the dropdown menu.
 * It first sorts the `selectedAssignedContacts` array by name in ascending order using `localeCompare`.
 * It then shows the container for the avatar list, clears its inner HTML, and loops through each assigned contact.
 * For each contact, it constructs the avatar HTML element with the contact's initials and background color set to the contact's avatar color.
 * Finally, it adds the avatar HTML to the container.
 */
function showAvatarsOfSelectedContacts() {
    selectedAssignedContacts.sort((a, b) => {
        return a.name.localeCompare(b.name);
    });
    document.getElementById('avatarsOfSelectedContacts').style.display = "flex";
    document.getElementById('avatarsOfSelectedContacts').innerHTML = "";
    for (let i = 0; i < selectedAssignedContacts.length; i++) {
        const contact = selectedAssignedContacts[i];
        document.getElementById('avatarsOfSelectedContacts').innerHTML += showAvatarsOfSelectedContactsHTMLTemplate(contact);
    }
}

/**
 * An array containing task category objects. Each object has properties for name and category color.
 * 
 * @typedef {object} TaskCategory
 * @property {string} name - The name of the task category.
 * @property {string} categoryColor - The color of the task category represented in RGB format.
 */
let taskCategories = [{
    name: "Technical Task",
    categoryColor: "rgb(0,56,255)"
},
{
    name: 'User Story',
    categoryColor: "rgb(255,122,0)"
}
];

/**
 * This function toggles the visibility of the "Select Task Category" dropdown menu.
 * If the dropdown is currently hidden, it will be opened and `openTaskCategoryDropdown` is called. Otherwise, it will be closed and `errorMessageIfEmptyCategory` is called to check for an empty selection.
 */
function toggleSelectTaskCategoryDropdown() {
    var content = document.getElementById("dropdownSelectTasksCategory");
    if (content.style.display == "none") {
        openTaskCategoryDropdown();
    } else {
        closeTaskCategoryDropdown();
        errorMessageIfEmptyCategory();
    }
}

/**
 * This function opens the "Select Task Category" dropdown menu.
 * It shows the dropdown container, clears its inner HTML, and loops through each task category.
 * For each category, it constructs the dropdown entry HTML with the category name and sets an onclick event listener to call `selectTaskCategory` when clicked.
 * Finally, it calls `scrollDown` (presumably to ensure visibility).
 */
function openTaskCategoryDropdown() {
    document.getElementById('dropdownSelectTasksCategory').style.display = 'flex';
    document.getElementById('dropdownSelectTasksCategory').innerHTML = '';
    for (let i = 0; i < taskCategories.length; i++) {
        const taskCategory = taskCategories[i];
        document.getElementById('dropdownSelectTasksCategory').innerHTML += openTaskCategoryDropdownHTMLTemplate(i, taskCategory);
    }
    scrollDown();
}

/**
 * This function closes the "Select Task Category" dropdown menu.
 * It hides the dropdown container.
 */
function closeTaskCategoryDropdown() {
    document.getElementById('dropdownSelectTasksCategory').style.display = 'none';
}

/**
 * This function handles selecting a task category from the dropdown menu.
 * It retrieves the selected task category object based on the provided index.
 * It updates the text content of the "selectTaskCategoryTextField" element with the selected category name.
 * It then closes the dropdown and calls `errorMessageIfEmptyCategory` to check for an empty selection.
 * 
 * @param {number} i - The index of the selected task category in the `taskCategories` array.
 */
function selectTaskCategory(i) {
    let taskCategory = taskCategories[i];
    document.getElementById('selectTaskCategoryTextField').innerHTML = taskCategory.name;
    closeTaskCategoryDropdown();
    errorMessageIfEmptyCategory();
}

/**
 * This function checks if a task category has been selected and displays an error message if not.
 * It retrieves the text content of the "selectTaskCategoryTextField" element (presumably showing the selected category name).
 * It selects the error message element using a query selector.
 * If the text content is still "Select task category" (indicating no selection), it shows the error message and calls `highlightErrorMessage` for an animation effect.
 * Otherwise, it hides the error message.
 */
function errorMessageIfEmptyCategory() {
    let selectedCategory = document.getElementById('selectTaskCategoryTextField').textContent;
    let errorMessage = document.querySelector('.errorMessageIfEmptyCategory');
    if (selectedCategory === 'Select task category') { // Überprüfe, ob eine gültige Kategorie ausgewählt wurde
        errorMessage.style.visibility = 'visible';
        highlightErrorMessage(errorMessage);
    } else {
        errorMessage.style.visibility = 'hidden';
    }
}

/**
 * This function animates the error message element to highlight it briefly.
 * It sets an animation style for 1 second and then removes the animation style after a short delay.
 * 
 * @param {HTMLElement} errorMessage - The error message element to animate.
 */
function highlightErrorMessage(errorMessage) {
    errorMessage.style.animation = 'highlight 1s';
    setTimeout(() => {
        errorMessage.style.animation = '';
    }, 125);
}

/**
 * An array containing objects representing created subtasks.
 * Each object has properties for "text" (the subtask description) and "done" (a boolean indicating completion status).
 * 
 * @typedef {object} CreatedSubtask
 * @property {string} text - The description of the subtask.
 * @property {boolean} done - Whether the subtask is marked as completed.
 */
let createdSubtasks = [];

/**
 * This function checks the value entered in the "Add Subtask" input field.
 * It retrieves the trimmed value from the input field element.
 * If the input value is empty, it calls `showDefaultInputMenu` (presumably to hide subtask options).
 * Otherwise, it calls `showSubtaskInputMenu` (presumably to show options for subtasks).
 */
function checkInputValue() {
    const inputValue = document.getElementById('addTaskSubtasksInput').value.trim();
    if (inputValue === "") {
        showDefaultInputMenu();
    } else {
        showSubtaskInputMenu();
    }
}

/**
 * This function clears the value from the "Add Subtask" input field.
 * It sets the value of the input field element to an empty string.
 * It also calls `showDefaultInputMenu` (presumably to hide subtask options).
 */
function clearSubtaskInputField() {
    document.getElementById('addTaskSubtasksInput').value = '';
    showDefaultInputMenu();
}

/**
 * This function saves the entered subtask from the "Add Subtask" input field.
 * It retrieves the trimmed value from the input field element.
 * If the input value is not empty, it creates a new subtask object with the text and sets its "done" status to false.
 * It then pushes the new subtask object to the `createdSubtasks` array.
 * Finally, it calls `openCreatedSubtaskBox` to display the created subtasks and `scrollDown` (presumably to ensure visibility).
 */
function saveSubtaskInput() {
    let createdSubtask = document.getElementById('addTaskSubtasksInput').value.trim();
    if (createdSubtask !== "") {
        let createdSubtasksJson = { text: createdSubtask, done: false };
        createdSubtasks.push(createdSubtasksJson)
        openCreatedSubtaskBox();
        scrollDown();
    }
}

/**
 * This function opens the box that displays the created subtasks.
 * It shows the container element for the created subtasks and clears its inner HTML.
 * It then loops through each created subtask in the `createdSubtasks` array.
 * For each subtask, it calls `openCreatedSubtaskBoxHTMLTemplate` (presumably to generate the HTML for the subtask) and adds it to the container's inner HTML.
 * Finally, it calls `clearSubtaskInputField` to clear the input field.
 */
function openCreatedSubtaskBox() {
    document.getElementById('createdSubTasksBox').style.display = 'flex';
    document.getElementById('createdSubTasksBox').innerHTML = '';
    for (let i = 0; i < createdSubtasks.length; i++) {
        const subtask = createdSubtasks[i];
        document.getElementById('createdSubTasksBox').innerHTML += openCreatedSubtaskBoxHTMLTemplate(i, subtask);
    }
    clearSubtaskInputField();
}

/**
 * This function edits a created subtask when its corresponding element is clicked.
 * It adds a class "eachSubtaskFocused" to the clicked subtask element (likely for styling).
 * It retrieves the current subtask text from the `createdSubtasks` array based on the provided index.
 * It updates the inner HTML of the clicked subtask element with the `editCreatedSubtaskHTMLTemplate` (presumably to show an edit input field).
 * It then focuses the edit input field and selects all its content.
 * 
 * @param {number} i - The index of the subtask in the `createdSubtasks` array.
 */
function editCreatedSubtask(i) {
    document.getElementById(`eachSubtask(${i})`).classList.add('eachSubtaskFocused');
    let currentSubtaskText = createdSubtasks[i];
    document.getElementById(`eachSubtask(${i})`).innerHTML = editCreatedSubtaskHTMLTemplate(i, currentSubtaskText);
    let inputField = document.getElementById(`editTaskSubtasksInput`);
    inputField.focus();
    inputField.selectionStart = inputField.selectionEnd = inputField.value.length;
}

/**
 * This function saves the edited subtask when the user confirms changes in the edit input field.
 * It removes the "eachSubtaskFocused" class from the edited subtask element (likely for styling).
 * It retrieves the trimmed value from the edit input field element.
 * If the edited value is not empty, it updates the inner HTML of the edited subtask element with the `saveEditSubtaskInputHTMLTemplate` (presumably to show the updated text).
 * It then updates the corresponding subtask object in the `createdSubtasks` array with the edited text and sets its "done" status to false (assuming it wasn't changed).
 * Otherwise, if the edited value is empty, it calls `deleteCreatedSubtask` to remove the subtask.
 * 
 * @param {number} i - The index of the subtask in the `createdSubtasks` array.
 */
function saveEditSubtaskInput(i) {
    document.getElementById(`eachSubtask(${i})`).classList.remove('eachSubtaskFocused');
    let editedSubtask = document.getElementById('editTaskSubtasksInput').value.trim();
    if (editedSubtask !== "") {
        document.getElementById(`eachSubtask(${i})`).innerHTML = saveEditSubtaskInputHTMLTemplate(i, editedSubtask);
        createdSubtasks[i] = { text: editedSubtask, done: false };
    } else if (editedSubtask == "") {
        deleteCreatedSubtask(i);
    }
}

/**
 * This function removes a created subtask from the list.
 * It removes the subtask at the provided index from the `createdSubtasks` array using the `splice` method.
 * It then calls `openCreatedSubtaskBox` to refresh the displayed list of subtasks.
 * 
 * @param {number} subTastIndex - The index of the subtask to delete in the `createdSubtasks` array.
 */
function deleteCreatedSubtask(subTastIndex) {
    createdSubtasks.splice(subTastIndex, 1);
    openCreatedSubtaskBox();
}

/**
 * This function resets the entire "Add Task" form to its initial state.
 * It calls various helper functions to reset individual form elements.
 */
function resetAddTaskForm() {
    resetInputFields();
    resetPriority();
    resetAssignToDropdown();
    resetTaskCategory();
    resetSubtasks();
    resetErrorMessagesVisibility();
}

/**
 * This function resets the input fields in the "Add Task" form to their empty states.
 * It clears the values of the title, description, due date, and subtasks inputs.
 */
function resetInputFields() {
    document.getElementById('addTaskInputTitle').value = '';
    document.getElementById('addTaskDescriptionInput').value = '';
    document.getElementById('addTaskDueDateInput').value = '';
    document.getElementById('addTaskSubtasksInput').value = '';
}

/**
 * This function resets the priority selection in the "Add Task" form.
 * It changes the default activated button representing the priority level.
 */
function resetPriority() {
    changePriorityColor('mediumPriorityButton');
}

/**
 * This function resets the "Assign To" dropdown menu in the "Add Task" form.
 * It clears the selected value, closes the dropdown (if open), and empties the container for displaying selected contacts.
 */
function resetAssignToDropdown() {
    document.getElementById('assignContactsDropdown').value = '';
    closeAssignToDropdown();
    document.getElementById('avatarsOfSelectedContacts').innerHTML = "";
    selectedAssignedContacts = [];
}

/**
 * This function resets the selected task category in the "Add Task" form.
 * It updates the text content of an element displaying the default text.
 */
function resetTaskCategory() {
    document.getElementById('selectTaskCategoryTextField').innerHTML = "Select task category";

}

/**
 * This function resets the subtasks section in the "Add Task" form.
 * It clears the `createdSubtasks` array and the subtasks input field.
 */
function resetSubtasks() {
    createdSubtasks = [];
    document.getElementById('addTaskSubtasksInput').value = '';
    openCreatedSubtaskBox();
}

/**
 * This function hides any error messages related to empty fields in the "Add Task" form.
 * It selects all elements with specific error message classes and sets their visibility to hidden.
 */
function resetErrorMessagesVisibility() {
    const errorMessages = document.querySelectorAll('.errorMessageIfEmptyTitle, .errorMessageIfEmptyDueDate, .errorMessageIfEmptyCategory');
    errorMessages.forEach(errorMessage => {
        errorMessage.style.visibility = 'hidden';
    });
}