import { app, BrowserWindow } from "electron";
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
let mainWindow: BrowserWindow;

if (require('electron-squirrel-startup')) app.quit();

const createWindow = () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = new BrowserWindow({
      width: 1280,
      height: 720,
      resizable: false,
      webPreferences: {
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY
      }
    });

    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    if (process.env.NODE_ENV !== 'production') {
      mainWindow.webContents.openDevTools();
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