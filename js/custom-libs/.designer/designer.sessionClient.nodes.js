/**
 * Module to interact with app model nodes
 *
 * @module designer/sessionClient/nodes
 */
(function() {
    var MODULE_NAME = "designer.sessionClient.nodes",
        /** @lends module:designer/sessionClient/nodes */
        module = shmi.pkg(MODULE_NAME);

    /**
     * getPrimaryId - get node ID from node handle
     *
     * @param {string} nodeHandle node handle
     * @returns {string} node ID
     */
    function getPrimaryId(nodeHandle) {
        return (typeof nodeHandle === "string") ? nodeHandle.split("@").slice(0, 1)[0] : null;
    }

    /**
     * getNodeInfo - get extended node info including node- and parent-dimensions
     *
     * @param {string} nodeHandle node handle
     * @param {boolean} [focusNode=false] `true` to focus node, `false` (default) else
     * @returns {object} node info
     */
    module.getInfo = function getInfo(nodeHandle, focusNode = false) {
        var model = shmi.requires("designer.app.model"),
            elem = model.getNodeElement(nodeHandle),
            clientControls = shmi.requires("designer.sessionClient.controls"),
            bb = null,
            node = model.getNode(nodeHandle),
            nodeInfo = null,
            meta = (node && node.ui) ? shmi.visuals.meta.controls[node.ui] : null,
            boundaryElem = null,
            parentBox = null;

        if (elem && node) {
            if (meta && meta.designer && meta.designer.boundarySelector) {
                boundaryElem = elem.querySelector(meta.designer.boundarySelector);
                if (boundaryElem) {
                    elem = boundaryElem;
                }
            }

            bb = elem.getBoundingClientRect();
            parentBox = elem.offsetParent ? elem.offsetParent.getBoundingClientRect() : document.body.getBoundingClientRect();

            nodeInfo = {
                x: Math.round(bb.left),
                y: Math.round(bb.top),
                width: Math.round(bb.width),
                height: Math.round(bb.height),
                uiType: node.ui,
                name: (node.attributes && node.attributes['data-name']) ? node.attributes['data-name'] : node.ui,
                id: getPrimaryId(nodeHandle),
                groupId: node.groupId || null,
                style: node.style,
                layout: shmi.getCurrentLayout(),
                movable: clientControls.isMovable(nodeHandle),
                parentBox: parentBox,
                handle: model.getNodeHandle(elem),
                variant: node.variant || null
            };

            if (focusNode) {
                elem.setAttribute("tabindex", "-1");
                elem.focus();
            }
        }

        return nodeInfo;
    };
}());
