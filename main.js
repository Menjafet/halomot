
const { app, BrowserWindow , ipcMain} = require('electron')
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'dreams.json');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,  // allow require() in HTML
       contextIsolation: false // must be false for nodeIntegration to work
    }
  })

  win.loadFile('index.html')
}


// Utility to ensure the file exists
function ensureDreamFile() {
    if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]'); // empty array of dreams
  }
}

// Handle saving dreams
ipcMain.handle('save-dream', async (event, dreamData) => {

  let dreams = JSON.parse(fs.readFileSync(filePath));
    //console.log("Loaded dreams:", dreams);
  if (dreamData.id != null) {
    // EDIT EXISTING
    dreams = dreams.map(d => (d.id === dreamData.id ? dreamData : d)); //condition ? valueIfTrue : valueIfFalse //this last 2 are returns
  } else {
    // ADD NEW
    const newId = dreams.length ? Math.max(...dreams.map(d => d.id || 0)) + 1 : 1;
    dreamData.id = newId;
    dreams.push(dreamData);
  }

  fs.writeFileSync(filePath, JSON.stringify(dreams, null, 2));
});

// Handle loading dreams
ipcMain.handle('load-dreams', async () => {
  ensureDreamFile(); // <-- ensure before reading
        
  return JSON.parse(fs.readFileSync(filePath));
});

app.whenReady().then(() => {
  ensureDreamFile();
  createWindow()
})

