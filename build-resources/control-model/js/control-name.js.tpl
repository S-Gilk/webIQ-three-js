/**
 * WebIQ visuals control template.
 *
 * Configuration options (default):
 *
 * {
 *     "class-name": "<%= control_default_class_name %>",
 *     "name": null,
 *     "template": "<%= control_default_template %>"
 * }
 *
 * Explanation of configuration options:
 *
 * class-name {string}: Sets default css class applied on control root element
 * name {string}: Name of control set to data-name attribute
 * template {string}: Path to template file
 *
 * @version 1.1
 */
(function() {
    'use strict';

    // variables for reference in control definition
    var className = "<%= control_default_class_name %>", // control name in camel-case
        uiType = "<%= control_ui_type %>", // control keyword (data-ui)
        isContainer = false;

    // example - default configuration
    var defConfig = {
        "class-name": "<%= control_name %>",
        "name": null,
        "template": "<%= control_default_template %>",
        "label": uiType
    };

    // setup module-logger
    var ENABLE_LOGGING = true,
        RECORD_LOG = false;
    var logger = shmi.requires("visuals.tools.logging").createLogger(uiType, ENABLE_LOGGING, RECORD_LOG);
    var fLog = logger.fLog,
        log = logger.log;

    // declare private functions - START

    // declare private functions - END

    // definition of new control extending BaseControl - START
    var definition = {
        className: className,
        uiType: uiType,
        isContainer: isContainer,
        /* default configuration settings - all available options have to be initialized! */
        config: defConfig,
        /* schema of configuration object for validation according to json-schema v4
         * (http://json-schema.org/draft-04/schema#)
         */
        configSchema: null,
        /* instance variables */
        vars: {

        },
        /* imports added at runtime */
        imports: {
            /* example - add import via shmi.requires(...) */
            im: "visuals.session.ItemManager",
            /* example - add import via function call */
            qm: function () {
                return shmi.visuals.session.QueryManager;
            }
        },

        /* array of custom event types fired by this control */
        events: [],

        /* functions to extend or override the BaseControl prototype */
        prototypeExtensions: {
            /* called when config-file (optional) is loaded and template (optional) is inserted into base element */
            onInit: function () {

            },
            /* called when control is enabled */
            onEnable: function () {

            },
            /* called when control is disabled */
            onDisable: function () {

            },
            /* called when control is locked - disable mouse- and touch-listeners */
            onLock: function () {

            },
            /* called when control is unlocked - enable mouse- and touch-listeners */
            onUnlock: function () {

            },
            /* called by ItemManager when subscribed item changes and once on initial subscription */
            onSetValue: function (value, type, name) {

            },
            /* Sets min & max values and stepping of subscribed variable */
            onSetProperties: function (min, max, step) {

            }
        }
    };

    // definition of new control extending BaseControl - END

    // generate control constructor & prototype using the control-generator tool
    var cg = shmi.requires("visuals.tools.control-generator");
    cg.generate(definition);

})();
