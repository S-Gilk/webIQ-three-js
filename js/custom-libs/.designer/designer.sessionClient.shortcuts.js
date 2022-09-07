/**
 * Module to implement keyboard shortcut communication in edit client
 *
 * @module designer/sessionClient/shortcuts
 */
(function() {
    var MODULE_NAME = "designer.sessionClient.shortcuts",
        /** @lends module:designer/sessionClient/shortcuts */
        module = shmi.pkg(MODULE_NAME); //eslint-disable-line

    function sendOperation(opName) {
        var cState = shmi.requires("designer.c2c.client-state"),
            rpc = shmi.requires("designer.c2c.rpc");

        //RPC - open loading overlay on designer host
        if (!cState.getState() && cState.getState().host) {
            return; //don't send requests when not connected yet
        }
        rpc.remoteCall(function(data) {
            var shortcuts = shmi.requires("designer.workspace.layout.shortcuts");

            shortcuts.perform(data.opName);
            complete(null);
        }, function(status, pJid) {
            console.log(MODULE_NAME, "shortcut operation performed:", opName);
        }, cState.getState().host, {
            opName: opName
        });
    }

    //add event listener for keyboard shortcuts
    window.addEventListener("keydown", function(evt) {
        if (shmi.requires("designer.sessionClient").isPreview()) {
            return; //shortcut operations should not be performed in preview mode
        }

        if ((evt.keyCode === 67) && evt.ctrlKey) {
            //copy - ctrl & c
            sendOperation("copy");
        } else if ((evt.keyCode === 88) && evt.ctrlKey) {
            //cut - ctrl & x
            sendOperation("cut");
        } else if ((evt.keyCode === 86) && evt.ctrlKey) {
            //paste - ctrl & v
            sendOperation("paste");
        } else if (evt.keyCode === 46) {
            //delete - DEL
            sendOperation("del");
        } else if (evt.altKey && evt.keyCode === 49) {
            //open config tab
            sendOperation("config-tab");
        } else if (evt.altKey && evt.keyCode === 50) {
            //open style tab
            sendOperation("style-tab");
        } else if (evt.altKey && evt.keyCode === 51) {
            //open hierarchy tab
            sendOperation("hierarchy-tab");
        } else if (evt.ctrlKey && (evt.keyCode === 220)) {
            //toggle control panel
            sendOperation("control-panel");
        } else if (evt.ctrlKey && (evt.keyCode === 80)) {
            //open preview
            sendOperation("open-preview");
        } else if (evt.ctrlKey && (evt.keyCode === 83)) {
            //save app
            sendOperation("save-app");
        } else if (evt.ctrlKey && (evt.keyCode === 89)) {
            //redo
            sendOperation("redo");
        } else if (evt.ctrlKey && (evt.keyCode === 90)) {
            //undo
            sendOperation("undo");
        }
    });
}());
