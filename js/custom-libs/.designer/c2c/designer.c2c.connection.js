/**
 * Module to provide client to client (C2C) communications.
 *
 * @module designer/c2c/connection
 */
(function() {
    var MODULE_NAME = "designer.c2c.connection",
        ENABLE_LOGGING = false,
        RECORD_LOG = false,
        logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG),
        fLog = logger.fLog,
        log = logger.log;

    // MODULE CODE - START

    /** @lends module:designer/c2c/connection */
    var module = shmi.pkg(MODULE_NAME),
        state = null,
        mode = null,
        fire = shmi.requires("visuals.tools.global-events.fire"),
        iterObj = shmi.requires("visuals.tools.iterate.iterateObject"),
        handlers = {},
        clients = {},
        clientName = null,
        hostName = null,
        broadcastInterval = null;

    var ipc = null;

    module.DEFAULT_CLIENT_PREFIX = "C2C_NODE";
    module.FRAGMENT_SIZE = 4096;
    module.HOST_BC_INTERVAL = 2000;
    module.PING_FREQUENCY = 1000;
    module.MAX_OPEN_PINGS = 20;

    /* connection state constants */

    /**
     * @constant
     * @default 0
     */
    module.STATE_NOT_SET = 0;
    /**
     * @constant
     * @default
     */
    module.STATE_NOT_CONNECTED = 1;
    /**
     * @constant
     * @default
     */
    module.STATE_CONNECTING = 2;
    /**
     * @constant
     * @default
     */
    module.STATE_WAIT_FOR_MASTER = 3;
    /**
     * @constant
     * @default
     */
    module.STATE_CONNECTED = 4;
    /* connection state reverse lookup */
    module.states = ["STATE_NOT_SET", "STATE_NOT_CONNECTED", "STATE_CONNECTING", "STATE_WAIT_FOR_MASTER", "STATE_CONNECTED"];

    /* connection mode constants */

    /**
     * @constant
     * @default 0
     */
    module.MODE_NOT_SET = 0;
    /**
     * @constant
     * @default
     */
    module.MODE_HOST = 1;
    /**
     * @constant
     * @default
     */
    module.MODE_CLIENT = 2;
    /**
     * @constant
     * @default
     */
    module.MODE_EDIT = 3;
    /**
     * @constant
     * @default
     */
    module.MODE_PREVIEW = 4;
    /* connection mode reverse lookup */
    module.modes = ["MODE_NOT_SET", "MODE_HOST", "MODE_CLIENT", "MODE_EDIT", "MODE_PREVIEW"];

    state = module.STATE_NOT_SET; //init connection state
    mode = module.MODE_NOT_SET; //init connection mode

    // -------- Handlers for low level c2c-messages

    /**
     * nameHandler - handle feedback of node name registration
     *
     * @param  {string} nodeName registered node name
     * @return {undefined}
     */
    function nameHandler(nodeName) {
        state = module.STATE_WAIT_FOR_MASTER;
        clientName = nodeName;
        log("name registered:", clientName);
        if ([module.MODE_CLIENT, module.MODE_EDIT, module.MODE_PREVIEW].indexOf(mode) !== -1) {
            fire('c2c-connection', {
                state: state,
                name: nodeName,
                mode: mode,
                host: hostName
            }, module);
            clientInit();
        } else if (mode === module.MODE_HOST) {
            state = module.STATE_CONNECTED;
            hostName = nodeName;
            fire('c2c-connection', {
                state: state,
                name: nodeName,
                mode: mode,
                host: hostName
            }, module);
            hostInit();
        } else {
            throw new Error("invalid mode set: " + mode);
        }
    }

    /* handler for incoming messages */
    function messageHandler(msg) {
        var msgObj, msg_utf8, msgPacket, localMessage = false;
        msgPacket = JSON.parse(msg);
        localMessage = true;
        var client = clients[msgPacket.src];

        if ((client === undefined) && (msgPacket.register !== true)) {
            console.error("client " + msgPacket.src + " is not registered");
            return;
        } else if (msgPacket.register === true) {
            /* register new client */
            if (clients[msgPacket.src] === undefined) {
                client = createClient(msgPacket.src, (msgPacket.mode) ? msgPacket.mode : null);
                fire('c2c-client', {
                    name: client.name,
                    mode: client.mode,
                    state: client.state
                }, module);
                log("new c2c peer registered:", msgPacket.src);
                if (mode === module.MODE_HOST) {
                    module.broadcast({
                        type: "C2C-ADD",
                        data: {
                            name: client.name,
                            mode: client.mode
                        }
                    });
                    iterObj(clients, function(val, prop) {
                        module.send({
                            type: "C2C-ADD",
                            data: {
                                name: prop,
                                mode: val.mode
                            }
                        }, client.name);
                    });
                    pingNode(client.name);
                }
            }
        }
        var part_buffer = client.partBuffer;

        if (msgPacket.partial === true) {
            //collect & decode message fragments
            log("partial message");
            if (msgPacket.fin !== true) {
                part_buffer.push(msgPacket.data);
                return;
            } else {
                part_buffer.push(msgPacket.data);
                /* decode base64 partial messages */
                part_buffer = part_buffer.map(function(prt) {
                    return prt = atob(prt);
                });
                /* join message */
                msg = part_buffer.join("");
                msg_utf8 = shmi.from_utf8(msg);
                try {
                    msgObj = JSON.parse(msg_utf8);
                } catch (exc) {
                    console.error("Error parsing JSON message: ", msg_utf8);
                    msgObj = {};
                }
                log("PARTIAL MSG COMPLETE");
                client.partBuffer = [];
            }
        } else if (localMessage) {
            //handle local IPC message
            msgObj = msgPacket.data;
        } else {
            //handle single fragment message
            msg_utf8 = shmi.from_utf8(atob(msgPacket.data));
            msgObj = JSON.parse(msg_utf8);
        }

        log("received '", msgObj.type, "' message from '", msgPacket.src, "'", msgPacket.register);

        if (handlers[msgObj.type]) {
            //run message handler for registered type
            handlers[msgObj.type](msgObj);
        } else {
            log("UNKNOWN MSG TYPE: " + msgObj.type);
        }
    }

    // -------- Built-in handlers for high level c2c-messages

    /* answer incoming ping request */
    function pingHandler(msg_data) {
        if (!clients[msg_data.src]) {
            console.error(MODULE_NAME, "drop PING from unknown peer:", msg_data.src);
            return;
        }
        var responseMsg = {
            type: "PONG",
            data: msg_data.data,
            src: clientName
        };
        module.send(responseMsg, msg_data.src);
    }

    handlers["PING"] = pingHandler;

    /* receive incoming pong response */
    function pongHandler(msg_data) {
        var client = clients[msg_data.src];
        if (client) {
            client.latency = (Date.now() - msg_data.data.ts) / 2;
            client.openPings -= 1;
            fire('c2c-latency', {
                name: msg_data.src,
                latency: client.latency,
                openPings: client.openPings
            }, module);
        }
    }

    handlers["PONG"] = pongHandler;

    function addNodeHandler(msg_data) {
        if ((msg_data.data.name !== clientName) && (clients[msg_data.data.name] === undefined)) {
            var node = createClient(msg_data.data.name, msg_data.data.mode);
            fire('c2c-client', {
                name: node.name,
                state: node.state,
                mode: node.mode
            }, module);
            log("node added:", msg_data.data.name);
        }
    }

    handlers["C2C-ADD"] = addNodeHandler;

    function removeNodeHandler(msg_data) {
        if (clients[msg_data.data.name] !== undefined) {
            var node = clients[msg_data.data.name];
            fire('c2c-client', {
                name: node.name,
                state: module.STATE_NOT_CONNECTED,
                mode: node.mode
            }, module);

            delete clients[node.name];
            log("node removed:", msg_data.data.name);
        }
    }

    handlers["C2C-REM"] = removeNodeHandler;

    // -------- Utility functions

    /* create node entry */
    function createClient(nodeName, nodeMode) {
        if (clients[nodeName] === undefined) {
            clients[nodeName] = {
                name: nodeName,
                mode: nodeMode,
                state: module.STATE_CONNECTED,
                partBuffer: [],
                latency: null,
                interval: null,
                openPings: null
            };
        } else {
            log("client exists:", nodeName);
        }
        return clients[nodeName];
    }

    /* start regular ping on specified node */
    function pingNode(nodeName) {
        var node = clients[nodeName];
        if (node) {
            if (node.interval) clearInterval(node.interval);
            node.latency = 0;
            node.interval = null;
            node.openPings = 0;
            node.interval = setInterval(function() {
                var pingMsg = {
                    type: "PING",
                    src: clientName,
                    data: {
                        ts: Date.now()
                    }
                };
                node.openPings += 1;
                if (node.openPings > module.MAX_OPEN_PINGS) {
                    if (mode === module.MODE_HOST) {
                        clearInterval(node.interval);
                        handleClientDisconnect(node);
                    } else if (mode >= module.MODE_CLIENT) {
                        clearInterval(node.interval);
                        handleHostDisconnect(node);
                    }
                } else {
                    module.send(pingMsg, nodeName);
                }
            }, module.PING_FREQUENCY);
        } else {
            throw new Error("c2c-node " + nodeName + " not known");
        }
    }

    //remove node from c2c client pool
    function handleClientDisconnect(node) {
        var nodeName = node.name;
        var cmd = {
            type: "C2C-REM",
            data: {
                name: nodeName
            }
        };
        /* delete node locally */
        handlers[cmd.type](cmd);
        /* send delete requests to remaining client nodes */
        iterObj(clients, function(val, prop) {
            module.send(cmd, prop);
        });
    }

    //remove host node from c2c -> no longer connected
    function handleHostDisconnect(node) {
        mode = module.MODE_CLIENT;
        state = module.STATE_WAIT_FOR_MASTER;
        hostName = null;
        /* remove all registered peer nodes */
        iterObj(clients, function(val, prop) {
            var cmd = {
                type: "C2C-REM",
                data: {
                    name: prop
                }
            };
            handlers[cmd.type](cmd);
        });

        fire('c2c-connection', {
            state: state,
            name: clientName,
            mode: mode,
            host: hostName
        }, module);
    }

    // -------- Module exports

    module.registerHandler = function(msgType, handlerFunc) {
        if (handlers[msgType] === undefined) {
            handlers[msgType] = handlerFunc;
        } else {
            throw new Error("message type " + msgType + " already handled");
        }
    };

    module.deregisterHandler = function(msgType) {
        if (handlers[msgType] !== undefined) {
            delete handlers[msgType];
        } else {
            throw new Error("message handler " + msgType + " does not exist");
        }
    };

    module.isConnected = function() {
        return (state === module.STATE_CONNECTED);
    };

    module.getState = function() {
        var tmpState = state;
        return tmpState;
    };

    module.getMode = function() {
        return mode;
    };

    module.disconnectClients = function() {
        var iter = shmi.requires("visuals.tools.iterate.iterateObject");
        iter(clients, function(node) {
            handleClientDisconnect(node);
        });
    };

    /**
     * establish a connection to c2c communications as either host (`hostSession := true`) or client node.
     *
     * @param {string} clientPrefix c2c node name
     * @param {boolean} hostSession  true to connect as host node, false to connect as client node
     * @param {number} [selectedMode] either `MODE_EDIT` or `MODE_PREVIEW` when `hostSession := true`
     */
    module.connect = function(clientPrefix, hostSession, selectedMode) {
        /* register cname, fire 'c2c-connection' event, */
        if (state < module.STATE_CONNECTING) {
            var cname = clientPrefix || module.DEFAULT_CLIENT_PREFIX;
            state = module.STATE_CONNECTING;
            mode = (hostSession) ? module.MODE_HOST : module.MODE_CLIENT;
            if (selectedMode === module.MODE_EDIT) {
                mode = module.MODE_EDIT;
                ipc = require('electron').ipcRenderer;
                ipc.send("register-client", "register");
                ipc.on("remote-message", function(evt, msg) {
                    messageHandler(msg);
                });
            } else if (selectedMode === module.MODE_PREVIEW) {
                mode = module.MODE_PREVIEW;
                ipc = require('electron').ipcRenderer;
                ipc.send("register-client", "register-preview");
                ipc.on("remote-message", function(evt, msg) {
                    messageHandler(msg);
                });
            } else if (mode === module.MODE_HOST) {
                ipc = require('electron').ipcRenderer;
                ipc.send("register-server", "register");
                ipc.on("remote-message", function(evt, msg) {
                    messageHandler(msg);
                });
            }
            ipc.on("register-name", function(evt, msg) {
                nameHandler(msg);
            });
            ipc.send("register-name", cname);
        } else {
            throw new Error("already connected or currently connecting");
        }
    };

    function localSend(obj, destName, register) {
        log("send '", obj.type, "' message to: ", (destName === "A") ? "[BROADCAST]" : destName, register);
        var msgData;
        if (register === true) {
            msgData = {
                src: clientName,
                fin: false,
                partial: false,
                data: shmi.cloneObject(obj),
                register: true,
                state: state,
                mode: mode
            };
        } else {
            msgData = {
                src: clientName,
                fin: false,
                partial: false,
                data: shmi.cloneObject(obj)
            };
        }
        msgData = JSON.stringify(msgData);
        if (mode === module.MODE_HOST) {
            ipc.send("msg-to-client", msgData);
        } else {
            ipc.send("msg-to-server", msgData);
        }
    }

    /* sends objects base-64 encoded to destination (shmi project session / client / all) */
    function send(obj, destName, register) {
        log("send '", obj.type, "' message to: ", (destName === "A") ? "[BROADCAST]" : destName, register);
        localSend(obj, destName, register);
    }

    module.broadcast = function(msgObj, register) {
        if (mode === module.MODE_HOST) {
            send(msgObj, "A", register);
        } else {
            throw new Error("broadcast only available in host mode");
        }
    };

    module.getName = function() {
        return clientName;
    };
    module.getHost = function() {
        return hostName;
    };
    module.getClients = function() {
        var tmpClients = [];
        iterObj(clients, function(val) {
            tmpClients.push(val);
        });
        return tmpClients;
    };

    module.send = function(msgObj, destName, register) {
        if (mode >= module.MODE_CLIENT) {
            if (destName === undefined) {
                if (hostName !== null) {
                    send(msgObj, hostName, register);
                } else {
                    throw new Error("host name not set yet and no destination name provided");
                }
            } else {
                send(msgObj, destName, register);
            }
        } else if (mode === module.MODE_HOST) {
            if (destName !== undefined) {
                send(msgObj, destName, register);
            } else {
                throw new Error("no destination name provided");
            }
        } else {
            throw new Error("no connection mode set yet");
        }
    };

    // -------- Client functions

    function clientInit() {
        log("initializing client");
        waitForMaster();
    }

    function masterBcHandler(msg_data) {
        var tmpHostName = msg_data.data.name;
        /* only register with new host node when not in connected state */
        if ((state !== module.STATE_CONNECTED)&&(hostName !== tmpHostName)) {
            hostName = msg_data.data.name;
            log("host name set:", hostName);
            state = module.STATE_CONNECTED;
            fire('c2c-connection', {
                state: state,
                name: clientName,
                mode: mode,
                host: hostName
            }, module);
            module.send({
                type: "C2C_REGISTER",
                data: null
            }, hostName, true);
            pingNode(hostName);
            log("registering with host");
        }
    }

    function waitForMaster() {
        module.registerHandler("MASTER_BROADCAST", masterBcHandler);
    }

    // -------- Host functions

    function hostInit() {
        log("initializing host");
        startMasterBroadcast();
    }

    function startMasterBroadcast() {
        if (broadcastInterval !== null) clearInterval(broadcastInterval);
        broadcastInterval = setInterval(function() {
            module.broadcast({
                type: "MASTER_BROADCAST",
                data: {
                    name: hostName
                }
            }, true);
        }, module.HOST_BC_INTERVAL);
        log("host name broadcast started");
    }

    // MODULE CODE - END

    fLog("module loaded");
})();
