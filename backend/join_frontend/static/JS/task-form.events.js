export function registerTaskFormEvents() {
    const titleInput = document.getElementById("addTaskInputTitle");
    const dateInput = document.getElementById("addTaskDueDateInput");
    const priorityButtons = document.querySelectorAll(".priorityButtons button");
  
    titleInput?.addEventListener("blur", errorMessageIfEmptyTitle);
    dateInput?.addEventListener("blur", errorMessageIfEmptyDueDate);
  
    priorityButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        changePriorityColor(btn.id);
      });
    });
  
    document.getElementById("selectTaskDropdown")?.addEventListener("click", toggleSelectTaskCategoryDropdown);
    document.getElementById("assignContactsDropdown")?.addEventListener("click", toggleAssignToDropdown);
    document.getElementById("assignContactsDropdown")?.addEventListener("input", searchContactToAssign);
  
    const subtaskInput = document.getElementById("addTaskSubtasksInput");
    subtaskInput?.addEventListener("input", () => {
      showSubtaskInputMenu();
      checkInputValue();
    });
  
    subtaskInput?.addEventListener("keypress", (e) => {
      if (e.key === "Enter") saveSubtaskInput();
    });
  
    document.getElementById("finish-btn")?.addEventListener("click", createTask);
  }
  