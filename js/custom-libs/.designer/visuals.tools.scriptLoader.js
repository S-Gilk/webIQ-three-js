/**
 * Module to dynamically load javascript scripts at app runtime.
 *
 * @module visuals/tools/scriptLoader
 */
(function() {
    var MODULE_NAME = "visuals.tools.scriptLoader",
        ENABLE_LOGGING = true,
        RECORD_LOG = false,
        logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG),
        fLog = logger.fLog,
        log = logger.log,
        /** @lends module:visuals/tools/scriptLoader */
        module = shmi.pkg(MODULE_NAME);

    // MODULE CODE - START

    /* private variables */
    var moduleMap = {}; //will hold name : module references

    var invalidModules = [
        "shmi.visuals.session",
        "shmi.project.session",
        "shmi.designer.session",
        "shmi.visuals.meta.controls"
    ];

    /* private functions */

    /* public functions */
    function mapModules(base, name) {
        var iter = shmi.requires("visuals.tools.iterate.iterateObject");

        if (invalidModules.indexOf(name) !== -1) {
            return;
        }

        if (!moduleMap[name]) {
            moduleMap[name] = base;
            shmi.fire("module-discovered", { module: moduleMap[name], name: name }, module);
        }
        iter(base, function(val, prop) {
            if ((typeof val === "object") && (val !== null)) {
                console.debug(MODULE_NAME, "current property:", name + "." + prop);
                mapModules(val, name + "." + prop);
            }
        });
    }

    module.mapModules = function() {
        moduleMap = {};
        mapModules(shmi, "shmi");
        return moduleMap;
    };

    /**
     * load - Load javascript script dynamically.
     *
     * @param  {string} scriptUrl script URL
     * @param  {function} callback  callback to run on completion
     * @return {undefined}
     */
    module.load = function(scriptUrl, callback) {
        var head = document.querySelector("head"),
            scriptElement = null;

        if (head) {
            scriptElement = document.createElement("SCRIPT");
            scriptElement.setAttribute("src", scriptUrl);
            scriptElement.setAttribute("async", false);
            scriptElement.onload = function() {
                head.removeChild(scriptElement);
                if (typeof callback === "function") {
                    callback();
                }
            };
            head.appendChild(scriptElement);
        } else {
            console.error(MODULE_NAME, "no head element found");
        }
    };

    // MODULE CODE - END

    fLog("module loaded");
})();
