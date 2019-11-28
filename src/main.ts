const electron = require('electron');
const electronLocalshortcut = require('electron-localshortcut');
const aspect = require("electron-aspectratio");

const app = electron.app;
const menu = electron.Menu;
const BrowserWindow = electron.BrowserWindow;

let mainWindow = null;
let mainWindowHandler: any;

menu.setApplicationMenu(null);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', () => create());

app.on('activate', () => {
  if (mainWindow === null) {
    create();
  }
});

const create = () => {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 600,
    minHeight: 338,
    darkTheme: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      // preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    }
  });


  mainWindow.on('closed', () => mainWindow = null);
  mainWindow.on('focus', () => mainWindowHandler.setRatio(16, 9, 1));
  mainWindow.on('blur', () => mainWindowHandler.stop(16, 9, 1));

  mainWindow.loadURL('file://' + __dirname + '/index.html');
  //mainWindow.webContents.openDevTools();
  mainWindowHandler = new aspect(mainWindow);

  electronLocalshortcut.register(mainWindow, 'Escape', () => {
    mainWindow.webContents.send('toggle-title-bar', true);
  });

  electronLocalshortcut.register(mainWindow, 'F12', () => {
    mainWindow.webContents.send('toggle-dev', true);
  });
};