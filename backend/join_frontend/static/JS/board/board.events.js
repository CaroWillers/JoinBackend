import { openBigCard, closeBigCard, boardPopupAddTask } from './board-popup.js';
import { drop, highlight, removeHighlight, startDragging } from './board-dnd.js';
import { updateCards, handleSearch  } from './board-tasks.js';

export function initBoardEventListeners() {
  // 🔍 Suche
  document.getElementById('search')?.addEventListener('input', handleSearch);
  document.getElementById('searchBtn')?.addEventListener('click', handleSearch);

  // ➕ Großer Add Task Button
  document.getElementById('boardAddTaskBtn')?.addEventListener('click', boardPopupAddTask);

  // ➕ Kleine Add Task Buttons in Spalten
  document.querySelectorAll('.add-btn-container').forEach(container => {
    const col = container.dataset.column;
    container.addEventListener('click', () => openAddTaskSmallBtnBoard(col));
  });

  // 🧲 Drag & Drop
  document.querySelectorAll('.card-container').forEach(container => {
    const status = container.dataset.status;

    container.addEventListener('dragover', (e) => {
      e.preventDefault();
      highlight(status);
    });

    container.addEventListener('dragleave', () => removeHighlight(status));

    container.addEventListener('drop', (e) => {
      e.preventDefault();
      drop(e, status, cards, updateCards, UpdateTaskInRemote);
      removeHighlight(status);
    });
  });

  // 📌 Karten-Klick & Dragstart
  document.querySelectorAll('.card-container').forEach(container => {
    container.addEventListener('click', (e) => {
      const cardEl = e.target.closest('.board-card-small');
      if (cardEl) {
        const id = parseInt(cardEl.dataset.id);
        if (!isNaN(id)) {
          openBigCard(id);
        }
      }
    });

    container.addEventListener('dragstart', (e) => {
      const cardEl = e.target.closest('.board-card-small');
      if (cardEl) {
        const id = parseInt(cardEl.dataset.id);
        if (!isNaN(id)) {
          startDragging(e, id); // Achtung: Übergib `event`!
        }
      }
    });
  });

  // 📦 Overlay schließen
  document.getElementById('boardOverlay')?.addEventListener('click', closeBigCard);
}
