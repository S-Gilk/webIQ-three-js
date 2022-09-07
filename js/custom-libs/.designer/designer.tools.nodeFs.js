/**
 * Module to access local filesystem & get application paths.
 *
 * @module designer/tools/nodeFs
 */
(function() {
    /** replace package- & module-names **/
    var MODULE_NAME = "designer.tools.nodeFs",
        ENABLE_LOGGING = true,
        RECORD_LOG = false,
        logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG),
        fLog = logger.fLog,
        log = logger.log,
        /** @lends module:designer/tools/nodeFs */
        module = shmi.pkg(MODULE_NAME);

    // MODULE CODE - START

    /* private module variables */
    var ignoreDirs = [".svn", "node_modules", ".git"],
        ignoreFiles = [".gitignore"],
        nodePath = require('path');

    /* private module functions */

    /**
     * lsdir - List directory contents of local filesystem.
     *
     * @param  {string} path     path, relative to basePath
     * @param  {function} callback callback function to receive result directory information
     * @param  {string} [basePath] base path for directory listing. Defaults to directory returned by `module.getBasePath`
     * @return {undefined}
     */
    module.lsdir = function(path, callback, basePath) {
        var fs = require('fs'),
            realPath = basePath ? basePath + nodePath.sep + path : module.getBasePath() + nodePath.sep + path,
            answer = {
                files: [],
                directories: []
            };
        fs.readdir(realPath, function(err, response) {
            if (Array.isArray(response)) {
                response.forEach(function(rEntry) {
                    if (fs.statSync(realPath + "/" + rEntry).isDirectory()) {
                        if (ignoreDirs.indexOf(rEntry) === -1) answer.directories.push({ name: rEntry });
                    } else if (ignoreFiles.indexOf(rEntry) === -1) {
                        answer.files.push({ name: rEntry });
                    }
                });
            }
            callback(!!err, answer);
        });
    };

    /**
     * clearDir - Clear directory on local filesystem.
     *
     * The directory itself will not be removed.
     *
     * @param  {string} path path to clear
     * @return {undefined}
     */
    module.clearDir = function clearDir(path) {
        var fs = require('fs-extra');
        fs.emptyDirSync(path);
    };

    /**
     * getBasePath - Get electron app base path.
     *
     * @return {string}  app base path
     */
    module.getBasePath = function() {
        return require('electron').remote.getGlobal("designerApp").getAppPath();
    };

    /**
     * getLocalWorkspacePath - Get path of local workspace directory.
     *
     * @return {string}  local workspace path
     */
    module.getLocalWorkspacePath = function() {
        return require('electron').remote.app.getPath("userData") + nodePath.sep + "workspace";
    };

    /**
     * getUserDataPath - Get path of local user-data directory.
     *
     * @return {string}  local user-data path
     */
    module.getUserDataPath = function() {
        return require('electron').remote.app.getPath("userData");
    };

    /**
     * getPackagePath - Get path of local packages directory.
     *
     * @return {string}  local package path
     */
    module.getPackagePath = function() {
        return require('electron').remote.app.getPath("userData") + nodePath.sep + "packages";
    };

    /**
     * getAppDataPath - Retrieve path of app-data directory (`%APPDATA%`, `.config`).
     *
     * @return {string}  user-data path
     */
    module.getAppDataPath = function() {
        return require('electron').remote.app.getPath("appData");
    };

    /**
     * getTempPath - Get path of local temp directory.
     *
     * @return {string}  local temp path
     */
    module.getTempPath = function() {
        return require('electron').remote.app.getPath("userData") + nodePath.sep + "temp";
    };

    /**
     * getDownloadsPath - Get path of users downloads directory
     *
     * @return {string}  user downloads path
     */
    module.getDownloadsPath = function() {
        return require('electron').remote.app.getPath("downloads");
    };

    /**
     * getDocumentsPath - Get path of users documents directory
     *
     * @return {string}  user documents path
     */
    module.getDocumentsPath = function() {
        return require('electron').remote.app.getPath("documents");
    };

    // MODULE CODE - END

    fLog("module loaded");
})();
