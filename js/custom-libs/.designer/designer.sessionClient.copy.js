/**
 *
 *
 * @module designer/sessionClient/copy
 */
(function() {
    var MODULE_NAME = "designer.sessionClient.copy",
        /** @lends module:designer/sessionClient/copy */
        module = shmi.pkg(MODULE_NAME);

    var stash = {};

    function getStashId() {
        var id = Date.now();
        while (stash[id]) {
            id++;
        }
        return id;
    }

    module.stashCopy = function stashCopy(nodeCopy) {
        var stashId = getStashId();
        stash[stashId] = nodeCopy;
        return stashId;
    };

    module.deleteCopy = function deleteCopy(stashId) {
        delete stash[stashId];
    };

    module.getCopy = function getCopy(stashId) {
        return stash[stashId];
    };
}());
