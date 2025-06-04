const { ipcRenderer } = require('electron');
const { marked } = require('marked');
const { renderCalendar, refreshCalendar } = require('./calendar.js');
const { showTooltip, hideTooltip } = require('./tooltipUtils');

let allDreams = [];
let filteredDreams = [];
let dreamIndex = 0;
let pageIndex = 0;
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();
let currentFilter = null;
const PAGE_LIMIT = 1500; // approx characters per page
let fontSize = 1;

async function loadAllDreams() {
  allDreams = await ipcRenderer.invoke('load-dreams');
  allDreams.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function paginate(text, limit = PAGE_LIMIT) {
  const paragraphs = text.split(/\n{2,}/);
  const pages = [];
  let cur = '';
  for (let para of paragraphs) {
    if ((cur + (cur ? '\n\n' : '') + para).length > limit) {
      if (cur) pages.push(cur);
      while (para.length > limit) {
        pages.push(para.slice(0, limit));
        para = para.slice(limit);
      }
      cur = para;
    } else {
      cur += (cur ? '\n\n' : '') + para;
    }
  }
  if (cur) pages.push(cur);
  return pages;
}

function stripTitle(text) {
  return text.replace(/^#.*\n/, '');
}

function prepareDreams(list) {
  return list.map(d => {
    const combined = stripTitle(d.dream) + '\n\n### Interpretation\n\n' + stripTitle(d.interpretation);
    const pages = paginate(combined);
    return { ...d, pages, maxPages: pages.length };
  });
}

function renderPage() {
  const container = document.getElementById('reader');
  if (!filteredDreams.length) {
    container.innerHTML = '<p><em>No dreams.</em></p>';
    return;
  }
  const dream = filteredDreams[dreamIndex];
  const page = dream.pages[pageIndex] || '';
  container.innerHTML = `
    <h2>${dream.date}</h2>
    <div class="page-content">
      ${marked.parse(page)}
    </div>
    <div class="page-indicator">
      ${dreamIndex + 1}/${filteredDreams.length} - Page ${pageIndex + 1}/${dream.maxPages}
    </div>
  `;
}

function reload(filterDate) {
  currentFilter = filterDate;
  const list = filterDate ? allDreams.filter(d => d.date === filterDate) : allDreams;
  filteredDreams = prepareDreams(list);
  dreamIndex = 0;
  pageIndex = 0;
  renderPage();
  refreshCalendar(
    allDreams,
    currentYear,
    currentMonth,
    renderCalendar,
    day => {
      reload(day);
    },
    showTooltip,
    hideTooltip
  );
}

function changeMonth(delta) {
  currentMonth += delta;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  reload(currentFilter);
}

document.getElementById('prev-month').addEventListener('click', () => changeMonth(-1));
document.getElementById('next-month').addEventListener('click', () => changeMonth(1));

document.getElementById('toggle-calendar').addEventListener('click', () => {
  const cont = document.getElementById('calendar-container');
  cont.style.display = cont.style.display === 'none' ? 'block' : 'none';
});

function applyFontSize() {
  document.documentElement.style.setProperty('--reader-font-size', fontSize + 'rem');
}

document.getElementById('increase-font').addEventListener('click', () => {
  fontSize = Math.min(fontSize + 0.1, 2);
  applyFontSize();
});

document.getElementById('decrease-font').addEventListener('click', () => {
  fontSize = Math.max(fontSize - 0.1, 0.6);
  applyFontSize();
});

document.getElementById('back-editor').addEventListener('click', () => {
  window.location.href = 'index.html';
});

document.body.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    const dream = filteredDreams[dreamIndex];
    if (pageIndex < dream.maxPages - 1) {
      pageIndex++;
    } else if (dreamIndex < filteredDreams.length - 1) {
      dreamIndex++;
      pageIndex = 0;
    }
    renderPage();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    if (pageIndex > 0) {
      pageIndex--;
    } else if (dreamIndex > 0) {
      dreamIndex--;
      pageIndex = filteredDreams[dreamIndex].maxPages - 1;
    }
    renderPage();
  }
});

loadAllDreams().then(() => {
  applyFontSize();
  reload(null);
});
