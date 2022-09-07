    var magX = null;
    var magY = null;
    var angle = null;
(function () {

    /**
     * replace module name with a custom name for the local-script.
     *
     * All local-script should be attached to the "custom.ls" package.
     * If more than one script is required for an application, a common root package
     * should be created (e.g. "custom.ls.customerName.*").
     */

    var MODULE_NAME = "swipe-events",
        ENABLE_LOGGING = false,
        RECORD_LOG = false,
        logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG),
        fLog = logger.fLog,
        log = logger.log,
        module = shmi.pkg( MODULE_NAME );

    // MODULE CODE - START

    /* private variables */
    var xDown = null;
    var yDown = null;
    var xDiff = null;
    var yDiff = null;
    var timeDown = null;
    var startEl = null;

    /* private functions */
    if (typeof window.CustomEvent !== 'function') {

        window.CustomEvent = function (event, params) {

            params = params || { bubbles: false, cancelable: false, detail: undefined };

            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        };

        window.CustomEvent.prototype = window.Event.prototype;
    }
    
    function handleTouchEnd(e) {

        var swipeThreshold = parseInt(getNearestAttribute(startEl, 'data-swipe-threshold', '20'), 10); // default 20px
        var swipeTimeout = parseInt(getNearestAttribute(startEl, 'data-swipe-timeout', '500'), 10);    // default 500ms
        var timeDiff = Date.now() - timeDown;
        var eventType = '';
        var changedTouches = e.changedTouches || e.touches || [];
        
        magX = Math.abs(xDiff)/timeDiff;
        magY = Math.abs(yDiff)/timeDiff;
        
        if (xDiff >= 0){
            // First quad
            if (yDiff >= 0){
                angle = Math.atan(yDiff/xDiff);
            } else {
                angle = Math.atan(yDiff/xDiff) + 2*Math.PI;
            }
        } else {
                angle = Math.atan(yDiff/xDiff) + Math.PI;
        }
        
        if (Math.abs(xDiff) > Math.abs(yDiff)) { // most significant
            if (Math.abs(xDiff) > swipeThreshold && timeDiff < swipeTimeout) {
                if (xDiff > 0) {
                    eventType = 'swiped-left';
                }
                else {
                    eventType = 'swiped-right';
                }
            }
        }
        else if (Math.abs(yDiff) > swipeThreshold && timeDiff < swipeTimeout) {
            if (yDiff > 0) {
                eventType = 'swiped-up';
            }
            else {
                eventType = 'swiped-down';
            }
        }

        if (eventType !== '') {

            var eventData = {
                dir: eventType.replace(/swiped-/, ''),
                touchType: (changedTouches[0] || {}).touchType || 'direct',
                xStart: parseInt(xDown, 10),
                xEnd: parseInt((changedTouches[0] || {}).clientX || -1, 10),
                yStart: parseInt(yDown, 10),
                yEnd: parseInt((changedTouches[0] || {}).clientY || -1, 10)
            };

            // fire `swiped` event event on the element that started the swipe
            startEl.dispatchEvent(new CustomEvent('swiped', { bubbles: true, cancelable: true, detail: eventData }));

            // fire `swiped-dir` event on the element that started the swipe
            startEl.dispatchEvent(new CustomEvent(eventType, { bubbles: true, cancelable: true, detail: eventData }));
        }

        // reset values
        xDown = null;
        yDown = null;
        timeDown = null;
    }
    
    function handleTouchStart(e) {
        // if the element has data-swipe-ignore="true" we stop listening for swipe events
        if (e.target.getAttribute('data-swipe-ignore') === 'true') return;
        startEl = e.target;
        timeDown = Date.now();
        xDown = e.touches[0].clientX;
        yDown = e.touches[0].clientY;
    }

    /**
     * Records location diff in px on touchmove event
     * @param {object} e - browser event object
     * @returns {void}
     */
    function handleTouchMove(e) {

        if (!xDown || !yDown) return;

        var xUp = e.touches[0].clientX;
        var yUp = e.touches[0].clientY;

        xDiff = xDown - xUp;
        yDiff = yDown - yUp;
    }

    /**
     * Gets attribute off HTML element or nearest parent
     * @param {object} el - HTML element to retrieve attribute from
     * @param {string} attributeName - name of the attribute
     * @param {any} defaultValue - default value to return if no match found
     * @returns {any} attribute value or defaultValue
     */
    function getNearestAttribute(el, attributeName, defaultValue) {

        // walk up the dom tree looking for attributeName
        while (el && el !== document.documentElement) {
            var attributeValue = el.getAttribute(attributeName);
            if (attributeValue) {
                return attributeValue;
            }
            el = el.parentNode;
        }
        return defaultValue;
    }

    /**
     * Implements local-script run function.
     *
     * This function will be called each time a local-script will be enabled.
     *
     * @param {LocalScript} self instance reference of local-script control
     */
    module.run = function (self) {
        var body = document.body;
        body.addEventListener('touchstart', handleTouchStart, false);
        body.addEventListener('touchstart', handleTouchStart, false);
        body.addEventListener('touchmove', handleTouchMove, false);
        body.addEventListener('touchend', handleTouchEnd, false);
    
        /* called when this local-script is disabled */
        self.onDisable = function () {
            self.run = false; /* from original .onDisable function of LocalScript control */
        };
    };


    // MODULE CODE - END

    fLog("module loaded");
})();
