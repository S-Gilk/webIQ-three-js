/**
 * Module to work with WebIQ HTML-Templates. This module provides ways to load
 * object-data from HTML-templates and create HTML-templates from object-data.
 *
 * Used to create a representation of app layouts in WebIQ designer.
 *
 * @module designer/template
 */
(function() {
    var MODULE_NAME = "designer.template",
        ENABLE_LOGGING = false,
        RECORD_LOG = false,
        logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG),
        fLog = logger.fLog,
        log = logger.log,
        /** @lends module:designer/template */
        module = shmi.pkg(MODULE_NAME);

    // MODULE CODE - START

    /* private variables */
    var elementTypes = {
            TEXT_ELEMENT: Node.TEXT_NODE,
            COMMENT_ELEMENT: Node.COMMENT_NODE,
            NODE_ELEMENT: Node.ELEMENT_NODE
        }, controlTypes = {
            NOT_CONTROL: 0,
            NO_TEMPLATE: 1,
            SINGLE_TEMPLATE: 2,
            VIEW_TEMPLATE: 3,
            INLINE_TEMPLATE: 4
        }, configAttributes = [
            "data-name",
            "data-item",
            "data-field",
            "data-label",
            "data-unit-text",
            "data-template",
            "data-content-template",
            "data-class-name"
        ];

    module.controlTypes = controlTypes;
    module.elementTypes = elementTypes;

    /* private functions */

    /**
     * generateElement - generate HTMLElement from node data
     *
     * @param {object} nodeInfo node data
     * @returns {HTMLElement} generated element
     */
    function generateElement(nodeInfo) {
        var element = null,
            iter = shmi.requires("visuals.tools.iterate.iterateObject");

        if (nodeInfo.type === Node.TEXT_NODE) {
            element = document.createTextNode(nodeInfo.value);
        } else if (nodeInfo.type === Node.COMMENT_NODE) {
            element = document.createComment(nodeInfo.value);
        } else if (nodeInfo.type === Node.ELEMENT_NODE) {
            element = document.createElement(nodeInfo.tagName);
            iter(nodeInfo.attributes, function(val, prop) {
                element.setAttribute(prop, val);
            });
            nodeInfo.children.forEach(function(cn) {
                var childElement = generateElement(cn);
                if (childElement) {
                    element.appendChild(childElement);
                }
            });
        }

        return element;
    }

    /**
     * parseElement - parse node data from DOM node
     *
     * @param {HTMLElement} node DOM node
     * @returns {object} node data
     */
    function parseElement(node) {
        var nodeInfo = null,
            iterNl = shmi.requires("visuals.tools.iterate.iterateNodeList");

        if ((node.nodeType === Node.TEXT_NODE)||(node.nodeType === Node.COMMENT_NODE)) {
            nodeInfo = {
                type: node.nodeType,
                value: node.nodeValue
            };
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            nodeInfo = {
                type: node.nodeType,
                ui: node.getAttribute("data-ui"),
                controlType: controlTypes.NOT_CONTROL,
                tagName: node.tagName,
                attributes: {},
                children: []
            };

            if (nodeInfo.ui) {
                nodeInfo.controlType = getControlType(nodeInfo.ui);
                //nodeInfo.meta = shmi.requires("visuals.meta").controls[nodeInfo.ui] || null;
                if (nodeInfo.controlType === controlTypes.NOT_CONTROL) {
                    console.error(MODULE_NAME, "unregistered ui-type found:", nodeInfo.ui);
                }
            }

            iterNl(node.attributes, function(attr, idx) {
                nodeInfo.attributes[attr.nodeName] = node.getAttribute(attr.nodeName);
            });

            if ((nodeInfo.controlType === controlTypes.NOT_CONTROL) || (nodeInfo.controlType === controlTypes.INLINE_TEMPLATE)) {
                iterNl(node.childNodes, function(cn) {
                    var childInfo = parseElement(cn);
                    if (childInfo) {
                        nodeInfo.children.push(childInfo);
                    }
                });
            }
        }

        return nodeInfo;
    }

    /**
     * getControlImplementation - get constructor for specified ui-type
     *
     * @param {string} uiType control ui-type
     * @returns {function|null} constructor or `null` if none found
     */
    function getControlImplementation(uiType) {
        var ps = shmi.requires("visuals.session.ParserState"),
            result;

        result = ps.controlTypes.find(function(t) {
            return t[0] === uiType;
        });

        return result ? result[1] : null;
    }

    /**
     * getControlType - get control type for specified ui-type
     *
     * @param {string} uiType control ui-type
     * @returns {number} control type
     */
    function getControlType(uiType) {
        var type = controlTypes.NOT_CONTROL,
            ps = shmi.requires("visuals.session.ParserState"),
            meta = shmi.requires("visuals.meta").controls[uiType];

        if (ps.containerTypes.indexOf(uiType) !== -1) {
            if (!meta) {
                console.error(MODULE_NAME, "meta data not installed:", uiType);
                type = controlTypes.NO_TEMPLATE;
            } else {
                var impl = getControlImplementation(uiType);
                if (impl && meta.designer && meta.designer.containerProperties && meta.designer.containerProperties.saveContent && meta.designer.containerProperties.hasViews) {
                    type = controlTypes.VIEW_TEMPLATE;
                } else if (meta.designer.containerProperties && meta.designer.containerProperties.saveContent) {
                    type = controlTypes.SINGLE_TEMPLATE;
                } else if (impl && impl.prototype) {
                    if (meta.designer.containerProperties) {
                        type = controlTypes.INLINE_TEMPLATE;
                    } else {
                        type = controlTypes.NO_TEMPLATE;
                    }
                }
            }
        } else if (getControlImplementation(uiType)) {
            type = controlTypes.NO_TEMPLATE;
        }

        return type;
    }

    /* public module functions */

    /**
     * getControlType - Retrieve control type of specified ui-type attribute.
     *
     * @param {string}  uiType ui-type attribute
     *
     * @returns {number} control type resolved by `module.controlTypes`
     */
    module.getControlType = getControlType;

    /**
     * parse - Parse a template structure from a WebIQ HTML template.
     *
     * @param {string} htmlText HTML source
     *
     * @returns {object} templateStructure
     */
    module.parse = function parse(htmlText) {
        var frag = document.createDocumentFragment(),
            root = document.createElement("DIV"),
            iterNl = shmi.requires("visuals.tools.iterate.iterateNodeList"),
            result = [];

        root.innerHTML = htmlText;
        frag.appendChild(root);

        iterNl(root.childNodes, function(node, idx) {
            var nodeInfo = parseElement(node);
            if (nodeInfo !== null) {
                result.push(nodeInfo);
            }
        });

        return result;
    };

    /**
     * getWorkspaceUrl - return base-URL of workspace
     *
     * @returns {string} workspace URL
     */
    function getWorkspaceUrl() {
        var path = require('path');
        return shmi.requires("designer.tools.nodeFs").getLocalWorkspacePath() + path.sep;
    }

    /**
     * collectConfigs - recursively collect all config URLs of template structure and return array of load tasks for these files
     *
     * @param {object[]} ts template structure
     * @param {object[]} [tasks] tasks array used for recursion
     * @returns {object[]} tasks to load configurations found in template structure
     */
    function collectConfigs(ts, tasks) {
        tasks = tasks || [];
        ts.forEach(function(tn) {
            var t = getConfigTask(tn);
            if (t) {
                tasks.push(t);
            }

            if (Array.isArray(tn.children)) {
                collectConfigs(tn.children, tasks);
            }
        });

        return tasks;
    }

    /**
     * mergeConfig - merge JSON-config with options parsed from selected `data-`-attributes
     *
     * @param {object} tNode template node
     */
    function mergeConfig(tNode) {
        var iter = shmi.requires("visuals.tools.iterate.iterateObject");
        iter(tNode.attributes, function(val, prop) {
            if (configAttributes.indexOf(prop) !== -1) {
                tNode.controlConfig[prop.replace("data-", "")] = val;
                delete tNode.attributes[prop];
            }
        });
    }

    /**
     * complementOptions - complement control config with unset options present in meta-data
     *
     * @param {object} tNode template node
     */
    function complementOptions(tNode) {
        var meta = shmi.requires("visuals.meta.controls"),
            iter = shmi.requires("visuals.tools.iterate.iterateObject"),
            ctrlMeta = meta[tNode.ui];

        if (tNode.controlConfig && ctrlMeta && ctrlMeta.designer && ctrlMeta.designer.defaultConfig) {
            iter(ctrlMeta.designer.defaultConfig, function(val, prop) {
                if (tNode.controlConfig[prop] === undefined) {
                    tNode.controlConfig[prop] = val;
                }
            });
        }
    }

    /**
     * isGroupConfigUrl - test if specified config URL is group config
     *
     * @param {string} configUrl config URL
     * @returns {boolean} `true` if URL is group config, `false` else
     */
    function isGroupConfigUrl(configUrl) {
        return configUrl.indexOf("@") === 0 && configUrl.length > 1;
    }

    /**
     * getConfigTask - check template structure node for control-type & config. create load task in case config exists and return it
     *
     * @param {object} tNode template node
     * @returns {object|null} load task for configuration data or `null` if no valid configuration found
     */
    function getConfigTask(tNode) {
        var loadTask = null,
            tm = shmi.requires("visuals.task"),
            styles = shmi.requires("designer.client.styles"),
            fse = require('fs');

        if (tNode.controlType) {
            if (tNode.attributes["data-config-name"] && !isGroupConfigUrl(tNode.attributes["data-config-name"]) /* skip group configs */) {
                loadTask = tm.createTask("load config");
                loadTask.run = function() {
                    var fUrl = getWorkspaceUrl() + shmi.c("CONFIG_PATH") + tNode.attributes["data-config-name"] + shmi.c("CONFIG_EXT");
                    tNode.groupConfig = tNode.attributes["data-group-config"] || null; //save group config reference for later
                    fse.readFile(fUrl, "utf8", function(failed, data) {
                        if (!failed) {
                            tNode.controlConfig = JSON.parse(data);
                            delete tNode.controlConfig["config-name"];
                            if (tNode.ui) {
                                tNode.controlConfig["ui"] = tNode.ui;
                            }
                            if (tNode.controlConfig._designer_ && tNode.controlConfig._designer_.variant) {
                                tNode.variant = tNode.controlConfig._designer_.variant;
                            }
                            mergeConfig(tNode);
                            complementOptions(tNode);
                            if (fse.existsSync(fUrl)) {
                                fse.unlinkSync(fUrl);
                            } else {
                                console.info(MODULE_NAME, "config url not found:", fUrl, " already deleted config of control embedded into group?");
                            }
                        } else {
                            tNode.controlConfig = {};
                            if (tNode.ui) {
                                tNode.controlConfig["ui"] = tNode.ui;
                            }
                            mergeConfig(tNode);
                            complementOptions(tNode);
                            console.debug(MODULE_NAME, "config file not found:", fUrl);
                        }
                        styles.initStyle(tNode);
                        loadTask.complete();
                    });
                };
            } else {
                tNode.groupConfig = tNode.attributes["data-group-config"] || null; //save group config reference for later
                tNode.controlConfig = {};
                if (tNode.ui) {
                    tNode.controlConfig["ui"] = tNode.ui;
                }
                mergeConfig(tNode);
                complementOptions(tNode);
                styles.initStyle(tNode);
            }
        }
        return loadTask;
    }

    /**
     * loadModel - Load config files and remaining resources to complete template model
     * from templateStructure data.
     *
     * The callback method will provide the initially given templateStructure as an argument
     * that will also include loaded configs on each node (`controlConfig` property).
     *
     * @param  {object} templateStructure description
     * @param  {function} callback        description
     * @return {undefined}
     */
    module.loadModel = function loadModel(templateStructure, callback) {
        var cfgTasks = collectConfigs(templateStructure),
            tm = shmi.requires("visuals.task"),
            tl = null;
        if (cfgTasks.length) {
            tl = tm.createTaskList(cfgTasks, true);
            tl.onComplete = function() {
                console.debug(MODULE_NAME, "configs loaded");
                callback(templateStructure);
            };
            tl.run();
        } else {
            console.debug(MODULE_NAME, "no configs found");
            shmi.raf(function() {
                callback(templateStructure);
            });
        }
    };

    /**
     * generate - Generate a WebIQ HTML template from a template structure object.
     *
     * @param {object|object[]} templateStructure template structure object
     *
     * @returns {string} template HTML source
     */
    module.generate = function generate(templateStructure) {
        var root = document.createElement("DIV");

        if (Array.isArray(templateStructure)) {
            templateStructure.forEach(function(ts) {
                var templateElement = generateElement(ts);
                root.appendChild(templateElement);
            });
        } else {
            root.appendChild(generateElement(templateStructure));
        }

        return root.innerHTML;
    };

    // MODULE CODE - END

    fLog("module loaded");
})();
