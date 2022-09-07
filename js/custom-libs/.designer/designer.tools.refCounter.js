/**
 * Module to provide a reference counting mechanism used to track the status of tasks
 * that starts executing an initially unknown number of steps.
 *
 * @module designer/tools/refCounter
 */
(function() {
    var MODULE_NAME = "designer.tools.refCounter",
        ENABLE_LOGGING = true,
        /** @lends module:designer/tools/refCounter */
        module = shmi.pkg(MODULE_NAME);

    var counterId = 1;

    /**
     * getRefCounter - Create new reference counter.
     *
     * The specified callback function is run when all references have been completed.
     *
     * @example
var refCounter = shmi.requires("designer.tools.refCounter"),
    rc = refCounter.get(function() {
        console.log("DONE");
    });

rc.start();
rc.start();
rc.complete();
rc.complete();
//"DONE" logged to console
     *
     * @param  {function} callback callback to run on completion
     * @return {object}          reference counter
     */
    module.get = function(callback) {
        var refCount = 0,
            totalRefs = 0,
            nextResId = Date.now(),
            changeListeners = [],
            completeListeners = [],
            counterName = "C" + (counterId++);

        var refObject = {
            start: function() {
                refCount++;
                totalRefs++;
                if (ENABLE_LOGGING) {
                    console.debug(counterName, " refcount:", refCount, totalRefs);
                }
                refObject.onChange();
            },
            complete: function() {
                refCount--;
                if (ENABLE_LOGGING) {
                    console.debug(counterName, " refcount:", refCount, totalRefs);
                }
                refObject.onChange();
                if (refCount === 0) {
                    refObject.onComplete();
                    if (callback) {
                        callback();
                    }
                    return;
                }
                if (refCount < 0) {
                    console.error("no task left to complete");
                }
            },
            getResId: function() {
                return nextResId++;
            },
            get onChange() {
                return function() {
                    changeListeners.forEach(function(cl, idx) {
                        cl({
                            current: totalRefs - refCount,
                            total: totalRefs
                        });
                    });
                };
            },
            set onChange(changeListener) {
                changeListeners.push(changeListener);
            },
            get onComplete() {
                return function() {
                    completeListeners.forEach(function(cl, idx) {
                        cl({
                            current: totalRefs - refCount,
                            total: totalRefs
                        });
                    });
                };
            },
            set onComplete(completeListener) {
                completeListeners.push(completeListener);
            }
        };

        return refObject;
    };
}());
