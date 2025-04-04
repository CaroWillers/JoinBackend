/**
 * Gibt das heutige Datum im Format YYYY-MM-DD zurück.
 * @returns {string} - z.B. "2025-03-25"
 */
function getCurrentDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

/**
 * Hebt eine Fehlernachricht kurz hervor (Blink-Effekt).
 * @param {HTMLElement} element - z. B. ein <p> mit der Fehlermeldung
 */
function highlightErrorMessage(element) {
    element.classList.add('highlightError');
    setTimeout(() => {
        element.classList.remove('highlightError');
    }, 800);
}

/**
 * Gibt eine neue eindeutige ID zurück (z. B. für neue Tasks lokal).
 * Durchsucht bestehende `cards` nach der höchsten ID.
 */
function generateUniqueTaskId(cards) {
    if (!cards || cards.length === 0) return 0;

    const usedIds = cards.map(c => c.id);
    for (let i = 0; i <= usedIds.length; i++) {
        if (!usedIds.includes(i)) {
            return i;
        }
    }
    return Math.max(...usedIds) + 1;
}
