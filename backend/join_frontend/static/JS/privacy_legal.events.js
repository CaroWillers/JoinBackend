import { summaryLoad } from './summary.js';

export function initPrivacyPolicyEvents() {
  document.getElementById('btnBackFromPrivacy')?.addEventListener('click', summaryLoad);
}
