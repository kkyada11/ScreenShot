var fs = require('fs'),
    path = require('path');

/**
 * find all files or subdirs (recursive) and pass to callback fn
 *
 * @param {string} dir directory in which to recurse files or subdirs
 * @param {string} type type of dir entry to recurse ('file', 'dir', or 'all', defaults to 'file')
 * @param {function(error, <Array.<string>)} callback fn to call when done
 * @example
 * dir.files(__dirname, function(err, files) {
 *      if (err) throw err;
 *      console.log('files:', files);
 *  });
 */
exports.files = function files(dir, type, callback, /* used internally */ ignoreType) {

    var pending,
        results = {
            files: [],
            dirs: []
        };
    var done = function() {
        if (ignoreType || type === 'all') {
            callback(null, results);
        } else {
            callback(null, results[type + 's']);
        }
    };

    var getStatHandler = function(statPath, lstatCalled) {
        return function(err, stat) {
            if (err) {
                if (!lstatCalled) {
                    return fs.lstat(statPath, getStatHandler(statPath, true));
                }
                return callback(err);
            }
            if (stat && stat.isDirectory() && stat.mode !== 17115) {
                if (type !== 'file') {
                    results.dirs.push(statPath);
                }
                files(statPath, type, function(err, res) {
                    if (err) return callback(err);
                    if (type === 'all') {
                        results.files = results.files.concat(res.files);
                        results.dirs = results.dirs.concat(res.dirs);
                    } else if (type === 'file') {
                        results.files = results.files.concat(res.files);
                    } else {
                        results.dirs = results.dirs.concat(res.dirs);
                    }
                    if (!--pending) done();
                }, true);
            } else {
                if (type !== 'dir') {
                    results.files.push(statPath);
                }
                // should be the last statement in statHandler
                if (!--pending) done();
            }
        };
    };

    if (typeof type !== 'string') {
        ignoreType = callback;
        callback = type;
        type = 'file';
    }

    fs.stat(dir, function(err, stat) {
        if (err) return callback(err);
        if(stat && stat.mode === 17115) return done();

        fs.readdir(dir, function(err, list) {
            if (err) return callback(err);
            pending = list.length;
            if (!pending) return done();
            for (var file, i = 0, l = list.length; i < l; i++) {
                file = path.join(dir, list[i]);
                fs.stat(file, getStatHandler(file));
            }
        });
    });
};
