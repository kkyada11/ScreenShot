'use strict';

const dir = require('node-dir'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    ignore = require('../ignore');

var projectFile;

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

Object.prototype.exeIgnore = function (ignore) {
    var files = this;
    for (var i = ignore.length - 1; i >= 0; i--) {
        files = files.filter(function (file) {
            return file.substr(-1 * (ignore[i].length)) !== ignore[i];
        });
    }
    return files;
};

Object.prototype.txtIgnore = function (ignore) {
    var files = this;
    for (var i = ignore.length - 1; i >= 0; i--) {
        files = files.filter(function (file) {
            return file.indexOf(ignore[i]) <= -1;
        });
    }
    return files;
};

module.exports = function (__dir, config, callback) {
    function getFilename(url) {
        var pattern = /(^.*\/)([^&#?]*)/;
        var m = url.match(pattern);
        var filename = m[2];
        return filename;
    }

    dir.files(__dir, function (err, files) {
        var jsonArray = [];
        if (err) throw err;
        // sort ascending
        files.sort();
        // sort descending
        files.reverse();

        // 제외.
        files = files.txtIgnore(ignore.folder);

        // html 파일만.
        files = files.exeIgnore(ignore.files);

        var i = 0, fData, f, folder, local, fileName;
        for (i = files.length - 1; i >= 0; i--) {
            fData = files[i];
            local = path.dirname(fData);
            f = config.url + fData.replaceAll(__dir, '');
            f = f.replaceAll('\\', '/');
            folder = local.replaceAll(__dir, '');
            folder = '.' + config.project + folder.replaceAll('\\', '/');
            fileName = getFilename(f);

            mkdirp(folder, function (err) {
                console.log(err || "Create Folder");
            });

            jsonArray.push({
                folder: folder,
                local: local,
                url: f,
                file: fileName
            });

            if (!i) {
                projectFile = {
                    url: config.url,
                    name: config.project,
                    items: jsonArray
                };
                callback(projectFile);
            }
        }
    });
};
