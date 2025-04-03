/**
 * Sendet ein neues Task-Objekt an das Backend.
 * Holt die Daten aus dem Formular und macht einen POST-Request an /tasks/.
 */
async function createTask() {
    const taskData = getTaskData();
    if (!validateTaskData(taskData)) return;

    try {
        const token = localStorage.getItem('access_token'); // JWT Auth
        const response = await fetch(`${API_URL}/tasks/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                title: taskData.title,
                description: taskData.description,
                due_date: taskData.dueDate,
                priority: taskData.priority,
                category: taskData.category.id,
                assigned: taskData.assigned,
                subtasks: taskData.subtasks,
                completed: false   
            })
        });

        if (!response.ok) throw new Error("Task konnte nicht erstellt werden");

        // Zeige Erfolgsmeldung & bereinige Form
        showTaskCreatedPopUp();
        resetCreateTaskFormInputs();
    } catch (error) {
        console.error("Fehler beim Erstellen des Tasks:", error.message);
        alert("Fehler beim Erstellen des Tasks");
    }
}


 