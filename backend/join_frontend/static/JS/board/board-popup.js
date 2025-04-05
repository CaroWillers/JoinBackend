// ============================
// IMPORTS
// ============================
import {
    CardPopupTemplate,
    CardPopupSubtaskTemplate,
    CardPopupAssignedTemplate,
    boardPopupAddTaskWindow
  } from './board-templates.js';
  
  
  // ============================
  // EXPORTIERTE FUNKTIONEN
  // ============================
  export {
    openBigCard,
    closeBigCard,
    boardPopupAddTask,
    closeCardAddTaskPopup
  };
  
  
  // ============================
  // 1. BOARD TASK POPUP (View/Edit Overlay)
  // ============================
  
  /**
   * Öffnet das große Task-Overlay für eine Karte.
   * @param {number} id - Task ID
   */
  function openBigCard(id) {
    const card = cards.find(c => c.id === id);
    if (!card) {
      console.error(`❌ Task mit ID ${id} nicht gefunden`);
      return;
    }
  
    const overlay = document.getElementById('board-card-overlay');
    const container = document.getElementById('board-card-popup');
  
    overlay.classList.remove('d-none');
    container.classList.remove('d-none');
    document.body.classList.add('body-noscroll-class');
  
    container.innerHTML = CardPopupTemplate(card, id);
    renderAssignedToPopup(card.assigned);
    renderSubtasksToPopup(card.subtasks, card.id);
    renderDueDateFormatted(card.dueDate);

    document.getElementById('board-card-popup')?.addEventListener('click', doNotClose);
  }
  
  
  /**
   * Schließt das große Task-Overlay.
   */
  function closeBigCard() {
    const overlay = document.getElementById('board-card-overlay');
    overlay.classList.add('d-none');
    overlay.innerHTML = `<div class="board-card-popup d-none" id="board-card-popup"></div>`;
    document.body.classList.remove('body-noscroll-class');
  }
  
  
  // ============================
  // 2. ADD TASK POPUP (Erstellen)
  // ============================
  
  /**
   * Öffnet das Add Task Popup auf dem Board.
   */
  async function boardPopupAddTask() {
    const container = document.getElementById('board-card-overlay');
    container.innerHTML = boardPopupAddTaskWindow();
  
    container.classList.remove('d-none');
    document.body.classList.add('body-noscroll-class');
    container.style.justifyContent = "flex-end";
    container.style.alignItems = "flex-start";
  
    document.getElementById('addTask-popup-container').innerHTML = `
      <div class="fullHeight" include-AddTask="./Templates/add_task-popup.html"></div>
    `;
  
    await includeAddTask();
    changePriorityColor('mediumPriorityButton');
  }
  
  
  /**
   * Schließt das Add Task Popup.
   */
  function closeCardAddTaskPopup() {
    const container = document.getElementById('board-card-overlay');
    container.classList.add('d-none');
    container.style.justifyContent = "center";
    container.style.alignItems = "center";
    container.innerHTML = `<div class="board-card-popup d-none" id="board-card-popup"></div>`;
    document.body.classList.remove('body-noscroll-class');
  
    // Reset globale Arrays
    priorities = [];
    selectedAssignedContacts = [];
    createdSubtasks = [];
    boardPlace = "";
  }
  
  
  /**
   * Inkludiert externes HTML-Formular z.B. Add Task.
   */
  async function includeAddTask() {
    const elements = document.querySelectorAll('[include-AddTask]');
    for (const el of elements) {
      const file = el.getAttribute("include-AddTask");
      const resp = await fetch(file);
      el.innerHTML = resp.ok ? await resp.text() : "Page not found.";
    }
  }
  
  
  // ============================
  // 3. HELPER-FUNKTIONEN
  // ============================
  
  /**
   * Rendert zugewiesene Kontakte im großen Overlay.
   */
  function renderAssignedToPopup(assigned) {
    const container = document.getElementById('assigned-container');
    container.innerHTML = assigned.map(user =>
      CardPopupAssignedTemplate(user, user.initials)
    ).join('');
  }
  
  
  /**
   * Rendert Subtasks im großen Overlay.
   */
  function renderSubtasksToPopup(subtasks, cardId) {
    const container = document.getElementById('board-task-subtasks-container');
    if (!subtasks || subtasks.length === 0) {
      container.innerHTML = '<p>No subtasks</p>';
      return;
    }
  
    container.innerHTML = subtasks.map((subtask, i) => {
      const img = `{% static 'img/${subtask.done ? 'checked' : 'unchecked'}.svg' %}`;
      return CardPopupSubtaskTemplate(subtask.text, img, subtask.done, i, cardId);
    }).join('');
  }
  
  
  /**
   * Formatiert und zeigt das Fälligkeitsdatum an.
   */
  function renderDueDateFormatted(dateString) {
    const dueDateEl = document.getElementById('due-date');
    if (dueDateEl) {
      const date = new Date(dateString);
      dueDateEl.innerText = date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
  }
  

  /**
   * Verhindert das Schließen eines Popups beim Klicken im Inneren.
   */
  function doNotClose(event) {
    event.stopPropagation();
  }
  