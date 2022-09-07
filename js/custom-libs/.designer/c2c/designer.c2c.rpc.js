/**
 * @module designer/c2c/rpc
 */
(function() {
    var MODULE_NAME = "designer.c2c.rpc",
        ENABLE_LOGGING = false, RECORD_LOG = false,
        logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG),
        fLog = logger.fLog,
        log = logger.log,

        // MODULE CODE - START
        /** @lends module:designer/c2c/rpc */
        module = shmi.pkg(MODULE_NAME),
        local_requests = {},
        c2c = shmi.requires("designer.c2c.connection");

    /**
     * @constant
     * @default 0
     */
    module.REQUEST_INITIAL = 0;
    /**
     * @constant
     * @default
     */
    module.REQUEST_PENDING = 1;
    /**
     * @constant
     * @default
     */
    module.REQUEST_COMPLETE = 2;
    /**
     * @constant
     * @default
     */
    module.REQUEST_FAILED = 3;
    /**
     * @constant
     * @default
     */
    module.DEFAULT_TIMEOUT = 60000; /* timeout rpc calls after 60 seconds if no custom timeout is specified */

    function createRequest(callback) {
        var rId = 0;
        while (local_requests[rId] !== undefined) {
            rId++;
        }
        local_requests[rId] = {
            id: rId,
            state: module.REQUEST_INITIAL,
            callback: callback,
            timeout: null
        };
        return local_requests[rId];
    }

    /* handler function for "RPC_REQUEST" commands received from other client */
    function requestHandler(msg_data) {
        log("incoming request", msg_data);
        // "complete" and "fail" may get called by "eval". Thus the eslint
        // warning must be ignored.
        var complete = function(response) { //eslint-disable-line
            var msg = {
                type: "RPC_RESPONSE",
                data: {
                    requestId: msg_data.data.requestId,
                    state: module.REQUEST_COMPLETE,
                    response: response
                }
            };
            c2c.send(msg, msg_data.data.requestSrc);
        };
        var fail = function(response) { //eslint-disable-line
            var msg = {
                type: "RPC_RESPONSE",
                data: {
                    requestId: msg_data.data.requestId,
                    state: module.REQUEST_FAILED,
                    response: response
                }
            };
            c2c.send(msg, msg_data.data.requestSrc);
        };
        var procedure;
        eval("procedure = " + msg_data.data.procedure);
        procedure(msg_data.data.data);
    }

    /* handler function for "RPC_RESPONSE" commands received from other client */
    function responseHandler(msg_data) {
        log("incoming response", msg_data);
        var r = local_requests[msg_data.data.requestId];
        if (r) {
            /* clear rpc timeout */
            clearTimeout(r.timeout);
            /* delete request reference */
            delete local_requests[msg_data.data.requestId];
            /* run rpc callback */
            r.callback(msg_data.data.state, msg_data.data.response);
        }
    }

    /**
     * execute function on remote c2c-node
     *
     * @param {function} remoteProcedure function to execute on target
     * @param {function~designer.c2c.rpc.callback} callback        function called when remoteProcedure finishes execution
     */
    module.remoteCall = function(remoteProcedure, callback, destName, data, customTimeout) {
        var r = createRequest(callback),
            msg = {
                type: "RPC_REQUEST",
                data: {
                    procedure: remoteProcedure.toString(),
                    requestId: r.id,
                    requestSrc: c2c.getName(),
                    data: data ? data : null
                }
            };
        r.timeout = setTimeout(function() {
            delete local_requests[r.id];
            log("rpc timeout", r);
            r.callback(module.REQUEST_FAILED, null);
        }, customTimeout || module.DEFAULT_TIMEOUT);
        c2c.send(msg, destName);
        log("sent rpc request", msg);
    };

    /**
     * execute function on remote c2c-node
     *
     * @param {function} remoteProcedure function to execute on target
     * @param {string} destName destination name (c2c name)
     * @param {object} [data] parameter data for remote function
     * @param {number} [customTimeout] custom timeout in ms
     * @returns {Promise<any>}
     */
    module.remoteCallAsync = function remoteCallAsync(remoteProcedure, destName, data, customTimeout) {
        return new Promise((resolve, reject) => {
            module.remoteCall(remoteProcedure, (status, response) => {
                if (status === module.REQUEST_FAILED) {
                    reject(new Error("Remote Procedure Call failed"));
                }

                resolve(response);
            }, destName, data, customTimeout);
        });
    };

    c2c.registerHandler("RPC_REQUEST", requestHandler);
    c2c.registerHandler("RPC_RESPONSE", responseHandler);

    /**
      * module.rpc callback function
      * @callback designer.c2c.rpc~callback
      * @param {Number} state request state
      * @param {Object} data  request data
      */

    // MODULE CODE - END

    fLog("module loaded");
})();
