var electron = require('electron');
var electronLocalshortcut = require('electron-localshortcut');
var aspect = require("electron-aspectratio");
var app = electron.app;
var menu = electron.Menu;
var BrowserWindow = electron.BrowserWindow;
var mainWindow = null;
var mainWindowHandler;
menu.setApplicationMenu(false);
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('ready', function () { return create(); });
app.on('activate', function () {
    if (mainWindow === null) {
        create();
    }
});
var create = function () {
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
    mainWindow.on('closed', function () { return mainWindow = null; });
    mainWindow.on('focus', function () { return mainWindowHandler.setRatio(16, 9, 1); });
    mainWindow.on('blur', function () { return mainWindowHandler.stop(16, 9, 1); });
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    //mainWindow.webContents.openDevTools();
    mainWindowHandler = new aspect(mainWindow);
    electronLocalshortcut.register(mainWindow, 'Escape', function () {
        mainWindow.webContents.send('toggle-title-bar', true);
    });
};
//# sourceMappingURL=main.js.map