import { loadBoard } from './board-tasks.js';

export function initSummaryEvents() {
  document.getElementById('btnUrgent')?.addEventListener('click', loadBoard);
  document.getElementById('btnTodo')?.addEventListener('click', loadBoard);
  document.getElementById('btnBoardTasks')?.addEventListener('click', loadBoard);
  document.getElementById('btnProgress')?.addEventListener('click', loadBoard);
  document.getElementById('btnFeedback')?.addEventListener('click', loadBoard);
  document.getElementById('btnDone')?.addEventListener('click', loadBoard);
}
