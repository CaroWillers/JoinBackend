import { getTaskData, validateTaskData, resetCreateTaskFormInputs } from './task-form.js';
import { showTaskCreatedPopUp } from './task-popup.js';
import { renderCategoryOptions } from './task-form.js';
import { API_URL } from './config.js'; 

export let taskCategories = [];

/**
 * Erstellt einen neuen Task und sendet ihn ans Backend.
 */
export async function createTask() {
    const taskData = getTaskData();
    if (!validateTaskData(taskData)) return;

    try {
        const token = localStorage.getItem('access_token');
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

        showTaskCreatedPopUp();
        resetCreateTaskFormInputs();
    } catch (error) {
        console.error("Fehler beim Erstellen des Tasks:", error.message);
        alert("Fehler beim Erstellen des Tasks");
    }
}

/**
 * Lädt die verfügbaren Kategorien vom Backend.
 */
export async function loadTaskCategories() {
    try {
        const res = await fetch(`${API_URL}/tasks/categories/`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access_token")}`
            }
        });

        if (!res.ok) throw new Error("Kategorien konnten nicht geladen werden");
        taskCategories = await res.json();
    } catch (err) {
        console.error("❌ Fehler beim Laden der Kategorien:", err.message);
    }
}

/**
 * Initialisiert das Taskformular.
 */
export async function loadTasks() {
    try {
        await Templates("addTask");
        await includeHTML();
        await delay(20);

        resetCreateTaskFormInputs();
        setMinDueDate();
        await loadTaskCategories();
        renderCategoryOptions();
    } catch (err) {
        console.error("❌ Fehler beim Laden des Add Task-Formulars:", err);
    }
}
