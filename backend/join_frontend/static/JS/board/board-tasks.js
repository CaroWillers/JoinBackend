export { 
    cards,  
    updateCards, 
    deleteTask,
    editTaskDone,
    loadBoard,
    handleSearch,
    loadTasks,
    editTask, 
  };
  
  import {
    EditTemplate,
    templateOkBtn
  } from './board-templates.js';

  let cards = [];
  
  // =====================
  // 1. LÄDT DIE AUFGABEN
  // =====================
 async function loadBoard() {
    try {
      await Templates("board");
      await loadTasks();
      updateCards();
    } catch (error) {
      console.error("❌ Fehler beim Laden des Boards:", error);
    }
  }
  
async function loadTasks() {
    try {
      const response = await fetch(`${API_URL}/tasks/`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      const data = await response.json();
      cards = data;
      updateCards();
    } catch (error) {
      console.error("Fehler beim Laden der Aufgaben:", error);
    }
  }
  
  // =====================
  // 2. BEARBEITEN
  // =====================
  async function editTask(id) {
    const container = document.getElementById('board-card-popup');
    container.innerHTML = EditTemplate();
  
    await includeAddTask();
    templateOkBtn(id);
  
    const editBtn = document.getElementById('finish-btn');
    editBtn.classList.add('editTaskButton');
  
    fillEditForm(id);
    document.getElementById('taskCategoryBoxPopup').style.display = 'none';
    document.getElementById('subtasksBox').style.paddingTop = '16px';
  }
  
  function fillEditForm(id) {
    const card = cards.find(card => card.id === id);
    document.getElementById('addTaskInputTitle').value = card.title;
    document.getElementById('addTaskDescriptionInput').value = card.description;
    document.getElementById('addTaskDueDateInput').value = card.dueDate;
  
    setPriorityForEdit(card);
    setAssignedContactsForEdit(card);
    setCategoryForEdit(card);
    setSubtasksForEdit(card);
  }
  
  function setPriorityForEdit(card) {
    const urgency = card.priority.urgency.toLowerCase();
    changePriorityColor(`${urgency}PriorityButton`);
  }
  
  function setAssignedContactsForEdit(card) {
    selectedAssignedContacts = card.assigned.map(c => ({
      name: c.name,
      initials: c.initials,
      avatarColor: c.avatarColor
    }));
    showAvatarsOfSelectedContacts();
  }
  
  function setCategoryForEdit(card) {
    document.getElementById('selectTaskCategoryTextField').innerText = card.category.name;
  }
  
  function setSubtasksForEdit(card) {
    createdSubtasks = card.subtasks.map(subtask => ({
      text: subtask.text,
      done: subtask.done
    }));
    openCreatedSubtaskBox();
  }
  
  async function editTaskDone(id) {
    const card = cards.find(c => c.id === id);
    const updatedCard = { ...card, ...collectEditedCardData(id) };
  
    if (!validateEditedTask(updatedCard)) return;
  
    finishEdit(updatedCard, id);
  }
  
  // =====================
  // 3. VALIDIERUNG
  // =====================
  function collectEditedCardData(id) {
    return {
      title: document.getElementById('addTaskInputTitle').value.trim(),
      description: document.getElementById('addTaskDescriptionInput').value.trim(),
      dueDate: document.getElementById('addTaskDueDateInput').value,
      priority: priorities[0],
      assigned: selectedAssignedContacts,
      subtasks: createdSubtasks,
      category: document.getElementById('selectTaskCategoryTextField').innerText
    };
  }
  
  function validateEditedTask(card) {
    const isValid = card.title && card.dueDate && taskCategories.some(c => c.name === card.category);
    if (!isValid) {
      showValidationErrors();
      return false;
    }
    return true;
  }
  
  function showValidationErrors() {
    errorMessageIfEmptyTitle();
    errorMessageIfEmptyDueDate();
    errorMessageIfEmptyCategory();
  }
  
  function finishEdit(newCard, id) {
    const index = cards.findIndex(c => c.id === id);
    cards.splice(index, 1, newCard);
    UpdateTaskInRemote(newCard);
    emptyArrays();
    bigCard(id);
    updateCards();
  }
  
  // =====================
  // 4. LÖSCHEN
  // =====================
  function deleteTask(cardId) {
    const index = cards.findIndex(card => card.id === cardId);
    if (index !== -1) {
      const deletedCard = cards.splice(index, 1)[0];
      updateCards();
      closeCard();
      UpdateTaskInRemote(deletedCard);
    } else {
      console.error("Task nicht gefunden:", cardId);
    }
  }
  
  // =====================
  // 5. KARTENANZEIGE
  // =====================
function updateCards() {
    const columns = ['todo', 'progress', 'feedback', 'done'];
    columns.forEach(column => {
      const container = document.getElementById(column);
      container.innerHTML = '';
      const filtered = cards.filter(c => c.place === column);
  
      if (filtered.length === 0) {
        container.innerHTML = `<div class="no-task-div">No tasks in ${column}</div>`;
      } else {
        filtered.forEach(card => {
          container.innerHTML += boardCardTemplate(card);
        });
      }
    });
  }
  
  function emptyArrays() {
    priorities = [];
    selectedAssignedContacts = [];
    createdSubtasks = [];
  }
  
  // =====================
  // 6. BACKEND-UPDATE
  // =====================
  async function UpdateTaskInRemote(card) {
    if (!card || !card.id) {
      console.error("❌ Kein gültiges Card-Objekt übergeben");
      return;
    }
  
    try {
      const response = await fetch(`${API_URL}/tasks/${card.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify(card)
      });
  
      if (!response.ok) throw new Error("Fehler beim Backend-Update");
      console.log(`✅ Task ${card.id} erfolgreich aktualisiert`);
    } catch (err) {
      console.error("❌ Fehler beim Speichern des Tasks:", err);
    }
  }
  
  // =====================
  // 7. SEARCH FUNKTIONALITÄT
  // =====================
  /**
   * Holt die Suchanfrage.
   */
  function getSearchQuery() {
    return document.getElementById('search').value.toLowerCase();
  }
  
  /**
   * Holt die Card-Container (ToDo, Progress etc.)
   */
  function getCardContainers() {
    return [
      document.getElementById('todo'),
      document.getElementById('progress'),
      document.getElementById('feedback'),
      document.getElementById('done')
    ];
  }
  
  /**
   * Führt die Suche in allen Karten durch.
   */
  function handleSearch() {
    const query = getSearchQuery();
    const containers = getCardContainers();
    const hasMatch = searchCards(query, containers);
    NoMatchFound(hasMatch, query);
  }
  
  /**
   * Sucht nach Cards anhand von Query-String.
   */
  function searchCards(query, containers) {
    let hasMatch = false;
    for (const container of containers) {
      for (const card of container.querySelectorAll('.board-card-small')) {
        const title = card.querySelector('.card-title')?.textContent.toLowerCase() || "";
        const desc = card.querySelector('.card-description')?.textContent.toLowerCase() || "";
        const combined = `${title} ${desc}`;
        if (combined.includes(query)) {
          card.classList.remove('d-none');
          hasMatch = true;
        } else {
          card.classList.add('d-none');
        }
      }
    }
    return hasMatch;
  }
  
  /**
   * Zeigt "Keine Ergebnisse" an, wenn keine Cards gefunden wurden.
   */
  function NoMatchFound(hasMatch, query) {
    const container = document.getElementById('no-search-results');
    container.innerText = (!hasMatch && query !== '') ? 'No matching task found.' : '';
  }
  

  
 