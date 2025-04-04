import { summaryLoad } from './summary.js';

export function initHelpEvents() {
    const backBtn = document.getElementById('goBackToSummaryBtn');
    backBtn?.addEventListener('click', summaryLoad);
}