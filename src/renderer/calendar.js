// calendarUtils.js
// Move the refreshCalendar logic here
const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

/**
 * Renders the grid of days for a given month/year,
 * wires up hover‐tooltips and click‐to‐filter.
 */
function renderCalendar(allDreams, year, month, onDayClick, showTooltip, hideTooltip) {
  const cal = document.getElementById('calendar');
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let html = `<table class="calendar-table">
    <caption>${monthNames[month]} ${year}</caption>
    <thead><tr>
      <th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th>
      <th>Thu</th><th>Fri</th><th>Sat</th>
    </tr></thead><tbody><tr>`;

  let day = 1;
  for (let week = 0; week < 6; week++) {
    for (let wd = 0; wd < 7; wd++) {
      if ((week === 0 && wd < firstDay) || day > daysInMonth) {
        html += '<td></td>';
      } else {
        const dd = String(day).padStart(2,'0');
        const mm = String(month+1).padStart(2,'0');
        const ds = `${year}-${mm}-${dd}`;
        const has = allDreams.some(d => d.date === ds);
        html += `
          <td class="calendar-day ${has?'has-dream':''}" data-date="${ds}">
            ${day}
          </td>`;
        day++;
      }
    }
    html += '</tr>';
    if (day>daysInMonth) break;
    html += '<tr>';
  }
  html += '</tbody></table>';
  cal.innerHTML = html;

  // group dreams by date
  const dreamsByDate = allDreams.reduce((acc,d)=>{
    (acc[d.date] = acc[d.date]||[]).push(d);
    return acc;
  },{});

  // hover‐tooltips
  cal.querySelectorAll('.calendar-day.has-dream').forEach(cell => {
    const ds     = cell.dataset.date;
    const dreams = dreamsByDate[ds];
    cell.addEventListener('mouseenter', e => showTooltip(e, dreams));
    cell.addEventListener('mouseleave', hideTooltip);
  });

  // click → fill & filter
  cal.querySelectorAll('.calendar-day').forEach(cell => {
    const ds = cell.dataset.date;
    cell.addEventListener('click', () => onDayClick(ds));
  });
}



/**
 * Update the month/year label and re-render the calendar
 * @param {Array} allDreams - Array of dream objects with { date, dream, interpretation, id }
 * @param {number} currentYear - The year to render
 * @param {number} currentMonth - Zero-based month index (0 = Jan)
 * @param {function} renderCalendarFn - The function that actually draws the calendar
 */
function refreshCalendar(allDreams, year, month, renderFn, onDayClick, showTooltip, hideTooltip) {
  document.getElementById('month-year-label').textContent =
    `${monthNames[month]} ${year}`;
  renderFn(allDreams, year, month, onDayClick, showTooltip, hideTooltip);
}

module.exports = { renderCalendar,refreshCalendar };