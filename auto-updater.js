const ChildProcess = require('child_process');
const path = require('path');

exports.createShortcut = function (callback) {
    spawnUpdate([
        '--createShortcut',
        path.basename(process.execPath),
        '--shortcut-locations',
        'StartMenu'
    ], callback)
};

exports.removeShortcut = function (callback) {
    spawnUpdate([
        '--removeShortcut',
        path.basename(process.execPath)
    ], callback)
};

function spawnUpdate(args, callback) {
    let updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe');
    let stdout = '';
    let spawned = null;

    try {
        spawned = ChildProcess.spawn(updateExe, args);
    } catch (error) {
        if (error && error.stdout == null) error.stdout = stdout;
        process.nextTick(function () {
            callback(error)
        });
        return
    }

    let error = null;

    spawned.stdout.on('data', function (data) {
        stdout += data
    });

    spawned.on('error', function (processError) {
        if (!error) error = processError;
    });

    spawned.on('close', function (code, signal) {
        if (!error && code !== 0) {
            error = new Error('Command failed: ' + code + ' ' + signal)
        }
        if (error && error.code == null) error.code = code;
        if (error && error.stdout == null) error.stdout = stdout;
        callback(error);
    })
}