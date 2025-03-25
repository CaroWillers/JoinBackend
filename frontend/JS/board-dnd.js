// JS/board-dnd.js

function allowDrop(event) {
    event.preventDefault();
}

function drag(event, id) {
    event.dataTransfer.setData("text/plain", id);
}

function drop(targetColumnId) {
    const draggedCardId = event.dataTransfer.getData("text/plain");
    const card = cards.find(c => c.id == draggedCardId);
    if (card) {
        card.place = targetColumnId;
        updateCards(); // Board aktualisieren
        UpdateTaskInRemote(); // Optional: sync mit Backend
    }
}

function highlight(columnId) {
    document.getElementById(columnId).classList.add('drag-over');
}

function removeHighlight(columnId) {
    document.getElementById(columnId).classList.remove('drag-over');
}
