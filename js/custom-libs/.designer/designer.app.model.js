/**
 * Module to load app model data from a WebIQ app.
 *
 * Layout data is loaded and parsed using `designer.template` and access provided
 * to individual node- and template data.
 *
 * @module designer/app/model
 */
(function() {
    var MODULE_NAME = "designer.app.model",
        module = shmi.pkg(MODULE_NAME);

    var templates = null,
        templatesBackend = {
            root: null
        },
        nodeMap = {},
        groupMap = {},
        nodeIds = {},
        groupIds = {},
        currentChanges = [],
        changeImmediate = null,
        ignoreModelChanges = false,
        NODEID_PREFIX = "node-",
        GROUPID_PREFIX = "group-";

    module.NODEID_PREFIX = NODEID_PREFIX;
    module.GROUPID_PREFIX = GROUPID_PREFIX;

    /**
     * generateId - generate identifier string
     *
     * @param {string} [prefix=NODEID_PREFIX]
     * @returns {string} ID string
     */
    function generateId(prefix = NODEID_PREFIX) {
        return prefix + Math.random().toString(36).substr(2, 16);
    }

    /**
     * getGroupId - generate & register unused node identifier
     *
     * @param {string} url group template URL
     * @returns {string} unused node ID
     */
    function getGroupId(url) {
        shmi.checkArg("url", url, "string");

        let idPrefix = GROUPID_PREFIX,
            urlParts = url.split("/"),
            groupId = urlParts[urlParts.length - 1];

        while (groupIds[groupId] !== undefined) {
            groupId = generateId(idPrefix);
        }

        groupIds[groupId] = {
            url: url
        };

        return groupId;
    }

    /**
     * getPrefix - get property path prefix
     *
     * @param {string} prefix existing prefix
     * @param {string} prop name of property to create path for
     * @returns {string} constructed property path
     */
    function getPrefix(prefix, prop) {
        if (prefix === null || prefix === undefined) {
            return prop;
        }

        if (String(parseInt(prop)) === prop) {
            return `${prefix}[${prop}]`;
        } else {
            return `${prefix}.${prop}`;
        }
    }

    /**
     * getChangeData - get data to save for specified node ID & change type
     *
     * @param {string} id node ID
     * @param {string} type change type, either `CHILDREN`, `CONFIG`, `STYLE` or `TEMPLATE`
     * @returns {object|null} change data to save or `null` if none was generated
     */
    function getChangeData(id, type) {
        var getNode = module.getNode,
            copyNode = shmi.requires("designer.app.control").copyNode,
            groupRef = null;

        switch (type) {
        case "CHILDREN":
            return {
                children: copyNode(id)
            };
        case "CONFIG":
            return {
                config: shmi.cloneObject(getNode(id).controlConfig)
            };
        case "STYLE":
            return {
                style: shmi.cloneObject(getNode(id).style)
            };
        case "TEMPLATE":
            return {
                template: copyNode(id)
            };
        case "GROUP":
            groupRef = shmi.visuals.session.groupConfig[id];
            return {
                group: groupRef ? shmi.cloneObject(groupRef) : null
            };
        default:
            return null;
        }
    }

    /**
     * emitModelChange - emit `designer.model-change` event in designer host application
     *
     */
    function emitModelChange() {
        var cState = shmi.requires("designer.c2c.client-state"),
            rpc = shmi.requires("designer.c2c.rpc"),
            paramChanges = shmi.cloneObject(currentChanges);

        changeImmediate = null;
        currentChanges = [];

        //RPC - open loading overlay on designer host
        rpc.remoteCall(function(data) {
            shmi.fire("designer.model-change", data, null);
            complete();
        }, function(status, pJid) {
            //changes submitted to designer host
        }, cState.getState().host, paramChanges);
    }

    /**
     * containsChange - tests if currently recorded change set already includes a change with equal node-ID & change-type
     *
     * @param {object} change change object
     * @returns {boolean} `true` if similar change already contained in current change set, `false` else
     */
    function containsChange(change) {
        return currentChanges.some(function(c, idx) {
            return change.id === c.id && change.type === c.type;
        });
    }

    /**
     * recordChange - record change of specified type for specified node ID
     *
     * @param {string} id node ID
     * @param {string} type change type
     * @returns {undefined}
     */
    function recordChange(id, type) {
        var changeObject = null,
            data = null;

        if (ignoreModelChanges) {
            return;
        }

        data = getChangeData(id, type);

        if (!data) {
            return;
        }

        changeObject = {
            id: id,
            type: type,
            data: data,
            ts: Date.now()
        };

        if (!containsChange(changeObject)) {
            currentChanges.push(changeObject);
            if (changeImmediate === null) {
                changeImmediate = setImmediate(emitModelChange);
            }
        }
    }

    /**
     * recordGroupChange - record group config before changed
     *
     * @param {string} id group ID
     */
    module.recordGroupChange = function recordGroupChange(id) {
        recordChange(id, "GROUP");
    };

    /**
     * createModelProxy - create outermost proxy for access to backend template data
     *
     * @param {object} target backend data object
     * @returns {Proxy} access proxy to app model data
     */
    function createModelProxy(target) {
        //.. implement proxy for model object (template storage / backend) => record added/removed templates
        var iter = shmi.requires("visuals.tools.iterate").iterateObject,
            isProxy = require("util").types.isProxy,
            handler = null;

        iter(target, function(template, name) {
            if (typeof template === "object" && template !== null && !isProxy(template)) {
                target[name] = createTemplateProxy(template, name);
            }
        });

        handler = {

            /**
             * get - retrieve property value of target data
             *
             * @param {object} t target data
             * @param {string} p property name
             * @returns
             */
            get(t, p) {
                return t[p];
            },
            /**
             * set - set property value of target data
             *
             * @param {object} t target data
             * @param {string} p property name
             * @param {any} v data value to set
             * @returns
             */
            set(t, p, v) {
                if (v !== null && typeof v === "object" && !isProxy(v)) {
                    t[p] = createTemplateProxy(v, p);
                } else {
                    t[p] = v;
                }

                return true;
            },
            /**
             * deleteProperty - delete property of target data
             *
             * @param {object} t target data
             * @param {string} p property name
             * @returns {boolean} `true` if property was found and deleted, `false` else
             */
            deleteProperty(t, p) {
                if (t[p] !== undefined) {
                    delete t[p];
                    return true;
                }
                return false;
            }
        };

        return new Proxy(target, handler);
    }

    /**
     * createTemplateProxy - create proxy access for template element of app model
     *
     * @param {object[]} target template backend data
     * @param {string} tName name of template
     * @returns {Proxy} proxy to access template data
     */
    function createTemplateProxy(target, tName) {
        //.. implement proxy for template objects (direct descendants of `templatesBackend`) => reinstance layout
        var isProxy = require("util").types.isProxy,
            handler = null;

        target.forEach(function(node, idx) {
            if (!isProxy(node)) {
                target[idx] = createNodeProxy(node, node.id);
            }
        });

        handler = {
            /**
             * get - retrieve property value of target data
             *
             * @param {object} t target data
             * @param {string} p property name
             * @returns
             */
            get(t, p) {
                return t[p];
            },
            /**
             * set - set property value of target data
             *
             * @param {object} t target data
             * @param {string} p property name
             * @param {any} v data value to set
             * @returns
             */
            set(t, p, v) {
                recordChange(tName, "TEMPLATE");
                if (v !== null && typeof v === "object" && !isProxy(v)) {
                    t[p] = createNodeProxy(v, v.id);
                } else {
                    t[p] = v;
                }

                return true;
            },
            /**
             * deleteProperty - delete property of target data
             *
             * @param {object} t target data
             * @param {string} p property name
             * @returns {boolean} `true` if property was found and deleted, `false` else
             */
            deleteProperty(t, p) {
                if (t[p] !== undefined) {
                    recordChange(tName, "TEMPLATE");
                    delete t[p];
                    return true;
                }
                return false;
            }
        };

        return new Proxy(target, handler);
    }

    /**
     * createNodeProxy - create proxy access for node element of app model
     *
     * @param {object} target node object
     * @param {string} id node ID
     * @returns {Proxy} proxy to access node data
     */
    function createNodeProxy(target, id) {
        //.. implement proxy for node objects (descendants of template objects) => reinstance parent template
        var isProxy = require("util").types.isProxy,
            handler = null;

        if (!(typeof target.type === "number" && typeof target.controlType === "number")) {
            return target;
        }

        if (Array.isArray(target.children)) {
            target.children.forEach(function(child, idx) {
                if (!isProxy(child)) {
                    target.children[idx] = createNodeProxy(child, child.id);
                }
            });
        }

        if (target.controlConfig && !isProxy(target.controlConfig)) {
            target.controlConfig = createConfigProxy(target.controlConfig, id);
        }

        if (target.style && !isProxy(target.style)) {
            target.style = createStyleProxy(target.style, id);
        }

        if (Array.isArray(target.children) && !isProxy(target.children)) {
            target.children = createChildrenProxy(target.children, id);
        }

        handler = {
            /**
             * get - retrieve property value of target data
             *
             * @param {object} t target data
             * @param {string} p property name
             * @returns
             */
            get(t, p) {
                switch (p) {
                case "controlConfig":
                    if (t[p] !== null && typeof t[p] === "object" && !isProxy(t[p])) {
                        t[p] = createConfigProxy(target.controlConfig, id);
                    }
                    break;
                case "style":
                    if (t[p] !== null && typeof t[p] === "object" && !isProxy(t[p])) {
                        t[p] = createStyleProxy(target.style, id);
                    }
                    break;
                case "children":
                    if (t[p] !== null && typeof t[p] === "object" && !isProxy(t[p])) {
                        t[p] = createChildrenProxy(target.children, id);
                    }
                    break;
                default:
                }

                return t[p];
            },
            /**
             * set - set property value of target data
             *
             * @param {object} t target data
             * @param {string} p property name
             * @param {any} v data value to set
             * @returns
             */
            set(t, p, v) {
                switch (p) {
                case "controlConfig":
                    if (v !== null && typeof v === "object" && !isProxy(v)) {
                        t[p] = createConfigProxy(v, id);
                    } else {
                        t[p] = v;
                    }
                    break;
                case "style":
                    if (v !== null && typeof v === "object" && !isProxy(v)) {
                        t[p] = createStyleProxy(v, id);
                    } else {
                        t[p] = v;
                    }
                    break;
                case "children":
                    if (v !== null && typeof v === "object" && !isProxy(v)) {
                        t[p] = createChildrenProxy(v, id);
                    } else {
                        t[p] = v;
                    }
                    break;
                default:
                    t[p] = v;
                }

                return true;
            }
        };

        return new Proxy(target, handler);
    }

    /**
     * createChildrenProxy - create proxy access for children array of node elements
     *
     * @param {object[]} target children array of node
     * @param {string} nodeId node ID
     * @returns {Proxy} proxy to access children of a node
     */
    function createChildrenProxy(target, nodeId) {
        //.. implement proxy to check for modified node children (ADD/REMOVE)
        var isProxy = require("util").types.isProxy,
            handler = null;

        target.forEach(function(node, idx) {
            if (typeof node.id === "string" && !isProxy(node)) {
                target[idx] = createNodeProxy(node, node.id);
            }
        });

        handler = {
            /**
             * get - retrieve property value of target data
             *
             * @param {object} t target data
             * @param {string} p property name
             * @returns
             */
            get(t, p) {
                if (!isProxy(t[p]) && t[p] !== null && typeof t[p] === "object") {
                    t[p] = createNodeProxy(t[p], t[p].id);
                }
                return t[p];
            },
            /**
             * set - set property value of target data
             *
             * @param {object} t target data
             * @param {string} p property name
             * @param {any} v data value to set
             * @returns
             */
            set(t, p, v) {
                recordChange(nodeId, "CHILDREN");
                if (v !== null && typeof v === "object" && !isProxy(v)) {
                    t[p] = createNodeProxy(v, v.id);
                } else {
                    t[p] = v;
                }

                return true;
            },
            /**
             * deleteProperty - delete property of target data
             *
             * @param {object} t target data
             * @param {string} p property name
             * @returns {boolean} `true` if property was found and deleted, `false` else
             */
            deleteProperty(t, p) {
                if (t[p] !== undefined) {
                    recordChange(nodeId, "CHILDREN");
                    delete t[p];
                    return true;
                }
                return false;
            }
        };

        return new Proxy(target, handler);
    }

    /**
     * createConfigProxy - create proxy access for node configuration objects
     *
     * Nested proxies are created for nested object type properties.
     *
     * @param {object} target node configuration
     * @param {string} nodeId node ID
     * @param {string} prefix prefix for property paths
     * @returns {Proxy} proxy to access node configuration data
     */
    function createConfigProxy(target, nodeId, prefix) {
        //.. implement proxy for configuration objects (config of nodes) => reinstance node
        var isProxy = require("util").types.isProxy,
            handler = null;

        handler = {
            /**
             * get - retrieve property value of target data
             *
             * @param {object} t target data
             * @param {string} p property name
             * @returns
             */
            get(t, p) {
                if (p !== "_designer_" && !isProxy(t[p]) && t[p] !== null && typeof t[p] === "object") {
                    t[p] = createConfigProxy(t[p], nodeId, getPrefix(prefix, p));
                }
                return t[p];
            },
            /**
             * set - set property value of target data
             *
             * @param {object} t target data
             * @param {string} p property name
             * @param {any} v data value to set
             * @returns
             */
            set(t, p, v) {
                var changed = false;

                if (typeof t[p] === "object") {
                    if (JSON.stringify(t[p]) !== JSON.stringify(v)) {
                        changed = true;
                    }
                } else if (t[p] !== v) {
                    changed = true;
                }

                if (changed) {
                    recordChange(nodeId, "CONFIG");
                    if (p !== "_designer_" && v !== null && typeof v === "object" && !isProxy(v)) {
                        t[p] = createConfigProxy(v, nodeId, getPrefix(prefix, p));
                    } else {
                        t[p] = v;
                    }
                }

                return true;
            },
            /**
             * deleteProperty - delete property of target data
             *
             * @param {object} t target data
             * @param {string} p property name
             * @returns {boolean} `true` if property was found and deleted, `false` else
             */
            deleteProperty(t, p) {
                if (t[p] !== undefined) {
                    recordChange(nodeId, "CONFIG");
                    delete t[p];
                    return true;
                }
                return false;
            }
        };

        return new Proxy(target, handler);
    }

    /**
     * createStyleProxy - create proxy access for node style data
     *
     * @param {object} target node style data
     * @param {string} nodeId node ID
     * @param {string} prefix prefix for property paths
     * @returns {Proxy} proxy to access node style data
     */
    function createStyleProxy(target, nodeId, prefix) {
        //.. implement proxy for style objects (styling of nodes) => rebuild & reapply node styles
        var isProxy = require("util").types.isProxy,
            handler = null;

        handler = {
            /**
             * get - retrieve property value of target data
             *
             * @param {object} t target data
             * @param {string} p property name
             * @returns
             */
            get(t, p) {
                if (!isProxy(t[p]) && t[p] !== null && typeof t[p] === "object") {
                    t[p] = createStyleProxy(t[p], nodeId, getPrefix(prefix, p));
                }
                return t[p];
            },
            /**
             * set - set property value of target data
             *
             * @param {object} t target data
             * @param {string} p property name
             * @param {any} v data value to set
             * @returns
             */
            set(t, p, v) {
                var changed = false;

                if (typeof t[p] === "object") {
                    if (JSON.stringify(t[p]) !== JSON.stringify(v)) {
                        changed = true;
                    }
                } else if (t[p] !== v) {
                    changed = true;
                }

                if (changed) {
                    recordChange(nodeId, "STYLE");
                    if (v !== null && typeof v === "object" && !isProxy(v)) {
                        t[p] = createStyleProxy(v, nodeId, getPrefix(prefix, p));
                    } else {
                        t[p] = v;
                    }
                }

                return true;
            },
            /**
             * deleteProperty - delete property of target data
             *
             * @param {object} t target data
             * @param {string} p property name
             * @returns
             */
            deleteProperty(t, p) {
                if (typeof t[p] !== "undefined") {
                    recordChange(nodeId, "STYLE");
                    delete t[p];
                }

                return true;
            }
        };

        return new Proxy(target, handler);
    }

    /**
     * initTemplateProxy - initialize proxies for backend template data
     *
     */
    function initTemplateProxy() { //templatesBackend => object with template arrays as properties
        templates = createModelProxy(templatesBackend);
    }

    /**
     * getNodeId - generate & register unused node identifier
     *
     * @param {string} [initialNodeId] optional initial node ID to try
     * @returns {string} unused node ID
     */
    function getNodeId(initialNodeId) {
        var nodeId = (typeof initialNodeId === "string") ? initialNodeId : generateId();
        while (nodeIds[nodeId] !== undefined) {
            nodeId = generateId();
        }
        nodeIds[nodeId] = true;
        return nodeId;
    }

    /**
     * insertNodeIds - set node-IDs and dependent properties on template structure
     *
     * @param {object[]} templateStructure node data array
     * @param {string} templateId template ID
     * @param {string|null} parentId parent ID
     * @param {string|null} [groupId] group ID
     */
    function insertNodeIds(templateStructure, templateId, parentId, groupId = null) {
        var templ = shmi.requires("designer.template");
        templateStructure.forEach(function(nodeInfo) {
            if (nodeInfo.type === templ.elementTypes.NODE_ELEMENT) {
                if (nodeInfo.attributes._nodeid && (nodeMap[nodeInfo.attributes._nodeid] === undefined)) {
                    nodeInfo.id = nodeInfo.attributes._nodeid;
                    nodeIds[nodeInfo.id] = true;
                } else {
                    nodeInfo.id = getNodeId();
                }

                if (groupId) {
                    if (!nodeInfo.attributes["data-group-config"]) {
                        nodeInfo.attributes["data-group-config"] = `@${nodeInfo.id}`;
                    }
                    nodeInfo.groupConfig = nodeInfo.attributes["data-group-config"];
                }

                nodeInfo.parentGroupId = groupId || null;
                nodeMap[nodeInfo.id] = nodeInfo;
                nodeInfo.attributes._nodeid = nodeInfo.id;
                nodeInfo.parent = parentId ? parentId : null;
                nodeInfo.template = templateId;
                if (Array.isArray(nodeInfo.children)) {
                    insertNodeIds(nodeInfo.children, templateId, nodeInfo.id, groupId);
                }
            }
        });
    }

    /**
     * storeConfig - put control config into storage & set config-URL option accordingly
     *
     * @param {object} nodeInfo node data
     */
    function storeConfig(nodeInfo) {
        nodeInfo.attributes["data-config-name"] = module.makeConfigUrl(nodeInfo.id);
        shmi.putResource(JSON.stringify(nodeInfo.controlConfig), nodeInfo.attributes["data-config-name"]);
    }

    /**
     * setContentUrl - set content-template option for control configs
     *
     * @param {object} nodeInfo node data
     */
    function setContentUrl(nodeInfo) {
        var cfg = nodeInfo.controlConfig,
            meta = shmi.requires("visuals.meta.controls"),
            cProps = meta[nodeInfo.ui].designer.containerProperties;

        cfg[cProps.contentURLOptionName] = module.makeTemplateUrl(nodeInfo.groupId ? nodeInfo.groupId : nodeInfo.id);
    }

    /**
     * getTemplateUrls - extract content-template URLs from template structure; also stores config data
     *
     * @param {object[]} templateStructure template data
     * @param {string[]} [templateUrls] existing template URLs (used for recursion)
     * @returns {string[]} extracted template URLs
     */
    function getTemplateUrls(templateStructure, templateUrls) {
        var controlMeta = shmi.requires("visuals.meta.controls");
        templateUrls = templateUrls || [];
        templateStructure.forEach(function(nodeInfo, idx) {
            var meta = controlMeta[nodeInfo.ui],
                url = null;
            if (meta && meta.designer && meta.designer.containerProperties && meta.designer.containerProperties.saveContent && nodeInfo.controlConfig) {
                url = nodeInfo.controlConfig[meta.designer.containerProperties.contentURLOptionName] || null;
            }
            if (url !== null) {
                if (nodeInfo.ui === "group") {
                    if (groupMap[url] === undefined) {
                        groupMap[url] = {
                            id: getGroupId(url),
                            nodes: []
                        };
                    }
                    groupMap[url].nodes.push(nodeInfo.id);
                    nodeInfo.groupId = groupMap[url].id;
                    nodeInfo.controlConfig.groupId = nodeInfo.groupId;
                }
                setContentUrl(nodeInfo);
                templateUrls.push([nodeInfo.id, shmi.c("TEMPLATE_PATH") + url + shmi.c("TEMPLATE_EXT"), nodeInfo.ui, nodeInfo.groupId ? nodeInfo.groupId : null]);
            }

            if (nodeInfo.controlConfig) {
                storeConfig(nodeInfo);
            }

            if (Array.isArray(nodeInfo.children)) {
                getTemplateUrls(nodeInfo.children, templateUrls);
            }
        });
        return templateUrls;
    }

    /**
     * loadStructures - recursively load layout structure from html layout
     *
     * @param {string} url template url
     * @param {string} nodeId node ID
     * @param {string|null} uiType node ui-type or `null` if not applicable
     * @param {object} rc ref counter
     * @param {string[]} [loadedUrls] urls already loaded (used for recursion)
     * @param {string} [groupId=null] group ID
     * @param {string} [parentGroupId=null] parent group ID
     */
    function loadStructures(url, nodeId, uiType, rc, loadedUrls, groupId = null, parentGroupId = null) {
        var templ = shmi.requires("designer.template"),
            layoutStructure = null,
            lUrls = loadedUrls || [];

        rc.start();
        shmi.loadResource(url, function(data, failed, furl) {
            if (!failed) {
                if (groupId && templatesBackend[groupId]) {
                    rc.complete();
                    return; //group already parsed
                }
                lUrls.push(url);
                layoutStructure = templ.parse(data, groupId);
                insertNodeIds(layoutStructure, groupId ? groupId : nodeId, null, groupId || parentGroupId);
                templatesBackend[groupId ? groupId : nodeId] = layoutStructure;
                layoutStructure.parent = {
                    ui: uiType,
                    id: nodeId,
                    group: groupId ? groupId : null
                };

                templ.loadModel(layoutStructure, function() {
                    var tUrls = getTemplateUrls(layoutStructure);
                    if (tUrls.length) {
                        tUrls.forEach(function(tu) {
                            loadStructures(tu[1], tu[0], tu[2], rc, lUrls, tu[3], groupId);
                        });
                    }
                    rc.complete();
                });
            } else {
                console.error(MODULE_NAME, "failed to load:", furl);
                rc.complete();
            }
        });
    }

    /**
     * makeConfigUrl - create config URL from resource ID
     *
     * @param {string} resId resource ID
     * @returns {string} config URL
     */
    module.makeConfigUrl = function makeConfigUrl(resId) {
        return `${shmi.c("RES_URL_PREFIX")}${resId}/config`;
    };

    /**
     * makeTemplateUrl - create template URL from resource ID
     *
     * @param {string} resId resource ID
     * @returns {string} template URL
     */
    module.makeTemplateUrl = function makeTemplateUrl(resId) {
        return `${shmi.c("RES_URL_PREFIX")}${resId}/template`;
    };

    /**
     * getGroupMetaPath - get path to group meta data
     *
     * @returns {string} path to group meta data
     */
    function getGroupMetaPath() {
        const path = require("path"),
            nodeFs = shmi.requires("designer.tools.nodeFs"),
            groupConfigDir = [nodeFs.getLocalWorkspacePath(), "json", "groups"].join(path.sep);

        return [groupConfigDir, "config.json"].join(path.sep);
    }

    /**
     * loadGroupMeta - load group meta data from filesystem
     *
     * @returns {object} group meta data
     */
    function loadGroupMeta() {
        const fs = require("fs");

        try {
            return JSON.parse(fs.readFileSync(getGroupMetaPath(), 'utf8'));
        } catch (exc) {
            console.error("Error parsing group configuration:", exc);
            return {};
        }
    }

    /**
     * loadLayout - load app model data from specified layout url (HTML-entrypoint).
     *
     * @param  {string} layoutUrl layout URL
     * @param  {function} callback  callback to run on completion
     * @return {undefined}
     */
    module.loadLayout = function loadLayout(layoutUrl, callback) {
        const rc = shmi.requires("designer.tools.refCounter").get(),
            iter = shmi.requires("visuals.tools.iterate").iterateObject,
            groupMeta = loadGroupMeta(),
            loadedUrls = [];

        rc.onComplete = function() {
            initTemplateProxy();
            ignoreModelChanges = false;
            callback(templates, loadedUrls);
        };
        rc.onChange = function(progress) {
            shmi.fire("designer.editCLient.loadLayout", {
                current: progress.current,
                total: progress.total
            }, module);
        };
        nodeIds = {};
        nodeMap = {};
        templatesBackend = {
            root: null
        };

        ignoreModelChanges = true;
        loadStructures(layoutUrl, "root", null, rc, loadedUrls);
        if (groupMeta) {
            iter(groupMeta, (data, groupId) => {
                const configUrl = `content/group/${groupId}`;
                loadStructures(`templates/${configUrl}.html`, groupId, "group", rc, loadedUrls, groupId, null);
                if (groupMap[configUrl] === undefined) {
                    groupMap[configUrl] = {
                        id: groupId,
                        nodes: []
                    };
                    groupIds[groupId] = {
                        url: configUrl
                    };
                }
            });
        }
    };

    /**
     * getTemplate - Retrieve template data associated with specified node-ID.
     *
     * @param  {string} nodeId node-ID
     * @return {object}        template data
     */
    module.getTemplate = function getTemplate(nodeId) {
        return templates[nodeId] || null;
    };

    /**
     * getTemplates - Retrieve template storage object.
     *
     * Used to provide access to all parsed templates.
     *
     * @return {object}  template data
     */
    module.getTemplates = function getTemplates() {
        return templates;
    };

    /**
     * getNode - Retrieve node data associated with specified node-ID.
     *
     * @param  {string} nodeId node-ID
     * @return {object}        node data
     */
    module.getNode = function getNode(nodeId) {
        if (typeof nodeId === "string" && nodeId.indexOf("@") !== -1) {
            nodeId = nodeId.split("@")[0];
        }
        return nodeMap[nodeId] || null;
    };

    /**
     * getNodes - Retrieve nodes storage object.
     *
     * @return {object}  node data
     */
    module.getNodes = function getNodes() {
        return nodeMap;
    };

    /**
     * mapNode - create map object of all nested nodes
     *
     * @param {object} node node to map
     * @param {object} [mapData] map object to generate into
     * @returns {object} map object
     */
    module.mapNode = function mapNode(node, mapData) {
        mapData = mapData || {};
        nodeMap[node.id] = node;
        nodeIds[node.id] = true;
        mapData[node.id] = node;
        if (Array.isArray(node.children)) {
            node.children.forEach(function(childNode) {
                module.mapNode(childNode, mapData);
            });
        }
        return mapData;
    };

    /**
     * setAndStoreConfigUrl - update url of config file & store content in resource manager
     *
     * @param {object} node node data
     */
    function setAndStoreConfigUrl(node) {
        var cfg = node.controlConfig;

        if (!cfg) {
            cfg = {
                ui: node.ui
            };
            node.controlConfig = cfg;
        }
        node.attributes["data-config-name"] = module.makeConfigUrl(node.id);
        shmi.putResource(JSON.stringify(node.controlConfig), node.attributes["data-config-name"]);
    }

    /**
     * setContentTemplateUrl - update url of content template
     *
     * @param {object} node node data
     */
    function setContentTemplateUrl(node) {
        var cfg = node.controlConfig,
            meta = shmi.requires("visuals.meta.controls"),
            controlMeta = meta[node.ui],
            cProps = null;

        if (!cfg) {
            cfg = {
                ui: node.ui
            };
            node.controlConfig = cfg;
        }

        if (controlMeta) {
            cProps = controlMeta.designer.containerProperties;
            if (cProps && cProps.contentURLOptionName) {
                cfg[cProps.contentURLOptionName] = module.makeTemplateUrl(node.groupId ? node.groupId : node.id);
            }
        }
    }

    /**
     * setTemplates - set template data of loaded app
     *
     * @param {object} tData template data
     */
    module.setTemplates = function setTemplates(tData) {
        var iter = shmi.requires("visuals.tools.iterate.iterateObject");

        ignoreModelChanges = true;

        templatesBackend = {
            root: null
        };
        nodeMap = {};
        nodeIds = {};

        iter(tData, function(val, prop) {
            val.forEach(function(node, idx) {
                module.mapNode(node);
            });
            templatesBackend[prop] = val;
        });
        iter(nodeMap, function(val, prop) {
            if (val.ui) {
                setContentTemplateUrl(val);
                setAndStoreConfigUrl(val);
            }
        });
        initTemplateProxy();
        ignoreModelChanges = false;
    };

    /**
     * getControlInstance - get control instance by node-id
     *
     * @param {string} nodeId node ID
     * @returns {object|null} control instance or `null` if no match found
     */
    module.getControlInstance = function getControlInstance(nodeId) {
        var node = module.getNode(nodeId),
            elem = null,
            ctrl = null;

        if (node) {
            elem = module.getNodeElement(nodeId);
            if (elem) {
                ctrl = shmi.getControlByElement(elem);
            }
        }

        return ctrl;
    };

    /**
     * getNodeElement - get element corresponding to specified node handle
     *
     * @param {string} nodeHandle node handle
     * @returns {HTMLElement|null} element or `null` if none found
     */
    module.getNodeElement = function getNodeElement(nodeHandle) {
        if (typeof nodeHandle === "string") {
            const selector = nodeHandle.split("@").map(
                (handlePart) => `[_nodeid=${handlePart}]`
            );
            selector.reverse();
            return selector.length ? document.querySelector(selector.join(" ")) : null;
        }
        return null;
    };

    /**
     * getNodeId - get and register unused node-ID
     *
     * @param {string} [initialNodeId] optional initial node ID to try
     * @return {string} node identifier
     */
    module.getNodeId = getNodeId;

    /**
     * getNodeIds - access map of used node IDs
     *
     * @returns {object} node ID map
     */
    module.getNodeIds = function() {
        return nodeIds;
    };

    /**
     * ignoreChanges - set if changes to model should be ignored
     *
     * @param {boolean} ignore `true` to ignore model changes, `false` to consider them
     */
    module.ignoreChanges = function ignoreChanges(ignore) {
        ignoreModelChanges = ignore;
    };

    /**
     * isAncestor - test if child node-ID is ancestor of parent node-ID
     *
     * @param {string} parentHandle parent node-handle
     * @param {string} childHandle child node-handle
     *
     * @returns {boolean} true if `cn` is ancestor of `pn`, `false` else
     */
    module.isAncestor = function isAncestor(parentHandle, childHandle) {
        let childNode = null;

        if ((parentHandle === null) || (childHandle === null)) {
            throw new Error("parent and child nodes need to be specified");
        }

        while (childHandle !== parentHandle) {
            childNode = module.getNode(childHandle);
            // If child node does not exist or the node is the root, stop.
            if (!childNode || ((typeof childNode.parent !== "string") && (childNode.template === "root"))) {
                return false;
            }

            if (!childNode.parent && childNode.parentGroupId) {
                let groups = module.getGroupInstances(childNode.parentGroupId);
                if (groups) {
                    return groups.some((groupNodeId) => module.isAncestor(parentHandle, groupNodeId));
                } else {
                    return false;
                }
            } else {
                childHandle = module.getNode(childNode.parent || childNode.template).id;
            }
        }

        return true;
    };

    /**
     * checkAndSetProxies - check if node object has all required proxies, create them if necessary
     *
     * @param {object} node node data
     */
    function checkAndSetProxies(node) {
        var isProxy = require("util").types.isProxy;

        if (node && typeof node === "object" && typeof node.controlType === "number") {
            if (node.controlConfig !== null && typeof node.controlConfig === "object" && !isProxy(node.controlConfig)) {
                node.controlConfig = createConfigProxy(node.controlConfig, node.id);
            }

            if (node.style !== null && typeof node.style === "object" && !isProxy(node.style)) {
                node.style = createStyleProxy(node.style, node.id);
            }

            if (node.children !== null && Array.isArray(node.children) && !isProxy(node.children)) {
                node.children = createChildrenProxy(node.children, node.id);
            }
        }
    }

    /**
     * updateNodeProxies - update required proxies an specified list of node IDs or all nodes when no IDs are specified
     *
     * @param {string[]} [customIds] node IDs to update
     */
    module.updateNodeProxies = function updateNodeProxies(customIds) {
        var iter = shmi.requires("visuals.tools.iterate").iterateObject;

        if (Array.isArray(customIds)) {
            customIds.forEach(function(id) {
                checkAndSetProxies(module.getNode(id));
            });
        } else {
            iter(nodeMap, checkAndSetProxies);
        }
    };

    /**
     * getParentGroup - get node info of parent group
     *
     * @param {string} nodeId node ID
     * @returns {string|null} parent group ID or `null` if none was found
     */
    module.getParentGroup = function getParentGroup(nodeId) {
        let n = module.getNode(nodeId),
            group = null;

        if (n && n.parentGroupId) {
            group = n.parentGroupId;
        } else if (n && n.groupId) {
            group = n.groupId;
        }

        return group;
    };

    /**
     * getGroupInstances - get node IDs of group instances for specified group ID
     *
     * @param {string} groupId group ID
     * @returns {string[]|null} array of group instance node IDs or `null` if none were found
     */
    module.getGroupInstances = function getGroupInstances(groupId) {
        let urlInfo = groupIds[groupId];
        return (urlInfo && groupMap[urlInfo.url]) ? groupMap[urlInfo.url].nodes : null;
    };

    /**
     * getNodeHandle - get node handle to identify specified control / control base-element
     *
     * @param {HTMLElement|Control} param either base HTMLElement of control instance or control instance
     * @returns {string} node handle
     */
    module.getNodeHandle = function getNodeHandle(param) {
        let nodeId = null,
            parts = [],
            element = null;

        if (param instanceof HTMLElement) {
            element = param;
        } else if (param && param.uiType) {
            element = param.element;
        }

        if (element) {
            nodeId = element.getAttribute("_nodeid");
        }

        if (nodeId) {
            parts.push(nodeId);
            element = element.parentNode;
            while (element && element !== document.body) {
                if (element.getAttribute("data-ui") === "group") {
                    parts.push(element.getAttribute("_nodeid"));
                }
                element = element.parentNode;
            }

            return parts.join("@");
        } else {
            return null;
        }
    };

    /**
     * getGroupMap - access group data storage
     *
     * @returns {object} group data storage
     */
    module.getGroupMap = function getGroupMap() {
        return groupMap;
    };

    /**
     * getGroupIds - access group ID storage
     *
     * @returns {object} group ID storage
     */
    module.getGroupIds = function getGroupIds() {
        return groupIds;
    };

    /**
     * getGroupId - generate & register unused node identifier
     *
     * @param {string} url group template URL
     * @returns {string} unused node ID
     */
    module.getGroupId = getGroupId;

    /**
     * getParentHandle - get handle of parent control from node-handle.
     * An instance of matching specified node-handle must be live to determine the parent handle.
     *
     * @param {string} nodeHandle node handle
     * @returns {string|null} parent node handle or `null` if none could be determined
     */
    module.getParentHandle = function getParentHandle(nodeHandle) {
        var model = shmi.requires("designer.app.model"),
            control = null;

        control = model.getControlInstance(nodeHandle);
        if (control) {
            let parent = control.getParent(),
                parentNode = parent ? model.getNode(model.getNodeHandle(parent)) : null,
                controlTypes = shmi.requires("designer.template").controlTypes;

            while (parentNode && [controlTypes.SINGLE_TEMPLATE, controlTypes.VIEW_TEMPLATE].indexOf(parentNode.controlType) === -1) {
                parent = parent.getParent();
                if (parent && parent.element.getAttribute("_nodeid") === null) {
                    parent = parent.getParent();
                    if (parent && parent.element.getAttribute("_nodeid") !== null) {
                        parentNode = model.getNode(model.getNodeHandle(parent));
                    }
                } else {
                    parentNode = parent ? model.getNode(model.getNodeHandle(parent)) : null;
                }
            }
            if (parentNode) {
                return model.getNodeHandle(parent);
            }
        }
        return null;
    };

    /**
     * getHieararchy - retrieve hierarchy data for specified template & node handle
     *
     * @param {string} template template ID
     * @param {string} handle base node handle
     * @param {function} callback function to call on completion
     * @param {string} [restoreViewHandle=null] optional view-handle to wait for when view has to be restored
     */
    module.getHierarchy = function getHierarchy(template, handle, callback, restoreViewHandle = null) {
        const appControl = shmi.requires("designer.app.control");
        if (appControl.waitingForRestore()) {
            appControl.onRestore(() => {
                module.getHierarchy(template, handle, callback, restoreViewHandle);
            });
            return;
        }

        var model = module,
            tName = template || "root",
            rootNode = model.getNode(handle ? handle : template),
            rootControl = null,
            templateControl = null,
            templateData = model.getTemplates()[tName],
            activeIndex = 0,
            answer = {
                activeView: null,
                rootNode: null,
                data: templateData,
                handle: handle ? handle : null
            };

        if (rootNode && templateData) {
            answer.rootNode = rootNode;
            if (rootNode.controlType === 3 /* VIEW_TEMPLATE */) {
                answer.activeView = {
                    index: -1,
                    id: null,
                    viewCount: 0,
                    views: []
                };
                rootControl = model.getControlInstance(handle ? handle : rootNode.id);
                if (rootControl !== null) {
                    shmi.onActive([rootControl], function onActive() {
                        templateData.forEach(function(cn) {
                            var cName = null,
                                nameParts = null,
                                viewHandle = cn.id;

                            if (cn.ui === "view") {
                                cName = cn.controlConfig ? cn.controlConfig.name || cn.attributes["data-name"] || cn.ui : cn.attributes["data-name"] || cn.ui;
                                nameParts = cName.split(".");
                                cName = nameParts[nameParts.length - 1];
                                if (handle) {
                                    let handleParts = handle.split("@");
                                    if (handleParts.length > 1) {
                                        handleParts = handleParts.slice(1);
                                        viewHandle = `${cn.id}@${handleParts.join("@")}`;
                                    }
                                }
                                templateControl = model.getControlInstance(viewHandle);
                                if (templateControl && templateControl.isActive()) {
                                    answer.activeView.index = activeIndex;
                                    answer.activeView.id = cn.id;
                                }
                                answer.activeView.views.push([cn.id, cName]);
                                activeIndex += 1;
                            }
                        });
                        answer.activeView.viewCount = activeIndex;
                        if (answer.activeView.index !== -1) {
                            callback(answer);
                        } else {
                            activeIndex = 0;
                            var navTok = shmi.listen("enable", function(evt) {
                                if (evt.detail.name.indexOf(rootControl.getName() + ".") === 0) {
                                    navTok.unlisten();
                                    templateData.forEach(function(cn) {
                                        if (cn.ui === "view") {
                                            templateControl = model.getControlInstance(cn.id);
                                            if (templateControl && templateControl.isActive()) {
                                                answer.activeView.index = activeIndex;
                                                answer.activeView.id = cn.id;
                                            }
                                            activeIndex += 1;
                                        }
                                    });
                                    answer.activeView.viewCount = activeIndex;
                                    callback(answer);
                                }
                            }, { "source.uiType": "view" });
                        }
                    });
                } else {
                    callback(null);
                }
            } else {
                callback(answer);
            }
        } else {
            callback(answer);
        }
    };

    /**
     * addChildNode - add child node to parent
     *
     * @param {object} parentNode parent node data
     * @param {object} n child node data
     */
    function addChildNode(parentNode, n) {
        if (n.ui) {
            let childNode = {
                    ui: n.ui,
                    id: n.id,
                    gid: n.groupId ? n.groupId : null,
                    groupConfig: n.groupConfig || null,
                    name: n.controlConfig && n.controlConfig.name ? n.controlConfig.name : n.ui,
                    variant: n.variant ? n.variant : null,
                    children: []
                },
                controlTypes = shmi.requires("designer.template").controlTypes;

            parentNode.children.push(childNode);
            if (n.children && n.children.length) {
                addChildren(childNode, n.children);
            } else if ([controlTypes.SINGLE_TEMPLATE, controlTypes.VIEW_TEMPLATE].includes(n.controlType)) {
                addTemplate(childNode, n.groupId ? n.groupId : n.id);
            }
        }
    }

    /**
     * addTemplate - add template tree data
     *
     * @param {object} parentNode parent node data
     * @param {string} template template ID
     */
    function addTemplate(parentNode, template) {
        let model = shmi.requires("designer.app.model"),
            gTemplate = model.getTemplate(template);

        gTemplate.forEach(function(n) {
            addChildNode(parentNode, n);
        });
    }

    /**
     * addChildren - add children to parent node
     *
     * @param {object} parentNode parent node data
     * @param {object[]} children array of child nodes
     */
    function addChildren(parentNode, children) {
        children.forEach(function(n) {
            addChildNode(parentNode, n);
        });
    }

    /**
     * getNodeTree - get node sub-tree
     *
     * @param {string} nodeHandle node handle
     * @returns {object} node sub-tree
     */
    module.getNodeTree = function getNodeTree(nodeHandle) {
        let baseNode = module.getNode(nodeHandle),
            root = null;

        if (baseNode !== null) {
            root = {
                ui: baseNode.ui,
                id: baseNode.id,
                gid: baseNode.groupId,
                groupConfig: baseNode.groupConfig,
                name: baseNode.controlConfig && baseNode.controlConfig.name ? baseNode.controlConfig.name : baseNode.ui,
                children: []
            };
            if (module.getTemplate(baseNode.groupId) || module.getTemplate(baseNode.id)) {
                addTemplate(root, baseNode.groupId || baseNode.id);
            } else {
                addChildren(root, baseNode.children);
            }
        }

        return root;
    };

    /**
     * getGroupTree - get node sub-tree of group widget
     *
     * @param {string} groupId group ID
     * @returns {object} node sub-tree
     */
    module.getGroupTree = function getGroupTree(groupId) {
        let template = module.getTemplate(groupId),
            root = {
                ui: "group",
                id: null,
                gid: groupId,
                groupConfig: null,
                name: null,
                children: []
            };

        if (template) {
            addTemplate(root, groupId);
        }

        return root;
    };
}());
