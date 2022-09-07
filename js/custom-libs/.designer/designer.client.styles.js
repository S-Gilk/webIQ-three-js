/**
 * Module to provide methods to access and manipulate styles in designer client app.
 *
 * @module designer/client/styles
 */
(function() {
    var MODULE_NAME = "designer.client.styles",
        /** @lends module:designer/client/styles */
        module = shmi.pkg(MODULE_NAME);

    var styleData = {},
        styleSheets = {},
        deviceSpecific = false,
        mqData = null,
        maxUiUpdateDelay = 100, //maximum delay between updates of UI after style changes (ms)
        updateNodeCopy = null; //stores copy of last node used for style updates

    /**
     * Free positioning alignmemt modes
     *
     * @constant
     */
    module.ALIGN = {
        TOP_LEFT: 1,
        TOP_RIGHT: 2,
        BOTTOM_RIGHT: 3,
        BOTTOM_LEFT: 4
    };

    /**
     * clearStyles - remove all style references and generated stylesheets
     *
     * @returns {undefined}
     */
    module.clearStyles = function clearStyles() {
        var iter = shmi.requires("visuals.tools.iterate.iterateObject");
        iter(styleSheets, function(val, prop) {
            val.parentNode.removeChild(val);
            delete styleSheets[prop];
        });
        iter(styleData, function(val, prop) {
            delete styleData[prop];
        });
    };

    /**
     * initStyle - initialize style settings for specified node
     *
     * @param {object} nodeInfo node reference object
     */
    module.initStyle = function initStyle(nodeInfo) {
        var style = null,
            sc = shmi.requires("designer.sessionClient"),
            sheet = document.createElement("style");

        if (nodeInfo.controlConfig && nodeInfo.controlConfig._designer_ && nodeInfo.controlConfig._designer_.style) {
            style = nodeInfo.controlConfig._designer_.style;
            delete nodeInfo.controlConfig._designer_.style;
        } else if (nodeInfo.style) {
            style = nodeInfo.style;
        } else {
            style = {
                ui: nodeInfo.ui,
                general: {},
                media: {},
                devStyle: {}
            };
        }

        if (style.align === undefined) {
            style.align = "TOP_LEFT";
        }

        mqData.queries.forEach(function(mq) {
            if (!style.media[mq.name]) {
                style.media[mq.name] = {};
            }
        });
        nodeInfo.style = style;
        styleData[nodeInfo.id] = style;
        if (styleSheets[nodeInfo.id] !== undefined) {
            console.warn(MODULE_NAME, "replacing stylesheet:", nodeInfo.id);
            if (styleSheets[nodeInfo.id].parentNode) {
                styleSheets[nodeInfo.id].parentNode.removeChild(styleSheets[nodeInfo.id]);
            }
        }
        styleSheets[nodeInfo.id] = sheet;
        if (sc.isPreview()) {
            document.head.appendChild(sheet);
        }
        module.generateCss(nodeInfo.id);
    };

    let nodeInstances = {};

    //listen for control instialization & initialize styles
    shmi.listen("register", function(evt) {
        if (shmi.requires("designer.sessionClient").isPreview()) {
            return;
        }
        //..
        var element = evt.source.element,
            nodeId = element ? element.getAttribute("_nodeid") : null,
            head = document.querySelector("head"),
            sheet = null;

        if (nodeId) {
            let nInstance = nodeInstances[nodeId] || {
                count: 0
            };
            nInstance.count += 1;
            nodeInstances[nodeId] = nInstance;
            sheet = styleSheets[nodeId];
            if (sheet && sheet.parentNode !== head) {
                head.appendChild(sheet);
            }
        }
    });

    //listen for control deletion & clean up unused styles
    shmi.listen("delete", function(evt) {
        if (shmi.requires("designer.sessionClient").isPreview()) {
            return;
        }
        //..
        var element = evt.source.element,
            nodeId = element ? element.getAttribute("_nodeid") : null,
            sheet = null;

        if (nodeId) {
            let nInstance = nodeInstances[nodeId];
            sheet = styleSheets[nodeId];
            if (nInstance) {
                nInstance.count -= 1;
                if (nInstance.count === 0) {
                    delete nodeInstances[nodeId];
                    if (sheet && sheet.parentNode) {
                        sheet.parentNode.removeChild(sheet);
                    }
                }
            }
        }
    });

    /**
     * getStyle - get style info object
     *
     * @param {string} nodeId node ID
     * @returns {object} style info object
     */
    module.getStyle = function getStyle(nodeId) {
        let control = shmi.requires("designer.app.control");

        return styleData[control.getPrimaryId(nodeId)] || null;
    };

    /**
     * setStyle - set styling property
     *
     * @param {string} nodeId node ID
     * @param {string} property name of styling property
     * @param {any} value value of styling property
     * @param {string|null} media name of media query to apply style value to, `null` to apply to general settings
     * @param {booleam} devStyle `true` if devStyle should be set
    */
    module.setStyle = function setStyle(nodeId, property, value, media, devStyle) {
        var style = module.getStyle(nodeId);

        if (style) {
            if (media) {
                if (style.media && style.media[media]) {
                    if ((property === "position") && (style.media[media].position !== value) && [null, "relative"].includes(value)) {
                        style.media[media]["offset-top"] = null;
                        style.media[media]["offset-right"] = null;
                        style.media[media]["offset-bottom"] = null;
                        style.media[media]["offset-left"] = null;
                    }
                    style.media[media][property] = value;
                }
            } else if (devStyle) {
                style.devStyle = style.devStyle || {};
                style.devStyle[property] = value;
            } else {
                if ((property === "position") && (style.general.position !== value) && [null, "relative"].includes(value)) {
                    style.general["offset-top"] = null;
                    style.general["offset-right"] = null;
                    style.general["offset-bottom"] = null;
                    style.general["offset-left"] = null;
                    style.align = "TOP_LEFT";
                }
                style.general[property] = value;
            }
        }
    };

    /**
     * setStyleData - set style data of node
     *
     * @param {string} nodeId node ID
     * @param {object} style style data
     */
    module.setStyleData = function setStyleData(nodeId, style) {
        styleData[nodeId] = style;
    };

    /**
     * getActiveStyle - get current value of specified style property
     *
     * @param {string} nodeId node ID
     * @param {string} property name of style property
     *
     * @returns {object|null} value & defining layout of requested style property
    */
    module.getActiveStyle = function getActiveStyle(nodeId, property) {
        var mq = shmi.getMediaQueries().queries,
            style = module.getStyle(nodeId),
            currentIdx = mq.findIndex(function(q, idx) {
                return q.name === shmi.getCurrentLayout();
            }),
            value = null,
            layout = null;

        if (style) {
            if (style.general[property]) {
                value = style.general[property];
            }
            mq.forEach(function(q, idx) {
                if (idx > currentIdx) {
                    return;
                }
                if (style.media[q.name] && style.media[q.name][property]) {
                    value = style.media[q.name][property];
                    layout = q.name;
                }
            });
        }

        return {
            value: value,
            layout: layout
        };
    };

    /**
     * setAlignment - set free positioning alignment
     *
     * @param {string} nodeId node ID
     * @param {string} align alignment mode
     */
    module.setAlignment = function setAlignment(nodeId, align) {
        var alignMode = module.ALIGN[align],
            model = shmi.requires("designer.app.model"),
            elem = model.getNodeElement(nodeId),
            parent = elem ? elem.parentNode : null,
            style = module.getStyle(nodeId),
            elemBb = null,
            parentBb = null;

        if (elem && parent && style) {
            elemBb = elem.getBoundingClientRect();
            parentBb = parent.getBoundingClientRect();

            switch (alignMode) {
            case module.ALIGN.TOP_LEFT:
                style.general["offset-left"] = {
                    value: Math.round(elemBb.x - parentBb.x),
                    unit: "px"
                };
                style.general["offset-top"] = {
                    value: Math.round(elemBb.y - parentBb.y),
                    unit: "px"
                };
                style.general["offset-right"] = null;
                style.general["offset-bottom"] = null;
                break;
            case module.ALIGN.TOP_RIGHT:
                style.general["offset-right"] = {
                    value: Math.round(parentBb.x + parentBb.width - (elemBb.x + elemBb.width)),
                    unit: "px"
                };
                style.general["offset-top"] = {
                    value: Math.round(elemBb.y - parentBb.y),
                    unit: "px"
                };
                style.general["offset-left"] = null;
                style.general["offset-bottom"] = null;
                break;
            case module.ALIGN.BOTTOM_RIGHT:
                style.general["offset-right"] = {
                    value: Math.round(parentBb.x + parentBb.width - (elemBb.x + elemBb.width)),
                    unit: "px"
                };
                style.general["offset-bottom"] = {
                    value: Math.round(parentBb.y + parentBb.height - (elemBb.y + elemBb.height)),
                    unit: "px"
                };
                style.general["offset-left"] = null;
                style.general["offset-top"] = null;
                break;
            case module.ALIGN.BOTTOM_LEFT:
                style.general["offset-left"] = {
                    value: Math.round(elemBb.x - parentBb.x),
                    unit: "px"
                };
                style.general["offset-bottom"] = {
                    value: Math.round(parentBb.y + parentBb.height - (elemBb.y + elemBb.height)),
                    unit: "px"
                };
                style.general["offset-right"] = null;
                style.general["offset-top"] = null;
                break;
            default:
            }

            style.align = align;

            module.generateCss(nodeId);
        }
    };

    /**
     * getStyleData - get copy of style data
     *
     * @returns {object} style data
     */
    module.getStyleData = function getStyleData() {
        return shmi.cloneObject(styleData);
    };

    /**
     * getStylesheets - access references to known stylesheets
     *
     * @returns {object} stylesheet storage
     */
    module.getStylesheets = function getStylesheets() {
        return styleSheets;
    };

    /**
     * getUsage - get percentage of total styles currently active (and log to console)
     *
     * @returns {number} percentage of loaded node stylesheets
    */
    module.getUsage = function getUsage() {
        var iter = shmi.requires("visuals.tools.iterate").iterateObject,
            model = shmi.requires("designer.app.model"),
            used = 0,
            unused = 0,
            total = 0,
            percentage = null;

        iter(styleData, function(val, prop) {
            var element = model.getNodeElement(prop);
            if (element) {
                used += 1;
            } else {
                unused += 1;
            }
        });

        total = used + unused;
        percentage = parseFloat((100*used/total).toFixed(2));

        console.log(`${percentage}% of styles used (${used} of ${total})`);

        return percentage;
    };

    /**
     * getSelector - create CSS selector for specified node ID & media query
     *
     * @param {string} nodeId node ID
     * @param {string} media media query name
     * @returns {string} CSS selector
     */
    function getSelector(nodeId, media) {
        var style = styleData[nodeId],
            mq = null;
        if (!media) {
            return "[data-ui=" + style.ui + "][_nodeId=" + nodeId + "] {\n<%= DATA %>}";
        } else {
            mqData.queries.forEach(function(q) {
                if (q.name === media) {
                    mq = q;
                }
            });
            if (mq.threshold) {
                if (mqData.type === 1) {
                    return "@media (min-width: " + mq.threshold + ") { \n[data-ui=" + style.ui + "][_nodeId=" + nodeId + "] {\n<%= DATA %>}}";
                } else {
                    return "@media (max-width: " + mq.threshold + ") { \n[data-ui=" + style.ui + "][_nodeId=" + nodeId + "] {\n<%= DATA %>}}";
                }
            } else {
                return "[data-ui=" + style.ui + "][_nodeId=" + nodeId + "] {\n<%= DATA %>}";
            }
        }
    }

    /**
     * generateVisibility - generate style setting for node visibility
     *
     * @param {string} nodeId node ID
     * @returns {string} visibility setting
     */
    function generateVisibility(nodeId) {
        var visText = "",
            style = styleData[nodeId],
            baseVis = style.general.visibility ? style.general.visibility : "visible";
        mqData.queries.forEach(function(q) {
            var curVis = style.media[q.name].visibility;
            if (curVis) {
                baseVis = curVis;
            }
            if (baseVis === "hidden") {
                visText += shmi.evalString("." + q.name + " " + getSelector(nodeId, null), { DATA: "visibility: hidden !important;\n" });
            } else if (baseVis === "none") {
                visText += shmi.evalString("." + q.name + " " + getSelector(nodeId, null), { DATA: "display: none !important;\n" });
            }
        });
        return visText;
    }

    /**
     * generateGeneral - generate CSS styling for general mode (non media query specific)
     *
     * @param {string} nodeId node ID
     * @returns {string} node styling
     */
    function generateGeneral(nodeId) {
        var iter = shmi.requires("visuals.tools.iterate.iterateObject"),
            generalText = "",
            style = styleData[nodeId];

        if (style) {
            iter(style.general, function(val, prop) {
                if (prop === "visibility") {
                    return;
                }
                var pName = prop;
                if (pName.indexOf("offset-") === 0) {
                    pName = pName.replace("offset-", "");
                }
                if (val !== null) {
                    if (typeof val === "string") {
                        generalText += pName + ": " + val + " !important;\n";
                    } else if (typeof val === "object" && val.unit) {
                        generalText += pName + ": " + String(val.value) + val.unit + " !important;\n";
                    }
                }
            });
        }

        return generalText;
    }

    /**
     * getIQSelector - create CSS selector for specified node ID and IQ-selector
     *
     * @param {string} nodeId node ID
     * @param {string} selector IQ selector
     * @returns {string} CSS selector
     */
    function getIQSelector(nodeId, selector) {
        var style = styleData[nodeId];
        return `[data-ui=${style.ui}][_nodeId=${nodeId}] ${selector} {\n<%= DATA %>\n}`;
    }

    /**
     * generateIQStyles - generate IQ styles for specified node ID
     *
     * @param {string} nodeId node ID
     * @returns {string} CSS stylesheet data
     */
    function generateIQStyles(nodeId) {
        var iter = shmi.requires("visuals.tools.iterate.iterateObject"),
            iqText = "",
            style = styleData[nodeId];

        if (style) {
            iter(style.general, function(val, prop) {
                if (val !== null && typeof val === "object" && (typeof val.value === "undefined") && (typeof val.unit === "undefined")) { //IQ-style with nested properties
                    var innerText = "";
                    iter(val, function(subval, subprop) {
                        if (subval !== null) {
                            if (typeof subval === "string") {
                                innerText += subprop + ": " + subval + " !important;\n";
                            } else if (typeof subval === "object") {
                                innerText += subprop + ": " + String(subval.value) + subval.unit + " !important;\n";
                            }
                        }
                    });
                    iqText += "\n" + shmi.evalString(getIQSelector(nodeId, prop), {
                        DATA: innerText
                    });
                }
            });
        }
        return iqText;
    }

    /**
     * generateMedia - generate media query specific CSS styling
     *
     * @param {string} nodeId node ID
     * @param {string} media name of media query to generate style for
     * @returns {string} node styling
     */
    function generateMedia(nodeId, media) {
        var iter = shmi.requires("visuals.tools.iterate.iterateObject"),
            mediaText = "",
            style = styleData[nodeId];

        if (style && style.media && style.media[media]) {
            iter(style.media[media], function(val, prop) {
                if (prop === "visibility") {
                    return;
                }
                var pName = prop;
                if (pName.indexOf("offset-") === 0) {
                    pName = pName.replace("offset-", "");
                }
                if (val !== null) {
                    if (typeof val === "string") {
                        mediaText += pName + ": " + val + " !important;\n";
                    } else if (typeof val === "object") {
                        mediaText += pName + ": " + String(val.value) + val.unit + " !important;\n";
                    }
                }
            });
        }

        return mediaText;
    }

    /**
     * generateDevStyle - generate DevStyle for specified node ID
     *
     * @param {string} nodeId node ID
     * @returns {string} CSS stylesheet data
     */
    function generateDevStyle(nodeId) {
        let iter = shmi.requires("visuals.tools.iterate.iterateObject"),
            devStyleText = "",
            style = styleData[nodeId];

        if (style) {
            iter(style.devStyle, function(val, prop) {
                if (prop === "visibility" || val === null) {
                    return;
                }
                let pName = prop;

                if (pName.indexOf("offset-") === 0) {
                    pName = pName.replace("offset-", "");
                }

                if (typeof val === "string") {
                    devStyleText += `${pName}: ${val} !important;\n`;
                } else if (typeof val === "object" && val.unit) {
                    devStyleText += `${pName}: ${String(val.value)}${val.unit} !important;\n`;
                }
            });
        }

        return devStyleText;
    }

    var updateId = null,
        lastUpdateTime = 0; //stores timestamp of last emitted "designer.update-style" event

    /**
     * emitStyleUpdate - notify designer host app of style update
     *
     * @param {object} nodeInfo node info
     */
    function emitStyleUpdate(nodeInfo) {
        var cState = shmi.requires("designer.c2c.client-state"),
            rpc = shmi.requires("designer.c2c.rpc"),
            bb = null,
            parentBb = null,
            element = updateNodeCopy.element;

        bb = element.getBoundingClientRect();
        if (element.offsetParent) {
            parentBb = element.offsetParent.getBoundingClientRect();
        } else {
            parentBb = document.body.getBoundingClientRect();
        }
        nodeInfo.parentBox = parentBb;
        nodeInfo.x = Math.round(bb.left);
        nodeInfo.y = Math.round(bb.top);
        nodeInfo.width = Math.round(bb.width);
        nodeInfo.height = Math.round(bb.height);

        lastUpdateTime = Date.now();
        rpc.remoteCall(function(nInfo) {
            //attention: this event is fired in designer host application via RPC!
            shmi.fire("designer.update-style", {
                nodeId: nInfo.id,
                data: nInfo
            }, null);
            complete(null);
        }, function(status) {}, cState.getState().host, nodeInfo);
        updateNodeCopy = null;
    }

    /**
     * updateUi - request update of designer host app UI
     *
     * @param {object} nodeInfo node info
     * @param {string} [nodeHandle] node handle
     * @returns {undefined}
     */
    function updateUi(nodeInfo, nodeHandle = null, element) {
        var cState = shmi.requires("designer.c2c.client-state");

        if (!cState.getState().connected) {
            return;
        }

        //save current node info, to avoid style changes that do not match calculated dimensions
        updateNodeCopy = shmi.cloneObject(nodeInfo);
        updateNodeCopy.handle = nodeHandle;
        updateNodeCopy.element = element;

        if (updateId !== null) {
            clearImmediate(updateId);
        }
        if (Date.now() - lastUpdateTime > maxUiUpdateDelay) {
            emitStyleUpdate(updateNodeCopy);
        } else {
            updateId = setImmediate(emitStyleUpdate.bind(null, updateNodeCopy));
        }
    }

    /**
     * applyStyleData - apply generated stylesheet data & calculate resulting node dimensions
     *
     * @param {string} nodeId node ID
     * @param {string} nodeHandle node handle
     * @param {string} sheetData generated stylesheet data
     */
    function applyStyleData(nodeId, nodeHandle, sheetData) {
        var sheet = styleSheets[nodeId],
            model = shmi.requires("designer.app.model"),
            sc = shmi.requires("designer.sessionClient.controls"),
            element = model.getNodeElement(nodeHandle),
            style = styleData[nodeId],
            nodeInfo = null;

        sheet.textContent = sheetData;

        nodeInfo = shmi.cloneObject(model.getNode(nodeId));
        nodeInfo.layout = shmi.getCurrentLayout();
        if (element) {
            nodeInfo.movable = sc.isMovable(nodeId);
            nodeInfo.uiType = nodeInfo.ui;
            nodeInfo.name = nodeInfo.attributes['data-name'];
            nodeInfo.style = style;
            updateUi(nodeInfo, nodeHandle, element);
        } else {
            nodeInfo.movable = false;
        }
    }

    let recalcData = {},
        recalcId = null;

    /**
     * drawStyles - apply all requested style updates
     *
     */
    function drawStyles() {
        let iter = shmi.requires("visuals.tools.iterate").iterateObject,
            evt = document.createEvent("Event");

        iter(recalcData, (val, prop) => {
            applyStyleData(prop, val.handle, val.data);
        });
        recalcData = {};

        evt.initEvent("resize", true, true);
        window.dispatchEvent(evt);
    }

    /**
     * recalculateStyle - request recalculation of node styles / dimensions
     *
     * @param {string} nodeId node ID
     * @param {string} nodeHandle node handle
     * @param {string} sheetData stylesheet data
     */
    function recalculateStyle(nodeId, nodeHandle, sheetData) {
        recalcData[nodeId] = {
            handle: nodeHandle,
            data: sheetData
        };
        if (recalcId !== null) {
            clearImmediate(recalcId);
        }
        recalcId = setImmediate(drawStyles);
    }

    /**
     * getNodeSheet - generate stylesheet for specified node-ID
     *
     * @param {string} nodeId node ID
     * @param {boolean} [includeDevStyles=false] `true` to include dev-styles, `false` for publishing
     * @returns {string} node stylesheet
     */
    function getNodeSheet(nodeId, includeDevStyles = false) {
        let style = styleData[nodeId],
            generalText = null,
            devStyleText = null,
            iqStylesText = null,
            visText = "",
            sheetData = "";

        if (style) {
            generalText = generateGeneral(nodeId);
            if (generalText) {
                sheetData += shmi.evalString(getSelector(nodeId, null), {
                    DATA: generalText
                });
            }

            if (includeDevStyles) {
                devStyleText = generateDevStyle(nodeId);
                if (devStyleText) {
                    sheetData += shmi.evalString(getSelector(nodeId, null), {
                        DATA: devStyleText
                    });
                }
            }

            iqStylesText = generateIQStyles(nodeId);
            if (iqStylesText) {
                sheetData += "\n" + iqStylesText;
            }

            mqData.queries.forEach(function(mq) {
                var prop = mq.name,
                    mediaText = generateMedia(nodeId, prop);
                if (mediaText) {
                    sheetData += shmi.evalString(getSelector(nodeId, prop), {
                        DATA: mediaText
                    });
                }
            });

            visText = generateVisibility(nodeId);
            if (visText) {
                sheetData += "\n" + visText;
            }
        }

        return sheetData;
    }

    /**
     * generateCss - generate CSS styles for specified node
     *
     * @param {string} nodeHandle node handle
     */
    module.generateCss = function generateCss(nodeHandle) {
        const control = shmi.requires("designer.app.control"),
            nodeId = control.getPrimaryId(nodeHandle),
            style = styleData[nodeId];
        let sheetData = "";

        if (style) {
            sheetData = getNodeSheet(nodeId, true);
            recalculateStyle(nodeId, nodeHandle, sheetData);
        }
    };

    /**
     * getSheetData - get data of generated stylesheets
     *
     * @param {boolean} includeDevStyles `true` to include dev styles, `false` for publishing
     * @returns {string} CSS stylesheet data
     */
    module.getSheetData = function getSheetData(includeDevStyles = false) {
        const sheetNames = Object.keys(styleSheets);
        let sheetData = "";

        sheetNames.sort();
        sheetNames.forEach(function(sheetName) {
            if (includeDevStyles) {
                sheetData += styleSheets[sheetName].textContent + "\n";
            } else {
                sheetData += getNodeSheet(sheetName, false) + "\n"; //recalculate styles without dev-styles for publishing
            }
        });

        return sheetData;
    };
    /**
     * removeStyle - remove styling for specified node
     *
     * @param {string} nodeId node ID
     */
    module.removeStyle = function removeStyle(nodeId) {
        var sheet = styleSheets[nodeId];
        delete styleData[nodeId];
        if (sheet && sheet.parentNode) {
            sheet.parentNode.removeChild(sheet);
        }
        delete styleSheets[nodeId];
    };

    //set media query data on session startup
    shmi.onSessionReady(function onSessionReady() {
        mqData = shmi.cloneObject(shmi.getMediaQueries());
    });

    /**
     * setDeviceSpecific - activate / deactivate device specific styling mode
     *
     * @param {boolean} value `true` to activate device specific styling, `false` to disable
     */
    module.setDeviceSpecific = function setDeviceSpecific(value) {
        deviceSpecific = value;
    };

    /**
     * getDeviceSpecific - get state of device specific styling mode
     *
     * @returns {boolean} `true` if device specific styling is active, `false` else
     */
    module.getDeviceSpecific = function getDeviceSpecific() {
        return deviceSpecific;
    };

    /**
     * removeDevStyle - remove dev-styling for specified node
     * @param {string} nodeId node ID
     */
    module.removeDevStyle = function removeDevStyle(nodeId) {
        if (styleData[nodeId].devStyle) {
            styleData[nodeId].devStyle = {};
        }
    };

    /**
     * removeAllDevStyles - remove dev-styling for all nodes
     */
    module.removeAllDevStyles = function removeAllDevStyles() {
        for (const nodeId in styleData) {
            if (styleData[nodeId].devStyle) {
                styleData[nodeId].devStyle = {};
                module.generateCss(nodeId);
            }
        }
    };
}());
