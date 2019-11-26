var electron = require('electron');
var electronLocalshortcut = require('electron-localshortcut');
var aspect = require("electron-aspectratio");
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;
var mainWindow = null;
var mainWindowHandler;
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
    mainWindow.on('closed', function () { return mainWindow = null; });
    mainWindow.on('focus', function () { return mainWindowHandler.setRatio(16, 9, 1); });
    mainWindow.on('blur', function () { return mainWindowHandler.stop(16, 9, 1); });
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    mainWindowHandler = new aspect(mainWindow);
    electronLocalshortcut.register(mainWindow, 'Escape', function () {
        mainWindow.webContents.send('toggle-title-bar', true);
    });
};
//# sourceMappingURL=main.js.map