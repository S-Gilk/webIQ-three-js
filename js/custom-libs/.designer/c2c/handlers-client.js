/**
 *
 *
 * @module designer/c2c/handlers-client
 */
(function() {
    var MODULE_NAME = "designer.c2c.handlers-client",
        /** @lends module:designer/c2c/handlers-client */
        module = shmi.pkg(MODULE_NAME), //eslint-disable-line
        ENABLE_LOGGING = true,
        msgHandlers = null;

    function log() {
        if (!ENABLE_LOGGING) return;
        var args = Array.prototype.slice.call(arguments);
        args = ["[" + MODULE_NAME + "]"].concat(args);
        console.log.apply(console, args);
    }

    log.debug = function() {
        if (!ENABLE_LOGGING) return;
        var args = Array.prototype.slice.call(arguments);
        args = ["[" + MODULE_NAME + "]"].concat(args);
        console.debug.apply(console, args);
    };

    log.error = function() {
        var args = Array.prototype.slice.call(arguments);
        args = ["[" + MODULE_NAME + "]"].concat(args);
        console.error.apply(console, args);
    };

    msgHandlers = {
        test: log.error.bind(log, "new message:")
    };

    shmi.onSessionReady(function() {
        var con = shmi.requires("designer.c2c.connection"),
            iter = shmi.requires("visuals.tools.iterate.iterateObject");

        iter(msgHandlers, function(handler, type) {
            con.registerHandler(type, handler);
            log.debug("registered c2c message handler:", type);
        });
    });
}());
