/**
 * Module to recursively list local and remote fileystem paths.
 *
 * @module designer/tools/lsdirRecursive
 */
(function() {
    var MODULE_NAME = "designer.tools.lsdirRecursive",
        ENABLE_LOGGING = false,
        RECORD_LOG = false,
        logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG),
        fLog = logger.fLog,
        log = logger.log,
        /** @lends module:designer/tools/lsdirRecursive */
        module = shmi.pkg(MODULE_NAME);

    // MODULE CODE - START

    var SUCCESS = 0,
        skipDirs = [".svn", "node_modules", ".git"],
        errors = {
            LIST_DIR: 1
        };

    /**
     * addDirectory - add directory to listing request
     *
     * @param  {object} dirData  directory data object
     * @param  {string} path     path
     * @param  {object} result   result data object
     * @param  {function} callback callback to run on completion
     * @param  {object} callRef  ref-counter object
     * @param  {boolean} local    true if request is local, false for remote
     * @param  {string} basePath base path
     * @return {undefined}
     */
    function addDirectory(dirData, path, result, callback, callRef, local, basePath) {
        var pathParts = path.split("/");
        var ls = local ? shmi.requires("designer.tools.nodeFs.lsdir") : shmi.lsdir;
        pathParts = pathParts.filter(function(val) {
            return (val.trim().length > 0);
        });
        result.name = pathParts[pathParts.length - 1];
        result.files = [];
        result.directories = [];
        result.ts = null;

        dirData.files.forEach(function(fn, idx) {
            var fnParts = fn.name.split(".");
            result.files.push({
                name: fn.name,
                type: fnParts.length > 1 ? fnParts[fnParts.length - 1] : null,
                ts: null
            });
        });
        dirData.directories.forEach(function(dn, idx) {
            if (skipDirs.indexOf(dn.name) !== -1) {
                return;
            }
            var dirRef = {
                name: dn.name,
                files: [],
                directories: [],
                ts: null
            };
            result.directories.push(dirRef);
            callRef.start();
            ls(path + "/" + dn.name, function(failed, tmpDirData) {
                if (failed) {
                    console.debug("failed to list directory", path + "/" + dn.name);
                    callRef.error(errors.LIST_DIR);
                } else {
                    addDirectory(tmpDirData, path + "/" + dn.name, dirRef, callback, callRef, local, basePath);
                    callRef.complete();
                }
            }, basePath);
        });
    }

    /**
     * lsdir - List local or remote filesystem path recursively.
     *
     * When in local mode, all paths are relative to `shmi.requires("designer.tools.nodeFs").getBasePath()`.
     *
     * @param  {string} url      path to list
     * @param  {function} callback callback to receive results
     * @param  {boolean} [local]    `true` for local filesystem, `false` for remote. Defaults to `false` if omitted.
     * @return {undefined}
     */
    module.lsdir = function lsdir(url, callback, local) {
        var openCalls = 0;
        var result = {};
        var lsdirLocal = shmi.requires("designer.tools.nodeFs.lsdir");
        var ls = local ? lsdirLocal : shmi.lsdir;
        var callRef = {
            start: function() {
                openCalls++;
            },
            complete: function() {
                openCalls--;
                if (openCalls === 0) {
                    callback(SUCCESS, result);
                }
            },
            error: function(errType) {
                openCalls--;
                if (openCalls === 0) {
                    callback(SUCCESS, result);
                }
            }
        };
        callRef.start();
        ls(url, function(failed, dirData) {
            if (failed) {
                var pathParts = url.split("/");
                pathParts = pathParts.filter(function(val) {
                    return (val.trim().length > 0);
                });
                result.name = pathParts[pathParts.length - 1];
                result.files = [];
                result.directories = [];
                result.ts = null;
                console.error("failed to list directory:", url);
                callRef.error(errors.LIST_DIR);
            } else {
                addDirectory(dirData, url, result, callback, callRef, local);
                callRef.complete();
            }
        });
    };

    function collectFiles(ref, type, result, path) {
        if (Array.isArray(ref.files)) {
            ref.files.forEach(function(file, idx) {
                if ((type === "*") || (file.type === type)) {
                    result.push(path + "/" + file.name);
                }
            });
        }
        if (Array.isArray(ref.directories)) {
            ref.directories.forEach(function(dir, idx) {
                collectFiles(dir, type, result, path + "/" + dir.name);
            });
        }
    }

    function createUrlGetter(result, path) {
        return function getUrls(type) {
            var urls = [];
            collectFiles(result, type, urls, path);
            return urls;
        };
    }

    /**
     * lsdirLocal - List local filesystem paths recursively.
     *
     * Optionally, `basePath` can be specified when locations outside of `shmi.requires("designer.tools.nodeFs").getBasePath()` should be listed.
     *
     * @param  {string} url      path to list
     * @param  {function} callback callback to receive results
     * @param  {string} [basePath] optional base-path. Defaults to `shmi.requires("designer.tools.nodeFs").getBasePath()` if omitted.
     * @return {undefined}
     */
    module.lsdirLocal = function lsdirLocal(url, callback, basePath) {
        var openCalls = 0;
        var result = {};
        var ls = shmi.requires("designer.tools.nodeFs.lsdir");
        var callRef = {
            start: function() {
                openCalls++;
            },
            complete: function() {
                openCalls--;
                if (openCalls === 0) {
                    callback(SUCCESS, result);
                }
            },
            error: function(errType) {
                openCalls--;
                if (openCalls === 0) {
                    callback(SUCCESS, result);
                }
            }
        };

        result.getUrls = createUrlGetter(result, url);

        callRef.start();
        ls(url, function(failed, dirData) {
            if (failed) {
                var pathParts = url.split("/");
                pathParts = pathParts.filter(function(val) {
                    return (val.trim().length > 0);
                });
                result.name = pathParts[pathParts.length - 1];
                result.files = [];
                result.directories = [];
                result.ts = null;
                console.error("failed to list directory:", url);
                callRef.error(errors.LIST_DIR);
            } else {
                addDirectory(dirData, url, result, callback, callRef, true, basePath);
                callRef.complete();
            }
        }, basePath);
    };

    /**
     * getFileUrls - Get all URLs of a specified file-type from the given (remote) path.
     *
     * @param  {string} path     path of remote filesystem
     * @param  {string} type     file extension to list or `*` to list all file-types
     * @param  {function} callback callback to receive results
     * @return {undefined}
     */
    module.getFileUrls = function getFileUrls(path, type, callback) {
        module.lsdir(path, function(status, data) {
            var result = [];
            if (status !== SUCCESS) {
                console.error("failed to get file urls from:", path);
                callback(null);
            } else {
                collectFiles(data, type, result, path);
                callback(result);
            }
        });
    };

    // MODULE CODE - END

    fLog("module loaded");
})();
