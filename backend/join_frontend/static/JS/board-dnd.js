let currentDraggedElement = null;

function startDragging(event, id) {
    currentDraggedElement = id;
    event.dataTransfer.setData("text/plain", id); 
}


function allowDrop(event) {
    event.preventDefault();
}

function drop(event, targetColumnId) {
    event.preventDefault();

    const draggedCardId = event.dataTransfer.getData("text/plain");
    const card = card.find(c => c.id == draggedCardId);

    if (card) {
        card.place = targetColumnId;
        updateCards();  
        UpdateTaskInRemote(card);  
    }
}



function highlight(columnId) {
    document.getElementById(columnId).classList.add('drag-over');
}

function removeHighlight(columnId) {
    document.getElementById(columnId).classList.remove('drag-over');
}
