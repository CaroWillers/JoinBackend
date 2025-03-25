/**
 * Fügt ein neues Subtask-Objekt zur Liste hinzu und rendert sie.
 */
function addSubtaskInput() {
    const input = document.getElementById('subtaskInputField');
    const value = input.value.trim();

    if (value) {
        createdSubtasks.push({ title: value, done: false });
        input.value = '';
        renderSubtasks();
    }
}

/**
 * Rendert alle Subtasks in die UI.
 */
function renderSubtasks() {
    const container = document.getElementById('subtasksContainer');
    container.innerHTML = '';

    createdSubtasks.forEach((subtask, index) => {
        container.innerHTML += getSubtaskTemplate(subtask, index);
    });
}

/**
 * Gibt das HTML für einen einzelnen Subtask zurück.
 * @param {Object} subtask 
 * @param {number} index 
 */
function getSubtaskTemplate(subtask, index) {
    const checked = subtask.done ? 'checked' : '';
    return `
        <div class="subtask-item">
            <input type="checkbox" id="subtask-${index}" ${checked} onchange="toggleSubtask(${index})">
            <label for="subtask-${index}">${subtask.title}</label>
            <button onclick="deleteSubtask(${index})">🗑️</button>
        </div>
    `;
}

/**
 * Entfernt ein Subtask-Objekt aus der Liste und rendert neu.
 * @param {number} index 
 */
function deleteSubtask(index) {
    createdSubtasks.splice(index, 1);
    renderSubtasks();
}

/**
 * Toggelt den Status eines Subtasks (done/undone).
 * @param {number} index 
 */
function toggleSubtask(index) {
    createdSubtasks[index].done = !createdSubtasks[index].done;
    renderSubtasks(); // optional, nur nötig wenn Darstellung sich ändern soll
}

function showSubtaskInputMenu() {
    document.getElementById('createdSubTasksBox').style.display = 'block';
}

function checkInputValue() {
    const input = document.getElementById('addTaskSubtasksInput');
    const icon = document.getElementById('addTaskSubtasksIcons');
    icon.style.display = input.value.trim() ? 'block' : 'none';
}

function saveSubtaskInput() {
    const input = document.getElementById('addTaskSubtasksInput');
    if (input.value.trim() !== '') {
        createdSubtasks.push({ title: input.value.trim(), done: false });
        input.value = '';
        renderSubtasks(); // bereits vorhanden
        showSubtaskInputMenu();
    }
}
