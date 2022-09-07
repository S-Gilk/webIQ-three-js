/**
 * Session client used to load edited app in edit-client and connect with designer host application.
 *
 * Normal login procedure is modified to provide editing functionality to the designer host application.
 * This module is configured as `session-client` via injection into the app configuration. App configuration
 * will be provided by the host application with a base64 encoded URL-parameter.
 *
 * @module designer/sessionClient
 */
(function() {
    var MODULE_NAME = "designer.sessionClient",
        /** @lends module:designer/sessionClient */
        module = shmi.pkg(MODULE_NAME);

    var editClientName = "webiq-edit-client",
        editClientConnected = false,
        isPreview = false,
        clearLog = false,
        currentTemplate = "root",
        currentHandle = null,
        modelPath =`${__dirname}/.designer/app-model.json`,
        tempModelPath = `${__dirname}/.designer/tmp-app-model.json`,
        currentOverlay = null,
        errorLogBuffer = [],
        currentLoginToken = null;

    /**
     * getUrlParams - get URL parameters from window.location
     *
     * @returns {object} URL parameter key-, value-map
     */
    function getUrlParams() {
        var url = new URL(window.location.href),
            entries = url.searchParams.entries(),
            entry = entries.next(),
            result = {};

        while (!entry.done) {
            result[entry.value[0]] = entry.value[1];
            entry = entries.next();
        }

        return result;
    }

    /**
     * getToken - decode base64 encoded URL parameter token
     *
     * @returns {object} token parameter data
     */
    function getToken() {
        var url = new URL(window.location.href),
            tokenText = url.searchParams.get("token"),
            result = null;

        if (tokenText) {
            result = JSON.parse(atob(tokenText));
        }

        return result;
    }

    /**
     * loadLayout - parse & load layout model
     *
     * @param {boolean} [isTemp=false] if `true` load from temporary model data
     */
    function loadLayout(isTemp = false) {
        var m = shmi.requires("designer.app.model"),
            fs = require('fs'),
            modelUrl = isTemp ? tempModelPath : modelPath;

        window.lastModel = null;

        if (!fs.existsSync(__dirname + "/.designer")) {
            fs.mkdirSync(__dirname + "/.designer");
        }

        if (fs.existsSync(modelUrl)) { //load app from stored JSON model when available...
            fs.readFile(modelUrl, "utf8", function(err, data) {
                if (!err) {
                    loadModel(data);
                    shmi.fire("designer.editCLient.loadLayout", {
                        current: 1,
                        total: 1
                    }, m);
                } else {
                    console.error(err);
                }
            });
        } else { //load app from HTML templates when JSON model not available yet
            m.loadLayout("layouts/default.html", function(layoutModel, loadedUrls) {
                var ac = shmi.requires("designer.app.control"),
                    modelData = {
                        templates: layoutModel,
                        groups: {
                            map: m.getGroupMap(),
                            ids: m.getGroupIds()
                        }
                    };

                fs.writeFileSync(modelPath, JSON.stringify(modelData, null, "    "), "utf8");
                ac.instanceModel(layoutModel, onControlsInitialized);
                loadedUrls.forEach(function(fn) {
                    let fileUrl = __dirname + "/" +fn;
                    if (fs.existsSync(fileUrl)) {
                        fs.unlinkSync(fileUrl);
                    } else {
                        console.info(MODULE_NAME, "template file not found:", fileUrl, " already removed group template, used multiple times?");
                    }
                });
            });
        }
    }

    /**
     * getParentOverlays - opens overlay control including all parent overlays, to make it visible
     *
     * @param {object} control overlay control object
     * @param {object[]} [povs] parent overlays array, used for recursion
     * @returns {object[]} array of parent overlay control objects
     */
    function getParentOverlays(control, povs) {
        var ctrl = null,
            parentOverlays = povs || [];

        if (control) {
            if ((typeof control.open === "function") && (typeof control.close === "function")) {
                ctrl = {
                    open: function() {
                        control.open();
                    },
                    close: function() {
                        control.close();
                    },
                    id: control.element.getAttribute("_nodeid")
                };
                parentOverlays.push(ctrl);
            } else if ((typeof control.show === "function") && (typeof control.hide === "function")) {
                ctrl = {
                    open: function() {
                        control.show();
                    },
                    close: function() {
                        control.hide();
                    },
                    id: control.element.getAttribute("_nodeid")
                };
                parentOverlays.push(ctrl);
            }
            if (control.parentContainer) {
                getParentOverlays(control.parentContainer, parentOverlays);
            } else {
                parentOverlays.reverse();
            }
        }

        return parentOverlays;
    }

    /**
     * isOverlay - test if control matching given node-id is an overlay; returns object to open / close overlay or null.
     *
     * @param {string} nodeId node ID
     * @returns {object|null} overlay control object or `null` if none found
     */
    function isOverlay(nodeId) {
        var ctrl = null,
            model = shmi.requires("designer.app.model"),
            tmpCtrl = model.getControlInstance(nodeId),
            povs = null;

        if (tmpCtrl === null && module.getTemplate() !== "root") {
            tmpCtrl = model.getControlInstance(module.getTemplate());
        }

        if (tmpCtrl) {
            povs = getParentOverlays(tmpCtrl);
            if (povs.length > 0) {
                ctrl = {
                    open: function() {
                        povs.forEach(function(p) {
                            p.open();
                        });
                    },
                    close: function() {
                        povs.forEach(function(p) {
                            p.close();
                        });
                    },
                    id: povs[povs.length - 1].id
                };
            }
        }

        return ctrl;
    }

    //module export to check if node is overlay control

    /**
     * isOverlay - check if node is overlay control
     *
     * @param {string} nodeId node ID
     * @returns {object|null} overlay control object, or `null` if node is node an overlay
    */
    module.isOverlay = isOverlay;

    /**
     * isPreview - test if session is preview client
     *
     * @returns {boolean} `true` if session is preview client, `false` else
     */
    module.isPreview = function() {
        return isPreview;
    };

    /**
     * saveLayout - save layout model data to disk
     *
     * @param {boolean} [isTemp=false] create temporary save if `true` (used for preview)
     */
    module.saveLayout = function saveLayout(isTemp = false) {
        let f = require('fs'),
            m = shmi.requires("designer.app.model"),
            modelData = {
                templates: m.getTemplates(),
                groups: {
                    map: m.getGroupMap(),
                    ids: m.getGroupIds()
                }
            },
            fileUrl = isTemp ? tempModelPath : modelPath;

        f.writeFileSync(fileUrl, JSON.stringify(modelData, null, 4), "utf8");
    };

    /**
     * setOverlay - set currently selected overlay
     *
     * @param {object} overlay overlay control object
     */
    module.setOverlay = function(overlay) {
        if (currentOverlay) {
            if (!overlay || (overlay && currentOverlay.id !== overlay.id)) {
                currentOverlay.close();
                currentOverlay = null;
            }
        }

        if (overlay) {
            overlay.open();
        }

        currentOverlay = overlay;

        if (currentOverlay) {
            currentOverlay.activeTemplate = module.getTemplate();
        }
    };

    /**
     * getOverlay - get currently selected overlay
     *
     * @returns {object|null} overlay control object or `null` if none set
     */
    module.getOverlay = function() {
        return currentOverlay;
    };

    /**
     * setTemplate - set name of currently edited template
     *
     * @param  {string} templateName name of template
     * @param {string} [nodeHandle] node Handle for overlay
     * @return {undefined}
     */
    module.setTemplate = function setTemplate(templateName, nodeHandle = null) {
        var updateOverlay = false;
        if (templateName !== currentTemplate) {
            updateOverlay = true;
        }
        currentTemplate = templateName;
        currentHandle = nodeHandle;

        if (updateOverlay) {
            module.setOverlay(module.isOverlay(nodeHandle ? nodeHandle : templateName));
        }
    };

    /**
     * getTemplate - retrieve name of currently edited template
     *
     * @return {string}  name of template
     */
    module.getTemplate = function getTemplate() {
        return currentTemplate;
    };

    /**
     * getHandle - get current template root node handle
     *
     * @returns {string|null} node handle or `null` if none set
     */
    module.getHandle = function getHandle() {
        return currentHandle;
    };

    /**
     * getLoginToken - get token provided for session login
     *
     * @returns {object} login token data
     */
    module.getLoginToken = function() {
        return shmi.cloneObject(currentLoginToken);
    };

    /**
     * notify - send event to host application to display notification
     *
     * @param {string} message notification message
     * @param {string} title notification title
     * @param {object} [param={}] dynamic notification parameters
     */
    module.notify = function notify(message, title, param = {}) {
        var cState = shmi.requires("designer.c2c.client-state"),
            rpc = shmi.requires("designer.c2c.rpc"),
            state = cState.getState();

        if (state && state.host) {
            //RPC - fire notification event in host application
            rpc.remoteCall(function(data) {
                shmi.fire("designer.notification", {
                    message: data.message,
                    title: data.title,
                    param: data.param
                });
                complete(null);
            }, () => {
            //..notification event sent
            }, state.host, {
                message: message,
                title: title,
                param: param
            });
        } else {
            console.error("Cannot send notification event: Host application not connected.");
        }
    };

    /**
     * setupWebviewListener - setup listener that fires `designer.webviewMouseDown` events in host app.
     * These events are used to detect clicks into the webview area which is impossible from the ouside.
     *
     */
    function setupWebviewListener() {
        window.addEventListener("mousedown", () => { //use "mousdown" since "click" is preventDefaulted on widget elements
            var cState = shmi.requires("designer.c2c.client-state"),
                rpc = shmi.requires("designer.c2c.rpc"),
                state = cState.getState();

            if (state && state.host) {
                rpc.remoteCall(function(data) {
                    shmi.fire("designer.webviewMouseDown", {});
                    complete(null);
                }, () => {
                    //event sent to host app
                }, state.host, {});
            }
        });
    }

    /**
     * startupEditClient - wait for connection establishment with edit client
     *
     * @param {boolean} [isTemp=false] if `true` load from temporary model data
     */
    function startupEditClient(isTemp = false) {
        var cState = shmi.requires("designer.c2c.client-state"),
            con = shmi.requires("designer.c2c.connection"),
            controls = shmi.requires("designer.sessionClient.controls");

        controls.setupControls();
        cState.onConnect((evt) => {
            onConnect(evt, isTemp);
        });

        //setup listener to detect clicks in webview
        setupWebviewListener();

        //establish C2C connection
        con.connect(editClientName, false, con.MODE_EDIT);
    }

    /**
     * onConnect - handle edit client connection establishment
     *
     * @param {object} evt connection state change event
     * @param {boolean} [isTemp=false] `true` to load from temporary model data
     */
    function onConnect(evt, isTemp = false) {
        var cState = shmi.requires("designer.c2c.client-state"),
            rpc = shmi.requires("designer.c2c.rpc"),
            tokLoadLayout = null,
            jobId = null;

        console.debug(MODULE_NAME, "edit-client connected:", evt);
        if (!editClientConnected) {
            clearLog = true;
            if (errorLogBuffer.length === 0) {
                errorLogBuffer.push(null);
            }
        }
        editClientConnected = true;
        cState.onDisconnect(onDisconnect);

        errorLogBuffer.forEach(function(logData) {
            sendLog(logData);
        });
        errorLogBuffer = [];

        //RPC - open loading overlay on designer host
        rpc.remoteCall(function(data) {
            var overlay = shmi.requires("designer.ui.loadingOverlay"),
                jid = overlay.startJob({
                    title: "${designer_indexing_app}",
                    type: overlay.JOB_LIST,
                    total: data.total
                });

            complete(jid);
        }, function(status, pJid) {
            jobId = pJid;
            loadLayout(isTemp);
        }, cState.getState().host, {
            total: 1
        });

        //listen for layout load progress & update loading overlay via RPC
        tokLoadLayout = shmi.listen("designer.editCLient.loadLayout", function onLoadLayout(layoutEvt) {
            if (jobId !== null) {
                rpc.remoteCall(function(data) {
                    var overlay = shmi.requires("designer.ui.loadingOverlay"),
                        isDone = false;

                    if (data.current === data.total) {
                        overlay.endJob(data.jobId);
                        isDone = true;

                        if (!data.temporary) {
                            shmi.requires("designer.app.changes").discard(true);
                        }
                        shmi.requires("designer.app.changes").record(true);
                        shmi.requires("visuals.meta").loadGroupMeta();
                        shmi.requires("designer.workspace.config.widget-templates").loadTemplateIndex();

                        shmi.decouple(function() {
                            //attention: this event is fired in designer host application via RPC!
                            shmi.fire("designer.appLoaded", {
                                token: data.token
                            }, shmi.designer.session);
                        });
                    } else {
                        overlay.setProgress(data.jobId, data.current, null, data.total);
                    }

                    complete(isDone);
                }, function(status, isDone) {
                    if (isDone) {
                        console.debug(MODULE_NAME, "load layout complete");
                        tokLoadLayout.unlisten();
                        jobId = null;
                    }
                }, cState.getState().host, {
                    total: layoutEvt.detail.total,
                    current: layoutEvt.detail.current,
                    jobId: jobId,
                    token: module.getLoginToken(),
                    temporary: isTemp
                });
            }
        });
    }

    /**
     * onDisconnect - handle edit client disconnect
     *
     * @param {object} evt connection state change event
     */
    function onDisconnect(evt) {
        var cState = shmi.requires("designer.c2c.client-state");
        console.debug(MODULE_NAME, "edit-client disconnected:", evt);
        editClientConnected = false;
        cState.onConnect(onConnect);
    }

    /**
     * onControlsInitialized - fire "parser-ready" event when controls of instanced model
     * have finished initializing
     *
     * @return {undefined}
     */
    function onControlsInitialized() {
        shmi.fire('parser-ready', {}, shmi.visuals.session);
    }

    /**
     * loadModel - load model from JSON data
     *
     * @param {string} jsonData loaded JSON data
     */
    function loadModel(jsonData) {
        let m = shmi.requires("designer.app.model"),
            c = shmi.requires("designer.app.control"),
            iter = shmi.requires("visuals.tools.iterate").iterateObject,
            templateData = JSON.parse(jsonData),
            gMap = m.getGroupMap(),
            gIds = m.getGroupIds();

        m.setTemplates(templateData.templates);
        iter(templateData.groups.map, function(val, prop) {
            gMap[prop] = val;
        });
        iter(templateData.groups.ids, function(val, prop) {
            gIds[prop] = val;
        });

        c.instanceModel(templateData.templates, onControlsInitialized);
    }

    /**
     * loadPreview - load app preview from json structure data
     *
     * @param {boolean} [isTemp=false] `true` to load from temporary model data
     */
    function loadPreview(isTemp = false) {
        var m = shmi.requires("designer.app.model"),
            fs = require('fs'),
            fileUrl = isTemp ? tempModelPath : modelPath;

        if (fs.existsSync(fileUrl)) {
            fs.readFile(fileUrl, "utf8", function(err, data) {
                if (!err) {
                    loadModel(data);

                    shmi.visuals.session.ProjectSource = shmi.getResource(m.makeTemplateUrl("root"));

                    let saved = false;
                    window.addEventListener("beforeunload", (event) => {
                        const { ipcRenderer } = require("electron");
                        if (!saved) {
                            ipcRenderer.once("preview-updated", () => {
                                saved = true;
                                require('electron').remote.getCurrentWindow().reload();
                            });
                            ipcRenderer.send("update-preview");
                            return true;
                        } else {
                            return false;
                        }
                    });

                    window.addEventListener("load", (event) => {
                        saved = false;
                    });

                    window.addEventListener("keydown", function(evt) {
                        switch (evt.keyCode) {
                        case 116: //F5 - reload
                            require('electron').remote.getCurrentWindow().reload();
                            break;
                        case 122: //F11 - toggle fullscreen
                            if (document.fullscreen) {
                                document.exitFullscreen().catch((e) => {
                                    console.log(MODULE_NAME, "error exiting fullscreen mode:", e);
                                });
                            } else {
                                document.documentElement.requestFullscreen().catch((e) => {
                                    shmi.notify("Could not enter fullscreen mode: " + e, "${V_ERROR");
                                });
                            }
                            break;
                        case 123: //F12 - open dev-tools
                            require('electron').remote.getCurrentWindow().toggleDevTools();
                            break;
                        default:
                        }
                    });

                    //add handler to open HTML links in external application
                    window.addEventListener("click", (evt) => {
                        if (evt.target.tagName === "A") {
                            evt.preventDefault();
                            require('electron').shell.openItem(evt.target.href);
                        }
                    });
                } else {
                    console.error(err);
                }
            });
        }
    }

    /**
     * noop - no operation
     *
     */
    function noop() {}

    /**
     * formatErrorLog - format error log data to message
     *
     * @param {string[]} logData log data
     * @returns {string|null} formatted error log message or `null` if no logdata specified
     */
    function formatErrorLog(logData) {
        var msg = null,
            src = null,
            line = null,
            column = null;
        if (!logData) {
            return null;
        } else {
            msg = logData[0];
            src = logData[1].split("/workspace/")[1];
            line = logData[2];
            column = logData[3];
            return `${msg} - source: ${src}, line: ${line} column: ${column}`;
        }
    }

    /**
     * sendLog - send log data to designer host application
     *
     * @param {string[]} logData log data
     * @param {string} type message type
     */
    function sendLog(logData, type) {
        var cState = shmi.requires("designer.c2c.client-state"),
            rpc = shmi.requires("designer.c2c.rpc");

        if (editClientConnected) {
            //RPC - log errors on host console
            rpc.remoteCall(function(data) {
                var c = shmi.requires("designer.console"),
                    logName = "client-app";
                if (data.clear) {
                    c.registerLog(logName, []);
                    c.emptyLog(logName);
                }
                if (data.log) {
                    c.showLog(logName);
                    if (data.type === "notification") {
                        c.log.notice(`[NOTIFICATION] ${data.log}`);
                    } else if (data.type === "confirmation") {
                        c.log.notice(`[CONFIRMATION REQUEST] ${data.log}`);
                    } else {
                        c.log.error(data.log);
                    }
                }
                complete(null);
            }, function(status, pJid) {
                //log done
            }, cState.getState().host, {
                log: ["notification", "confirmation"].indexOf(type) !== -1 ? logData : formatErrorLog(logData),
                clear: clearLog,
                type: type || null
            });
            clearLog = false;
        } else {
            console.error(MODULE_NAME, "DESIGNER_NOT_CONNECTED");
        }
    }

    /**
     * logError - error handler to store and send error events to designer host
     *
     */
    function logError() {
        var errorData = Array.from(arguments);

        if (editClientConnected) {
            sendLog(errorData);
        } else {
            errorLogBuffer.push(errorData);
            console.error(MODULE_NAME, "CLIENT_ERROR (designer not connected):", errorData.join(", "));
        }
    }

    /**
     * onerror - bind global error handler
     */
    window.onerror = logError;

    /**
     * run - implementation of configurable `session-client` module.
     *
     * @return {undefined}
     */
    module.run = function run() {
        shmi.visuals.session.URLParameters = getUrlParams();
        shmi.pkg("preview_client");
        shmi.pkg("visuals.session.names");
        var loginToken = getToken(),
            um = shmi.requires("visuals.session.UserManager"),
            am = shmi.requires("visuals.session.AlarmManager"),
            request = shmi.requires("visuals.tools.connect").request,
            socket = shmi.requires("visuals.session.SocketConnection");

        currentLoginToken = loginToken;
        if (loginToken) {
            shmi.visuals.session.current_project = loginToken.app;
            if (!loginToken.preview) {
                //disable local-script execution
                shmi.visuals.controls.LocalScript.prototype.onEnable = noop;
                //disable ui-action execution
                shmi.visuals.core.UiAction.prototype.execute = noop;
                //prevent app notifications from popping up
                shmi.notify = function(msg, title, param) {
                    msg = shmi.localize(msg);
                    if (typeof param === "object" && param !== null) {
                        msg = shmi.evalString(msg, param);
                    }
                    sendLog(msg, "notification");
                };
                //prevent confirmations from popping up
                shmi.confirm = function(text, cb, title, param) {
                    text = shmi.localize(text);
                    if (typeof params === "object" && param !== null) {
                        text = shmi.evalString(text, param);
                    }
                    sendLog(text, "confirmation");
                    cb(false);
                };
                //remove connection-failed handler to prevent notification on publish / clear workspace
                shmi.requires("visuals.handler.default.connectionFailed").deregister();
            }

            //remove password expired handler to prevent dialog popup in designer
            shmi.requires("visuals.handler.default.passwordExpired").deregister();

            //wait for connection to be established ...
            shmi.listen("connection-state", function(evt) {
                if (evt.detail.established) {
                    //1 - get user list
                    //2 - select first user
                    //3 - login using designer credentials
                    //4 - user.impersonate app user
                    //login to connect...
                    request("user.login", {
                        username: loginToken.user,
                        password: loginToken.pwd
                    }, function(loginResponse, loginErr) {
                        request("user.impersonate", loginToken.appUser, function(impResponse, impErr) {
                            var meta = shmi.requires("visuals.meta"),
                                tokMeta = null;

                            um.userList[loginToken.appUser] = new shmi.visuals.core.User(loginToken.appUser);
                            um.currentUser = um.userList[loginToken.appUser];
                            um.loginCallback = function() { /* stub */ };
                            um.setProperties(loginToken.appUser, impResponse);

                            if (!loginToken.preview) {
                                //prevent edit-client login from timing out due to inactivity
                                um.currentUser.autoLogoffTime = 0;
                                um.resetInactivity();
                            }

                            shmi.loadResource(shmi.evalString(shmi.c("LOCALE_PATH_PATTERN"), { index: um.currentUser.locale }), function(data, failed, url) {
                                var session = shmi.requires("visuals.session");
                                session.locale = session.locale || {};
                                if (!failed) {
                                    var iter = shmi.requires("visuals.tools.iterate.iterateObject"),
                                        locale = {};
                                    try {
                                        locale = JSON.parse(data);
                                        iter(locale, function(val, prop) {
                                            session.locale[prop] = val;
                                        });
                                    } catch (exc) {
                                        console.error("[Login] failed to parse locale file:", url, exc);
                                    }
                                }

                                if (um.currentUser.loggedIn) {
                                    am.requestAlarmList();
                                    if (loginToken.preview) {
                                        //start preview-client when logged in & meta-data is loaded
                                        isPreview = true;
                                        if (meta.isLoaded()) {
                                            loadPreview(loginToken.temporary);
                                        } else {
                                            tokMeta = shmi.listen("metadata-loaded", function(evtMeta) {
                                                tokMeta.unlisten();
                                                loadPreview(loginToken.temporary);
                                            });
                                        }
                                    } else if (meta.isLoaded()) { //start edit-client when logged in & meta-data is loaded
                                        startupEditClient(loginToken.temporary);
                                    } else {
                                        tokMeta = shmi.listen("metadata-loaded", function(evtMeta) {
                                            tokMeta.unlisten();
                                            startupEditClient(loginToken.temporary);
                                        });
                                    }
                                } else {
                                    console.error(MODULE_NAME, "failed to login");
                                }
                            });
                        }, null, loginToken.app);
                    });
                }
            });

            //configure websocket url in app-config & socket-connection
            shmi.visuals.session.config["ws-url"] = loginToken.wsUrl;
            shmi.visuals.session.SocketConnection.url = loginToken.wsUrl;

            //connect to ws-server
            socket.connect(function() {
                console.log("connection callback:", arguments);
            });
        }
    };

    //initialize client app session configuration
    var clientSession = shmi.pkg("visuals.session"),
        clientToken = null;

    clientSession.URLParameters = getUrlParams();
    clientToken = getToken();
    if (clientToken && (typeof clientToken.appConfig === "object")) {
        var iter = shmi.requires("visuals.tools.iterate").iterateObject,
            appConfig = shmi.pkg("visuals.session.config");

        iter(clientToken.appConfig, function(val, prop) {
            appConfig[prop] = val;
        });
    } else {
        console.error(MODULE_NAME, "client config token not present!");
    }
}());
