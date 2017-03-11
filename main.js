const electron = require('electron'),
    ipc = electron.ipcMain,
    dialog = electron.dialog,
    app = electron.app,
    BrowserWindow = electron.BrowserWindow;

var fs = require('fs'),
    path = require('path'),
    url = require('url'),
    j = require('jsonfile'),
    exec = require('child_process').exec,
    autoUpdater = require('./auto-updater'),
    jsonFile = require('./main-process/jsonFiles');

// 교체 가능.
var ExecLimiter = require("exec-limiter");

var mainWindow, readJson, config;

function initialize() {
    //electon 뷰 창 생성.
    function createWindow() {
        mainWindow = new BrowserWindow({width: 1000, height: 600, "node-integration": false});

        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file:',
            slashes: true
        }));

        mainWindow.webContents.openDevTools();

        mainWindow.on('closed', function () {
            mainWindow = null
        });

    }

    //설정 파일 생성.
    function configPaser(inProject, inPath, inUrl) {
        var txt = {
            project: inProject,
            url: inUrl,
            path: inPath
        };
        config = txt;
        fs.writeFileSync('config.json', JSON.stringify(txt, null, ''), 'utf8');
    }

    //목록 순차 적으로 phantomjs 호출.
    function jsonPhantomExec(calbak) {
        readJson = j.readFileSync(config.project + '.json', 'utf8');
        var count = readJson.items.length;
        for (var i = readJson.items.length - 1; i >= 0; i--) {
            var item = readJson.items[i];
            var rootPath = path.join(__dirname, '.');
            var outPath = path.join(rootPath, 'main-process');
            var el = new ExecLimiter(2);
            var commandTxt = 'phantomjs ' + outPath + '\\createImg.js ' + item.url + ' ' + item.folder;
            el.add(commandTxt, function (err) {
                console.log(err || "Create Images Save.");
                count--;
                if (!count) {
                    if (typeof calbak === 'function') {
                        calbak(config.project + '.json', commandTxt);
                    }
                    // exit();
                }
            });
        }
    }

    //목록 생성.
    function jsonFileExtraction(calbak) {
        jsonFile(config.path, config, function (a) {
            fs.writeFileSync(config.project + '.json', JSON.stringify(a, null, ''), 'utf8');
            jsonPhantomExec(calbak);
        });
        return config.project + '.json';
    }

    exports.configPaser = function (inPath, inUrl, inProject) {
        configPaser(inPath, inUrl, inProject);
    };

    ipc.on('jsonFileExtraction', function (event) {
        jsonFileExtraction(function (files, logs) {
            event.sender.send('next-step3', files, logs);
        });
    });

    ipc.on('open-file-dialog', function (event, id) {
        dialog.showOpenDialog({
            properties: ['openDirectory']
        }, function (files) {
            if (files) event.sender.send('selected-directory', files, id)
        })
    });

    app.on('ready', function () {
        createWindow();
    });

    app.on('window-all-closed', function () {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    });

    app.on('activate', function () {
        if (mainWindow === null) {
            createWindow()
        }
    });
};

// Handle Squirrel on Windows startup events
switch (process.argv[1]) {
    case '--squirrel-install':
        autoUpdater.createShortcut(function () {
            app.quit()
        });
        break;
    case '--squirrel-uninstall':
        autoUpdater.removeShortcut(function () {
            app.quit()
        });
        break;
    case '--squirrel-obsolete':
    case '--squirrel-updated':
        app.quit();
        break;
    default:
        initialize();
}