/**
 * Module to load and proved access to control meta-data.
 *
 * @module visuals/meta
 */
(function() {
    var MODULE_NAME = "visuals.meta";

    var ENABLE_LOGGING = false,
        RECORD_LOG = false;
    var logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG);
    var fLog = logger.fLog,
        log = logger.log;

    // MODULE CODE - START
    /** @lends module:visuals/meta */
    var module = shmi.pkg(MODULE_NAME);
    module.controls = {};
    var IS_LOADED = false;
    var c_lid = null;
    var loadCallbacks = [];
    var waitingForMeta = false;
    var ridMetaLoad = 0;

    /**
     * isLoaded - Check if meta-data has been loaded.
     *
     * @return {boolean}  `true` if meta-data loaded, `false` else
     */
    module.isLoaded = function isLoaded() {
        return IS_LOADED;
    };

    /**
     * reload - Reload meta-data.
     *
     * @return {undefined}
     */
    module.reload = function reload() {
        IS_LOADED = false;
        beforeMeta();
    };

    function notifyLoaded() {
        loadCallbacks.forEach(function(cb) {
            cb(module);
        });
        loadCallbacks = [];
    }

    module.onLoaded = function onLoaded(callback) {
        var tokLoaded = null;

        loadCallbacks.push(callback);
        if (module.isLoaded()) {
            shmi.caf(ridMetaLoad);
            ridMetaLoad = shmi.raf(notifyLoaded);
        } else if (!waitingForMeta) {
            waitingForMeta = true;
            tokLoaded = shmi.listen("metadata-loaded", function(evt) {
                tokLoaded.unlisten();
                waitingForMeta = false;
                notifyLoaded();
            });
        }
    };

    function beforeMeta(evt) {
        var lsr = shmi.requires("designer.tools.lsdirRecursive").lsdirLocal,
            nodeFs = shmi.requires("designer.tools.nodeFs");
        lsr("packages", function(status, response) {
            onLogin(response);
        }, nodeFs.getUserDataPath());
    }

    function onLogin(dirInfo) {
        if (c_lid !== null) {
            c_lid.unlisten();
            c_lid = null;
        }

        var scriptUrls = dirInfo.getUrls("json"),
            fse = require('fs'),
            nodeFs = shmi.requires("designer.tools.nodeFs"),
            path = require('path'),
            tm = shmi.requires("visuals.task"),
            tl = null,
            tasks = [];

        scriptUrls = scriptUrls.filter(function(su) {
            return (su.indexOf("/.designer/meta/controls/") !== -1);
        });

        scriptUrls.forEach(function(su, idx) {
            var t = tm.createTask("load script #" + (idx + 1));
            t.run = function run() {
                fse.readFile(nodeFs.getUserDataPath() + path.sep + su, "utf8", function onData(err, data) {
                    var tmpVariants = null;
                    if (err) {
                        shmi.notify("Error parsing meta-data: " + err);
                    } else {
                        var jsonData = null;
                        try {
                            jsonData = JSON.parse(data);
                        } catch (exc) {
                            shmi.notify("Error parsing meta-data: " + exc);
                        }

                        if (jsonData.variant) {
                            module.controls[jsonData.uiType] = module.controls[jsonData.uiType] || {
                                variants: {}
                            };
                            module.controls[jsonData.uiType].variants = module.controls[jsonData.uiType].variants || {};
                            module.controls[jsonData.uiType].variants[jsonData.variant] = jsonData;
                        } else {
                            if (module.controls[jsonData.uiType] && module.controls[jsonData.uiType].variants) {
                                tmpVariants = module.controls[jsonData.uiType].variants;
                            }
                            module.controls[jsonData.uiType] = jsonData;
                            module.controls[jsonData.uiType].variants = tmpVariants || {};
                        }
                    }
                    t.complete();
                });
            };
            tasks.push(t);
        });
        if (scriptUrls.length) {
            tl = tm.createTaskList(tasks, true);
            tl.onComplete = function onComplete() {
                IS_LOADED = true;
                fLog("metadata loaded");
                shmi.fire('metadata-loaded', {}, module.controls || null);
            };
            tl.run();
        } else {
            shmi.raf(function onNoScriptsFound() {
                IS_LOADED = true;
                fLog("metadata loaded");
                shmi.fire('metadata-loaded', {}, module.controls || null);
            });
        }
    }

    if (shmi.visuals.session && shmi.visuals.session.UserManager && shmi.visuals.session.UserManager.currentUser && shmi.visuals.session.UserManager.currentUser.loggedIn) {
        beforeMeta({});
    } else {
        c_lid = shmi.listen('login-state', beforeMeta, { "detail.loggedIn": true });
    }
    // MODULE CODE - END

    fLog("module loaded");
})();
