/**
 * Loads summary template, updates summary numbers, and highlights summary navigation.
 * Loads and displays the summary template and then retrieves task counts for each list.
 *
 * This function uses `async` to load the summary template via `Templates` (not provided).
 * After successful loading (assumed), it:
 *  - Updates summary numbers with `summaryLoadNumbers` (implementation not provided).
 *  - Highlights the summary navigation section with `changeNavigationHighlightSummary`.
 * @async
 */
async function summaryLoad() {
    await Templates('summary');
    summaryLoadNumbers();
    changeNavigationHighlightSummary();
    greetUser()
}

/**
 * Highlights the summary navigation element and removes highlights from legal sections.
 *
 * This function adds the "navigation-item-clicked" class to the element with ID "navSummary", visually marking it as selected.
 * It also removes the "navigation-legal-clicked" class from both legal notice and privacy policy elements.
 * Additionally, it adjusts element visibility based on screen size (potentially for mobile).
 */
function changeNavigationHighlightSummary() {
    let summary = document.getElementById('navSummary');
    let privacyPolicy = document.getElementById('navPrivacyPolicy');
    let legalNotice = document.getElementById('navLegalNotice');
    summary.classList.add('navigation-item-clicked');
    legalNotice.classList.remove('navigation-legal-clicked');
    privacyPolicy.classList.remove('navigation-legal-clicked');

    if (window.innerWidth < 800) {
        summary.children[0].classList.add('d-none');
        summary.children[1].classList.remove('d-none');
    }

}

/**
 * Calls functions to retrieve and display the number of tasks in each list ("todo", "progress", "feedback", "done").
 */
function summaryLoadNumbers() {
    todoNumber();
    progressNumber();
    feedbackNumber();
    doneNumber();
    boardTaskNumber();
    urgentNumber();
    displayClosestDueDate();
}

/**
 * Calculates and displays the number of tasks in the "todo" list.
 * Performs error handling if the container element with ID 'to-do-number' is not found.
 */
function todoNumber() {
    let todoCount = 0;
    const container = document.getElementById('to-do-number');
    if (!container) {
        console.error("Element with ID 'to-do-number' not found!");
        return;
    }

    for (const card of cards) {
        if (card.place === 'todo') {
            todoCount++;
        }
    }
    container.textContent = todoCount;
}

/**
* Calculates and displays the number of tasks in the "progress" list.
* Performs error handling if the container element with ID 'progress-task-number' is not found.
*/
function progressNumber() {
    let progressCount = 0;
    const container = document.getElementById('progess-task-number');
    if (!container) {
        console.error("Element with ID 'progress-task-number' not found!");
        return;
    }

    for (const card of cards) {
        if (card.place === 'progress') {
            progressCount++;
        }
    }
    container.textContent = progressCount;
}

/**
* Calculates and displays the number of tasks in the "feedback" list.
* Performs error handling if the container element with ID 'feedback-number' is not found.
*/
function feedbackNumber() {
    let feedbackCount = 0;
    const container = document.getElementById('feedback-number');
    if (!container) {
        console.error("Element with ID 'feedback-number' not found!");
        return;
    }

    for (const card of cards) {
        if (card.place === 'feedback') {
            feedbackCount++;
        }
    }
    container.textContent = feedbackCount;
}

/**
 * Calculates and displays the number of tasks in the "done" list.
 * Performs error handling if the container element with ID 'done-number' is not found.
 */
function doneNumber() {
    let doneCount = 0;
    const container = document.getElementById('done-number');
    if (!container) {
        console.error("Element with ID 'done-number' not found!");
        return;
    }

    for (const card of cards) {
        if (card.place === 'done') {
            doneCount++;
        }
    }
    container.textContent = doneCount;
}

/**
 * Calculates and displays the total number of tasks in the board using the 'cards' array length.
 * Performs error handling if the container element with ID 'bord-tasks-number' is not found.
 */
function boardTaskNumber() {
    const container = document.getElementById('bord-tasks-number');

    if (!container) {
        console.error("Element with ID 'bord-tasks-number' not found!");
        return;
    }
    container.textContent = cards.length;
}

/**
 * Calculates and displays the number of tasks marked as "Urgent" based on the 'priority.urgency' property within each card object.
 * Performs error handling if the container element with ID 'urgent-number' is not found.
 */
function urgentNumber() {
    let urgentCount = 0;
    const container = document.getElementById('urgent-number');
    if (!container) {
        console.error("Element with ID 'urgent-number' not found!");
        return;
    }

    for (const card of cards) {
        if (card.priority && card.priority.urgency === 'Urgent') {
            if (card.place != 'done') {
                urgentCount++;
            }
        }
    }
    container.textContent = urgentCount;
}

/**
 * Finds and displays the closest upcoming due date or overdue cards.
 *
 * This function:
 *  - Creates arrays for overdue and upcoming cards.
 *  - Calls `separateCards` to separate cards based on due dates and current date.
 *  - Calls `sortUpcomingCards` to sort upcoming cards by due date (if any).
 *  - Calls `updateDueDateContainers` to update the UI with the closest upcoming due date or overdue cards information.
 */
function displayClosestDueDate() {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set time to 00:00:00 to compare only dates
    let overdueCards = [];
    let upcomingCards = [];

    separateCards(overdueCards, upcomingCards, currentDate);
    sortUpcomingCards(upcomingCards);
    updateDueDateContainers(overdueCards, upcomingCards, currentDate);
}

/**
 * Separates cards into overdue and upcoming categories based on due dates.
 *
 * This function iterates through the `cards` array (assumed to be an array of card objects).
 * For each card with a place other than "done":
 *  - It parses the `dueDate` string into a Date object (if it exists).
 *  - If the due date exists and is earlier than `currentDate`, it adds the card to `overdueCards`.
 *  - If the due date exists and is later than or equal to `currentDate`, it adds the card to `upcomingCards`.
 *
 * @param {array} overdueCards - An array to store overdue cards.
 * @param {array} upcomingCards - An array to store upcoming cards.
 * @param {Date} currentDate - The current date object.
 */
function separateCards(overdueCards, upcomingCards, currentDate) {
    for (let i = 0; i < cards.length; i++) {// Loop through cards and separate overdue and upcoming cards
        const card = cards[i];
        if (card.place !== 'done') {
            const dueDate = card.dueDate ? new Date(card.dueDate) : null;
            if (dueDate) {
                if (dueDate < currentDate) {
                    overdueCards.push(card);
                } if (dueDate > currentDate) {
                    upcomingCards.push(card);
                } if (dueDate === currentDate) { // Due date matches current date
                    upcomingCards.push(card); // Add to upcoming for display
                }
            }
        }
    }
}

/**
 * Sorts the upcoming cards array by due date in ascending order.
 * @param {Array} upcomingCards - An array of upcoming card objects.
 * @returns {Array} - The sorted array of upcoming cards.
 */
function sortUpcomingCards(upcomingCards) {
    return upcomingCards.sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate) : new Date(8640000000000000);
        const dateB = b.dueDate ? new Date(b.dueDate) : new Date(8640000000000000);
        return dateA - dateB;
    });
}

/**
 * Formats the due date as a localized string.
 * @param {string} dueDate - The due date string in the format "YYYY-MM-DD".
 * @returns {string} - The formatted due date as a localized string.
 */
function formatDueDate(dueDate) {
    const formattedDate = new Date(dueDate);
    const options = ('default', { month: 'long', day: 'numeric', year: 'numeric' });
    return formattedDate.toLocaleDateString('en-US', options);
}

/**
 * Finds the oldest overdue date from the provided array of overdue cards.
 * @param {Array} overdueCards - An array of overdue card objects.
 * @returns {string} - The oldest overdue date formatted as a localized string, or an empty string if no overdue cards exist.
 */
function getOldestOverdueDate(overdueCards) {
    if (overdueCards.length === 0) {
        return '';
    }

    let oldestOverdueDate = overdueCards[0].dueDate;
    for (let i = 1; i < overdueCards.length; i++) {
        const currentDueDate = overdueCards[i].dueDate;
        if (new Date(currentDueDate) < new Date(oldestOverdueDate)) {
            oldestOverdueDate = currentDueDate;
        }
    }
    return formatDueDate(oldestOverdueDate);
}

/**
 * Updates UI with overdue/upcoming due date or "No upcoming due dates found" message.
 *
 * This function checks for overdue cards:
 *  - If overdue cards exist, it sets "Missed Deadline" text and gets the oldest overdue date.
 *  - If no overdue cards exist, it checks for upcoming cards:
 *      - If upcoming cards exist, it formats the closest upcoming due date.
 *      - Otherwise, it sets the message to "No upcoming due dates found".
 * Finally, it calls functions to update the UI elements with the formatted output and deadline text/button styling.
 *
 * @param {array} overdueCards - Array of overdue card objects.
 * @param {array} upcomingCards - Array of upcoming card objects.
 */
function updateDueDateContainers(overdueCards, upcomingCards, currentDate) {
    let output = '';
    let deadlineText = 'Upcoming Deadline';
    let urgentButtonClass = '';
    if (overdueCards.length > 0) {
        deadlineText = 'Missed Deadline';
        urgentButtonClass = 'missed-deadline';
        output = getOldestOverdueDate(overdueCards);
    } else if (upcomingCards.length > 0) {
        const closestUpcomingCard = upcomingCards[0];
        const { deadlineText: updatedDeadlineText, output: updatedOutput, urgentButtonClass: updatedUrgentButtonClass } = closestDueDate(closestUpcomingCard, currentDate, urgentButtonClass, output, deadlineText);
        deadlineText = updatedDeadlineText;
        output = updatedOutput;
        urgentButtonClass = updatedUrgentButtonClass;
    } else { output = "No upcoming due dates found."; }
    outputsDueDateContainers(output, deadlineText, urgentButtonClass);
}

/**
 * Updates information about the closest upcoming due date based on the provided card and current date.
 *
 * - Sets deadline text and output based on whether the due date falls on the current date (ignoring time).
 * - Updates urgent button class (for styling) if the due date is today.
 *
 * @param {Object} closestUpcomingCard An object representing the closest upcoming card with a due date property.
 * @param {string} currentDate A string representation of the current date.
 * @param {string} urgentButtonClass (Optional) The current urgent button class (styling).
 * @param {string} output (Optional) The current output string (displaying the due date).
 * @param {string} deadlineText (Optional) The current deadline text.
 * @returns {void} (nothing returned, modifies provided variables)
 */
function closestDueDate(closestUpcomingCard, currentDate, urgentButtonClass, output, deadlineText) {
    if (closestUpcomingCard.dueDate) {
        const dueDateAsDate = new Date(closestUpcomingCard.dueDate);
        dueDateAsDate.setHours(0, 0, 0, 0); // Set time to 00:00:00
        const currentDateWithoutTime = new Date(currentDate);
        currentDateWithoutTime.setHours(0, 0, 0, 0); // Set time to 00:00:00
        if (dueDateAsDate.getTime() === currentDateWithoutTime.getTime()) {
            deadlineText = 'Deadline is today';
            output = formatDueDate(dueDateAsDate);
            urgentButtonClass = 'missed-deadline';
        } else {
            output = formatDueDate(dueDateAsDate);
        }
    }
    return { deadlineText, output, urgentButtonClass };
}

/**
 * Updates the UI elements representing the due date container.
 * 
 * @param {string} output The content to be displayed for the due date (likely formatted).
 * @param {string} deadlineText The text indicating the deadline status (e.g., "Upcoming Deadline", "Missed Deadline").
 * @param {string} urgentButtonClass The CSS class to be applied for styling the urgency button (optional).
 * @returns {void} (nothing returned)
 */
function outputsDueDateContainers(output, deadlineText, urgentButtonClass) {
    outputDueDate(output);
    outputDeadlineText(deadlineText);
    urgentButtonColor(urgentButtonClass);
}

/**
 * Updates the "due-date" element text content (if it exists).
 *
 * This function retrieves the DOM element with ID "due-date" and updates its text content with the provided `output` string.
 * 
 * @param {string} output - The text to display in the "due-date" element.
 */
function outputDueDate(output) {
    const dueDateContainer = document.getElementById('due-date');
    if (dueDateContainer) {
        dueDateContainer.textContent = output;
    }
}

/**
 * Updates the "deadline" element text content (if it exists).
 *
 * This function retrieves the DOM element with ID "deadline" and updates its text content with the provided `deadlineText` string.
 * 
 * @param {string} deadlineText - The text to display in the "deadline" element.
 */
function outputDeadlineText(deadlineText) {
    const deadlineContainer = document.getElementById('deadline');
    if (deadlineContainer) {
        deadlineContainer.textContent = deadlineText;
    }
}

/**
 * Updates the ".urgent-button" element class list for urgency (if it exists).
 *
 * This function retrieves the element with class ".urgent-button".
 * - It removes the "missed-deadline" class (if present).
 * - If `urgentButtonClass` is provided, it adds that class to the element.
 * 
 * @param {string} urgentButtonClass - Class name to add for urgency indication.
 */
function urgentButtonColor(urgentButtonClass) {
    const urgentButton = document.querySelector('.btn-urgent-back');
    if (urgentButton) {
        urgentButton.classList.remove('missed-deadline');
        if (urgentButtonClass) {
            urgentButton.classList.add(urgentButtonClass);
        }
    }
}