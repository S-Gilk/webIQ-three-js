/**
 *
 *
 * @module designer/c2c/client-state
 */
(function() {
    var MODULE_NAME = "designer.c2c.client-state",
        /** @lends module:designer/c2c/client-state */
        module = shmi.pkg(MODULE_NAME);

    var state = {
            name: null,
            connected: false,
            host: null
        },
        rafId = 0,
        connectCallbacks = [],
        disconnectCallbacks = [];

    module.setState = function setState(updatedState) {
        var runConnectCallback = (updatedState.connected && !state.connected),
            runDisconnectCallback = (!updatedState.connected && state.connected);

        state.name = updatedState.name;
        state.connected = updatedState.connected;
        state.host = updatedState.host;

        if (runConnectCallback) {
            shmi.caf(rafId);
            rafId = shmi.raf(function() {
                connectCallbacks.forEach(function(cb) {
                    cb(state);
                });
                connectCallbacks = [];
            });
        } else if (runDisconnectCallback) {
            shmi.caf(rafId);
            rafId = shmi.raf(function() {
                disconnectCallbacks.forEach(function(cb) {
                    cb(state);
                });
                disconnectCallbacks = [];
            });
        }
    };

    module.getState = function getState() {
        return state;
    };

    module.onConnect = function onConnect(callback) {
        connectCallbacks.push(callback);
    };

    module.onDisconnect = function onDisconnect(callback) {
        disconnectCallbacks.push(callback);
    };

    shmi.listen("c2c-connection", function(evt) {
        var con = shmi.requires("designer.c2c.connection");

        module.setState({
            host: evt.detail.host,
            connected: (evt.detail.state === con.STATE_CONNECTED),
            name: evt.detail.name
        });
    });
}());
