
let tooltipEl = null;

function showTooltip(e, dreamsForDay) {
  hideTooltip();

  tooltipEl = document.createElement('div');
  tooltipEl.className = 'tooltip';

  // build content
  tooltipEl.innerHTML = dreamsForDay.map(d => {
    const match = d.dream.match(/^#\s*(.+)$/m);
    const title = match ? match[1] : d.dream.split('\n')[0].slice(0, 30) + '…';
    const snippet = d.dream.replace(/^#.*\n?/, '').slice(0, 60).replace(/\n/g, ' ') + '…';
    return `<strong>${title}</strong><br><em>${snippet}</em>`;
  }).join('<hr style="border-color:#444;margin:4px 0">');

  document.body.appendChild(tooltipEl);

  // initial position: to the right of the cell
  const rect = e.currentTarget.getBoundingClientRect();
  let top = rect.top + window.scrollY + 2;
  let left = rect.right + 8;

  tooltipEl.style.top = top + 'px';
  tooltipEl.style.left = left + 'px';

  // now clamp so it never overflows the viewport
  const tipRect = tooltipEl.getBoundingClientRect();
  const margin = 8;

  // if it goes off the right edge, flip to the left side
  if (tipRect.right > window.innerWidth - margin) {
    left = rect.left - tipRect.width - margin;
    tooltipEl.style.left = `${Math.max(margin, left)}px`;
  }

  // if it goes off the bottom edge, shift it up
  if (tipRect.bottom > window.innerHeight - margin) {
    top = window.innerHeight - tipRect.height - margin;
    tooltipEl.style.top = `${Math.max(margin, top)}px`;
  }
}

function hideTooltip() {
  if (tooltipEl) {
    tooltipEl.remove();
    tooltipEl = null;
  }
}

module.exports = { showTooltip, hideTooltip };