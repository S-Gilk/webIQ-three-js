/**
 * Module to provide direct access to storage data.
 *
 * This module provides a method of general storage to the underlying WebIQ app.
 * Per default all stored data is put into storage URLs with random identifiers.
 * Resource-URLs have the following form: <RES_URL_PREFIX> + <Random Resource ID>.
 * Example: `res://1499076238091`
 *
 * @module visuals/tools/put-resource
 */
(function() {
    var MODULE_NAME = "visuals.tools.put-resource",
        ENABLE_LOGGING = false,
        RECORD_LOG = false,
        logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG),
        fLog = logger.fLog,
        log = logger.log,

        // MODULE CODE - START
        /** @lends module:visuals/tools/put-resource */
        module = shmi.pkg(MODULE_NAME),
        eStr = shmi.requires("evalString");

    /**
     * putResource - Puts data resource into storage.
     *
     * @param  {any} data data to put into storage
     * @param  {string} [name] optional resource URL
     * @return {string}      resource URL
     */
    shmi.putResource = function(data, name) {
        let res_prefix = "res://",
            rl = shmi.requires("visuals.session.ResourceLoader"),
            res_ts = Date.now(),
            res_name = null;

        if (name !== undefined) {
            if (rl.resources[name] !== undefined) {
                log("resource name is taken; overwriting", name);
            }
            res_name = name;
        } else {
            res_name = res_prefix + res_ts;
            while (rl.resources[res_prefix + res_ts] !== undefined) {
                res_ts++;
                res_name = res_prefix + res_ts;
            }
        }
        if (rl.resources[name] !== undefined) {
            rl.resources[name].data = data;
            rl.resources[name].failed = false;
            if (!Array.isArray(rl.resources[name].callbacks)) {
                log("create callbacks");
                rl.resources[name].callbacks = [];
            }
            rl.notifyCallbacks(name);
        } else {
            rl.resources[res_name] = { data: data, failed: false, callbacks: [] };
        }

        log("created resource: ", res_name);
        return res_name;
    };

    /**
     * getResource - Retrieves data from storage.
     *
     * @param  {string} name resource URL
     * @return {any}      stored data, or `null` if no data present
     */
    shmi.getResource = function(name) {
        var rl = shmi.requires("visuals.session.ResourceLoader");

        if (rl.resources[name] !== undefined) {
            return rl.resources[name].data;
        } else {
            return null;
        }
    };

    /**
     * writeResource - Updates existing resource data.
     *
     * @param  {any} data resource data
     * @param  {string} name resource URL
     * @return {undefined}
     */
    shmi.writeResource = function(data, name) {
        var rl = shmi.requires("visuals.session.ResourceLoader");

        if (rl.resources[name] !== undefined) {
            rl.resources[name].data = data;
            rl.resources[name].failed = false;
        } else {
            rl.resources[name] = { data: data, failed: false, callbacks: [] };
        }
    };

    /**
     * putResource - Puts data resource into storage.
     *
     * @param  {any} data data to put into storage
     * @param  {string} [name] optional resource URL
     * @return {string}      resource URL
     */
    module.putResource = shmi.putResource;

    /**
     * getResource - Retrieves data from storage.
     *
     * @param  {string} name resource URL
     * @return {any}      stored data, or `null` if no data present
     */
    module.getResource = shmi.getResource;

    /**
     * removeResource - Removes specified resource URL from storage.
     *
     * @throws Will throw an error if resource URL does not exist
     * @param  {string} res_name resource URL
     * @return {undefined}
     */
    shmi.removeResource = function(res_name) {
        var rl = shmi.visuals.session.ResourceLoader;

        if (rl.resources && rl.resources[res_name]) {
            delete rl.resources[res_name];
        } else {
            throw new Error(eStr("resource '<%= NAME %>' does not exist.", { NAME: res_name }));
        }
    };

    /**
     * removeResource - Removes specified resource URL from storage.
     *
     * @throws Will throw an error if resource URL does not exist
     * @param  {string} res_name resource URL
     * @return {undefined}
     */
    module.removeResource = shmi.removeResource;

    // MODULE CODE - END

    fLog("module loaded");
})();
