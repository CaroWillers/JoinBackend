/**
 * Zeigt das Popup nach erfolgreichem Task-Erstellen im normalen Modus (nicht Popup-Fenster).
 */
export function showTaskCreatedPopUp() {
    const container = document.getElementById('taskCreatedButtonContainer');
    const popup = document.getElementById('taskCreatedButton');

    container.style.display = "flex";

    setTimeout(() => {
        popup.classList.add('showTaskCreatedButtonContainer');
    }, 20);

    setTimeout(() => {
        popup.classList.remove('showTaskCreatedButtonContainer');
        container.style.display = "none";
    }, 800);

    setTimeout(() => {
        loadBoard();
    }, 820);
}

/**
 * Zeigt das Erfolgspopup im Popup-Modus (kleine Ansicht).
 * Danach wird das Popup geschlossen und das Board neu geladen.
 */
export function showTaskCreatedPopUpBoard() {
    const container = document.getElementById('taskCreatedButtonContainerBoard');
    container.style.display = "flex";

    setTimeout(() => {
        container.style.display = "none";
    }, 800);

    setTimeout(() => {
        loadBoard();
        closeCardAddTaskPopup();
    }, 820);
}

/**
 * Schließt das Add-Task-Popup-Fenster.
 * Kann bei mobile oder Desktop genutzt werden.
 */
function closeCardAddTaskPopup() {
    const popup = document.querySelector('.addTaskWrapperPopup');
    if (popup) {
        popup.remove();
    }
}
