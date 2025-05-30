// dataUtils.js
const { ipcRenderer } = require('electron');
const { marked } = require('marked');

/**
 * Load all dreams via IPC, then:
 *  • call refreshCalendar(allDreams)
 *  • render the dreams list (filtered by optional date)
 *
 * @param {Function} refreshCalendarFn – (allDreams) ⇒ void
 * @param {string|null} filterDate     – 'YYYY-MM-DD' or null
 * @param {string} dreamsListSel       – CSS selector for your <div id="dreamsList">
 */

// 2) load dreams, render calendar & list (optionally filtered)
async function loadDreams(refreshCalendarFn, filterDate, dreamsListSelector) {
  // 1) IPC call to get the data
  const allDreams = await ipcRenderer.invoke('load-dreams');

  // 2) Update the calendar
  refreshCalendarFn(allDreams);

  // 3) Filter for the list view
  const dreamsToShow = filterDate
    ? allDreams.filter(d => d.date === filterDate)
    : allDreams;

  // 4) Render into your container
  const container = document.querySelector(dreamsListSelector);
  if (!dreamsToShow.length) {
    container.innerHTML = '<p><em>No dreams for this date.</em></p>';
    return;
  }

  container.innerHTML = dreamsToShow.map(d => `
    <div class="dream" data-id="${d.id}">
      <strong>${d.date}</strong>
      <div>${marked.parse(d.dream)}</div>
      <div class="interpretation">${marked.parse(d.interpretation)}</div>
      <button class="edit" data-id="${d.id}">Edit</button>
    </div>
  `).join('');
}
module.exports = { loadDreams }        