// editorUtils.js
const { ipcRenderer } = require('electron');
//const { marked } = require('marked');
const EasyMDE = window.EasyMDE;

/**
 * Initialize both EasyMDE instances and wire up the form.
 * @param {string} dreamSel   – selector for the dream textarea
 * @param {string} interpSel  – selector for the interpretation textarea
 * @param {string} formSel    – selector for the form element
 * @param {Function} reloadFn – function to call after save to reload UI
 * @returns {Object}          – { dreamEditor, interpEditor, editDream }
 */
function initEditors(dreamSel, interpSel, formSel, reloadFn) {
  const dreamEditor = new EasyMDE({
    element: document.querySelector(dreamSel),
    placeholder: "Your dream…"
  });
  const interpEditor = new EasyMDE({
    element: document.querySelector(interpSel),
    placeholder: "Your interpretation…"
  });

  let editingId = null;

  // expose editDream so calendar clicks can call it
  function editDream(id, allDreams) {
    const d = allDreams.find(x => x.id === id);
    if (!d) return;
    document.querySelector(formSel).date.value = d.date;
    dreamEditor.value(d.dream);
    interpEditor.value(d.interpretation);
    editingId = id;
  }

  // form submit
  document.querySelector(formSel).addEventListener('submit', async e => {
    e.preventDefault();
    if (!dreamEditor.value().trim()) {
      return alert("Please write your dream before saving.");
    }
    const form = document.querySelector(formSel);
    const data = {
      id: editingId,
      date: form.date.value,
      dream: dreamEditor.value(),
      interpretation: interpEditor.value()
    };
    await ipcRenderer.invoke('save-dream', data);

    // reset
    form.reset();
    dreamEditor.value("");
    interpEditor.value("");
    editingId = null;

    reloadFn();
  });

  return { dreamEditor, interpEditor, editDream };
}

module.exports = { initEditors };
