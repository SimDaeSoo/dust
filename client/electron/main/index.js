const { app, ipcMain, BrowserWindow } = require('electron');
const path = require('path');
let mainWindow;

if (require('electron-squirrel-startup')) app.quit();

const createWindow = () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = new BrowserWindow({
      width: 1280,
      height: 720,
      resizable: false,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js')
      }
    });

    if (process.env.NODE_ENV === 'dev') {
      mainWindow.loadURL('http://localhost:3000');
      mainWindow.webContents.openDevTools();
    } else {
      mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
    }
  }
};

const destroyApplication = () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
};

app.on('ready', createWindow);
app.on('activate', createWindow);
app.on('window-all-closed', destroyApplication);

ipcMain.handle('send', (_event, ...args) => {
  mainWindow.webContents.send('receive', ...args);
});