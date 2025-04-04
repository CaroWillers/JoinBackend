import { summaryLoad } from './summary.js';

export function initLegalNoticeEvents() {
  document.getElementById('btnBackFromLegal')?.addEventListener('click', summaryLoad);
}