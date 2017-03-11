const electronInstaller = require('electron-winstaller');
const path = require('path');

const rootPath = path.join(__dirname, '..');
const outPath = path.join(rootPath, 'out');

resultPromise = electronInstaller.createWindowsInstaller({
    appDirectory: path.join(outPath, 'screen-win32-ia32'),
    iconUrl: path.join(rootPath, 'assets', 'img', 'app.ico'),
    loadingGif: path.join(rootPath, 'assets', 'img', 'loading.gif'),
    outputDirectory: path.join(outPath, 'windows-installer'),
    exe: 'screen.exe',
    setupExe: 'screenSetup.exe',
    setupIcon: path.join(rootPath, 'assets', 'img', 'install.ico'),
    skipUpdateIcon: true,
    noMsi: true
});

resultPromise.then(function () {
    console.log("It worked!");
}, function (e) {
    console.log('No dice: ' + e.message);
});

