/**
 * Module to instanciate a loaded WebIQ app model.
 *
 * @module designer/app/control
 */
(function() {
    var MODULE_NAME = "designer.app.control",
        /** @lends module:designer/app/control */
        module = shmi.pkg(MODULE_NAME);

    /**
     * clearLayout - deletes all controls in current layout
     *
     * @return {undefined}
     */
    function clearLayout() {
        var n = shmi.requires("visuals.session.names"),
            iter = shmi.requires("visuals.tools.iterate.iterateObject");
        iter(n, function(val, prop) {
            if (prop.indexOf(".") === -1) {
                shmi.deleteControl(val.ctrl);
            }
        });
    }

    /**
     * setupModel - generates layout HTML and parses controls
     *
     * @param  {object} templates template data
     * @return {object[]} array of parsed controls
     */
    function setupModel(templates) {
        var root = templates.root,
            gen = shmi.requires("designer.template").generate;
        document.body.innerHTML = gen(root);
        return shmi.visuals.parser.parseControls(null, true, null, true);
    }

    /**
     * storeTemplates - stores generated template data in content-template URLs
     *
     * @param  {object} templates template data
     * @return {undefined}
     */
    module.storeTemplates = function storeTemplates(templates) {
        var iter = shmi.requires("visuals.tools.iterate.iterateObject"),
            gen = shmi.requires("designer.template").generate,
            model = shmi.requires("designer.app.model");

        iter(templates, function(val, prop) {
            shmi.putResource(gen(val), model.makeTemplateUrl(prop));
        });
    };

    /**
     * instanceModel - Instanciate WebIQ app from specified app model data.
     *
     * @param  {object} modelTemplates app model data
     * @param  {function} callback       callback to run on completion
     * @return {undefined}
     */
    module.instanceModel = function instanceModel(modelTemplates, callback) {
        var iter = shmi.requires("visuals.tools.iterate.iterateObject"),
            model = shmi.requires("designer.app.model"),
            styles = shmi.requires("designer.client.styles");

        clearLayout();
        module.storeTemplates(modelTemplates);

        iter(model.getNodes(), function(val, prop) {
            styles.initStyle(val);
        });

        if (typeof callback === "function") {
            shmi.waitOnInit(setupModel(modelTemplates), callback);
        } else {
            setupModel(modelTemplates);
        }
    };

    /**
     * hasTemplate - check if specified node has a content-template
     *
     * @param  {object} node node data
     * @return {boolean} `true` if node has template, `false` else
     */
    function hasTemplate(node) {
        var model = shmi.requires("designer.app.model"),
            templates = model.getTemplates(),
            nodeTemplate = node ? templates[node.groupId ? node.groupId : node.id] : null;

        return !!nodeTemplate;
    }

    /**
     * copyTemplates - recursively creates copies of templates nested in node
     *
     * @param  {object} origNode source node
     * @param  {object} paramTemplates template data
     * @param  {boolean} [copyGroupTemplates] `true` to include group templates in copy data, `false` (default) else
     * @return {object} template data
     */
    function copyTemplates(origNode, paramTemplates, copyGroupTemplates = false) {
        var templates = paramTemplates || {},
            model = shmi.requires("designer.app.model");

        if (origNode === null) {
            return templates;
        }

        //copy nodes nested in origNode's template
        if ((typeof origNode.id === "string") && hasTemplate(origNode)) {
            if ((origNode.groupId && copyGroupTemplates) || !origNode.groupId) {
                let templateId = origNode.groupId ? origNode.groupId : origNode.id;
                templates[templateId] = shmi.cloneObject(model.getTemplate(templateId));
                templates[templateId].forEach(function(n) {
                    copyTemplates(n, templates, copyGroupTemplates);
                });
            }
        }

        //copy direct childnodes of origNode
        if (Array.isArray(origNode.children)) {
            origNode.children.forEach(function(c) {
                copyTemplates(c, templates, copyGroupTemplates);
            });
        }

        return templates;
    }

    /**
     * copyTemplate - creates a copy of the template with the given id and its sub-templates.
     *
     * @param {string} templateId id of the template to copy
     * @param {boolean} [copyGroupTemplates] `true` to include group templates in copy data, `false` (default) else
     * @returns {object} template data
     */
    module.copyTemplate = function copyTemplate(templateId, copyGroupTemplates = false) {
        const model = shmi.requires("designer.app.model"),
            template = model.getTemplate(templateId);

        if (!template) {
            return {};
        }

        const templates = {
            [templateId]: shmi.cloneObject(template)
        };
        templates[templateId].forEach((node) => copyTemplates(node, templates, copyGroupTemplates));

        return templates;
    };

    /**
     * mapNode - adds node and its children to specified node-map object
     *
     * @param  {object} node node object
     * @param  {object} map node map
     * @return {object} node map
     */
    function mapNode(node, map) {
        //add specified node to map
        if (node.id) {
            map[node.id] = node;
        }
        //add child nodes to map recursively
        if (Array.isArray(node.children)) {
            node.children.forEach(function(c) {
                mapNode(c, map);
            });
        }
        return map;
    }

    /**
     * mapNodes - creates a node-map from the specified map-object & node-copy
     *
     * @param  {object} nodeCopy node object copy
     * @param  {object} paramMap node map
     * @return {object} node map
     */
    function mapNodes(nodeCopy, paramMap) {
        var map = paramMap || {},
            iter = shmi.requires("visuals.tools.iterate.iterateObject");
        mapNode(nodeCopy.node, map);
        iter(nodeCopy.templates, function(t, tName) {
            t.forEach(function(n) {
                mapNode(n, map);
            });
        });
        return map;
    }

    /**
     * copyNode - Creates a copy of the specified node and all nested templates.
     *
     * @param  {string} nodeId Node-ID
     * @param {boolean} generateMap true if nodemap should be generated
     * @param {boolean} copyGroupTemplates `true` to include group templates in copy data, `false` (default) else
     * @return {object}        Node-Copy
     */
    module.copyNode = function copyNode(nodeId, generateMap = false, copyGroupTemplates = false) {
        var n = null,
            model = shmi.requires("designer.app.model"),
            copy = {
                node: null,
                templates: null,
                map: null
            };

        n = shmi.cloneObject(model.getNode(nodeId));
        if (!n) {
            console.error("node not found:", nodeId);
            return null;
        }
        copy.node = n;
        copy.handle = (n.id === nodeId) ? null : nodeId;
        copy.templates = copyTemplates(n, null, copyGroupTemplates);
        copy.map = generateMap ? mapNodes(copy, null) : null;

        return copy;
    };

    /**
     * cloneCopy - Creates a clone of the specified node-copy object, duplicating
     * all node-IDs and nested templates.
     *
     * @param  {object} nodeCopy Node-Copy object
     * @return {object}          Cloned Node-Copy
     */
    module.cloneCopy = function cloneCopy(nodeCopy) {
        var iter = shmi.requires("visuals.tools.iterate.iterateObject"),
            model = shmi.requires("designer.app.model"),
            cloneMap = {},
            templatesCopy = {},
            clone = {
                node: shmi.cloneObject(nodeCopy.node),
                templates: shmi.cloneObject(nodeCopy.templates),
                map: null
            };

        clone.map = mapNodes(clone, null);

        iter(clone.map, function(n) {
            cloneMap[n.id] = model.getNodeId(n.id);
        });
        iter(clone.map, function(n, origId) {
            n.id = cloneMap[origId];
            if (n.groupConfig) {
                delete n.attributes["data-group-config"];
                n.groupConfig = null;
            }
            if (n.parentGroupId && nodeCopy.groups && nodeCopy.groups[n.parentGroupId]) {
                let groupMeta = nodeCopy.groups[n.parentGroupId];
                groupMeta.meta.forEach((options) => {
                    if (options.id === origId) {
                        options.id = cloneMap[origId];
                    }
                });
            }
            n.attributes._nodeid = cloneMap[origId];
            n.parent = cloneMap[n.parent] || null;
            n.template = cloneMap[n.template] ? cloneMap[n.template] : (nodeCopy.groups && nodeCopy.groups[n.template]) ? n.template : null;
        });
        iter(clone.templates, function(t, tName) {
            if (nodeCopy.groups && nodeCopy.groups[tName]) {
                templatesCopy[tName] = t;
            } else if (typeof cloneMap[tName] === "undefined") {
                //unknown template
            } else {
                templatesCopy[cloneMap[tName]] = t;
            }
        });
        clone.templates = templatesCopy;
        clone.map = mapNodes(clone, null); //generate map with updated node-IDs

        return clone;
    };

    /**
     * createNode - create new node of specfied ui-type / variant.
     *
     * @param  {string} uiType  ui type / control type
     * @param  {string} [variant] control variant
     * @return {object} node object
     */
    module.createNode = function createNode(uiType, variant) {
        var nodeCopy = {
                node: null,
                templates: {},
                map: {}
            },
            contentNode = null,
            meta = shmi.requires("visuals.meta.controls"),
            model = shmi.requires("designer.app.model"),
            templateParser = shmi.requires("designer.template"),
            controlTypes = templateParser.controlTypes,
            controlMeta = meta[uiType];

        if (!controlMeta) {
            console.error(MODULE_NAME, "control meta-data not found:", uiType);
            return null;
        }

        if (variant && controlMeta.variants && controlMeta.variants[variant]) {
            controlMeta = controlMeta.variants[variant];
        }

        nodeCopy.node = {
            attributes: {
                "data-ui": uiType
            },
            children: [],
            controlConfig: shmi.cloneObject(controlMeta.designer.defaultConfig),
            controlType: templateParser.getControlType(uiType),
            id: model.getNodeId(),
            parent: null,
            tagName: "DIV",
            template: null,
            type: 1,
            ui: uiType,
            variant: variant || null,
            groupId: null,
            parentGroupId: null
        };
        nodeCopy.node.attributes._nodeid = nodeCopy.node.id;

        //check for default template-variant & apply it
        if (controlMeta.designer && Array.isArray(controlMeta.designer.templateVariants)) {
            let templateVariant = controlMeta.designer.templateVariants.find((tv) => tv.default === true);
            if (templateVariant) {
                if (templateVariant.classList) {
                    nodeCopy.node.controlConfig["class-name"] += ` ${templateVariant.classList}`;
                }

                if (templateVariant.template) {
                    nodeCopy.node.controlConfig.template = templateVariant.template;
                }
            }
        }

        if (nodeCopy.node.controlType === controlTypes.SINGLE_TEMPLATE) { //SINGLE_TEMPLATE
            nodeCopy.templates = {};
            contentNode = {
                "type": templateParser.elementTypes.NODE_ELEMENT,
                "ui": "container",
                "controlType": controlTypes.INLINE_TEMPLATE,
                "tagName": "DIV",
                "attributes": {
                    "data-ui": "container"
                },
                "children": [],
                "id": model.getNodeId(),
                "parent": null,
                "template": nodeCopy.node.id,
                "controlConfig": {
                    "ui": "container",
                    "class-name": "container",
                    "name": "content",
                    "template": null,
                    "type": "stacked",
                    "auto-width": false,
                    "auto-margin": false,
                    "h-alignment": "left",
                    "v-alignment": "top",
                    "flex-orientation": "row",
                    "flex-distribute": false,
                    "flex-all": false
                },
                "variant": null
            };
            contentNode.attributes._nodeid = contentNode.id;

            //iq-flex content container enabled
            if (controlMeta.designer && controlMeta.designer.containerProperties && controlMeta.designer.containerProperties.iqFlex) {
                contentNode.variant = "iq-flex-v-layout";
                contentNode.controlConfig = {
                    "ui": "container",
                    "class-name": "iq-container",
                    "type": "iqflex",
                    "flex-orientation": "column",
                    "flex-none": true,
                    "flex-wrap": false,
                    "flex-primary-align": "start",
                    "flex-secondary-align": "stretch",
                    "flex-line-align": "start",
                    "name": "content",
                    "template": null
                };
            }

            if (nodeCopy.node.ui === "group") {
                if (variant && model.getGroupIds()[variant]) {
                    nodeCopy.node.groupId = variant;
                } else {
                    let groupUrl = nodeCopy.node.id.replace(model.NODEID_PREFIX, model.GROUPID_PREFIX);
                    nodeCopy.node.groupId = model.getGroupId(groupUrl);
                    model.getGroupMap()[groupUrl] = {
                        id: nodeCopy.node.groupId,
                        nodes: []
                    };
                    contentNode.parentGroupId = nodeCopy.node.groupId;
                    contentNode.template = nodeCopy.node.groupId;
                    if (!nodeCopy.templates[nodeCopy.node.groupId]) {
                        nodeCopy.templates[nodeCopy.node.groupId] = [contentNode];
                        nodeCopy.map[contentNode.id] = contentNode;
                    }
                }
                nodeCopy.node.controlConfig.groupId = nodeCopy.node.groupId;
            } else {
                nodeCopy.templates[nodeCopy.node.id] = [contentNode];
                nodeCopy.map[contentNode.id] = contentNode;
            }
        } else if (nodeCopy.node.controlType === controlTypes.VIEW_TEMPLATE) { //VIEW_TEMPLATE
            nodeCopy.templates = {};
            contentNode = {
                "type": templateParser.elementTypes.NODE_ELEMENT,
                "ui": "view",
                "controlType": controlTypes.INLINE_TEMPLATE,
                "tagName": "DIV",
                "attributes": {
                    "data-ui": "view"
                },
                "children": [],
                "id": model.getNodeId(),
                "parent": null,
                "template": nodeCopy.node.id,
                "controlConfig": {
                    "ui": "view",
                    "name": "view_1",
                    "template": null,
                    "class-name": "view"
                },
                "name": "view_1"
            };
            contentNode.attributes._nodeid = contentNode.id;
            nodeCopy.templates[nodeCopy.node.id] = [contentNode];
            nodeCopy.map[contentNode.id] = contentNode;
        }
        nodeCopy.map[nodeCopy.node.id] = nodeCopy.node;

        return nodeCopy;
    };

    /**
     * getMarginCompensator - get `margin-compensator` element of container node
     *
     * @param  {object} node container node object
     * @return {HTMLElement} `margin-compensator` element
     */
    function getMarginCompensator(node) {
        var mc = null;
        if (Array.isArray(node.children)) {
            node.children.forEach(function(elem) {
                if (elem.attributes && elem.attributes.class && (elem.attributes.class.indexOf("margin-compensator") !== -1)) {
                    mc = elem;
                }
            });
        }
        return mc;
    }

    /**
     * getViewInfo - get view information for specified node ID
     *
     * @param  {string} nodeId node handle
     * @return {object} view information
     */
    module.getViewInfo = function getViewInfo(nodeHandle) {
        let model = shmi.requires("designer.app.model"),
            controlTypes = shmi.requires("designer.template").controlTypes,
            rootControl = model.getControlInstance(nodeHandle),
            rootNode = model.getNode(nodeHandle),
            nodeId = module.getPrimaryId(nodeHandle),
            templateData = model.getTemplate((rootNode && rootNode.groupId) ? rootNode.groupId : nodeId),
            activeIndex = 0,
            viewInfo = {
                index: -1,
                id: null,
                viewCount: 0,
                views: [],
                root: {
                    id: null,
                    handle: null
                }
            };

        if (templateData && rootControl && rootNode && rootNode.controlType === controlTypes.VIEW_TEMPLATE /* VIEW_TEMPLATE */) {
            viewInfo.root.id = nodeId;
            viewInfo.root.handle = model.getNodeHandle(rootControl);
            templateData.forEach(function(cn, idx) {
                let cName = null,
                    nameParts = null,
                    viewElement = null,
                    viewInstance = null;

                if (cn.ui === "view") {
                    viewElement = rootControl.element.querySelector(`[_nodeid=${cn.id}]`);
                    viewInstance = viewElement ? shmi.getControlByElement(viewElement) : null;
                    if (viewInstance && viewInstance.isActive()) {
                        viewInfo.id = cn.id;
                        viewInfo.index = activeIndex;
                    }
                    cName = cn.controlConfig ? cn.controlConfig.name || cn.attributes["data-name"] || cn.ui : cn.attributes["data-name"] || cn.ui;
                    nameParts = cName.split(".");
                    cName = nameParts[nameParts.length - 1];
                    viewInfo.views.push([cn.id, cName]);
                    activeIndex += 1;
                }
            });
            viewInfo.viewCount = activeIndex;
        }

        return viewInfo;
    };

    /**
     * getViewLabelOption - get name of option that defines view label (tab-panel, etc.)
     *
     * @param  {object} destNode destination node
     * @return {string} name of view label option
     */
    function getViewLabelOption(destNode) {
        var meta = shmi.requires("visuals.meta.controls"),
            destMeta = meta[destNode.ui];
        if (!hasViewLabels(destNode)) {
            return null;
        } else if (destNode.ui === "tab-panel") {
            return "tab-labels";
        } else {
            return destMeta.designer.containerProperties.viewLabelsOptionName;
        }
    }

    /**
     * hasViewLabels - check if node has view labels
     *
     * @param  {object} destNode destination node
     * @return {boolean} `true` if node has view labels, `false` else
     */
    function hasViewLabels(destNode) {
        var meta = shmi.requires("visuals.meta.controls"),
            destMeta = meta[destNode.ui];
        return ((destMeta && destMeta.designer && destMeta.designer.containerProperties && destMeta.designer.containerProperties.viewLabelsOptionName) || (destNode.ui === "tab-panel"));
    }

    /**
     * getSuffix - get suffix of control name
     *
     * @param  {string} controlName configured control name
     * @return {number|null} either suffix index or null if no suffix present
     */
    function getSuffix(controlName) {
        var parts = controlName.split("_"),
            suffix = null;
        if (parts[parts.length - 1] === parseInt(parts[parts.length - 1]).toString()) {
            suffix = parseInt(parts[parts.length - 1]);
        }
        return suffix;
    }

    /**
     * isNameTaken - test if specified control name is taken in specified node array
     *
     * @param  {string} name      control name
     * @param  {object[]} nodeArray node array
     * @return {boolean}           `true` if specified name is taken, `false` else
     */
    function isNameTaken(name, nodeArray) {
        var isTaken = false;
        nodeArray.forEach(function(n) {
            if (n.controlConfig && n.controlConfig.name) {
                if (name === n.controlConfig.name) {
                    isTaken = true;
                }
            }
        });
        return isTaken;
    }

    /**
     * getNodeName - get unique control name based on specified name. a numeric suffix
     * will be added when the configured name is in use.
     *
     * @param  {string} configuredName control name
     * @param  {object[]} nodeArray      node array
     * @return {string}                unique node name
     */
    function getNodeName(configuredName, nodeArray) {
        if (isNameTaken(configuredName, nodeArray)) {
            var curSuffix = getSuffix(configuredName),
                namePart = null;
            if (curSuffix === null) {
                namePart = configuredName + "_";
                curSuffix = 1;
            } else {
                namePart = configuredName.split("_");
                namePart.pop();
                namePart = namePart.join("_") + "_";
            }
            while (isNameTaken(namePart + curSuffix, nodeArray)) {
                curSuffix += 1;
            }
            return namePart + curSuffix;
        } else {
            return configuredName;
        }
    }

    /**
     * getTargetNodeHandle - get node handle from node-ID destination handle & insert location
     *
     * @param {string} nodeId node ID
     * @param {string} destHandle destination node handle
     * @param {string} insertLocation insert location
     * @returns {string} node handle at destination
     */
    function getTargetNodeHandle(nodeId, destHandle, insertLocation) {
        if (["after", "before", "into"].indexOf(insertLocation) !== -1) {
            let parts = destHandle.split("@");
            if (parts.length > 1) {
                return nodeId + "@" + destHandle.split("@").slice(1).join("@");
            } else {
                return nodeId;
            }
        }
        throw new Error("Invalid insert mode: " + insertLocation);
    }

    /**
     * updateNodes - update copied node data for insertion into local app
     *
     * @param {object} nodeCopy node copy data
     * @param {string} [destTemplate=null] destination template
     */
    function updateNodes(nodeCopy, destTemplate = null) {
        let iter = shmi.requires("visuals.tools.iterate").iterateObject,
            model = shmi.requires("designer.app.model"),
            styles = shmi.requires("designer.client.styles"),
            allNodes = model.getNodes();

        iter(nodeCopy.map, function(val, prop) {
            allNodes[prop] = val;
            if (val.template === null) {
                val.template = destTemplate;
            }

            if (val.groupId) {
                let groupNodeIDs = model.getGroupInstances(val.groupId);
                if (!Array.isArray(groupNodeIDs)) {
                    let gid = model.getGroupId(val.groupId);
                    if (nodeCopy.templates[val.groupId]) {
                        let templ = nodeCopy.templates[val.groupId];
                        delete nodeCopy.templates[val.groupId];
                        nodeCopy.templates[gid] = templ;
                        val.controlConfig.template = model.makeTemplateUrl(gid);
                    }
                    val.groupId = gid;
                    model.getGroupMap()[model.getGroupIds()[gid].url] = {
                        id: gid,
                        nodes: [val.id]
                    };
                } else if (groupNodeIDs.indexOf(val.id) === -1) {
                    groupNodeIDs.push(val.id);
                }
            }
            styles.initStyle(val);
        });
    }

    /**
     * setParentGroup - configure parent group for node copy data in local app
     *
     * @param {object} nodeCopy node copy data
     * @param {string|null} parentGroupId parent group ID or `null`
     * @param {string} [nodeId=null] node ID
     */
    function setParentGroup(nodeCopy, parentGroupId, nodeId = null) {
        let node = nodeId ? nodeCopy.map[nodeId] : nodeCopy.node,
            controlTypes = shmi.requires("designer.template").controlTypes;

        node.groupConfig = parentGroupId ? (node.groupConfig ? node.groupConfig : `@${node.id}`) : null;
        if (parentGroupId) {
            node.attributes["data-group-config"] = node.groupConfig;
        } else {
            delete node.attributes["data-group-config"];
        }

        if (node.groupId) {
            node.parentGroupId = parentGroupId;
            parentGroupId = node.groupId;
            let groupTempl = nodeCopy.templates[node.groupId];
            if (groupTempl) {
                groupTempl.forEach(function(templateNode) {
                    setParentGroup(nodeCopy, parentGroupId, templateNode.id);
                });
            }
        } else {
            node.parentGroupId = parentGroupId;
            if ([controlTypes.SINGLE_TEMPLATE, controlTypes.VIEW_TEMPLATE].indexOf(node.controlType) !== -1) {
                let contentTemplate = nodeCopy.templates[node.id];
                if (contentTemplate) {
                    contentTemplate.forEach((templateNode) => {
                        if (templateNode.id) {
                            setParentGroup(nodeCopy, parentGroupId, templateNode.id);
                        }
                    });
                }
            } else if (node.children) {
                node.children.forEach((childNode) => {
                    if (childNode.id) {
                        setParentGroup(nodeCopy, parentGroupId, childNode.id);
                    }
                });
            }
        }
    }

    /**
     * getGroupNodes - get all group instance node IDs that contain given node ID
     *
     * @param {string} nodeId node ID
     * @returns {string[]|null} array of group node IDs or `null` if none found
     */
    function getGroupNodes(nodeId) {
        let model = shmi.requires("designer.app.model"),
            parentGroup = model.getParentGroup(nodeId),
            groupNodes = parentGroup ? model.getGroupInstances(parentGroup) : null,
            result = [];

        if (Array.isArray(groupNodes)) {
            groupNodes.forEach(function(nid) {
                let n = model.getNode(nid);
                if (n.parentGroupId) {
                    let groupNodeIDs = model.getGroupInstances(n.parentGroupId);
                    if (Array.isArray(groupNodeIDs)) {
                        result = result.concat(groupNodeIDs);
                    }
                } else {
                    result.push(nid);
                }
            });
        }

        return result.length ? result : null;
    }

    /**
     * createsGroupLoop - test if inserting node copy data at specified destination will create a group-template loop
     *
     * @param {object} nodeCopy node copy data
     * @param {string} destHandle destination node handle
     * @returns {boolean} `true` when insertion would create a loop, `false` else
     */
    function createsGroupLoop(nodeCopy, destHandle) {
        let iter = shmi.requires("visuals.tools.iterate").iterateObject,
            model = shmi.requires("designer.app.model"),
            usedGroupIds = [],
            parentGroupIds = module.getParentGroupIds(destHandle);

        iter(nodeCopy.map, (node, id) => {
            if (node && node.groupId) {
                usedGroupIds.push(node.groupId);
            }
        });

        //iterate over copy of usedGroupIds to not increase number of required run
        usedGroupIds.slice().forEach((groupId) => {
            let template = model.getTemplate(groupId);
            if (template && template[0]) {
                let copy = module.copyNode(template[0].id, true, true);
                iter(copy.map, (node, id) => {
                    if (node && node.groupId && !usedGroupIds.includes(node.groupId)) {
                        usedGroupIds.push(node.groupId);
                    }
                });
            }
        });

        return parentGroupIds.some((id) => usedGroupIds.indexOf(id) !== -1);
    }

    /**
     * insertNode - insert node into app model
     *
     * @param {object} nodeCopy node to insert
     * @param {string} destNode destination node ID
     * @param {string} insertLocation insert location, either `into`, `after` or `before`
     * @param {boolean} [noUpdate] set to `true` to prevent layout update (can be used when multiple nodes are inserted, to only update on last insert)
     * @return {undefined}
     */
    module.insertNode = function insertNode(nodeCopy, destNode, insertLocation, noUpdate) {
        var iter = shmi.requires("visuals.tools.iterate.iterateObject"),
            sessionClient = shmi.requires("designer.sessionClient"),
            model = shmi.requires("designer.app.model"),
            controlTypes = shmi.requires("designer.template").controlTypes,
            generate = shmi.requires("designer.template").generate,
            allNodes = model.getNodes(),
            allTemplates = model.getTemplates(),
            dest = null,
            destCount = 0,
            destTemplate = null,
            destIdx = -1,
            marginCompensatorNode = null,
            parent = null,
            parentGroupId = null;

        if (["after", "before"].indexOf(insertLocation) !== -1) {
            dest = model.getNode(destNode);
            if (!dest) {
                console.info(MODULE_NAME, "invalid insert destination:", destNode);
                return null;
            }

            if (createsGroupLoop(nodeCopy, destNode)) {
                sessionClient.notify("${layout.app.paste.loopError}", "${V_ERROR}");
                return null;
            }

            parent = model.getNode(dest.parent);
            destIdx = getNodeIndex(parent.children, dest);
            parentGroupId = dest.parentGroupId || null;
            updateNodes(nodeCopy, parent.template);
            setParentGroup(nodeCopy, parentGroupId);
            iter(nodeCopy.templates, function(val, prop) {
                allTemplates[prop] = val;
            });
            nodeCopy.node.parent = parent.id;
            nodeCopy.node.controlConfig.name = getNodeName(nodeCopy.node.controlConfig.name, parent.children);
            parent.children.splice((insertLocation === "after") ? destIdx + 1 : destIdx, 0, nodeCopy.node);
        } else if (["into"].indexOf(insertLocation) !== -1) {
            dest = model.getNode(destNode);
            if (!dest) {
                console.info(MODULE_NAME, "invalid insert destination:", destNode);
                return null;
            }

            if (createsGroupLoop(nodeCopy, destNode)) {
                sessionClient.notify("${layout.app.paste.loopError}", "${V_ERROR}");
                return null;
            }

            parentGroupId = dest.parentGroupId || null;
            if ((dest.controlType === controlTypes.VIEW_TEMPLATE) && (nodeCopy.node.ui === "view")) { //VIEW_TEMPLATE
                if (hasViewLabels(dest)) {
                    if (!Array.isArray(dest.controlConfig[getViewLabelOption(dest)])) {
                        dest.controlConfig[getViewLabelOption(dest)] = [];
                    }
                    destTemplate = allTemplates[dest.id];
                    destTemplate.forEach(function(cn) {
                        if (cn.ui === "view") {
                            destCount += 1;
                        }
                    });
                    while (dest.controlConfig[getViewLabelOption(dest)].length < (destCount +1)) {
                        dest.controlConfig[getViewLabelOption(dest)].push("view");
                    }
                }
                updateNodes(nodeCopy, dest.id);
                setParentGroup(nodeCopy, parentGroupId);
                nodeCopy.node.parent = null;
                nodeCopy.node.controlConfig.name = getNodeName(nodeCopy.node.controlConfig.name, allTemplates[dest.id]);
                allTemplates[dest.id].push(nodeCopy.node);
            } else { //Container Parent
                marginCompensatorNode = getMarginCompensator(dest);
                if (marginCompensatorNode) {
                    dest = marginCompensatorNode;
                }
                updateNodes(nodeCopy, dest.template);
                setParentGroup(nodeCopy, parentGroupId);
                iter(nodeCopy.templates, function(val, prop) {
                    allTemplates[prop] = val;
                });
                nodeCopy.node.parent = dest.id;
                nodeCopy.node.controlConfig.name = getNodeName(nodeCopy.node.controlConfig.name, dest.children);
                dest.children.push(nodeCopy.node);
            }
        } else {
            console.error(MODULE_NAME, "unknown insert location:", insertLocation);
            return null;
        }

        //regenerate storage
        model.ignoreChanges(true);
        iter(allNodes, function(val, prop) {
            setContentTemplateUrl(val);
            if (val.ui) {
                setAndStoreConfigUrl(val);
            }
        });
        model.ignoreChanges(false);

        //store updated templates
        iter(allTemplates, function(val, prop) {
            shmi.putResource(generate(val), model.makeTemplateUrl(prop));
        });

        //perform node updates when required
        if (!noUpdate) {
            let nHandle = getTargetNodeHandle(nodeCopy.node.id, destNode, insertLocation),
                pc = getParentContainer(nHandle),
                vi = pc ? module.getViewInfo(pc.handle) : null;

            if (pc) {
                module.updateNode(pc.handle, vi, parentGroupId);
                return nHandle;
            } else {
                window.onerror(`Error inserting layout node. Target: ${nHandle}, Destination: ${destNode}, Location: ${insertLocation}`, "designer.app.control.js");
                return null;
            }
        } else {
            return null;
        }
    };

    /**
     * setContentTemplateUrl - set content template URL of specified node
     *
     * @param  {object} node node object
     * @return {undefined}
     */
    function setContentTemplateUrl(node) {
        var cfg = node.controlConfig,
            meta = shmi.requires("visuals.meta.controls"),
            controlMeta = meta[node.ui],
            cProps = null,
            model = shmi.requires("designer.app.model");

        if (!cfg) {
            cfg = {
                ui: node.ui
            };
            node.controlConfig = cfg;
        }

        if (controlMeta) {
            cProps = controlMeta.designer.containerProperties;
            if (cProps && cProps.contentURLOptionName) {
                cfg[cProps.contentURLOptionName] = model.makeTemplateUrl(node.groupId ? node.groupId : node.id);
            }
        }
    }

    /**
     * setAndStoreConfigUrl - set and update config URL of specified node
     *
     * @param  {object} node node object
     * @return {undefined}
     */
    function setAndStoreConfigUrl(node) {
        var cfg = node.controlConfig,
            model = shmi.requires("designer.app.model");

        if (!cfg) {
            cfg = {
                ui: node.ui
            };
            node.controlConfig = cfg;
        }
        node.attributes["data-config-name"] = model.makeConfigUrl(node.id);
        shmi.putResource(JSON.stringify(node.controlConfig), node.attributes["data-config-name"]);
    }

    /**
     * getParentContainer - get parent container of specified node ID
     *
     * @param  {string} nodeHandle node ID
     * @return {object} parent container node
     */
    function getParentContainer(nodeHandle) {
        var model = shmi.requires("designer.app.model"),
            handleParts = nodeHandle.split("@").slice(1),
            n = null,
            p = null;

        n = model.getNode(nodeHandle);

        if (n.template && (n.template !== "root")) {
            if (model.getGroupIds()[n.template]) {
                let gInstances = model.getGroupInstances(n.parentGroupId),
                    gIdx = gInstances.findIndex((gi) => gi === handleParts[0]);

                if (gIdx !== -1) {
                    p = model.getNode(gInstances[gIdx]);
                }
            } else {
                p = model.getNode(n.template);
            }
        } else {
            p = model.getNode(n.parent);
            while (p && !((p.ui === "container") || (p.ui === "view"))) {
                p = model.getNode(p.parent);
            }
        }

        if (p) {
            p = shmi.cloneObject(p);
            p.handle = (handleParts.length) ? `${p.id}@${handleParts.join("@")}` : p.id;
        }

        return p;
    }

    /**
     * reinstanceControl - reinstance control with specified node handle
     *
     * @param {string} nodeHandle node handle
     * @returns {object} control instance or `null` if node handle unmatched
     */
    function reinstanceControl(nodeHandle) {
        let generate = shmi.requires("designer.template").generate,
            element = null,
            model = shmi.requires("designer.app.model"),
            node = model.getNode(nodeHandle),
            control = model.getControlInstance(nodeHandle);

        if (control) {
            element = control.element;
            shmi.deleteControl(control, false);
            element.outerHTML = generate([node]);
            element = model.getNodeElement(nodeHandle);
            control = shmi.createControl(node.ui, element, {}, "DIV", "from", false);
        }

        return control;
    }

    /**
     * updateNode - update node with specified ID.
     *
     * removes and reinstances control.
     *
     * @param  {string} nodeId node ID
     * @param  {object} [viewInfo] panel control view information
     * @param {string} [parentGroupId] parent group ID
     * @return {undefined}
     */
    module.updateNode = function updateNode(nodeId, viewInfo, parentGroupId = null) {
        var model = shmi.requires("designer.app.model"),
            sc = shmi.requires("designer.sessionClient"),
            node = model.getNode(nodeId),
            panelNode = null,
            control = model.getControlInstance(nodeId);

        if (viewInfo && viewInfo.id && viewInfo.index > -1 && viewInfo.root && viewInfo.root.handle) {
            module.restoreView({
                handle: viewInfo.root.handle,
                index: viewInfo.index,
                viewId: viewInfo.index === -1 ? null : viewInfo.views[viewInfo.index][0]
            }, true, null);
        }

        if (parentGroupId !== null) {
            const groupNodes = getGroupNodes(nodeId),
                navPath = module.getNavPath(nodeId);
            let controls = [];

            navPath.forEach((navInfo, idx) => {
                if (viewInfo && viewInfo.root && viewInfo.root.handle === navInfo.handle) {
                    //filter duplicate entry from navpath if present
                    return;
                }
                module.restoreView(navInfo, false, null);
            });

            if (Array.isArray(groupNodes)) {
                controls = groupNodes.map(reinstanceControl).
                    filter((ctrl) => (ctrl !== null));
            }

            controls.forEach((ctrl) => {
                ctrl.enable();
            });
            shmi.waitOnInit(controls, function onInit() {
                const overlay = sc.isOverlay(nodeId);
                if (overlay) {
                    sc.setOverlay(overlay);
                }
            });
        } else if (control) {
            if (control.uiType === "view" && node && node.parent === null && node.template !== "root") {
                panelNode = model.getNode(node.template);
                viewInfo = module.getViewInfo(panelNode.id);
                module.updateNode(node.template, viewInfo, node.parentGroupId || null);
            } else {
                control = reinstanceControl(nodeId);
                control.enable();
                shmi.waitOnInit([control], function onInit() {
                    const overlay = sc.isOverlay(node.id);
                    if (overlay) {
                        sc.setOverlay(overlay);
                    }
                });
            }
        }
    };

    /**
     * getViewIndex - get index of view from mixed element type template array
     *
     * @param {object[]} template content template storage object
     * @param {object} viewNode view node object for comparison
     * @returns {number} index of view node or `-1` if not found
     */
    function getViewIndex(template, viewNode) {
        var viewIndex = -1,
            previousViews = 0;

        template.some(function(node) {
            if (node.type === Node.ELEMENT_NODE && node.ui === "view") {
                if (node.id === viewNode.id) {
                    viewIndex = previousViews;
                    return true;
                }
                previousViews += 1;
            }
            return false;
        });

        return viewIndex;
    }

    /**
     * applyViewOrder - apply new view order for panel control
     *
     * @param  {string} template name of template
     * @param  {string[]} nodeIds array of view node IDs
     * @param  {string[]} nodeNames array of view names
     * @return {undefined}
     */
    module.applyViewOrder = function applyViewOrder(template, nodeIds, nodeNames) {
        var model = shmi.requires("designer.app.model"),
            iter = shmi.requires("visuals.tools.iterate.iterateObject"),
            generate = shmi.requires("designer.template").generate,
            allNodes = null,
            allTemplates = null,
            baseTemplate = null,
            baseNode = null,
            copyTemplate = [],
            copyLabels = [];

        allNodes = model.getNodes();
        allTemplates = model.getTemplates();

        baseTemplate = model.getTemplate(template);
        baseNode = model.getNode(template);

        if (!(baseTemplate && baseNode)) {
            console.error(MODULE_NAME, "cannot rearrange nodes, template not found:", template);
            return;
        }

        if (Array.isArray(nodeIds) && Array.isArray(nodeNames)) {
            if (nodeIds.length !== nodeNames.length) {
                console.error(MODULE_NAME, "count of node names does not match count of node IDs:", nodeIds, nodeNames);
                return;
            }
        }

        baseTemplate.forEach(function(viewNode) {
            if (viewNode.id && nodeIds.indexOf(viewNode.id) === -1) {
                module.deleteNode(viewNode.id, true);
            }
        });

        nodeIds.forEach(function(nid, idx) {
            var viewNode = model.getNode(nid),
                origIndex = getViewIndex(baseTemplate, viewNode);

            copyTemplate.push(viewNode);
            if (hasViewLabels(baseNode)) {
                if (baseNode.controlConfig && baseNode.controlConfig[getViewLabelOption(baseNode)]) {
                    copyLabels.push(baseNode.controlConfig[getViewLabelOption(baseNode)][origIndex]);
                }
            }
            if (Array.isArray(nodeNames) && viewNode.controlConfig) {
                viewNode.controlConfig.name = nodeNames[idx];
                shmi.putResource(JSON.stringify(allNodes[nid].controlConfig, null, "    "), model.makeConfigUrl(nid));
            }
        });

        allTemplates[template] = copyTemplate;
        if (hasViewLabels(baseNode)) {
            if (baseNode.controlConfig && baseNode.controlConfig[getViewLabelOption(baseNode)]) {
                baseNode.controlConfig[getViewLabelOption(baseNode)] = copyLabels;
                shmi.putResource(JSON.stringify(baseNode.controlConfig, null, "    "), model.makeConfigUrl(template));
            }
        }

        iter(allTemplates, function(val, prop) {
            shmi.putResource(generate(val), model.makeTemplateUrl(prop));
        });

        module.updateNode(template, module.getViewInfo(template), baseNode.parentGroupId || null);
    };

    /**
     * getNodeIndex - get index of node in node-children array
     *
     * @param {object[]} children node children
     * @param {object} node node to find index for
     * @returns {number} index of node in children array or `-1` if not found
     */
    function getNodeIndex(children, node) {
        return children.findIndex(function(n) {
            return n.id === node.id;
        });
    }

    /**
     * signalResize - fire resize event to trigger size recalculation
     *
     */
    function signalResize() {
        const event = document.createEvent("Event");

        event.initEvent("resize", true, true);
        window.dispatchEvent(event);
    }

    /**
     * deleteNode - delete node of specified node ID
     *
     * @param {string} nodeId node ID
     * @param {boolean} [noUpdate] set to `true` to prevent layout update (can be used when multiple nodes are deleted, to only update on last delete)
     * @return {undefined}
     */
    module.deleteNode = function deleteNode(nodeId, noUpdate) {
        var model = shmi.requires("designer.app.model"),
            iter = shmi.requires("visuals.tools.iterate.iterateObject"),
            generate = shmi.requires("designer.template").generate,
            styles = shmi.requires("designer.client.styles"),
            n = null,
            p = null,
            isTemplateChild = false,
            copy = null,
            allNodes = null,
            allTemplates = null,
            allNodeIds = null,
            element = null,
            childIndex = -1,
            viewCount = 0,
            viewIndex = -1,
            control = null,
            parentHandle = null;

        shmi.checkArg("nodeId", nodeId, "string");

        allNodes = model.getNodes();
        allTemplates = model.getTemplates();
        allNodeIds = model.getNodeIds();
        n = model.getNode(nodeId);
        p = model.getNode(n.parent);

        if (!n) {
            console.error(MODULE_NAME, "cannot delete node, ID not found:", nodeId);
            return;
        }
        parentHandle = model.getParentHandle(nodeId);
        copy = module.copyNode(nodeId);
        copy.map = mapNodes(copy, null);
        iter(copy.map, function(val, prop) {
            styles.removeStyle(prop);
            if (val.groupId) {
                let groupNodeIDs = model.getGroupInstances(val.groupId);
                if (Array.isArray(groupNodeIDs)) {
                    let grpIdx = groupNodeIDs.indexOf(val.id);
                    if (grpIdx !== -1) {
                        groupNodeIDs.splice(grpIdx, 1);
                    }
                }
            }
            delete allNodes[prop];
            delete allNodeIds[prop];
        });
        copy.map = null;

        if (p) {
            var tmpIdx = getNodeIndex(p.children, n);
            p.children.splice(tmpIdx, 1);
            if (p.template && p.template !== "root") {
                isTemplateChild = true;
            }
        } else {
            if (n.ui === "view" && hasViewLabels(allNodes[n.template])) {
                allTemplates[n.template].forEach(function(te) {
                    if (te.id === n.id) {
                        viewIndex = viewCount;
                    }
                    if (te.ui === "view") {
                        viewCount += 1;
                    }
                });
                allNodes[n.template].controlConfig[getViewLabelOption(allNodes[n.template])].splice(viewIndex, 1);
                shmi.putResource(JSON.stringify(allNodes[n.template].controlConfig, null, "    "), model.makeConfigUrl(n.template));
            }
            childIndex = getNodeIndex(allTemplates[n.template], n);
            allTemplates[n.template].splice(childIndex, 1);
            isTemplateChild = true;
        }
        iter(copy.templates, function(val, prop) {
            delete allTemplates[prop];
        });
        iter(allTemplates, function(val, prop) {
            shmi.putResource(generate(val), model.makeTemplateUrl(prop));
        });
        element = model.getNodeElement(nodeId);
        if (element) {
            control = shmi.getControlByElement(element);
            if (control) {
                shmi.deleteControl(control, true);
            }
        }

        if (isTemplateChild && !noUpdate) {
            if (parentHandle) {
                module.updateNode(parentHandle, module.getViewInfo(parentHandle), n.parentGroupId);
            } else {
                module.updateNode(n.template, allNodes[n.template] ? module.getViewInfo(allNodes[n.template].id) : null, n.parentGroupId);
            }
        } else {
            signalResize();
        }
    };

    /**
     * getNodeSelector - get CSS selector to uniquely identify specified node element
     *
     * @param {HTMLElement} element
     * @returns {string|null} CSS selector to match specified node element or `null` of none found
     */
    module.getNodeSelector = function getNodeSelector(element) {
        let control = shmi.getControlByElement(element),
            selector = [];

        if (control) {
            let nodeId = control.element.getAttribute("_nodeid");
            selector.push(`[_nodeid=${nodeId}]`);
            let parent = control.getParent();
            while (parent) {
                if (parent.uiType === "group") {
                    selector.push(`[_nodeid=${parent.element.getAttribute("_nodeid")}]`);
                }
                parent = parent.getParent();
            }
            selector.reverse();

            return selector.join(" ");
        }

        return null;
    };

    /**
     * applyChange - apply change to application model
     *
     * @param {object} param parameters to apply model change
     * @param {object[]} param.change change data to apply
     * @param {string} param.template current edit template (test for existence after application of change data)
     * @param {function} callback function to call on completion
     */
    module.applyChange = function applyChange(param, callback) {
        var model = shmi.requires("designer.app.model"),
            control = shmi.requires("designer.app.control"),
            styles = shmi.requires("designer.client.styles"),
            iter = shmi.requires("visuals.tools.iterate").iterateObject,
            changeArray = param.change,
            nodeUpdates = [],
            revertData = [];

        //do not record changes made by un-/redoing recorded changes
        model.ignoreChanges(true);

        //undo changes in reverse to make sure all references still exist
        changeArray.reverse();

        changeArray.forEach(function(changeInfo) {
            var copyNode = shmi.requires("designer.app.control").copyNode,
                node = null,
                template = null,
                mapData = null,
                configCopy = null,
                revertInfo = {
                    id: changeInfo.id,
                    type: changeInfo.type,
                    data: null,
                    ts: Date.now()
                },
                groupInfo = null;

            node = model.getNode(changeInfo.id);
            switch (changeInfo.type) {
            case "GROUP": //change to group config
                groupInfo = shmi.visuals.session.groupConfig[revertInfo.id];
                revertInfo.data = {
                    group: groupInfo ? shmi.cloneObject(groupInfo) : null
                };
                revertData.push(revertInfo);
                break;
            case "CONFIG": //change to configuration
                revertInfo.data = {
                    config: shmi.cloneObject(node.controlConfig)
                };
                revertData.push(revertInfo);
                node.controlConfig = changeInfo.data.config;
                shmi.putResource(JSON.stringify(node.controlConfig), model.makeConfigUrl(node.id));
                if (nodeUpdates.indexOf(node.id) === -1) {
                    nodeUpdates.push(node.id);
                }
                break;
            case "STYLE": //change to styling
                revertInfo.data = {
                    style: shmi.cloneObject(node.style)
                };
                revertData.push(revertInfo);
                node.style = changeInfo.data.style;
                styles.setStyleData(changeInfo.id, node.style);
                styles.generateCss(changeInfo.id);
                break;
            case "CHILDREN": //change to children of node
                revertInfo.data = {
                    children: copyNode(changeInfo.id)
                };
                revertData.push(revertInfo);
                node.children.slice().forEach(function(c) {
                    if (typeof c.id === "string") { //pure HTML nodes need not explicitly be deleted
                        control.deleteNode(c.id, true);
                    }
                });
                node.children = changeInfo.data.children.node.children; //here children are reinserted - ADD BACK GROUP NODE IDs TO GROUP-MAP here!!!
                mapData = model.mapNode(node);
                iter(changeInfo.data.children.templates, function(data, name) {
                    model.getTemplates()[name] = data;
                    data.forEach(function(templateChild) {
                        model.mapNode(templateChild, mapData);
                    });
                });
                control.storeTemplates(model.getTemplates());
                iter(mapData, function(n, id) {
                    if (n.groupId) {
                        let groupNodeIDs = model.getGroupInstances(n.groupId);
                        if (Array.isArray(groupNodeIDs)) {
                            if (!groupNodeIDs.includes(n.id)) {
                                groupNodeIDs.push(n.id);
                            }
                        }
                    }
                    styles.initStyle(n);
                    if (n.controlConfig) {
                        shmi.putResource(JSON.stringify(n.controlConfig), model.makeConfigUrl(n.id));
                    }
                });

                model.updateNodeProxies([node.id]);

                if (nodeUpdates.indexOf(node.id) === -1) {
                    nodeUpdates.push(node.id);
                }
                break;
            case "TEMPLATE": //change to template data
                revertInfo.data = {
                    template: copyNode(changeInfo.id)
                };
                revertData.push(revertInfo);

                if (node.ui === "tab-panel") {
                    //special treatment for tab-panels:
                    //labels get automatically deleted when views are removed.
                    //store a copy of initial config for later restoration
                    configCopy = shmi.cloneObject(node.controlConfig);
                }

                template = model.getTemplate(changeInfo.id);
                template.slice().forEach(function(te) {
                    if (typeof te.id === "string") {
                        control.deleteNode(te.id, true);
                    }
                });
                mapData = {};
                iter(changeInfo.data.template.templates, function(data, name) {
                    model.getTemplates()[name] = data;
                    data.forEach(function(templateChild) {
                        model.mapNode(templateChild, mapData);
                    });
                });
                control.storeTemplates(model.getTemplates());
                iter(mapData, function(n, id) {
                    styles.initStyle(n);
                    if (n.controlConfig) {
                        shmi.putResource(JSON.stringify(n.controlConfig), model.makeConfigUrl(n.id));
                    }
                });

                if (node.ui === "tab-panel") {
                    //special treatment for tab-panels:
                    //restore initially saved configuration
                    node = model.getNode(changeInfo.id);
                    node.controlConfig = configCopy;
                    shmi.putResource(JSON.stringify(node.controlConfig), model.makeConfigUrl(node.id));
                }

                //restore config-proxy that got removed by replacing node data
                model.updateNodeProxies([node.id]);

                if (nodeUpdates.indexOf(node.id) === -1) {
                    nodeUpdates.push(node.id);
                }
                break;
            default:
            }
        });

        nodeUpdates = nodeUpdates.map(function(nId) {
            let node = model.getNode(nId);
            control.updateNode(nId, control.getViewInfo(nId), node.parentGroupId || null);
            return model.getControlInstance(nId);
        });
        nodeUpdates = nodeUpdates.filter(function(ctrlRef) {
            return ctrlRef !== null && !ctrlRef.isDeleted();
        });

        //wait for modified controls that were active before change...
        if (nodeUpdates.length) {
            shmi.waitOnInit(nodeUpdates, function() {
                model.ignoreChanges(false);
                callback({
                    templateExists: model.getTemplate(param.template) !== null,
                    revertData: revertData
                });
            });
        } else {
            model.ignoreChanges(false);
            callback({
                templateExists: model.getTemplate(param.template) !== null,
                revertData: revertData,
                reload: false
            });
        }
    };

    /**
     * deleteGroup - delete group including meta data and all instances
     *
     * @param {string} groupId group ID
     */
    module.deleteGroup = function deleteGroup(groupId) {
        module.deleteGroupInstances(groupId, true);
        module.deleteGroupTemplate(groupId);
        module.updateRoot();
    };

    /**
     * deleteGroupInstances - delete instances of a group.
     *
     * @param {string} groupId group ID
     * @param {boolean} [noUpdate] set to `true` to prevent layout update (can be used when multiple nodes are inserted, to only update on last insert)
     */
    module.deleteGroupInstances = function deleteGroupInstances(groupId, noUpdate = false) {
        const m = shmi.requires("designer.app.model"),
            gids = shmi.cloneObject(m.getGroupInstances(groupId));

        if (!Array.isArray(gids)) {
            return;
        }

        // Remove instances of the group.
        gids.forEach((gid) => module.deleteNode(gid, true));

        // If noUpdate is not set, find root node and update it, effectively
        // reinitializing the entire app.
        if (!noUpdate) {
            module.updateRoot();
        }
    };

    /**
     * deleteGroupTemplate - delete group metadata and template.
     *
     * @param {string} groupId group ID
     */
    module.deleteGroupTemplate = function deleteGroupTemplate(groupId) {
        const m = shmi.requires("designer.app.model"),
            session = shmi.requires("visuals.session"),
            groupTemplate = m.getTemplate(groupId),
            groupIds = m.getGroupIds(),
            groupUrl = groupIds[groupId] ? groupIds[groupId].url : null;

        if (Array.isArray(groupTemplate)) {
            const groupNodesMap = {};
            groupTemplate.forEach((node) => mapNode(node, groupNodesMap));

            // Remove child nodes of template. Clears references, ids, etc...
            groupTemplate.forEach((node) => module.deleteNode(node.id, false));

            // Remove references to instances of other groups used in the template.
            Object.values(groupNodesMap).forEach((node) => {
                if (!node.groupId) {
                    return;
                }

                // Note: getGroupInstances returns a reference to the internal
                // array.
                const instances = m.getGroupInstances(node.groupId);
                if (!Array.isArray(instances)) {
                    return;
                }

                const idx = instances.indexOf(node.id);
                if (idx > -1) {
                    instances.splice(instances, 1);
                }
            });
        }

        if (groupUrl) {
            delete groupIds[groupId];
            delete m.getGroupMap()[groupUrl];
        }
        delete m.getTemplates()[groupId];
        delete session.groupConfig[groupId];
    };

    /**
     * updateRoot - update root node, effectively updating the entire app.
     */
    module.updateRoot = function updateRoot() {
        const m = shmi.requires("designer.app.model"),
            rootTemplate = m.getTemplate("root"),
            rootNode = rootTemplate.find((n) => typeof n.controlType === "number");

        if (rootNode) {
            module.updateNode(rootNode.id);
        }
    };

    /**
     * getPrimaryId - get primary node ID from node handle
     *
     * @param {string} nodeHandle node handle
     * @returns {string} node ID
     */
    module.getPrimaryId = function getPrimaryId(nodeHandle) {
        return (typeof nodeHandle === "string") ? nodeHandle.split("@").slice(0, 1)[0] : null;
    };

    /**
     * getNavPath - get navigation path to specified node handle.
     *
     * Navigation state of all controls that contain views and lead to
     * node matched by specified node handle is collected.
     *
     * @param {string} nodeHandle node handle
     * @returns {object[]} navigation path
     */
    module.getNavPath = function getNavPath(nodeHandle) {
        let model = shmi.requires("designer.app.model"),
            controlInstance = model.getControlInstance(nodeHandle),
            navPath = [];

        if (controlInstance) {
            let parent = controlInstance;
            while (parent) {
                let navInfo = module.getViewInfo(model.getNodeHandle(parent));
                if (navInfo && navInfo.index !== -1) {
                    navPath.push({
                        handle: navInfo.root.handle,
                        index: navInfo.index,
                        viewId: navInfo.views[navInfo.index][0]
                    });
                }
                parent = parent.getParent();
            }
        }
        navPath.reverse();

        return navPath;
    };

    /**
     * getAncestors - get node handles of all ancestors of specified node handle
     *
     * @param {string} nodeHandle node handle
     * @returns {string[]} ancestor node handles
     */
    module.getAncestors = function getAncestors(nodeHandle) {
        let model = shmi.requires("designer.app.model"),
            base = model.getControlInstance(nodeHandle),
            ancestorIds = [],
            parent = base ? base.getParent() : null;

        while (parent) {
            let parentHandle = model.getNodeHandle(parent);

            ancestorIds.push(parentHandle);
            base = parent;
            parent = base.getParent();
        }

        return ancestorIds;
    };

    /**
     * getParentGroupIds - get group IDs of all parent groups of specified node handle
     *
     * @param {string} nodeHandle node handle
     * @returns {string[]} parent group IDs
     */
    module.getParentGroupIds = function getParentGroupIds(nodeHandle) {
        let ancestorIds = module.getAncestors(nodeHandle),
            model = shmi.requires("designer.app.model"),
            groupIds = [];

        ancestorIds.forEach((id) => {
            let node = model.getNode(id);
            if (node && node.groupId) {
                groupIds.push(node.groupId);
            }
        });

        return groupIds;
    };

    let restoreCounter = 0, //number of ongoing view restores
        onRestoreQueue = []; //handler queue to run after restores have been completed

    /**
     * waitingForRestore - check if view restore is ongoing
     *
     * @returns {boolean} `true` if one or more restores are ongoing, `false` else
     */
    module.waitingForRestore = () => restoreCounter > 0;

    /**
     * onRestore - queue handler function to run after view restores have been completed
     *
     * @param {function} handler handler function to run on completion
     */
    module.onRestore = (handler) => {
        onRestoreQueue.push(handler);
    };

    /**
     * beginRestore - start new view restore
     *
     */
    function beginRestore() {
        restoreCounter += 1;
    }

    /**
     * completeRestore - complete running restore
     *
     */
    function completeRestore() {
        restoreCounter -= 1;
        if (!module.waitingForRestore()) {
            shmi.decouple(() => {
                if (module.waitingForRestore()) {
                    return;
                }
                onRestoreQueue.forEach((handler) => {
                    handler();
                });
                onRestoreQueue = [];
            });
        }
    }

    /**
     * onPanelActive - handler to run after panel activates during view restoration
     *
     * @param {object} panelInstance panel control instance
     * @param {object} navInfo navigation info
     * @param {function} [callback=null] callback to run on completion
     */
    function onPanelActive(panelInstance, navInfo, callback = null) {
        const viewElement = panelInstance.element.querySelector(`[_nodeid=${navInfo.viewId}]`);

        if (viewElement) {
            const controlInstance = shmi.getControlByElement(viewElement);
            if (controlInstance && controlInstance.isActive()) {
                if (typeof callback === "function") {
                    callback();
                }
                completeRestore();
                return;
            }
        }

        const viewToken = shmi.listen("enable", (e) => {
            if (e.source.element.getAttribute("_nodeid") === navInfo.viewId) {
                viewToken.unlisten();
                if (typeof callback === "function") {
                    callback();
                }
                completeRestore();
            }
        }, { "source.uiType": "view" });

        panelInstance.setView(navInfo.index);
    }

    /**
     * restoreView - restore view navigation state
     *
     * @param {object} navInfo navigation info
     * @param {string} navInfo.handle node handle
     * @param {number} navInfo.index view index
     * @param {string} navInfo.viewId view node id
     * @param {boolean} wait `true` to wait for 'enable' event first, `false` if widget does not have to be reinstanced
     * @param {function} [callback] optional callback function called on completion
     */
    module.restoreView = function restoreView(navInfo, wait = true, callback = null) {
        const model = shmi.requires("designer.app.model");

        if (navInfo && navInfo.handle && typeof navInfo.index === "number") {
            const panelInstance = model.getControlInstance(navInfo.handle);
            beginRestore();
            if (!wait && panelInstance && panelInstance.isActive()) {
                onPanelActive(panelInstance, navInfo, callback);
            } else {
                const token = shmi.listen("enable", (evt) => {
                    if (model.getNodeHandle(evt.source) === navInfo.handle) {
                        token.unlisten();
                        onPanelActive(evt.source, navInfo, callback);
                    }
                });
            }
        }
    };
}());
