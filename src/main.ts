const electron = require('electron');
const electronLocalshortcut = require('electron-localshortcut');
const aspect = require("electron-aspectratio");

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow = null;
let mainWindowHandler: any;

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
    minWidth: 500,
    minHeight: 281,
    autoHideMenuBar: true,
    darkTheme: true,
    titleBarStyle: 'hiddenInset',
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

  mainWindowHandler = new aspect(mainWindow);

  electronLocalshortcut.register(mainWindow, 'Escape', () => {
    mainWindow.webContents.send('toggle-title-bar', true);
  });
};