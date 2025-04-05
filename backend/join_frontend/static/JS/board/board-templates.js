/**
 * Generates the HTML structure for a single card on the board.
 */
export function cardTemplate(card) {
    return `
      <div draggable="true" class="board-card-small" data-id="${card.id}">
        <div style="background-color:${card.category.color};" class="category-card">${card.category.name}</div>
        <div class="card-text">
          <h3 class="card-title">${card.title}</h3>
          <p class="card-description">${card.description}</p>
        </div>
        ${TemplateSubtaskProgressbar(card)}
        <div class="icons-area">
          <div class="initial-card-container" id="assigned-container${card.id}"></div>
          <img src="${card.priority.img}" alt="">
        </div>
      </div>
    `;
  }
  
  export function TemplateSubtaskProgressbar(card) {
    if (card.subtasks.length > 0) {
      let completeSubtask = card.subtasks.reduce((acc, subtask) => acc + subtask.done, 0);
      return `
        <div class="progressbar-area">
          <div class="progressbar">
            <div class="progress-color" style="width:${progressbarCompetedRate(card)}%;"></div>
          </div>
          <p>${completeSubtask}/${card.subtasks.length} Subtasks</p>
        </div>
      `;
    } else {
      return '';
    }
  }
  
  export function CardPopupTemplate(card, id) {
    return `
      <div class="board-card-big-top" data-id="${card.id}">
        <div class="flex-row">
          <div style="background-color:${card.category.color};" class="category-card-big">${card.category.name}</div>
          <div class="dropdowen-task">
            <img class="dropdowen-arrow dropdowen-task-trigger" src="static/img/arrow_drop_down.svg" alt="openDropdown">
            <div tabindex="0" class="dropdown-container-task d-none" id="task-dropdown" data-dropdown>
              <div class="move-to"><p>Move Task to:</p></div> 
              <div class="move-link">
                <a class="move-task" data-status="todo" data-id="${card.id}">Todo</a>
                <a class="move-task" data-status="progress" data-id="${card.id}">In progress</a>
                <a class="move-task" data-status="feedback" data-id="${card.id}">Await feedback</a>
                <a class="move-task" data-status="done" data-id="${card.id}">Done</a>
              </div>
            </div>
          </div>
          <p>Status</p>
        </div>
        <div class="board-card-close-container card-close-btn" data-id="${id}">
          <img class="board-card-close" src="static/img/Close.svg" alt="close">
          <img class="board-card-close-hover" src="static/img/close hover.svg" alt="close hover">
        </div>
      </div>
      <h1>${card.title}</h1>
      <p class="board-card-big-description">${card.description}</p>
      <div class="board-card-big-info">
        <h2>Due date:</h2>
        <p id="due-date"></p>
      </div>
      <div class="board-card-big-info">
        <h2>Priority:</h2>
        <div class="board-card-big-priority">
          <p>${card.priority.urgency}</p>
          <img src="${card.priority.img}" alt="Priority">
        </div>
      </div>
      <div class="task-assigned-container" id="assigned-container"></div>
      <div class="board-card-big-subtasks-area" id="board-card-big-subtasks-area">
        <h2>Subtasks</h2> 
        <div class="board-task-subtasks-container" id="board-task-subtasks-container"></div> 
      </div>
      <div class="board-card-big-bottom">
        <div class="board-card-icons delete-task-btn" data-id="${id}">
          <img class="board-card-big-bottom-icon" src="static/img/delete.svg" alt="Delete">
          <img class="board-card-big-bottom-icon-hover" src="static/img/delete hover.svg" alt="delete hover">
          Delete
        </div>
        <div class="board-card-big-bottom-seperation"></div>
        <div class="board-card-icons edit-task-btn" data-id="${id}">
          <img class="board-card-big-bottom-icon" src="static/img/edit.svg" alt="Edit">
          <img class="board-card-big-bottom-icon-hover" src="static/img/edit hover.svg" alt="edit hover">
          Edit
        </div>
      </div>
    `;
  }
  
  export function CardPopupAssignedTemplate(user, initials) {
    return `
      <div class="board-card-big-assingend-user">
        <div style="background-color:${user.avatarColor};" class="user-initals-card-big-card">${initials}</div>
        <p>${user.name}</p>
      </div>
    `;
  }
  
  export function CardPopupSubtaskTemplate(taskText, img, done, i, id) {
    return `
      <div class="board-task-subtask">
        <p><img id="subtask${i}" data-done="${done}" data-index="${i}" data-id="${id}" src="${img}">${taskText}</p>
      </div>
    `;
  }
  
  export function boardPopupAddTaskWindow() {
    return `
      <div class="borad-card-popup-addTask" id="borad-card-popup-addTask">
        <div class="board-addTask-popup-top">
          <div class="add-task-title-popup">
            <h1>Add Task</h1>
          </div>
          <div class="board-popup-close-area">
            <div class="board-card-close-container card-close-btn">
              <img class="board-card-close" src="static/img/Close.svg" alt="close">
              <img class="board-card-close-hover" src="static/img/close hover.svg" alt="close hover">
            </div>
          </div>            
        </div>
        <div class="addTask-popup-container" id="addTask-popup-container"></div>
      </div> 
    `;
  }
  
  export function EditTemplate() {
    return `
      <div class="board-card-big-top-popup">
        <div class="board-card-close-container card-close-btn">
          <img class="board-card-close" src="static/img/Close.svg" alt="close">
          <img class="board-card-close-hover" src="static/img/close hover.svg" alt="close hover">
        </div>
      </div>
      <div class="fullHeight small-width" include-AddTask="./Templates/add_task-popup.html"> </div>
    `;
  }
  
  export function templateOkBtn(id) {
    return `
      <button id="finish-btn" class="createTaskButton edit-task-done-btn" data-id="${id}">
        <p>Ok</p>
        <img src="static/img/createTaskCheckIcon.svg">
      </button>
    `;
  }
  
  export function TemplateGreetMobile() {
    return `
      <div class="greeting-container">
        <p id="greeting-mobile-user"></p><br>
        <h1 class="greeting-mobile" id="greeting-mobile"></h1>
      </div>
    `;
  }
  