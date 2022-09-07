/**
 * Module to handle interaction with controls in the loaded app and the layout editor.
 *
 * @module designer/sessionClient/controls
 */
(function() {
    var MODULE_NAME = "designer.sessionClient.controls",
        /** @lends module:designer/sessionClient/controls */
        module = shmi.pkg(MODULE_NAME);

    var dragOverQueue = [],
        idInterval = 0,
        pos = {
            TOP: 0,
            RIGHT: 1,
            BOTTOM: 2,
            LEFT: 3
        },
        mode = {
            LTR: 0,
            RTL: 1,
            TTB: 2
        },
        insertPos = {
            AFTER: "after",
            BEFORE: "before",
            INTO: "into"
        },
        activeNodes = {
            /*
            <node-id>: {
                "id": <node-id>,
                "control": <control-reference>,
                "element": <base-element>,
                "lastPos": null
            }
             */
        },
        selectedNode = null,
        positioning = false,
        gridSettings = {
            x: 10,
            y: 10,
            visible: true,
            snap: false
        },
        moveData = {},
        moveId = 0,
        DRAG_DATA_TYPE = "text/webiq";

    /**
     * getNodeElement - get element corresponding to node ID
     *
     * @param {string} nodeId node ID
     * @returns {HTMLElement|null} matching element or `null` if none was found
     */
    function getNodeElement(nodeId) {
        let handle = (typeof nodeId === "string") ? nodeId.split("@") : [],
            selector = handle.map((handlePart) => `[_nodeid=${handlePart}]`);

        selector.reverse();

        return selector.length ? document.querySelector(selector.join(" ")) : null;
    }

    /**
     * moveNodeByKey - move selected node with arrow keys
     *
     * @param {string} dir direction of movement, either `UP`, `RIGHT`, `DOWN` or `LEFT`
     * @param {boolean} ctrlKey state of control key, `true` for pressed, `false` for released
     */
    function moveNodeByKey(dir, ctrlKey) {
        var dx = 0,
            dy = 0;

        switch (dir) {
        case "LEFT":
            dx = -1;
            break;
        case "UP":
            dy = -1;
            break;
        case "RIGHT":
            dx = 1;
            break;
        case "DOWN":
            dy = 1;
            break;
        default:
        }

        if (!ctrlKey) {
            dx *= gridSettings.x;
            dy *= gridSettings.y;
            moveNode(selectedNode.id, dx, dy, gridSettings.snap);
        } else {
            moveNode(selectedNode.id, dx, dy, false);
        }
    }

    /**
     * handleKeyDown - event handler for `keydown` event
     *
     * @param {Event} event keyboard event
     */
    function handleKeyDown(event) {
        if (selectedNode) {
            if (event.keyCode === 80) { //"p"
                event.preventDefault();
                let model = shmi.requires("designer.app.model"),
                    node = model.getNode(selectedNode.id),
                    parentParts = selectedNode.id.split("@").slice(1);

                if (node && node.parent) {
                    let parentHandle = parentParts.length ? `${node.parent}@${parentParts.join("@")}` : node.parent,
                        element = getNodeElement(parentHandle);

                    if (element) {
                        selectNode(parentHandle, element, false);
                    }
                }
            } else if (isMovable(selectedNode.id)) {
                if (event.keyCode === 37) { //Left
                    event.preventDefault();
                    moveNodeByKey("LEFT", event.ctrlKey);
                } else if (event.keyCode === 38) { //Up
                    event.preventDefault();
                    moveNodeByKey("UP", event.ctrlKey);
                } else if (event.keyCode === 39) { //Right
                    event.preventDefault();
                    moveNodeByKey("RIGHT", event.ctrlKey);
                } else if (event.keyCode === 40) { //Down
                    event.preventDefault();
                    moveNodeByKey("DOWN", event.ctrlKey);
                }
            }
        }
    }

    /**
     * setupGlobalListeners - sets up listeners on window object to react to changes
     * of window dimension, scrolling and opening of container controls (slide-in, popup, etc.).
     *
     * @returns {undefined}
     */
    function setupGlobalListeners() {
        var cState = shmi.requires("designer.c2c.client-state"),
            rpc = shmi.requires("designer.c2c.rpc");

        //clear hover overlay when mouse leaves
        window.onmouseout = function(e) {
            if (!shmi.testParentChild(document.body, e.toElement)) {
                e.preventDefault();
                e.stopPropagation();
                rpc.remoteCall(function() {
                    //attention: this event is fired in designer host application via RPC!
                    shmi.requires("designer.workspace.layout.overlay").setHover(null);
                    complete(null);
                }, function(status) {
                }, cState.getState().host, null);
            }
        };

        document.body.addEventListener("mouseover", function() {
            rpc.remoteCall(function() {
                //attention: this event is fired in designer host application via RPC!
                shmi.requires("designer.workspace.layout.overlay").setHover(null);
                complete(null);
            }, function(status) {
            }, cState.getState().host, null);
        });

        window.onkeydown = handleKeyDown;

        //clear drag state when leaving window while dragging
        window.ondragleave = function(e) {
            rpc.remoteCall(function() {
                var ins = shmi.requires("designer.workspace.layout.insert");
                //attention: this event is fired in designer host application via RPC
                ins.setInsert(null);
                complete(null);
            }, function(status) {
                //dragged out of application window
            }, cState.getState().host, null);
            dragOverQueue = [];
            clearInterval(idInterval);
        };

        //check for intersections when dragging something into the window
        window.ondragenter = function(e) {
            startCheckInterval();
        };

        //inform designer of scrolling
        window.addEventListener("scroll", function() {
            rpc.remoteCall(function() {
                //attention: this event is fired in designer host application via RPC!
                shmi.fire("designer.editor-scroll", {}, null);
                complete(null);
            }, function(status) {}, cState.getState().host, null);
        }, true);

        //inform designer on resize
        window.onresize = function() {
            rpc.remoteCall(function() {
                //attention: this event is fired in designer host application via RPC!
                shmi.fire("designer.editor-scroll", {}, null);
                complete(null);
            }, function(status) {}, cState.getState().host, null);
        };

        //inform designer on CSS transition
        window.ontransitionend = function() {
            rpc.remoteCall(function() {
                //attention: this event is fired in designer host application via RPC!
                shmi.fire("designer.editor-scroll", {}, null);
                complete(null);
            }, function(status) {}, cState.getState().host, null);
        };

        //inform designer on container control opening
        shmi.listen("open", function() {
            rpc.remoteCall(function() {
                //attention: this event is fired in designer host application via RPC!
                shmi.fire("designer.editor-scroll", {}, null);
                complete(null);
            }, function(status) {}, cState.getState().host, null);
        });
    }

    //starts interval to update overlay-ui while dragging
    function startCheckInterval() {
        var cState = shmi.requires("designer.c2c.client-state"),
            rpc = shmi.requires("designer.c2c.rpc");

        clearInterval(idInterval);
        idInterval = setInterval(function() {
            if (dragOverQueue.length) {
                rpc.remoteCall(function(nid) {
                    var ins = shmi.requires("designer.workspace.layout.insert");
                    //attention: this event is fired in designer host application via RPC!
                    ins.setInsert(nid.id, nid.pos);
                    complete(null);
                }, function(status) {
                    //insert marker set
                }, cState.getState().host, {
                    id: dragOverQueue[dragOverQueue.length - 1][0],
                    pos: dragOverQueue[dragOverQueue.length - 1][1]
                });
            }
        }, 66);
    }

    //log app errors
    window.onerror = function(err) {
        console.log("APP_ERROR", err);
    };

    /**
     * lockRecursive - locks specified control and children recursively
     *
     * @param {object} control control instance
     *
     * @returns {undefined}
     */
    function lockRecursive(control) {
        control.lock(true);
        control.unlock = () => {}; //prevent scripts & dynamic lock conditions unlocking widgets in edit client
        if (Array.isArray(control.controls)) {
            control.controls.forEach(function(c) {
                lockRecursive(c);
            });
        }
    }

    /**
     * isMovable - test if specified node is movable
     *
     * @param {string} nodeHandle node ID
     * @returns {boolean} movable state, `true` if movable, `false` else
     */
    function isMovable(nodeHandle) {
        var s = shmi.requires("designer.client.styles"),
            nodeId = nodeHandle.split("@")[0],
            posValue = s.getActiveStyle(nodeId, "position");

        return ["absolute", "fixed"].includes(posValue.value);
    }

    /**
     * addOffset - add offset to specified node style
     *
     * @param {object} style node style
     * @param {string} dir offset direction, either `top`, `right`, `bottom` or `left`
     * @param {number} val offset in px
     * @param {boolean} snap snap to grid units
     * @param {object} maxOffsets maximum offsets for each direction to be contained in parent
     */
    function addOffset(style, dir, val, snap, maxOffsets) {
        var s = shmi.requires("designer.client.styles"),
            deviceSpecific = s.getDeviceSpecific(),
            layout = shmi.getCurrentLayout(),
            currentStyle = null,
            axis = ["top", "bottom"].includes(dir) ? "y" : "x",
            newValue = null;

        currentStyle = s.getActiveStyle(style.id, `offset-${dir}`);

        if (!deviceSpecific && currentStyle.layout) {
            return;
        }

        if (!currentStyle.value) {
            newValue = snap ? Math.sign(val) * gridSettings[axis] : val;
        } else if (snap) {
            let gridProportion = currentStyle.value.value / gridSettings[axis];
            if (!Number.isInteger(gridProportion)) {
                gridProportion = (Math.sign(val) === -1) ? Math.floor(gridProportion) : Math.ceil(gridProportion);
                newValue = gridProportion * gridSettings[axis];
            } else {
                newValue = (currentStyle.value.value / gridSettings[axis] + Math.sign(val)) * gridSettings[axis];
            }
        } else {
            newValue = currentStyle.value.value + val;
        }

        if (newValue < 0) {
            newValue = 0;
        } else if (newValue > maxOffsets[dir]) {
            newValue = maxOffsets[dir];
        }

        s.setStyle(style.id, `offset-${dir}`, {
            value: newValue,
            unit: "px"
        }, deviceSpecific ? layout : null);
    }

    /**
     * setOffset - set offset to specified node style
     *
     * @param {object} style node style
     * @param {string} dir offset direction, either `top`, `right`, `bottom` or `left`
     * @param {number} val offset in px
     * @param {object} maxOffsets maximum offsets for each direction to be contained in parent
     */
    function setOffset(style, dir, val, maxOffsets) {
        var s = shmi.requires("designer.client.styles"),
            deviceSpecific = s.getDeviceSpecific(),
            layout = shmi.getCurrentLayout(),
            currentStyle = null;

        currentStyle = s.getActiveStyle(style.id, `offset-${dir}`);

        if (!deviceSpecific && currentStyle.layout) {
            return;
        }

        if (val < 0) {
            val = 0;
        } else if (val > maxOffsets[dir]) {
            val = maxOffsets[dir];
        }

        s.setStyle(style.id, `offset-${dir}`, {
            value: val,
            unit: "px"
        }, deviceSpecific ? layout : null);
    }

    /**
     * getMaxOffsets - get maximum offsets for each direction to stay contained in offset-parent
     *
     * @param {HTMLElement} element element to retrieve offsets for
     * @returns {object} maximum offsets
     */
    function getMaxOffsets(element) {
        let base = element.getBoundingClientRect(),
            parentBounds = element.offsetParent ? element.offsetParent.getBoundingClientRect() : document.body.getBoundingClientRect(),
            top = 0,
            left = 0;

        top = Math.max(0, Math.floor(parentBounds.height - base.height));
        left = Math.max(0, Math.floor(parentBounds.width - base.width));

        if (gridSettings.snap) {
            top = Math.floor(top / gridSettings.y) * gridSettings.y;
            left = Math.floor(left / gridSettings.x) * gridSettings.x;
        }

        return {
            top,
            right: left,
            bottom: top,
            left
        };
    }

    /**
     * moveNode - move node by specified x- and y-offsets
     *
     * @param {string} nodeId node ID
     * @param {number} dx x-offset in px
     * @param {number} dy y-offset in px
     * @param {boolean} [snap] snap to grid units
     */
    function moveNode(nodeId, dx, dy, snap) {
        var s = shmi.requires("designer.client.styles"),
            style = s.getStyle(nodeId),
            iter = shmi.requires("visuals.tools.iterate").iterateObject,
            element = getNodeElement(nodeId),
            maxOffsets = element ? getMaxOffsets(element) : {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            };

        style.id = nodeId;
        switch (style.align) {
        case "TOP_LEFT":
            addOffset(style, "top", dy, !!snap, maxOffsets);
            addOffset(style, "left", dx, !!snap, maxOffsets);
            break;
        case "TOP_RIGHT":
            addOffset(style, "top", dy, !!snap, maxOffsets);
            addOffset(style, "right", -dx, !!snap, maxOffsets);
            break;
        case "BOTTOM_RIGHT":
            addOffset(style, "bottom", -dy, !!snap, maxOffsets);
            addOffset(style, "right", -dx, !!snap, maxOffsets);
            break;
        case "BOTTOM_LEFT":
            addOffset(style, "bottom", -dy, !!snap, maxOffsets);
            addOffset(style, "left", dx, !!snap, maxOffsets);
            break;
        default:
        }

        moveData[nodeId] = true;

        shmi.caf(moveId);
        moveId = shmi.raf(function() {
            iter(moveData, function(val, prop) {
                s.generateCss(prop);
            });
            moveData = {};
        });
    }

    /**
     * placeNode - place node at specified x- and y-offsets
     *
     * @param {string} nodeId node ID
     * @param {number} x x-offset in px
     * @param {number} y y-offset in px
     */
    function placeNode(nodeId, x, y) {
        var s = shmi.requires("designer.client.styles"),
            style = s.getStyle(nodeId),
            iter = shmi.requires("visuals.tools.iterate").iterateObject,
            element = getNodeElement(nodeId),
            maxOffsets = element ? getMaxOffsets(element) : {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            };

        style.id = nodeId;
        switch (style.align) {
        case "TOP_LEFT":
            setOffset(style, "top", y, maxOffsets);
            setOffset(style, "left", x, maxOffsets);
            break;
        case "TOP_RIGHT":
            setOffset(style, "top", y, maxOffsets);
            setOffset(style, "right", x, maxOffsets);
            break;
        case "BOTTOM_RIGHT":
            setOffset(style, "bottom", y, maxOffsets);
            setOffset(style, "right", x, maxOffsets);
            break;
        case "BOTTOM_LEFT":
            setOffset(style, "bottom", y, maxOffsets);
            setOffset(style, "left", x, maxOffsets);
            break;
        default:
        }

        moveData[nodeId] = true;

        shmi.caf(moveId);
        moveId = shmi.raf(function() {
            iter(moveData, function(val, prop) {
                s.generateCss(prop);
            });
            moveData = {};
        });
    }

    /**
     * setMoving - configure control base element for free positioning
     *
     * @param {HTMLElement} element control base element
     * @param {Event} event original JS event
     * @param {string} nodeId node ID
     */
    function setMoving(element, event, nodeId) {
        var x = event.clientX,
            y = event.clientY,
            handlers = null;

        event.preventDefault(); //prevent drag operation from starting
        element.style.cursor = "move";

        handlers = {
            onmousemove: function(e) {
                if (!positioning) {
                    return;
                }
                var dx = e.clientX - x,
                    dy = e.clientY - y;

                e.stopPropagation();

                x += dx;
                y += dy;

                emitRemote("designer.client-move", {
                    id: nodeId,
                    dx: dx,
                    dy: dy
                });
            },
            onmouseup: function() {
                positioning = false;
                element.style.cursor = "";
                document.removeEventListener("mouseup", handlers.onmouseup);
                document.removeEventListener("mousemove", handlers.onmousemove);
                document.removeEventListener("mouseleave", handlers.onmouseup);
                emitRemote("designer.client-drag", {
                    dragging: false
                });
            }
        };

        document.addEventListener("mouseup", handlers.onmouseup);
        document.addEventListener("mouseleave", handlers.onmouseup);
        document.addEventListener("mousemove", handlers.onmousemove);
    }

    /**
     * getDragData - retrieve drag data attached to event
     *
     * @param {Event} event JS event
     * @returns  {object|null} either JS object containing drag data or `null` if no drag data associated
     */
    function getDragData(event) {
        var dragData = event.dataTransfer.getData(DRAG_DATA_TYPE),
            result = null;

        if (dragData) {
            try {
                result = JSON.parse(dragData);
            } catch (exc) {
                /* SOL */
            }
        }

        return result;
    }

    /**
     * selectNode - set node as current selection
     *
     * @param {string} nodeHandle node handle
     * @param {HTMLElement} element control base element
     * @param {boolean} noNotify `true` to prevent UI update notification for designer host
     */
    function selectNode(nodeHandle, element, noNotify) {
        var cState = shmi.requires("designer.c2c.client-state"),
            rpc = shmi.requires("designer.c2c.rpc");

        if (selectedNode && selectedNode.element !== element) {
            selectedNode.element.ondrag = null;
            selectedNode = null;
        }

        if (element && nodeHandle) {
            selectedNode = {
                id: nodeHandle,
                element: element
            };
        }

        if (!noNotify) {
            rpc.remoteCall(function(nId) {
                var selection = shmi.requires("designer.workspace.layout.selection");

                if (selection.getSelected() !== nId) {
                    selection.setSelected(nId);
                }
                complete(null);
            }, function(status) {
                //control selected
            }, cState.getState().host, nodeHandle);
        }
    }

    /**
     * editTemplate - load content template in layout editor
     *
     * @param {string} template template ID
     * @param {string} nodeHandle handle of node that contains template
     */
    function editTemplate(template, nodeHandle) {
        var cState = shmi.requires("designer.c2c.client-state"),
            rpc = shmi.requires("designer.c2c.rpc");

        rpc.remoteCall(function(param) {
            var editor = shmi.requires("designer.workspace.layout.editor");
            editor.setTemplate(param.node, null, param.handle);
            complete(null);
        }, function(status) {
            //editing template set
        }, cState.getState().host, {
            node: template,
            handle: nodeHandle ? nodeHandle : null
        });
    }

    /**
     * emitRemote - emit event in designer host app
     *
     * @param {string} type event type
     * @param {object} data event detail data
     * @param {function} [callback] optional callback to run on completion
     */
    function emitRemote(type, data, callback) {
        var cState = shmi.requires("designer.c2c.client-state"),
            rpc = shmi.requires("designer.c2c.rpc");

        rpc.remoteCall(function(param) {
            shmi.fire(param.type, param.data, null);
            complete(null);
        }, function(status) {
            //event emitted
            if (typeof callback === "function") {
                callback();
            }
        }, cState.getState().host, { type: type, data: data });
    }

    /**
     * getParentGroup - get parent group node ID
     *
     * @param {HTMLElement} element
     * @returns {string|null} parent group node ID or `null` if none found
     */
    function getParentGroup(element) {
        let p = element.parentNode;
        while (p !== document.body && p.getAttribute("data-ui") !== "group" && p.parentNode) {
            p = p.parentNode;
        }
        if (p === document.body) {
            return null;
        }
        return p ? p.getAttribute("_nodeid") : null;
    }

    /**
     * initNode - initialize control for use with layout editor
     *
     * @param {object} src     source control instance
     * @param {HTMLElement} srcElem base html element
     * @param {string} nodeId  node ID
     *
     * @returns {undefined}
     */
    function initNode(src, srcElem, nodeId) {
        var cState = shmi.requires("designer.c2c.client-state"),
            rpc = shmi.requires("designer.c2c.rpc"),
            model = shmi.requires("designer.app.model"),
            lastClick = -1,
            nodeHandle = nodeId,
            parentId = null;

        nodeHandle = model.getNodeHandle(srcElem);
        parentId = getParentGroup(srcElem);

        if (activeNodes[nodeHandle] !== undefined) {
            activeNodes[nodeHandle].tokens.forEach(function forEachToken(t) {
                t.unlisten();
            });
            activeNodes[nodeHandle].tokens = [];
        }

        activeNodes[nodeHandle] = {
            id: nodeId,
            parentId: parentId,
            control: src,
            element: srcElem,
            lastPos: null,
            tokens: []
        };

        lockRecursive(src);

        //attach drag handler to all controls except base level container & views
        if ((src.parentContainer !== null) && (src.uiType !== "view")) {
            srcElem.setAttribute("draggable", "true");
            srcElem.ondragstart = function(dragEvent) {
                var n = model.getNode(nodeId),
                    dragData = null,
                    dragImage = null;

                dragEvent.stopPropagation();

                if (n) {
                    selectNode(nodeHandle, srcElem);

                    dragImage = new Image();
                    dragImage.src = shmi.designer.tools.nodeFs.getBasePath() + "/designer/pics/custom/images/transparent.png";
                    dragEvent.dataTransfer.setDragImage(dragImage, 0, 0);

                    if (isMovable(n.id)) {
                        positioning = true;
                        emitRemote("designer.client-drag", {
                            dragging: true
                        });
                        setMoving(srcElem, dragEvent, nodeHandle);
                        return;
                    }

                    dragData = {
                        uiType: n.ui,
                        variant: null,
                        action: "move",
                        id: nodeHandle
                    };
                    dragEvent.dataTransfer.setData(DRAG_DATA_TYPE, JSON.stringify(dragData));

                    rpc.remoteCall(function(nData) {
                        shmi.fire("designer.drag", {
                            nodeId: nData.id,
                            data: nData.data
                        });
                        complete(null);
                    }, function(status) {
                        //control drag started
                    }, cState.getState().host, dragData);
                }
                startCheckInterval();
            };
        } else {
            srcElem.removeAttribute("draggable");
            srcElem.ondragstart = null;
        }

        //add listner to select/deselect controls & enter panel controls
        srcElem.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (Date.now() - lastClick < 250) {
                var templ = shmi.requires("designer.template"),
                    dblNode = model.getNode(nodeId);
                if (dblNode && ((dblNode.controlType === templ.controlTypes.SINGLE_TEMPLATE) || (dblNode.controlType === templ.controlTypes.VIEW_TEMPLATE))) {
                    let templateNode = model.getNode(nodeId);
                    editTemplate(templateNode.groupId ? templateNode.groupId : nodeId, templateNode.groupId || templateNode.parentGroupId ? nodeHandle : null);
                }
            } else {
                selectNode(nodeHandle, srcElem);
            }
            lastClick = Date.now();
        };

        //add listener to open a context menu for a widget
        srcElem.oncontextmenu = function(e) {
            e.preventDefault();
            e.stopPropagation();
            rpc.remoteCall(function(nid) {
                //attention: this event is fired in designer host application via RPC!
                shmi.fire("designer.editor-context-menu", {
                    nodeId: nid
                }, null);
                complete(null);
            }, function(status) { }, cState.getState().host, nodeHandle);
            selectNode(nodeHandle, srcElem);
        };

        //attach listner to clean up when control is deleted
        activeNodes[nodeHandle].tokens.push(shmi.listen("delete-control", function(delEvt) {
            tearDownNode(nodeHandle);
        }, {
            "detail.name": src.getName()
        }));

        //attach listener to display hover overlay in layout editor
        srcElem.onmouseover = function(e) {
            if ((e.toElement === srcElem) || shmi.testParentChild(srcElem, e.toElement)) {
                e.stopPropagation();
                rpc.remoteCall(function(nHandle) {
                    //attention: this event is fired in designer host application via RPC!
                    shmi.requires("designer.workspace.layout.overlay").setHover(nHandle);
                    complete(null);
                }, function(status) {
                    //hover state set
                }, cState.getState().host, nodeHandle);
            }
        };

        //attach listener to show insert marker when dragged over
        srcElem.ondragover = function(e) {
            var bb = srcElem.getBoundingClientRect(),
                curPos = {
                    x: e.clientX,
                    y: e.clientY
                },
                relPos = {
                    x: null,
                    y: null
                };

            if (positioning || !(e.dataTransfer && e.dataTransfer.types.includes(DRAG_DATA_TYPE))) {
                return false;
            }

            relPos.x = bb.left + bb.width - curPos.x;
            relPos.y = bb.top + bb.height - curPos.y;
            relPos.x = relPos.x / bb.width;
            relPos.y = relPos.y / bb.height;

            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';

            var im = getInsertMode(src);
            var ip = getInsertPosition(src, im, relPos);
            activeNodes[nodeHandle].lastPos = ip;
            dragOverQueue.push([nodeHandle, ip /* ins.BOTTOM */, relPos]);
            if (idInterval === 0) {
                startCheckInterval();
            }

            return false;
        };

        //attach listner to detect drops while dragging to move / insert controls
        srcElem.ondrop = function(e) {
            var dragData = getDragData(e);
            if (!dragData) {
                return; //ignore drags that have no payload (e.g. positioning)
            }

            e.preventDefault();
            e.stopPropagation();
            rpc.remoteCall(function(nData) {
                var ins = shmi.requires("designer.workspace.layout.insert");
                //attention: this event is fired in designer host application via RPC
                ins.setInsert(null);

                shmi.fire("designer.drop", {
                    location: nData.pos ? nData.pos.insert : "after",
                    nodeId: nData.id,
                    data: nData.data
                });

                complete(null);
            }, function(status) {
                //control dropped
            }, cState.getState().host, {
                data: dragData,
                pos: activeNodes[nodeHandle].lastPos,
                id: nodeHandle
            });
            dragOverQueue = [];
            clearInterval(idInterval);
            idInterval = 0;
        };

        //attach listener to clear drag state when leaving element
        srcElem.ondragleave = function(e) {
            e.stopPropagation();
            dragOverQueue = [];
            clearInterval(idInterval);
            idInterval = 0;
        };

        //attach listener to clear drag state when dragging has ended (without drop)
        srcElem.ondragend = function(e) {
            if (positioning) {
                return; //ignore drags that have no payload (e.g. positioning)
            }
            e.stopPropagation();
            rpc.remoteCall(function() {
                var ins = shmi.requires("designer.workspace.layout.insert");
                //attention: this event is fired in designer host application via RPC
                ins.setInsert(null);
                complete(null);
            }, function(status) {
                //drag ended
            }, cState.getState().host, null);
            dragOverQueue = [];
            clearInterval(idInterval);
            idInterval = 0;
        };
    }

    /**
     * tearDownNode - clean up drag & drop listeners of node
     *
     * @param {string} nodeId node ID
     *
     * @returns {undefined}
     */
    function tearDownNode(nodeId) {
        var nodeInfo = activeNodes[nodeId];

        if (nodeInfo) {
            nodeInfo.element.onclick = null;
            nodeInfo.element.oncontextmenu = null;
            nodeInfo.element.onmouseover = null;
            nodeInfo.element.ondragover = null;
            nodeInfo.element.ondrop = null;
            nodeInfo.element.ondragleave = null;
            nodeInfo.element.ondragend = null;
            nodeInfo.element.ondragstart = null;
            nodeInfo.element.ondrag = null;
            nodeInfo.tokens.forEach(function(t) {
                t.unlisten();
            });
            nodeInfo.tokens = [];
            delete activeNodes[nodeId];
        }
    }

    /**
     * checkParent - test whether specified parent handle corresponds to parent of child instance
     *
     * @param {string} parentHandle parent node handle
     * @param {object} childInstance child control instance
     * @returns {boolean} `true` if parent handle corresponds to parent control, `false` else
     */
    function checkParent(parentHandle, childInstance) {
        let model = shmi.requires("designer.app.model"),
            parentInstance = model.getControlInstance(parentHandle),
            isParent = false;

        if (parentHandle === null) {
            return true;
        }

        let parent = childInstance.getParent();
        while (parent && !isParent) {
            if (parentInstance === parent) {
                isParent = true;
            } else {
                parent = parent.getParent();
            }
        }

        return isParent;
    }

    /**
     * onControlEnable - handler for control "enable" events - starts
     * initialization of controls for layout editor.
     *
     * @param {object} evt enable event
     *
     * @returns {undefined}
     */
    function onControlEnable(evt) {
        var src = evt.source,
            srcElem = src.element,
            nodeId = srcElem.getAttribute("_nodeid"),
            sc = shmi.requires("designer.sessionClient"),
            model = shmi.requires("designer.app.model");

        if (nodeId && model.getNode(nodeId) && (model.getNode(nodeId).template === sc.getTemplate()) && checkParent(sc.getHandle(), src)) {
            initNode(src, srcElem, nodeId);
        } else {
            lockRecursive(src);
        }
    }

    /**
     * setupControls - initially setup global listeners to check for controls
     *
     * @returns {undefined}
     */
    module.setupControls = function setupControls() {
        shmi.listen("enable", onControlEnable);
        setupGlobalListeners();
    };

    /**
     * updateControls - check for new controls and update initialization state
     * of active controls.
     *
     * @returns {undefined}
     */
    module.updateControls = function updateControls() {
        var iter = shmi.requires("visuals.tools.iterate.iterateObject"),
            layout = shmi.requires("visuals.session.Layout"),
            sc = shmi.requires("designer.sessionClient"),
            model = shmi.requires("designer.app.model");

        iter(activeNodes, function(nodeInfo, nodeId) {
            tearDownNode(nodeId);
        });

        iter(layout, function(ctrlArray, uiType) {
            if (uiType === "topLevel") {
                return;
            }

            ctrlArray.forEach(function(ctrl) {
                var nodeId = ctrl.element.getAttribute("_nodeid"),
                    srcElem = ctrl.element,
                    handle = model.getNodeHandle(srcElem),
                    templateNode = null;

                handle = model.getParentHandle(handle);

                if (ctrl.isActive() && nodeId) {
                    let node = model.getNode(nodeId);
                    if (sc.getHandle()) {
                        templateNode = model.getNode(sc.getHandle());
                    }
                    if (node && (node.template === sc.getTemplate())) {
                        if (templateNode && templateNode.ui === "group" && sc.getHandle() === handle) {
                            initNode(ctrl, ctrl.element, nodeId);
                            return;
                        }

                        if (handle && sc.getHandle() && model.getParentHandle(sc.getHandle()) === handle) {
                            initNode(ctrl, ctrl.element, nodeId);
                            return;
                        }

                        if ((sc.getHandle() === handle) || (sc.getHandle() === null && handle === sc.getTemplate())) {
                            initNode(ctrl, ctrl.element, nodeId);
                            return;
                        }
                    }
                }

                if (ctrl.isActive()) {
                    lockRecursive(ctrl);
                }
            });
        });
    };

    /**
     * setSelected - set currently selected control
     *
     * @param {string} nodeHandle node handle
     */
    module.setSelected = function setSelected(nodeHandle) {
        var element = getNodeElement(nodeHandle);

        if (element) {
            selectNode(nodeHandle, element, true);
        } else {
            selectNode(null, null, true);
        }

        let model = shmi.requires("designer.app.model"),
            node = model.getNode(nodeHandle);

        if (node && node.groupId) {
            console.log(`Selected node handle: ${nodeHandle} (group ID: ${node.groupId})`);
        } else {
            console.log(`Selected node handle: ${nodeHandle}`);
        }
    };

    /**
     * getSelected - get node ID of currently selected control
     *
     * @returns {string|null} node ID of selected control or `null` if none selected
     */
    module.getSelected = function getSelected() {
        return selectedNode ? selectedNode.id : null;
    };

    /**
     * moveSelected - move selected control
     *
     * @param {number} dx amount of px to translate on X axis
     * @param {number} dy amount of px to translate on Y axis
     */
    module.moveSelected = function moveSelected(dx, dy) {
        if (selectedNode && isMovable(selectedNode.id)) {
            moveNode(selectedNode.id, dx, dy);
        }
    };

    /**
     * placeSelected - place selected control at specified offsets
     *
     * @param {number} x x-axis offset in px to set
     * @param {number} y y-axis offset in px to set
     */
    module.placeSelected = function placeSelected(x, y) {
        if (selectedNode && isMovable(selectedNode.id)) {
            placeNode(selectedNode.id, x, y);
        }
    };

    /**
     * moveSelectedByKey - move selected control in fixed increments (arrow keys)
     *
     * @param {string} dir direction of movement, either `UP`, `RIGHT`, `DOWN` or `LEFT`
     * @param {boolean} ctrlKey state of control key, `true` means control pressed and causes movement by smaller (1px) increments
     */
    module.moveSelectedByKey = function moveSelectedByKey(dir, ctrlKey) {
        if (selectedNode && isMovable(selectedNode.id)) {
            moveNodeByKey(dir, ctrlKey);
        }
    };

    /**
     * setGrid - set grid dimensions (used for arrow key movement)
     *
     * @param {object} options grid options
     * @param {number} options.x X axis grid size in px
     * @param {number} options.y Y axis grid size in px
     * @param {boolean} options.visible `true` when grid is enabled, `false` else
     * @param {boolean} options.snap `true` when snap to grid is enabled, `false` else
     */
    module.setGrid = function setGrid(options) {
        gridSettings.x = options.x;
        gridSettings.y = options.y;
        gridSettings.visible = options.visible;
        gridSettings.snap = options.snap;
    };

    /**
     * isMovable - test if node is movable (position absolute/fixed)
     *
     * @param {string} nodeId node ID
     *
     * @returns {boolean} `true` if node is movable, `false` else
     */
    module.isMovable = isMovable;

    /**
     * getInsertMode - get insert mode of control based on container layout mode.
     *
     * May return the following modes:
     * 0 := LTR - Left To Right
     * 1 := RTL - Right To Left
     * 2 := TTB - Top To Bottom
     *
     * @param {object} control control instance
     *
     * @returns {number} insert mode
     */
    function getInsertMode(control) {
        var parentContainer = (control.uiType === "container") ? control : control.parentContainer;
        if (parentContainer) {
            var cl = parentContainer.element.classList;
            if (cl.contains("flex-layout")) {
                if (cl.contains("column-orientation")) {
                    return mode.TTB;
                } else {
                    return mode.LTR;
                }
            } else if (cl.contains("inline-layout")) {
                return mode.LTR;
            } else if (cl.contains("auto-width")) {
                //float
                var cs = getComputedStyle(control.element);
                if (cs.float === "right") {
                    return mode.RTL;
                } else {
                    return mode.LTR;
                }
            } else {
                return mode.TTB;
            }
        } else {
            return mode.TTB;
        }
    }

    /**
     * getInsertPosition - get insert position based on insert mode and current
     * relative drag position.
     *
     * @param {object} control control instance (dragged over)
     * @param {number} insMode insert mode
     * @param {string} relPos  relative drag position
     *
     * @returns {string} insert position
     */
    function getInsertPosition(control, insMode, relPos) {
        var insPos = {
            pos: pos.BOTTOM,
            insert: "after",
            mode: insMode
        };
        switch (insMode) {
        case mode.LTR:
            if (relPos.x < 0.5) {
                insPos.pos = pos.RIGHT;
                insPos.insert = insertPos.AFTER;
            } else {
                insPos.pos = pos.LEFT;
                insPos.insert = insertPos.BEFORE;
            }
            break;
        case mode.RTL:
            if (relPos.x < 0.5) {
                insPos.pos = pos.RIGHT;
                insPos.insert = insertPos.BEFORE;
            } else {
                insPos.pos = pos.LEFT;
                insPos.insert = insertPos.AFTER;
            }
            break;
        case mode.TTB:
            if (relPos.y < 0.5) {
                insPos.pos = pos.BOTTOM;
                insPos.insert = insertPos.AFTER;
            } else {
                insPos.pos = pos.TOP;
                insPos.insert = insertPos.BEFORE;
            }
            break;
        default:
        }
        if ((control.uiType === "container") || (control.uiType === "view")) {
            insPos.insert = insertPos.INTO;
        }

        return insPos;
    }
}());
