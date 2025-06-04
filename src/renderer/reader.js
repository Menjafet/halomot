const { ipcRenderer } = require('electron');
const { marked } = require('marked');
const { renderCalendar, refreshCalendar } = require('./calendar.js');
const { showTooltip, hideTooltip } = require('./tooltipUtils');

let allDreams = [];
let filteredDreams = [];
let currentIndex = 0;
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();
let currentFilter = null;

async function loadAllDreams() {
    allDreams = await ipcRenderer.invoke('load-dreams');
    allDreams.sort((a,b)=> new Date(a.date) - new Date(b.date));
}

function renderDream() {
    const container = document.getElementById('reader');
    if (!filteredDreams.length) {
        container.innerHTML = '<p><em>No dreams.</em></p>';
        return;
    }
    const d = filteredDreams[currentIndex];
    container.innerHTML = `
        <h2>${d.date}</h2>
        <div class="reader-container">
            <div class="dream-column">${marked.parse(d.dream)}</div>
            <div class="interpretation-column">${marked.parse(d.interpretation)}</div>
        </div>
        <div class="page-indicator">${currentIndex+1} / ${filteredDreams.length}</div>
    `;
}

function reload(filterDate) {
    currentFilter = filterDate;
    filteredDreams = filterDate
        ? allDreams.filter(d => d.date === filterDate)
        : allDreams;
    currentIndex = 0;
    renderDream();
    refreshCalendar(allDreams, currentYear, currentMonth, renderCalendar, day => {
        reload(day);
    }, showTooltip, hideTooltip);
}

function changeMonth(delta){
    currentMonth += delta;
    if(currentMonth<0){ currentMonth=11; currentYear--; }
    if(currentMonth>11){ currentMonth=0; currentYear++; }
    reload(currentFilter);
}

document.getElementById('prev-month').addEventListener('click', () => changeMonth(-1));
document.getElementById('next-month').addEventListener('click', () => changeMonth(1));

document.getElementById('toggle-calendar').addEventListener('click', () => {
    const cont = document.getElementById('calendar-container');
    cont.style.display = cont.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('back-editor').addEventListener('click', () => {
    window.location.href = 'index.html';
});

document.body.addEventListener('keydown', e => {
    if(e.key === 'ArrowRight' && currentIndex < filteredDreams.length-1){
        currentIndex++;
        renderDream();
    } else if(e.key === 'ArrowLeft' && currentIndex > 0){
        currentIndex--;
        renderDream();
    }
});

loadAllDreams().then(() => reload(null));

