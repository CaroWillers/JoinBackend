export function initBoardEventListeners() {
    document.getElementById('search')?.addEventListener('input', handleSearch);
    document.getElementById('searchBtn')?.addEventListener('click', handleSearch);
    document.getElementById('boardAddTaskBtn')?.addEventListener('click', boardPopupAddTask);
  
    // Kleine Add Task Buttons
    document.querySelectorAll('.add-btn-container').forEach(container => {
      const col = container.dataset.column;
      container.addEventListener('click', () => openAddTaskSmallBtnBoard(col));
    });
  
    // Drag & Drop Events
    document.querySelectorAll('.card-container').forEach(container => {
      const status = container.dataset.status;
      container.addEventListener('dragover', (e) => {
        e.preventDefault();
        highlight(status);
      });
      container.addEventListener('dragleave', () => removeHighlight(status));
      container.addEventListener('drop', (e) => {
        e.preventDefault();
        drop(e, status);
        removeHighlight(status);
      });
    });
  }
  