document.addEventListener('DOMContentLoaded', () => {
  setupGlobalEventListeners();
});

function setupGlobalEventListeners() {
  document.body.addEventListener('click', handleClickEvents);
}

function handleClickEvents(event) {
  const target = event.target;

  if (target.closest('.delete-task-btn')) {
    const taskId = target.closest('.delete-task-btn').dataset.id;
    deleteTask(taskId);
  }

  if (target.closest('.edit-task-btn')) {
    const taskId = target.closest('.edit-task-btn').dataset.id;
    editTask(taskId);
  }

  if (target.classList.contains('dropdowen-task-trigger')) {
    openDropdown(target);
  }

  if (target.classList.contains('move-task')) {
    const status = target.dataset.status;
    const taskId = target.dataset.id;
    dropMobile(status, taskId);
  }

  if (target.closest('.card-close-btn')) {
    closeCard();
  }

  if (target.closest('.edit-task-done-btn')) {
    const taskId = target.closest('.edit-task-done-btn').dataset.id;
    editTaskDone(taskId);
  }

  if (target.closest('.dropdownEachContact')) {
    const index = getIdFromElementId(target.closest('.dropdownEachContact').id);
    assignContact(index);
  }

  if (target.closest('.editContact')) {
    const index = getIndexFromElement(target.closest('.editContact'));
    showEditContact(index);
  }

  if (target.closest('.deleteContact')) {
    const index = getIndexFromElement(target.closest('.deleteContact'));
    deleteContact(index);
  }
}

function getIdFromElementId(idString) {
  const match = idString.match(/\((\d+)\)/);
  return match ? parseInt(match[1], 10) : null;
}

function getIndexFromElement(element) {
  return parseInt(element.dataset.index);
}