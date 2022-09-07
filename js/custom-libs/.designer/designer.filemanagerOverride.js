/**
 * Module to override `FileManager.save` while app is loaded in WebIQ Designer.
 * The override method uses node module `fs-extra` to store data in the local workspace folder.
 *
 */
(function() {
    shmi.visuals.core.FileManager.prototype.save = function(path, data, callback, utf8) {
        let fs = require("electron").remote.require("fs-extra"),
            p = require("path"),
            nodeFs = shmi.requires("designer.tools.nodeFs");

        if (utf8) {
            fs.outputFile([nodeFs.getLocalWorkspacePath(), path].join(p.sep), data, "utf8", (err) => {
                callback(err, {});
            });
        } else {
            fs.outputFile([nodeFs.getLocalWorkspacePath(), path].join(p.sep), data, (err) => {
                callback(err, {});
            });
        }
    };
})();