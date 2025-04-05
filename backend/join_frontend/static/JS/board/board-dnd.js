export { startDragging, drop, highlight, removeHighlight };

/**
 * Wird beim Dragging einer Karte ausgelöst.
 */
function startDragging(event, id) {
    event.dataTransfer.setData("text/plain", id);
}

/**
 * Wird beim Drop einer Karte aufgerufen.
 * @param {Event} event - Das Drop-Event
 * @param {string} targetColumnId - Die Zielspalte (todo, progress etc.)
 * @param {Array} cards - Das globale Card-Array (Tasks)
 * @param {Function} updateCards - Funktion zum Re-Rendern der Cards
 * @param {Function} updateRemote - Funktion zum Aktualisieren im Backend
 */
function drop(event, targetColumnId, cards, updateCards, updateRemote) {
    event.preventDefault();
    const draggedCardId = event.dataTransfer.getData("text/plain");

    const card = cards.find(c => c.id == draggedCardId);
    if (card) {
        card.place = targetColumnId;
        updateCards();
        updateRemote(card);
    }
}

/**
 * Fügt eine visuelle Hervorhebung hinzu (Drag over)
 */
function highlight(columnId) {
    const column = document.getElementById(columnId);
    if (column) column.classList.add('drag-over');
}

/**
 * Entfernt visuelle Hervorhebung beim Verlassen
 */
function removeHighlight(columnId) {
    const column = document.getElementById(columnId);
    if (column) column.classList.remove('drag-over');
}
