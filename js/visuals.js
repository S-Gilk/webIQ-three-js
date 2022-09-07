/** 
 * Visuals - Industrial Visualization Framework for JavaScript
 * 
 * Copyright © 2012-2022 Smart HMI GmbH
 * 
 * All rights reserved
 * 
 * No part of this website or any of its contents may be reproduced, copied, modified or
 * adapted, without the prior written permission of Smart HMI.
 * 
 * Commercial use and distribution of the contents of the website is not allowed without
 * express and prior written permission of Smart HMI.
 * 
 * 
 * Web: http://www.smart-hmi.de
 * 
 * @version 2.11.4 314329a.27483 12-05-2022 09:45:45
 */


/**
 * Smart HMI root package
 * 
 * Contains classes for all Smart HMI products. Frequently used functions can be accessed
 * directly from this package.
 * 
 * @namespace
 */
var shmi = shmi || {};

/**
 * Smart HMI visuals package
 * 
 * Contains classes and functions of the visuals framework.
 * 
 * @namespace
 */
shmi.visuals = shmi.visuals || {};
/* version is exposed to the client via locale-variable ${VisualsVersion} */
shmi.visuals.Version = "2.11.4";
shmi.visuals.BuildDate = "12-05-2022 09:45:45";
shmi.visuals.Build = "27483";
shmi.visuals.Revision = "314329a";

console.log("Smart HMI visuals Version 2.11.4 314329a.27483 built at 12-05-2022 09:45:45");

/**
 * Visuals base package
 *
 * Contains all other packages and globally available convenience functions.
 *
 * @namespace shmi
 */

/**
 * Visuals controls package
 *
 * Contains controls included with Smart HMI visuals.
 *
 * @namespace shmi.visuals.controls
 */

/**
 * Visuals core package
 *
 * Contains subsystem managers, related classes and helper functions.
 *
 * @namespace shmi.visuals.core
 */

/**
 * Visuals debug package
 *
 * Contains debugging classes
 *
 * @namespace shmi.visuals.debug
 */

/**
 * Visuals gfx package
 *
 * Contains classes und functions for graphical content manipulation.
 *
 * @namespace shmi.visuals.gfx
 */

/**
 * Visuals init package
 *
 * Contains functions used during project initialization.
 *
 * @namespace shmi.visuals.init
 */

/**
 * Visuals io package
 *
 * Contains classes for user input handling, resource loading and messaging via WebSocket.
 *
 * @namespace shmi.visuals.io
 */

/**
 * Visuals parser package
 *
 * Contains functions for project- and control-parsing.
 *
 * @namespace shmi.visuals.parser
 */

/**
 * Error handler for debugging on devices without console support
 *
 * @param {string} errorMsg error message
 * @param {string} url script url that caused the error
 * @param {number} lineNumber line number where error was caused
 * @returns {Boolean} returns true
 */
//window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
//    alert("ERROR: " + errorMsg + ", line " + lineNumber + " file " + url)
//    return true;
//};

/**
 * Creates and returns a package.
 *
 * The package defined by the specified string will only be created if it is undefined,
 * otherwise a reference to the package is returned.
 *
 * @param {String} str java-style dotted package name
 * @returns {Object} package referenced by name
 */
shmi.pkg = function(str) {
    var nodes = str.split('.'),
        ret = null,
        i = 0,
        obj = shmi;
    while (i < nodes.length) {
        var n = nodes[i];
        if ((i === 0) && (n === "shmi")) {
            nodes.splice(0, 1);
            continue;
        }
        obj[n] = obj[n] || {};
        /* if package does not exist, create it */
        obj = obj[n];
        if (i === (nodes.length - 1)) {
            ret = obj;
        }
        i++;
    }
    return ret;
};

/**
 * Tests if the specified package or class is defined and returns a reference
 * to the package object.
 *
 * An Error is thrown if the referenced package or class is not defined.
 *
 * @param {type} str java-style dotted package name
 * @returns {shmi} package referenced by name
 */
shmi.requires = function(str) {
    var nodes = str.split('.'),
        ret = null,
        i = 0,
        obj = shmi;
    while (i < nodes.length) {
        var n = nodes[i];
        if ((i === 0) && (n === "shmi")) {
            nodes.splice(0, 1);
            continue;
        }
        if (obj[n] === undefined) {
            throw new Error("Package not available: " + str);
        }

        obj = obj[n];
        if (i === (nodes.length - 1)) {
            ret = obj;
        }
        i++;
    }
    return ret;
};

/**
 * Returns value of a constant if called without value parameter. If a value is
 * specified the constant is set to the value;
 *
 * @param {string} str constant identifier
 * @param {string|number|boolean|object} [val] new value of constant
 * @returns {string|number|boolean|object|undefined} value of constant
 */
shmi.c = function(str, val) {
    shmi.Constants = shmi.Constants || {};
    if (val !== undefined) {
        if (shmi.Constants[str] !== undefined) {
            throw Error("ERROR: constant '" + str + "' already defined");
        }
        shmi.Constants[str] = val;
    }
    return shmi.Constants[str];
};

/**
 * Logging function
 *
 * @deprecated new controls and modules should use a logger based on visuals.tools.logger
 * @param {string} text - message to be logged
 * @param {number} type - 0 Debug, 1 Info, 2 Message, 3 Error
 */
shmi.log = function(text, type) {
    let session = shmi.pkg("visuals.session");

    if (typeof type === "number") {
        let loglevel = (session.config && typeof session.config.loglevel === "number") ? session.config.loglevel : 2,
            alertlevel = (session.config && typeof session.config.alertlevel === "number") ? session.config.alertlevel : Number.POSITIVE_INFINITY;

        if (type === null || type === undefined) {
            type = 2;
        } else {
            type = parseInt(type);
        }
        if (type < loglevel) {
            return;
        }
        if (type < alertlevel) {
            console.log(text);
        } else {
            console.error(text);
        }
    } else if (typeof type === "object") {
        if (session.config && session.config.debug) {
            console.log(shmi.evalString(text, type));
        }
    } else if (session.config && session.config.debug) {
        console.log(shmi.evalString(text, {}));
    }
};

/**
 * Retrieves all matching elements of the specified type ascending the DOM from
 * the specified root element.
 *
 * @param {String} type value of data-ui attribute
 * @param {HTMLElement} root root element to begin search from
 * @returns {Array} matching elements, empty array if not found
 */
shmi.getUiElements = function(type, root) {
    if (!root) {
        root = document.body;
    }
    return root.querySelectorAll('[data-ui=' + type + ']');
};

/**
 * Retrieves the first matching element of the specified type ascending the DOM from
 * the specified root element.
 *
 * @param {String} type value of data-ui attribute
 * @param {HTMLElement} root root element to begin search from
 * @returns {HTMLElement} first matching element, null if not found
 */
shmi.getUiElement = function(type, root) {
    if (!root) {
        root = document.body;
    }
    var ret = null;
    try {
        ret = root.querySelector('[data-ui=' + type + ']');
    } catch (exc) {
        shmi.log("[Helpers] getUiElement - Exception: " + exc + " element: " + root, 3);
    }

    return ret;
};

/**
 * Tests if the specified child is a child element of the specified parent element
 *
 * @param {HTMLElement} parent
 * @param {HTMLElement} child
 * @returns {Boolean}
 */
shmi.testParentChild = function(parent, child) {
    if (parent === child) {
        return true;
    }
    if (!child) {
        //this condition can be met even though a event.relatedTarget was
        //specified, if the pointer crossed a parent element too fast.
        return false;
    }
    if (child.parentNode === parent) {
        return true;
    }
    if (child.parentNode === document.body) {
        return false;
    } else {
        return shmi.testParentChild(parent, child.parentNode);
    }
};

/**
 * Tests if the specified HTMLElement is currently visible in the layout by testing its
 * offsetWidth & -Height. An element with an offsetWidth or -Height greater than zero
 * is considered visible.
 *
 * @param {HTMLElement} elem element to test visibility for
 * @returns {Boolean} true if element is visible, false else
 */
shmi.isVisible = function(elem) {
    return elem.offsetHeight > 0 || elem.offsetWidth > 0;
};

(function() {
    /**
     * get fresh copy of locale variable regexp
     * @returns {RegExp}
     */
    function getLocaleRegexp() {
        return /\${(.+?)}/g;
    }

    /**
     * localize specified recursively. detect loops based on specified variable stack.
     *
     * @param {string} text text to localize
     * @param {string[]} variableStack variable name stack
     * @returns {string} localized text
     */
    function localizeText(text, variableStack) {
        const intialText = text;

        if (!getLocaleRegexp().test(text)) {
            return text;
        }

        const variableRegexp = getLocaleRegexp();
        let result = variableRegexp.exec(intialText);

        while (result) {
            const [varText, varName] = result;
            let varContent = shmi.visuals.session.locale[varName];
            if (!variableStack.includes(varName) && varContent !== undefined) {
                if (getLocaleRegexp().test(varContent)) {
                    varContent = localizeText(varContent, [...variableStack, varName]);
                }
                text = text.replace(varText, varContent);
            } else if (variableStack.includes(varName)) {
                text = text.replace(varText, `[LOCALE_LOOP: ${[...variableStack, varName].join(", ")}]`);
            }
            result = variableRegexp.exec(intialText);
        }

        return text;
    }

    /**
     * Replaces all localization variables in the specified text by their definition in
     * the currently loaded locale.
     *
     * @param {String} text original text
     * @returns {String} localized text
     */
    shmi.localize = function(text) {
        if (shmi.visuals.session.locale === undefined) {
            console.log("[Helpers] locale not loaded yet", 2);
            return text;
        }
        return localizeText(text, []);
    };
}());

(function() {
    /**
     * matchesNameParts - test specified complete control name is a match for partial control name
     *
     * @param {string} name complete control name
     * @param {string} partialName partial control name
     * @returns {boolean} `true` if partial name matches, `false` else
     */
    function matchesNameParts(name, partialName) {
        var parts = name.split("."),
            compareParts = partialName.split("."),
            lastIdx = null,
            matches = true;

        //name cannot match when it's shorter...
        if (parts.length < compareParts.length) {
            return false;
        }

        //reduce name to match length of compare name...
        parts.splice(0, parts.length - compareParts.length);

        compareParts.forEach(function(part, idx) {
            var curIdx = parts.indexOf(part);
            if (curIdx === -1) {
                matches = false;
            } else if (lastIdx !== null && lastIdx !== (curIdx - 1)) {
                matches = false;
            } else {
                lastIdx = curIdx;
            }
        });

        return matches;
    }

    /**
     * returns a control instance associated with the specified control name expression.
     *
     * @param {string} controlName control name expression
     * @param {object} [parentInstance] optional parent control instance to lookup relative to
     *
     * @returns {object|null} control instanced associated with control name expression, or `null` if no match was found
     */
    shmi.ctrl = function(controlName, parentInstance) {
        const iter = shmi.requires("visuals.tools.iterate").iterateObject,
            session = shmi.visuals.session,
            { HANDLE_PREFIX, getNodeElement } = shmi.requires("visuals.tools.nodes");

        let ctrl = null;

        if (typeof controlName === "string" && controlName.startsWith(HANDLE_PREFIX)) {
            const nodeHandle = controlName.replace(HANDLE_PREFIX, ""),
                element = getNodeElement(nodeHandle),
                control = element ? shmi.getControlByElement(element) : null;

            return control;
        } else if (parentInstance && parentInstance.getName() && (controlName.indexOf(".") === 0)) {
            let count = 1;
            const specifiedName = controlName;

            while (controlName.charAt(count) === ".") {
                count++;
            }

            const cn_parts = parentInstance.getName().split(".").slice(0, -count),
                repl_str = '.'.repeat(count);

            controlName = controlName.replace(repl_str, '');
            const parent_ctrl = (session.names[cn_parts.join(".")]) ? session.names[cn_parts.join(".")].ctrl : null;
            if (parent_ctrl) {
                iter(session.names, function(ref, name) {
                    if (ctrl === null && name.indexOf(parent_ctrl.getName()) === 0) {
                        const fn_idx = name.indexOf(controlName);
                        if ((fn_idx !== -1) && (fn_idx === (name.length - controlName.length))) {
                            ctrl = session.names[name].ctrl;
                        }
                    }
                });
            } else {
                ctrl = shmi.ctrl(specifiedName);
            }
        } else {
            const parts = controlName.split(" .");
            let sub_parts,
                tmp_ctrl = null;

            if (parts.length > 2) {
                ctrl = shmi.ctrl(parts[0] + " ." + parts[1]);
                if (ctrl) {
                    parts.splice(0, 2);
                    ctrl = shmi.ctrl(ctrl.getName() + " ." + parts.join(" ."));
                }
            } else {
                if (parts[0].indexOf(".") === 0) {
                    parts[0] = parts[0].substr(1);
                    iter(session.names, function(ref, name) {
                        if (tmp_ctrl === null && matchesNameParts(name, parts[0])) {
                            tmp_ctrl = shmi.visuals.session.names[name].ctrl;
                        }
                    });
                } else {
                    tmp_ctrl = (shmi.visuals.session.names[parts[0]]) ? shmi.visuals.session.names[parts[0]].ctrl : null;
                }

                if (parts.length === 2) {
                    sub_parts = parts[1].split(".");
                    for (let i = 0; i < sub_parts.length; i++) {
                        tmp_ctrl = shmi.getControlByName(sub_parts[i], null, tmp_ctrl);
                    }
                }
                ctrl = (tmp_ctrl) ? tmp_ctrl : null;
            }
        }

        return ctrl;
    };
}());

/**
 * Returns the first matching Control with the specified data-name attribute of
 * the specified type. Note that a Control can only be accessed this way if it was
 * successfully parsed and added to the shmi.visuals.session.Layout.
 *
 * @private
 * @param {String} name value of data-name attribute to search
 * @param {String} type type of control
 * @returns {Object} parent control
 */
shmi.getControlByName = function(name, type, parent) {
    var ret = null,
        start_time;
    if (shmi.visuals.session.config.lookup_debug === true) {
        start_time = Date.now();
    }

    function isContainer(param_ctrl) {
        return ((param_ctrl) && (param_ctrl.isContainer) && (Array.isArray(param_ctrl.controls)));
    }

    function hasViews(param_ctrl) {
        return ((param_ctrl) && (param_ctrl.isContainer) && (Array.isArray(param_ctrl.views)));
    }

    function findInViews(param_ctrl) {
        var tmp_ctrl = null;
        for (var i = 0; i < param_ctrl.views.length; i++) {
            tmp_ctrl = findInContainer(param_ctrl.views[i]);

            if (tmp_ctrl !== null) {
                break;
            }
        }
        return tmp_ctrl;
    }

    function findInContainer(param_ctrl) {
        var tmp_ctrl = null;
        if (Array.isArray(param_ctrl.controls)) {
            for (var i = 0; i < param_ctrl.controls.length; i++) {
                if (!param_ctrl.controls[i].getName()) {
                    continue;
                }
                var ctrlName = param_ctrl.controls[i].getName();
                if ((ctrlName === null) || (ctrlName === undefined)) {
                    return null;
                }
                var name_parts = param_ctrl.controls[i].getName().split(".");
                if (name_parts[name_parts.length - 1] === name) {
                    tmp_ctrl = param_ctrl.controls[i];
                }
                if (tmp_ctrl === null) {
                    if (hasViews(param_ctrl.controls[i])) {
                        tmp_ctrl = findInViews(param_ctrl.controls[i]);
                    } else if (isContainer(param_ctrl.controls[i])) {
                        tmp_ctrl = findInContainer(param_ctrl.controls[i]);
                    }
                }

                if (tmp_ctrl !== null) {
                    break;
                }
            }
        }
        return tmp_ctrl;
    }

    if (hasViews(parent)) {
        ret = findInViews(parent);
    } else if (isContainer(parent)) {
        ret = findInContainer(parent);
    } else {
        var n = shmi.visuals.session.names;
        if (n[name] !== undefined) {
            ret = n[name].ctrl;
        }
    }

    if (shmi.visuals.session.config.lookup_debug === true) {
        console.log("[Lookup] Control lookup for", ret, "took", (Date.now() - start_time), "ms");
    }

    return ret;
};

/**
 * Returns the first matching element with the specified data-name attribute
 *
 * @param {String} name value of data-name attribute to search
 * @param {HTMLElement} root root element to begin search
 * @returns {HTMLElement}
 */
shmi.getElementByName = function(name, root) {
    if (!root) {
        root = document;
    }
    return root.querySelector('[data-name="' + name + '"]');
};

/**
 * Returns all matching elements with the specified attribute set to the specified value
 *
 * @param {String} attrib attribute to match
 * @param {String} value value to match
 * @param {HTMLElement} root root element to begin search
 * @returns {HTMLElement[]}
 */
shmi.getElementsByAttribute = function(attrib, value, root) {
    if (!root) {
        root = document.body;
    }
    return root.querySelectorAll('[' + attrib + '="' + value + '"]');
};

/**
 * Checks if the specified base-element of a control is registered in the shmi.visuals.session.Layout
 *
 * @private
 * @param {HTMLElement} element base-element of control
 * @param {String} type control type
 * @returns {Boolean} true if element is registered, false else
 */
shmi.isRegistered = function(element, type) {
    if (!shmi.visuals.session.Layout[type]) {
        return false;
    }
    for (var i = 0; i < shmi.visuals.session.Layout[type].length; i++) {
        if (shmi.visuals.session.Layout[type][i].element === element) {
            return true;
        }
    }
    return false;
};

/**
 * Adds the specified CSS-class to the specified element if not already present.
 *
 * @param {HTMLElement} element element to add class to
 * @param {String} classname class to add
 * @returns {undefined}
 */
shmi.addClass = function(element, classname) {
    var cssClasses = classname.split(" ");
    cssClasses.forEach(function(c) {
        element.classList.add(c);
    });
};

/**
 * Tests if the specified elements has the specified CSS-class.
 *
 * @param {HTMLElement} element element to test
 * @param {String} classname class to test for
 * @returns {Boolean} true if element has specified class, false else
 */
shmi.hasClass = function(element, classname) {
    if ((element !== null) && (element !== undefined)) {
        if (element.classList) {
            return element.classList.contains(classname);
        } else if (element.getAttribute('class')) {
            var classes = element.getAttribute('class').split(' ');
            for (var i = 0; i < classes.length; i++) {
                if (classes[i].trim() === classname) {
                    return true;
                }
            }
            return false;
        } else {
            return false;
        }
    } else {
        return false;
    }
};

/**
 * Removes the specified CSS-class from the specified element if present.
 *
 * @param {HTMLElement} element element to remove class from
 * @param {String} classname class to remove
 * @returns {unresolved}
 */
shmi.removeClass = function(element, classname) {
    var cssClasses = classname.split(" ");
    cssClasses.forEach(function(c) {
        element.classList.remove(c);
    });
};

/**
 * Appends the specified content to the provided SVGElement
 *
 * @private
 * @param {SVGElement} element element to append content to
 * @param {String} content svg/xml content to add
 * @returns {undefined}
 */
shmi.setSvgContent = function(element, content) {
    var parser = new DOMParser();
    parser.async = false;
    var svgml = '<svg xmlns=\'http://www.w3.org/2000/svg\'>' + content + '</svg>',
        svgdoc = parser.parseFromString(svgml, 'text/xml').documentElement,
        added = 0,
        child = svgdoc.firstChild;
    while (child) {
        element.appendChild(element.ownerDocument.importNode(child, true));
        added++;
        child = child.nextSibling;
    }
    shmi.log("[Helpers] added svg content (" + added + " elements)", 0);
};

/**
 * getParentGroup - get parent group instance of specified control
 *
 * @param {object} control control instance reference
 * @returns {object} parent group control instance or `null` if none found
 */
shmi.getParentGroup = function getParentGroup(control) {
    var element = control.element.parentNode,
        group = null;

    while (element && element.getAttribute("data-ui") !== "group") {
        if (element === document.body) {
            element = null;
        } else {
            element = element.parentNode;
        }
    }
    if (element) {
        group = shmi.getControlByElement(element);
    }
    return group;
};

/**
 * Loads configuration from parent Group-Control, if present
 *
 * @private
 * @param control the control to apply configuration on
 */
shmi.loadGroupConfig = function(control) {
    var group = shmi.getParentGroup(control),
        session = shmi.requires("visuals.session"),
        iter = shmi.requires("visuals.tools.iterate").iterateObject;

    if (!group) {
        shmi.log("[Helpers] loadGroupConfig - Parent container not found", 1);
        return;
    }
    if (group.element.getAttribute('data-ui') !== 'group') {
        shmi.log("[Helpers] loadGroupConfig - Parent container is no group", 1);
    } else {
        let configHandle = control.element.getAttribute('data-group-config'),
            groupConfig = group.getConfig(),
            groupId = groupConfig.groupId || null,
            groupSettings = groupId ? session.groupConfig[groupId] || null : null,
            setByPath = shmi.requires("visuals.tools.objectHelpers").setByPath;

        if (groupConfig[configHandle]) {
            iter(groupConfig[configHandle], (val, prop) => {
                if (val !== null && val !== "") {
                    control.config[prop] = val;
                }
            });
        }

        if (groupSettings && Array.isArray(groupSettings.snippets)) {
            let replacers = {};
            if (groupSettings.replacers) {
                groupSettings.replacers.forEach((replacer) => {
                    replacers[replacer.id] = replacer.default;
                });
            }

            if (groupConfig.replacers) {
                iter(groupConfig.replacers, (val, id) => {
                    replacers[id] = val;
                });
            }

            groupSettings.snippets.forEach((snippet) => {
                if (snippet.dest === configHandle) {
                    try {
                        let snippetData = JSON.parse(shmi.evalString(snippet.data, replacers));
                        if (snippet.path === null) { //apply to base config
                            if (snippetData !== null && typeof snippetData === "object") {
                                iter(snippetData, (val, prop) => {
                                    control.config[prop] = val;
                                });
                            } else {
                                throw new TypeError("Snippet must be an object when applied to base config!");
                            }
                        } else {
                            setByPath(snippet.path, control.config, snippetData);
                        }
                    } catch (exc) {
                        console.error("[shmi.loadGroupConfig] error parsing snippet:", exc);
                    }
                }
            });
        }
    }
};

/**
 * Adds a new type of control to the library
 *
 * @private
 * @param {String} identifier identifier for control type, set with data-ui attribute
 * @param {Function} constructor constructor of the new control type
 * @param {Boolean} isContainer true if the new control is a ui-container, false else
 * @returns {undefined}
 */
shmi.registerControlType = function(identifier, constructor, isContainer) {
    if (shmi.visuals.session.Layout[identifier] !== undefined) {
        console.debug("[Parser] control identifier '" + identifier + "' already defined, skipping");
    } else {
        try {
            shmi.visuals.session.Layout = shmi.visuals.session.Layout || {};
            shmi.visuals.session.Layout[identifier] = new Array();
            shmi.visuals.session.ParserState.controlTypes.push([identifier, constructor]);
            if (isContainer) {
                shmi.visuals.session.ParserState.containerTypes.push(identifier);
            }
            console.debug("[Parser] adding control type '" + identifier + "', is container:" + isContainer);
        } catch (exc) {
            shmi.log("[Parser] exception adding control: " + exc, 3);
        }
    }
};

(function() {
    var protectedMethods = [
        "startup",
        "init",
        "loadTemplate",
        "applyTemplate",
        "loadConfig",
        "applyConfig",
        "enable",
        "disable",
        "lock",
        "unlock",
        "parseAttributes",
        "getParent",
        "getName",
        "isActive",
        "isInitialized",
        "isDeleted",
        "getChildren",
        "parseChildren",
        "listen",
        "unlisten"
    ];

    /**
     * Extends the childs prototype to inherit the parents prototype functions.
     *
     * All inherited functions can be overriden by implementing them in the prototype of
     * the child Object.
     *
     * @private
     * @param {Object} child object which inherits prototype
     * @param {Object} parent type to inherit prototype from
     * @returns {undefined}
     */
    shmi.extend = function(child, parent) {
        for (var prop in parent.prototype) {
            if (child.prototype[prop] === undefined) {
                child.prototype[prop] = parent.prototype[prop];
            } else if (Array.isArray(parent.prototype[prop]) && Array.isArray(child.prototype[prop])) {
                for (var j = 0; j < parent.prototype[prop].length; j++) {
                    child.prototype[prop].push(parent.prototype[prop][j]);
                }
            } else if (protectedMethods.indexOf(prop) !== -1) {
                console.warn("[shmi.extend] BaseControl method '%s' was replaced with custom implementation. This might lead to errors.", prop);
            }
        }
    };
}());

(function() {
    const defaultItemProperties = {
            "access": ["read", "write"],
            "data_type": null,
            "digits": 0,
            "item_alias": null,
            "label": null,
            "max": null,
            "min": null,
            "prewarn": null,
            "step": 0,
            "unit": null,
            "value_type": "string",
            "warn": null
        },
        types = ["string", "bool", "int", "float"];

    function noop() {}

    /**
     * create item properties from virtual item options
     *
     * @param {object} options virtual item options
     * @param {string} options.name name of virtual item
     * @param {string|number|boolean} options.value initial value
     * @param {number} [options.min] lower limit
     * @param {number} [options.max] upper limit
     * @param {string} [options.label] label text
     * @param {string|number} [options.unit] unit-text or unit-class
     * @param {number} [options.digits=0] decimal places
     * @param {number} [options.step=0] value stepping
     * @param {object} [options.prewarn] prewarn limits
     * @param {number|null} [options.prewarn.min] lower prewarn limit
     * @param {number|null} [options.prewarn.max] upper prewarn limit
     * @param {object} [options.warn] warn limits
     * @param {number|null} [options.warn.min] lower warn limit
     * @param {number|null} [options.warn.max] upper warn limit
     * @returns {object} item properties
     */
    function getItemProperties(options) {
        const properties = Object.create(defaultItemProperties);

        if (typeof options.name !== "string") {
            throw new TypeError("invalid 'name' parameter");
        }
        properties.item_alias = options.name;

        if (Array.isArray(options.access) && options.access.every((entry) => typeof entry === "string")) {
            properties.access = options.access;
        }

        if (typeof options.type === "number" && types[options.type]) {
            properties.value_type = types[options.type];
        }

        if (typeof options.min === "number") {
            properties.min = options.min;
        }

        if (typeof options.max === "number") {
            properties.max = options.max;
        }

        if (typeof options.step === "number") {
            properties.step = options.step;
        }

        if (typeof options.digits === "number") {
            properties.digits = options.digits;
        }

        if (typeof options.label === "string") {
            properties.label = options.label;
        }

        if (typeof options.unit === "string" || typeof options.unit === "number") {
            properties.unit = options.unit;
        }

        if (options.warn && typeof options.warn === "object") {
            properties.warn = {
                min: typeof options.warn.min === "number" ? options.warn.min : null,
                max: typeof options.warn.max === "number" ? options.warn.max : null
            };
        }

        if (options.prewarn && typeof options.prewarn === "object") {
            properties.prewarn = {
                min: typeof options.prewarn.min === "number" ? options.prewarn.min : null,
                max: typeof options.prewarn.max === "number" ? options.prewarn.max : null
            };
        }

        return properties;
    }

    /**
     * Creates a virtual Item with the specified name and parameters.
     *
     * Virtual Items can be used for UI-internal storage and sync of variables. All virtual
     * Items are named starting with 'virtual:'.
     *
     * @param {string} name   name of virtual Item
     * @param {number} type   type of virtual Item
     * @param {number} min    minimum input value for numeric type, ignored for string values
     * @param {number} max    maximum input value for numeric type, ignored for string values
     * @param {string|number|boolean} value  initial value of virtual Item
     * @param {function} [setvalueCallback]   function to call when item value changes
     * @returns {shmi.visuals.core.Item}
     *//**
     * Creates a virtual Item with the specified name and parameters.
     *
     * Virtual Items can be used for UI-internal storage and sync of variables. All virtual
     * Items are named starting with 'virtual:'.
     *
     * @param {object} options virtual item settings
     * @param {string} options.name name of virtual item
     * @param {string|number|boolean} options.value initial value
     * @param {number} [options.min] lower limit
     * @param {number} [options.max] upper limit
     * @param {string} [options.label] label text
     * @param {string|number} [options.unit] unit-text or unit-class
     * @param {number} [options.digits=0] decimal places
     * @param {number} [options.step=0] value stepping
     * @param {object} [options.prewarn] prewarn limits
     * @param {number|null} [options.prewarn.min] lower prewarn limit
     * @param {number|null} [options.prewarn.max] upper prewarn limit
     * @param {object} [options.warn] warn limits
     * @param {number|null} [options.warn.min] lower warn limit
     * @param {number|null} [options.warn.max] upper warn limit
     * @param {function} [setvalueCallback] function to call when item value changes
     * @returns {shmi.visuals.core.Item}
     */
    shmi.createVirtualItem = function(name, type, min, max, value, setvalueCallback) {
        const item = {},
            im = shmi.visuals.session.ItemManager,
            iterObj = shmi.requires("visuals.tools.iterate.iterateObject");

        let options = null;

        if (name && typeof name === "object" && arguments.length <= 2) { //object options signature call
            options = name;
            setvalueCallback = typeof type === "function" ? type : null;
        } else { //legacy signature call
            options = {
                name: name,
                type: type,
                min: min,
                max: max,
                value: value
            };
        }

        item.setValue = noop;

        /* create stubs for remaining Subscriber<Item> Interface functions */
        item.setProperties = noop;
        item.lock = noop;
        item.unlock = noop;

        const existingItem = im.getItem(options.name),
            updateTargets = [];

        if (existingItem) {
            if (typeof existingItem.onDelete === "function") {
                existingItem.onDelete();
            }
            /* store remaining update-targets of existing item */
            iterObj(existingItem._updateTargets, function(ut, sid) {
                updateTargets.push({ ut: ut, sid: sid });
            });
            /* remove existing item */
            im.removeItem(options.name);
        }

        /* create new item */
        im._createItem(options.name);
        const virtualItem = im.getItem(options.name);

        /* restore existing update-targets (sans old setValue handler) */
        updateTargets.forEach(function(val) {
            virtualItem._updateTargets[val.sid] = val.ut;
        });

        if (setvalueCallback) {
            item.sID = im.subscribeItem(options.name, item);
            virtualItem.onDelete = function() {
                item.sID.unlisten();
            };
            item.setValue = setvalueCallback;
        } else {
            virtualItem.onDelete = noop;
        }
        virtualItem.value = options.value;
        im.setProperties(getItemProperties(options));
        virtualItem.valueSet = true;

        virtualItem.notifyUpdateTargets();

        shmi.log("[Helpers] created virtual item '" + options.name + "'", 1);

        return virtualItem;
    };
}());
/**
 * Sets the specified option to the provided value if the property is not defined on the target object yet.
 *
 * Used to set default config options in controls.
 *
 * @param {object} obj object to set property on
 * @param {string} prop property to set
 * @param {object|string|number|boolean|undefined|null} val default value for property
 * @returns {undefined}
 */
shmi.def = function(obj, prop, val) {
    if (obj[prop] === undefined) {
        obj[prop] = val;
    }
};

/**
 * Displays a notification dialog to the user.
 *
 * @param {string} msg notification message
 * @param {string} title dialog title
 * @param {object} paramObj parameter object for string evaluation
 */
shmi.notify = function(msg, title, paramObj) {
    var nofListeners = shmi.fire('notification', {
        message: msg,
        title: title,
        param: paramObj
    }, shmi);

    /* use native alert function if notifications are not handled */
    if (nofListeners === 0) {
        var locTitle = shmi.evalString(shmi.localize(title), paramObj),
            locMsg = shmi.evalString(shmi.localize(msg), paramObj);
        // eslint-disable-next-line no-alert
        alert(locTitle + "\n" + locMsg);
    }
};

/**
 * Displays a dialog asking for confirmation of an action. The specified callback
 * function will be be run after the user selected to either confirm or deny the request.
 *
 * @param {string} msg displayed message
 * @param {function} callback callback function
 * @param {string} [title] optional title
 * @param {object} [param] optional dynamic parameter object
 */
shmi.confirm = function(msg, callback, title, param) {
    title = title || "${V_CONFIRM_TITLE}";
    param = param || {};
    var nofListeners = shmi.fire('confirmation', {
        message: msg,
        callback: callback,
        title: title,
        param: param
    }, shmi);

    /* use native confirm function if notifications are not handled */
    if (nofListeners === 0) {
        shmi.decouple(function() {
            callback(
                // eslint-disable-next-line no-alert
                confirm(
                    shmi.evalString(shmi.localize(title), param) + "\n" + shmi.evalString(shmi.localize(msg), param)
                )
            );
        });
    }
};

/**
 * Display a dialog with custom buttons
 * @param dialogConfig {Object}
 *
 * @example Usage example
 shmi.optionDialog({
     title: "Title",
     message: "Message",
     buttons: [
         {
             callback: function(buttonName, event) {
                 shmi.notify(buttonName + ' pressed');
             },
             config: {
                 'name': 'Button1',
                 'class-name': 'button',
                 'label': 'button1'
             }
         },
         {
             callback: function(buttonName, event) {
                 shmi.notify(buttonName + ' pressed');
             },
             config: {
                 'name': 'Button2',
                 'class-name': 'button',
                 'label': 'button2'
             }
         },
         {
             callback: function(buttonName, event) {
                 shmi.notify(buttonName + ' pressed');
             },
             config: {
                 'name': 'Button3',
                 'class-name': 'button',
                 'label': 'button3'
             }
         }
     ]
 });

 */
shmi.optionDialog = function(dialogConfig) {
    var inValidButtons = [],
        validButtonTypes = ['option', 'success', 'warning', 'cancel'];

    var isDialogObj = (typeof dialogConfig === 'object'),
        isTitleValid = isDialogObj && (dialogConfig.title && dialogConfig.title.length > 0),
        isMessageValid = isDialogObj && (dialogConfig.message && dialogConfig.message.length > 0),
        hasValidButtons = isDialogObj && Array.isArray(dialogConfig.buttons) && dialogConfig.buttons.every(function(button) {
            var isButtonObj = (typeof button === 'object');
            if (isButtonObj) {
                button.type = button.type || 'option';
            }
            var hasValidType = isButtonObj && button.type.length > 0 && (validButtonTypes.indexOf(button.type) !== -1),
                hasValidCallback = isButtonObj && (typeof button.callback === 'function'),
                hasValidConfig = isButtonObj && (typeof button.config === 'object') && button.config.name && button.config.label;
            if (hasValidType && hasValidCallback && hasValidConfig) {
                return true;
            } else {
                inValidButtons.push({
                    invalidButtonObj: button,
                    isButtonObj: isButtonObj,
                    hasValidType: Boolean(hasValidType),
                    hasValidCallback: Boolean(hasValidCallback),
                    hasValidConfig: Boolean(hasValidConfig)
                });
            }
            return false;
        }),
        isConfigValid = (isTitleValid && isMessageValid && hasValidButtons);

    if (!isConfigValid) {
        shmi.log('[shmi.optionDialog] Invalid option dialog configuration provided:', 3);
        var errObj = {
            isDialogObj: isDialogObj,
            isTitleValid: isTitleValid,
            isMessageValid: isMessageValid
        };
        if (hasValidButtons) {
            errObj.hasValidButtons = hasValidButtons;
        } else {
            errObj.hasInvalidButtons = inValidButtons;
        }
        console.log(errObj);
        return false;
    }
    dialogConfig.buttonLayout = dialogConfig.buttonLayout || 'horizontal';
    var nofListeners = shmi.fire('optionDialog', dialogConfig, shmi);

    /* use native confirm function if options are not handled */
    if (nofListeners) {
        return nofListeners;
    } else {
        shmi.log('[shmi.optionDialog] No optionDialog listener triggered', 3);
        return false;
    }
};

/**
 * Displays a dialog asking to save changes. The specified callback
 * function will be be run after the user selected to either save changes and
 * continue, continue without saving or cancel.
 *
 * @param {type} msg displayed message
 * @param {type} callback callback function
 */
shmi.askSave = function(msg, callback) {
    var dia = shmi.ctrl('.ask-save-dialog');
    if (dia === null) {
        var config = shmi.requires("visuals.session.SysControlConfig.askSaveDialog");
        dia = shmi.createControl('dialog-box', document.body, config, 'DIV');
        dia.enable();
    } else {
        /* move dialog to front */
        document.body.appendChild(dia.element);
    }

    function checkDialog() {
        if (dia.active) {
            if (!dia.hidden) {
                setTimeout(function retry() {
                    shmi.askSave(msg, callback);
                }, shmi.c("ACTION_RETRY_TIMEOUT"));
                return;
            }
            var ele = shmi.getElementByName('ask-save-text', dia.element);
            shmi.visuals.session.AskSaves = shmi.visuals.session.AskSaves || {};
            var askSaves = shmi.visuals.session.AskSaves,
                id = Date.now();
            while (askSaves[id] !== undefined) {
                id++;
            }
            askSaves[id] = callback;
            var btn_save = shmi.ctrl(dia.getName() + '.save-button'),
                action;
            if (btn_save) {
                action = [];
                action.push("ask-save:" + id + ":SAVE");
                action.push("dialog:.ask-save-dialog:hide");
                btn_save.action = new shmi.visuals.core.UiAction(action, btn_save);
            }

            var btn_nosave = shmi.ctrl(dia.getName() + '.no-save-button');
            if (btn_nosave) {
                action = [];
                action.push("ask-save:" + id + ":NOSAVE");
                action.push("dialog:.ask-save-dialog:hide");
                btn_nosave.action = new shmi.visuals.core.UiAction(action, btn_nosave);
            }

            var btn_cancel = shmi.ctrl(dia.getName() + '.cancel-button');
            if (btn_cancel) {
                action = [];
                action.push("ask-save:" + id + ":CANCEL");
                action.push("dialog:.ask-save-dialog:hide");
                btn_cancel.action = new shmi.visuals.core.UiAction(action, btn_cancel);
            }

            if (ele) {
                ele.textContent = shmi.localize(msg);
            }
            dia.show();
        } else {
            setTimeout(checkDialog, shmi.c("ACTION_RETRY_TIMEOUT"));
        }
    }

    setTimeout(checkDialog, shmi.c("ACTION_RETRY_TIMEOUT"));
};

/**
 * Displays a FileChooser Dialog to select a file or directory. A callback function will be run when
 * the user has selected a file / directory or canceled selection.
 *
 * @private
 * @param {string} dir initial directory
 * @param {string[]} extensions file extensions to show (empty array lists all files)
 * @param {function} cb callback function
 * @param {string} top_level top-level directory (user cannot navigate higher)
 * @param {string} template template url sans ".html"
 */
shmi.chooseFile = function(dir, extensions, cb, top_level, template) {
    shmi.requires("visuals.controls.Button");
    shmi.requires("visuals.controls.DialogBox");
    shmi.requires("visuals.controls.FileChooser");
    var dia_cfg = shmi.requires("visuals.session.SysControlConfig.chooseFileDialog"),
        dia,
        fc_ctrl = null;

    if (template !== undefined) {
        dia_cfg.template = template;
    }

    var cancel_func = function() {
        dia.hide();
        shmi.deleteControl(dia, true);
        cb(null);
    };

    var ok_func = function() {
        dia.hide();

        var val = null;
        if (fc_ctrl !== null) {
            val = fc_ctrl.getValue();
        }

        shmi.deleteControl(dia, true);

        cb(val);
    };

    var on_init = function() {
        dia.enable();
        var ok_el = dia.element.querySelector("[data-function*=ok]"),
            cancel_el = dia.element.querySelector("[data-function*=cancel]"),
            fc_el = dia.element.querySelector("[data-function*=choose-file]");

        if (ok_el && cancel_el && fc_el) {
            var ok_ctrl = shmi.getControlByElement(ok_el);
            var cancel_ctrl = shmi.getControlByElement(cancel_el);
            fc_ctrl = shmi.getControlByElement(fc_el);

            if (ok_ctrl && cancel_ctrl && fc_ctrl) {
                fc_ctrl.setExtensions(extensions);
                if (top_level !== undefined) {
                    fc_ctrl.setTopLevel(top_level);
                }
                fc_ctrl.setValue(dir);
                ok_ctrl.onClick = ok_func;
                cancel_ctrl.onClick = cancel_func;
            } else {
                throw new Error("FileChooser-dialog template '" + dia_cfg.template + "' does not contain all required controls");
            }
        } else {
            throw new Error("FileChooser-dialog template '" + dia_cfg.template + "' does not contain all required elements");
        }
        dia.show();
    };

    dia = shmi.createControl('dialog-box', document.body, dia_cfg, 'DIV');
    shmi.waitOnInit(dia, on_init);
};

/**
 * Runs multiple queries at once and runs the specified callbacks whenn all
 * queries have returned.
 *
 * @param {array} queries
 * @param {string} queries[i][0] name of db table
 * @param {string} queries[i][1] fields list of comma-separated fieldnames
 * @param {string[]} queries[i][2] array of where-conditions
 * @param {numeric} queries[i][3] database ID
 * @param {function} callback function to run on completion
 */
shmi.multiQuery = function(queries, callback) {
    var result = {};

    for (var i = 0; i < queries.length; i++) {
        (function(j) {
            var res = {},
                iter = shmi.requires("visuals.tools.iterate.iterateObject");
            res.id = shmi.visuals.session.QueryManager.queryDirect(function(status, query) {
                res.status = status;
                res.query = query;
                if (Object.keys(result).length === queries.length) {
                    var completed = 0;
                    iter(result, function(val, k) {
                        if (result[k].status !== undefined) {
                            completed++;
                        }
                    });
                    if (completed === Object.keys(result).length) {
                        callback(result);
                    }
                }
            }, queries[j][0], queries[j][1], queries[j][2], queries[j][3]);
            result[j] = res;
        })(i);
    }
};

(function() {
    function checkReady(urlRef) {
        var iter = shmi.requires("visuals.tools.iterate.iterateObject"),
            ready = true;

        iter(urlRef, function(ref, prop) {
            if (!ref.ready) {
                ready = false;
            }
        });

        return ready;
    }

    function altLoad(urlRef, callback) {
        var iter = shmi.requires("visuals.tools.iterate.iterateObject"),
            workingRef = shmi.cloneObject(urlRef),
            resultRef = shmi.cloneObject(urlRef);

        iter(urlRef, function(ref, prop) {
            workingRef[prop] = {
                url: ref,
                ready: false,
                data: null,
                callback: function(data, failed, url) {
                    if (!failed) {
                        resultRef[prop] = data;
                    } else {
                        resultRef[prop] = null;
                    }
                    workingRef[prop].ready = true;
                    if (checkReady(workingRef)) {
                        callback(resultRef);
                    }
                }
            };
        });

        iter(workingRef, function(ref, prop) {
            shmi.loadResource(ref.url, ref.callback);
        });
    }

    /**
     * Asynchronously loads an array of file URLs.
     *
     * @param {string[]} urls     urls to load
     * @param {function} callback result callback
     * @param {boolean} forceRemote true to bypass cache
     * @param {boolean} binary true for binary mode
     */
    shmi.multiLoad = function(urls, callback, forceRemote, binary) {
        if (!Array.isArray(urls) && (typeof urls === "object")) {
            altLoad(urls, callback);
            return;
        }

        var result = [],
            i;
        for (i = 0; i < urls.length; i++) {
            result.push(null);
        }

        result.counter = 0;

        for (i = 0; i < urls.length; i++) {
            (function(j) {
                var res = {};
                res.url = urls[j];
                result[j] = res;
                shmi.loadResource(urls[j],
                    function multiload_cb(data, failed) {
                        res.failed = !!failed;
                        res.data = data;
                        result.counter++;
                        var cur_length = result.counter;
                        if (cur_length === urls.length) {
                            var completed = 0;
                            for (var k = 0; k < result.length; k++) {
                                if (result[k].failed !== undefined) {
                                    completed++;
                                }
                            }
                            if (completed === result.length) {
                                callback(result);
                            }
                        }
                    }, forceRemote, binary);
            })(i);
        }
    };
}());

/**
 * Deletes the specified control
 *
 * @param {control} control control to delete
 * @param {boolean} remove_ele true if HTML base element should be removed
 */
shmi.deleteControl = function(control, remove_ele) {
    var session = shmi.requires("visuals.session"),
        cm = shmi.requires("visuals.tools.controller");

    /* default to remove control including its root element */
    remove_ele = (remove_ele === undefined) ? true : remove_ele;

    /* disable control to release its resources */
    control.disable();

    /* call onDelete function in case the control implements it */
    if (typeof control.onDelete === "function") {
        control.onDelete();
    }

    if (control._init_ && Array.isArray(control._init_.tokens)) {
        control._init_.tokens.forEach(function(t) {
            t.unlisten();
        });
        control._init_.tokens = [];
    }

    var ctrl_name = control.getName();
    if (session && session.config && session.config.debug && !ctrl_name) {
        console.debug("[shmi.deleteControl] deleting uninitialized control");
    }

    /* delete control-reference from parent-container */
    if (control.parentContainer) {
        control.parentContainer.controls.forEach(function(ctrl_ref, idx) {
            if (ctrl_ref === control) {
                control.parentContainer.controls.splice(idx, 1);
            }
        });
    }

    /* delete control-reference from layout; also recursively delete all child-controls */
    for (var i = 0; i < session.Layout[control.uiType].length; i++) {
        if (session.Layout[control.uiType][i].element === control.element) {
            /* delete child-controls */
            if (Array.isArray(session.Layout[control.uiType][i].controls)) {
                while (session.Layout[control.uiType][i].controls.length) {
                    shmi.deleteControl(session.Layout[control.uiType][i].controls[0], remove_ele);
                }
            }
            session.Layout[control.uiType][i].disable();
            /* delete control name reference */
            delete session.names[session.Layout[control.uiType][i].getName()];
            /* remove control layout reference */
            session.Layout[control.uiType].splice(i, 1);
            if ((remove_ele === true) && control.element.parentNode) {
                control.element.parentNode.removeChild(control.element);
            }
            break;
        }
    }
    control.deleted = true;
    control.parentContainer = null;
    cm.removeAll(ctrl_name);
    control.fire("delete", { name: ctrl_name });
    shmi.fire("delete-control", { name: ctrl_name }, session);
};

/**
 * Creates a new control with the specified ui-type. the new control will be created using
 * as a child element of the provided parent element using the provided tag-name.
 *
 * @param {string} ui_type ui-type of the new control
 * @param {HTMLElement} parent_el parent element of the new control
 * @param {object} config configuration object
 * @param {string} tag_name tag name of controls base element
 * @param {string} position 'after' | 'before' | 'from' | null
 * @param {boolean} [autoEnable] automatically enable control when parent is active, defaults to `true` when omitted
 *
 * @returns {control} new control or null
 */
shmi.createControl = function(ui_type, parent_el, config, tag_name, position, autoEnable) {
    var tag = null;
    if (tag_name !== undefined) {
        tag = tag_name;
    } else {
        tag = 'DIV';
    }

    if (autoEnable === undefined) {
        autoEnable = true;
    }

    var defaultConfig = shmi.visuals.parser.getDefaultConfig(ui_type),
        iter = shmi.requires("visuals.tools.iterate.iterateObject");

    config = config || {};

    iter(defaultConfig, function(val, prop) {
        shmi.def(config, prop, val);
    });

    function appendFormat(prefix, parent, child) {
        if (parent.hasChildNodes() && parent.lastChild.nodeType === 3 && /^\s*[\r\n]\s*$/.test(parent.lastChild.textContent)) {
            parent.insertBefore(document.createTextNode("\n" + prefix), parent.lastChild);
            parent.insertBefore(child, parent.lastChild);
        } else {
            parent.appendChild(document.createTextNode("\n" + prefix));
            parent.appendChild(child);
            parent.appendChild(document.createTextNode("\n" + prefix.slice(0, -4)));
        }
    }

    var el = document.createElement(tag);
    el.setAttribute('data-ui', ui_type);
    if (config && config.name) {
        el.setAttribute('data-name', config.name);
    }

    if (position === "before") {
        parent_el.parentNode.insertBefore(el, parent_el);
    } else if (position === "after") {
        parent_el.parentNode.insertBefore(el, parent_el.nextSibling);
    } else if (position === "from") {
        if (shmi.getControlByElement(parent_el) !== null) {
            throw new Error("element already contains a control");
        }
        el = parent_el;
        /* make the control from the specified element */
    } else {
        appendFormat("    ", parent_el, el);
    }

    var type_i = -1,
        ps = shmi.visuals.session.ParserState;
    for (var i = 0; i < ps.controlTypes.length; i++) {
        if (ps.controlTypes[i][0] === ui_type) {
            type_i = i;
            break;
        }
    }
    var control = null;
    if (type_i !== -1) {
        if (ui_type === 'panel') {
            control = new ps.controlTypes[type_i][1](el, false, config);
        } else {
            control = new ps.controlTypes[type_i][1](el, config);
        }
        control.uiType = ui_type;
        var parentContainerElement = shmi.getParentContainerElement(control.element);
        control.parentContainer = (parentContainerElement === null) ? null : shmi.getControlByElement(parentContainerElement);

        if (control.getParent() !== null) {
            control.getParent().controls.push(control);
            if (autoEnable && control.getParent().isActive() === true) {
                control.enable();
            }
        } else if (autoEnable) {
            control.enable();
        }

        shmi.visuals.session.Layout[ui_type].push(control);
        control.fire('register', {});
        /* fire 'register' after adding it to Layout */
    } else {
        shmi.log("[createControl] control type '" + ui_type + "' not available", 2);
    }
    return control;
};

/**
 * Waits for specified control(-s) to finish initialization and then runs a callback function.
 *
 * @private
 * @param {control|control[]} obj control reference or array of control references
 * @param {function} cb function to be called when all controls are initialized
 * @param {object} [recRef] reference object used for recursion
 *
 * @returns {object} reference object to cancel waiting using `reference.cancel()`
 */
shmi.waitOnInit = function(obj, cb, recRef) {
    var ready = false,
        ref = recRef ? recRef : {
            tokens: [],
            cancel: function() {
                this.tokens.forEach(function(t) {
                    t.unlisten();
                });
                this.tokens = [];
            },
            unlisten: function() {
                this.cancel();
            }
        };

    if (Array.isArray(obj)) {
        var i,
            inited = 0;

        for (i = 0; i < obj.length; i++) {
            if (obj[i].initialized === true) {
                inited++;
            }
        }

        if (inited === obj.length) {
            ready = true;
        }
    } else if (obj.initialized === true) {
        ready = true;
    }
    if (ready === true) {
        cb(obj);
    } else if (Array.isArray(obj)) {
        obj.forEach(function(ctrl) {
            if (!ctrl.initialized) {
                var t = ctrl.listen("init", function(evt) {
                    ref.tokens.forEach(function(tmpTok) {
                        tmpTok.unlisten();
                    });
                    ref.tokens = [];
                    shmi.waitOnInit(obj, cb, ref);
                });
                ref.tokens.push(t);
            }
        });
    } else if (!obj.initialized) {
        var t = obj.listen("init", function(evt) {
            ref.tokens.forEach(function(tmpTok) {
                tmpTok.unlisten();
            });
            ref.tokens = [];
            shmi.waitOnInit(obj, cb, ref);
        });
        ref.tokens.push(t);
    }

    return ref.tokens.length ? ref : null;
};

(function() {
    function checkDomInsertion(elem, callback) {
        var root = getRoot(elem);
        if (root !== document.body) {
            setTimeout(function() {
                checkDomInsertion(elem, callback);
            }, 100);
        } else {
            callback();
        }
    }

    function getRoot(elem) {
        if (elem.parentNode === null) {
            return null;
        } else if (elem.parentNode === document.body) {
            return document.body;
        } else {
            return getRoot(elem.parentNode);
        }
    }

    function addToParent(control) {
        if (control.parentContainer !== null) {
            control.parentContainer.controls.push(control);
            if (control.parentContainer.active === true) {
                var act_lid = control.listen("init", function(e) {
                    control.unlisten("init", act_lid);
                    if (control.parentContainer.active === true) {
                        control.enable();
                    }
                });
            }
        }
    }

    /**
     * Register control name in app layout.
     *
     * @private
     * @param {control} ctrl visuals control
     * @param {string} [ctrl_name] optional requested control name
     * @returns {string} final control name
     */
    shmi.registerName = function(ctrl, ctrl_name) {
        var s = shmi.visuals.session;
        s.names = s.names || {};
        var names = s.names;
        if (ctrl_name && ctrl_name.indexOf(".") !== -1) {
            //throw "ERROR: non-local control name configured!" + ctrl_name;
            var tmp_parts = ctrl_name.split(".");
            ctrl_name = tmp_parts[tmp_parts.length - 1];
        }
        var custom_n = !!ctrl_name;

        var t = custom_n ? ctrl_name : ctrl.getClassName().toLowerCase() || ctrl.uiType || "UNDEFINED",
            p_name = "";
        /* full name storage */
        if (shmi.isRegistered(ctrl.element, ctrl.uiType)) {
            checkDomInsertion(ctrl.element, function() {
                if (ctrl.parentContainer === null) {
                    var parentContainerElement = shmi.getParentContainerElement(ctrl.element);
                    ctrl.parentContainer = (parentContainerElement === null) ? null : shmi.getControlByElement(parentContainerElement);
                    addToParent(ctrl);
                }

                if ((ctrl.parentContainer !== null) && (ctrl.parentContainer !== undefined)) {
                    p_name = ctrl.parentContainer.getName();
                    t = p_name + "." + t;
                }
                var num = 1,
                    n = "";
                if (custom_n) {
                    if (names[t] === undefined) {
                        n = t;
                    } else {
                        while (names[t + shmi.c("NAME_SUFFIX") + num] !== undefined) {
                            num++;
                        }
                        n = t + shmi.c("NAME_SUFFIX") + num;
                    }
                } else {
                    while (names[t + shmi.c("NAME_SUFFIX") + num] !== undefined) {
                        num++;
                    }
                    n = t + shmi.c("NAME_SUFFIX") + num;
                }
                names[n] = {};
                names[n].ctrl = ctrl;

                ctrl.fire('register-name', { name: n });
            });
        } else {
            var l_id = ctrl.listen('register', function() {
                ctrl.unlisten('register', l_id);

                checkDomInsertion(ctrl.element, function() {
                    if (ctrl.parentContainer === null) {
                        var parentContainerElement = shmi.getParentContainerElement(ctrl.element);
                        ctrl.parentContainer = (parentContainerElement === null) ? null : shmi.getControlByElement(parentContainerElement);
                        addToParent(ctrl);
                    }

                    if (ctrl.parentContainer !== null) {
                        p_name = ctrl.parentContainer.getName();
                        t = p_name + "." + t;
                    }
                    var num = 1,
                        n = "";
                    if (custom_n) {
                        if (names[t] === undefined) {
                            n = t;
                        } else {
                            while (names[t + shmi.c("NAME_SUFFIX") + num] !== undefined) {
                                num++;
                            }
                            n = t + shmi.c("NAME_SUFFIX") + num;
                        }
                    } else {
                        while (names[t + shmi.c("NAME_SUFFIX") + num] !== undefined) {
                            num++;
                        }
                        n = t + shmi.c("NAME_SUFFIX") + num;
                    }
                    names[n] = {};
                    names[n].ctrl = ctrl;

                    ctrl.fire('register-name', { name: n });
                });
            });
        }

        return ctrl_name;
    };
})();

/**
 * Converts expr to a boolean expression if possible.
 *
 * @param {boolean|string} expr
 * @returns {boolean}
 */
shmi.toBoolean = function(expr) {
    var boolResult = false;
    if ((typeof expr === "boolean") || (expr instanceof Boolean)) {
        boolResult = expr;
    } else if ((typeof expr === "string") || (expr instanceof String)) {
        var strExpr = expr.trim().toLowerCase();
        if ((strExpr === "true") || (strExpr === "false")) {
            boolResult = (strExpr === "true");
        }
    } else {
        shmi.log("[toBoolean] expr ist not a boolean expression, expr: " + expr, 2);
    }
    return boolResult;
};

/**
 * Converts expr to a number expression if possible.
 *
 * @param {number|string} expr
 * @returns {number}
 */
shmi.toNumber = function(expr) {
    var numResult = 0;
    if (isNaN(expr)) {
        shmi.log("[toNumber] expr ist not a number expression, expr: " + expr, 2);
        numResult = Number.NaN;
    } else {
        numResult = Number(expr);
    }
    return numResult;
};

/**
 * Creates a deep copy of an object.
 *
 * @param {object} obj the object to clone.
 * @returns {object} the copy.
 */
shmi.cloneObject = function(obj) {
    if (typeof obj === 'undefined') {
        return undefined;
    }
    // probably fastest way to fit all cases:
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Binds the values of any two items from the ItemManager.
 *
 * Synchronization of values starts when both items have been successfully initialized.
 * The current value of the first specified item will be used as the new value for
 * both items after binding.
 *
 * Connecting two items that are both non-virtual will only be active during an active user
 * session since binding takes place client side.
 *
 * @param {string} item_name1 first item name
 * @param {string} item_name2 second item name
 * @returns {number} binding-ID
 */
shmi.bindItems = function(item_name1, item_name2) {
    var s = shmi.visuals.session,
        im = s.ItemManager;

    s.bindings = s.bindings || {};
    var bind_id = 1;
    while (s.bindings[bind_id] !== undefined) {
        bind_id++;
    }

    s.bindings[bind_id] = {
        id: bind_id,
        item1: item_name1,
        item2: item_name2
    };

    var sid_1 = 0,
        sid_2 = 0;
    var noop = function() {
    };
    var sub_1 = {
        setProperties: noop,
        lock: noop,
        unlock: noop
    };
    var sub_2 = {
        setProperties: noop,
        lock: noop,
        unlock: noop
    };
    /* i need to set the one value to the other if both have been successfully initialized */
    var common_set = false;

    sub_1.setValue = function(value) {
        if (im.items[item_name2].valueSet) {
            im.writeValue(item_name2, value);
        }
    };
    sub_2.setValue = function(value) {
        if (common_set) {
            im.writeValue(item_name1, value);
        } else if (im.items[item_name1].valueSet) {
            im.writeValue(item_name2, im.items[item_name1].value);
            common_set = true;
        }
    };

    sid_1 = im.subscribeItem(item_name1, sub_1);
    sid_2 = im.subscribeItem(item_name2, sub_2);
    s.bindings[bind_id].item1_sid = sid_1;
    s.bindings[bind_id].item2_sid = sid_2;
    return bind_id;
};

/**
 * Stop item-binding created with `shmi.bindItems`.
 *
 * @param   {number}  bindId binding-ID returned by call to shmi.bindItems
 * @returns {boolean} true if binding was stopped, false if the specified binding-ID has not been found
 */
shmi.unbindItems = function(bindId) {
    var unbound = false,
        s = shmi.visuals.session,
        im = s.ItemManager;
    s.bindings = s.bindings || {};
    var binding;

    if (s.bindings[bindId] !== undefined) {
        binding = s.bindings[bindId];
        im.unsubscribeItem(binding.item1, binding.item1_sid);
        im.unsubscribeItem(binding.item2, binding.item2_sid);
        delete s.bindings[bindId];
        unbound = true;
    }

    return unbound;
};

/**
 * Retrieves the corresponding control instance for a specified HTMLElement.
 *
 * The specified element must be the root element of an active control.
 *
 * @param {HTMLElement} element
 * @returns {Control} corresponding Control object or null if none was found
 */
shmi.getControlByElement = function(element) {
    var ui_t = element.getAttribute('data-ui'),
        s = shmi.visuals.session,
        ctrl = null;
    if (ui_t !== null) {
        if (Array.isArray(s.Layout[ui_t])) {
            var layout = s.Layout[ui_t];
            for (var i = 0; i < layout.length; i++) {
                if (layout[i].element === element) {
                    ctrl = layout[i];
                    break;
                }
            }
        } else {
            throw new Error("[shmi.getControlByElement] control type '" + ui_t + "' not defined");
        }
    } else {
        var iterObj = shmi.requires("visuals.tools.iterate.iterateObject");
        console.debug("[shmi.getControlByName] data-ui attribute missing, checking all ui-types...");
        iterObj(s.Layout, function(layoutArray, uiType) {
            layoutArray.forEach(function(ctrlRef) {
                if (ctrlRef.element === element) {
                    ctrl = ctrlRef;
                }
            });
        });
    }
    return ctrl;
};

/**
 * returns the global name of the specified control
 *
 * @private
 * @param {control} ctrl control instance
 *
 * @returns {string|null} control name or `null` if none is registered yet
 */
shmi.getFullName = function(ctrl) {
    return ctrl.getName();
};

/**
 * Listen for global events of the specified type.
 *
 * @param {String} event_name event type
 * @param {function} event_handler event handler function
 * @param {object} filter event detail filter
 * @returns {object} listener token
 */
shmi.listen = function(event_name, event_handler, filter) {
    var s = shmi.pkg("visuals.session");
    s.Events = s.Events || {};
    s.Events[event_name] = s.Events[event_name] || {};
    var e = s.Events[event_name],
        l_id = 0;
    while (e[l_id] !== undefined) {
        l_id++;
    }
    if ((filter !== null) && (typeof filter === 'object')) {
        e[l_id] = function(evt) {
            let filter_matches = false,
                properties = Object.keys(filter);

            properties.some((prop) => {
                let f_parts = prop.split("."),
                    ref = null;

                while (f_parts.length) {
                    let f_part = f_parts.shift();

                    ref = (ref === null) ? evt[f_part] : ref[f_part];
                    if (ref === undefined) {
                        break; // filter property not defined on event
                    }
                }

                if ((ref !== undefined) && (ref === filter[prop])) {
                    filter_matches = true;
                    return false;
                } else {
                    filter_matches = false;
                    return true;
                }
            });

            if (filter_matches === true) {
                event_handler(evt);
            }

            return filter_matches;
        };
    } else {
        e[l_id] = function(evt) {
            event_handler(evt);
            return true;
        };
    }

    var listenToken = { name: event_name, listenerId: l_id, unlisten: null };
    listenToken.unlisten = function() {
        shmi.unlisten(listenToken);
    };

    return listenToken;
};

/**
 * Stop listening for the specified event type
 *
 * @param {string} event_name event type
 * @param {number} listener_id event listener id returned by shmi.listen
 * @returns {undefined}
 */
shmi.unlisten = function(event_name, listener_id) {
    var s = shmi.visuals.session,
        e;

    /* alternative use with only one {object} argument (listener token returned from listen function */
    if ((typeof event_name === "object") && (arguments.length === 1)) {
        e = s.Events[event_name.name];
        if (e === undefined) {
            throw Error("ERROR: undefined event type '" + event_name.name + "'");
        }
        if (e[event_name.listenerId] !== undefined) {
            delete e[event_name.listenerId];
        } else {
            throw Error("ERROR: listener id " + event_name.listenerId + " not registered for event type '" + event_name.name + "'");
        }
    } else {
        e = s.Events[event_name];
        if (e === undefined) {
            throw Error("ERROR: undefined event type '" + event_name + "'");
        }
        if (e[listener_id.listenerId] !== undefined) {
            delete e[listener_id.listenerId];
        } else {
            throw Error("ERROR: listener id " + listener_id.listenerId + " not registered for event type '" + event_name + "'");
        }
    }
};

/**
 * Returns the parent container control of the specified base-element of a control
 *
 * @private
 * @param {HTMLElement} elem base-element of control
 * @returns {Control} parent container control
 */
shmi.getParentContainer = function(elem) {
    elem = elem.parentNode;
    if (elem === null) {
        shmi.log("[Helpers] element is body", 1);
        return null;
    }
    if (elem === document.body) {
        shmi.log("[Helpers] element is body", 1);
        return null;
    }
    while (!shmi.isContainer(elem)) {
        if ((elem === null) || (elem === undefined)) {
            shmi.log("[Helpers] getParentContainer - provided element NULL", 1);
            return null;
        }
        elem = elem.parentNode;
        if (elem === document.body) {
            shmi.log("[Helpers] some parent of element is body", 1);
            return null;
        }
    }
    var type = elem.getAttribute('data-ui');
    for (var i = 0; i < shmi.visuals.session.Layout[type].length; i++) {
        if (shmi.visuals.session.Layout[type][i].element === elem) {
            return shmi.visuals.session.Layout[type][i];
        }
    }
    shmi.log("[Helper] parent not found in layouts(" + shmi.visuals.session.Layout[type].length + "), type: " + type, 1);
    return null;
};

/**
 *Helper function to retrieve base element of parent container-control during parsing.
 *
 * @private
 * @param   {HTMLElement} elem HTML-element used to base container search
 * @returns {HTMLElement} base element of parent container-control or null if none was found
 */
shmi.getParentContainerElement = function(elem) {
    elem = elem.parentNode;
    if (elem === document.body) {
        shmi.log("[Helpers] element is body", 1);
        return null;
    } else if (elem === null) {
        shmi.log("[Helpers] parent node is null or undefined", 1);
        return null;
    }
    while (!shmi.isContainer(elem)) {
        if (elem === null) {
            shmi.log("[Helpers] parent node is null or undefined", 1);
            return null;
        }
        elem = elem.parentNode;
        if (elem === document.body) {
            shmi.log("[Helpers] some parent of element is body", 1);
            return null;
        }
        if (elem === document.documentElement) {
            shmi.log("[Helpers] some parent of element is body", 1);
            return null;
        }
    }
    return elem;
};

/**
 * Check if specified element is base of container control.
 *
 * @private
 * @param   {HTMLElement} element element to test
 * @returns {boolean}     true of specified element is base of container control
 */
shmi.isContainer = function(element) {
    if (element instanceof HTMLElement) {
        var type = element.getAttribute('data-ui');
        for (var i = 0; i < shmi.visuals.session.ParserState.containerTypes.length; i++) {
            if (shmi.visuals.session.ParserState.containerTypes[i] === type) {
                return true;
            }
        }
    }
    return false;
};

(function() {
    /* on enable CB maker */
    function getEnableCallback(controlsRef, selector, length, callback) {
        return function(c) {
            controlsRef[selector] = c;
            var iter = shmi.requires("visuals.tools.iterate.iterateObject"),
                ready = true,
                count = 0;
            iter(controlsRef, function(val, cn) {
                if (controlsRef[cn].active !== true) {
                    ready = false;
                } else {
                    count++;
                }
            });
            if (ready && (count === length)) {
                callback(controlsRef);
            }
        };
    }

    /**
     * runs a callback function when a control matching the specified name expression is active
     * or activated (when not currently active).
     *
     * when an array of name expressions is given as argument, all expressions have to be matched
     * before the callback is run.
     *
     * @param {String|String[]} ctrl_name control name expression or array of expressions
     * @param {function} callback function to call with control(-s) as argument when active
     * @returns {undefined}
     */
    shmi.onEnable = function(ctrl_name, callback) {
        const ctrls = {},
            { HANDLE_PREFIX: idPrefix, getNodeHandle } = shmi.requires("visuals.tools.nodes");

        if (Array.isArray(ctrl_name)) {
            for (let i = 0; i < ctrl_name.length; i++) {
                shmi.onEnable(ctrl_name[i], getEnableCallback(ctrls, ctrl_name[i], ctrl_name.length, callback));
            }
        } else {
            let ctrl = shmi.ctrl(ctrl_name), l_id;
            if (ctrl && ctrl.active) {
                callback(ctrl);
            } else if (ctrl_name.startsWith(idPrefix)) {
                const nodeHandle = ctrl_name.replace(idPrefix, "");

                l_id = shmi.listen("enable", function(e) {
                    /* skip events that do not provide a node-id */
                    if (!e.source || !e.source.element || !e.source.element.getAttribute("_nodeid")) {
                        return;
                    }

                    const currentHandle = getNodeHandle(e.source);
                    if (currentHandle === nodeHandle) {
                        shmi.unlisten("enable", l_id);
                        callback(e.source);
                    }
                });
            } else {
                l_id = shmi.listen("enable", function(e) {
                    let name_parts, misses;
                    /* skip events that do not provide an event-source name */
                    if (!e.detail.name) {
                        return;
                    }
                    name_parts = ctrl_name.split(" .");
                    misses = 0;
                    for (let i = 0; i < name_parts.length; i++) {
                        if (e.detail.name.indexOf(name_parts[i]) === -1) {
                            misses++;
                        }

                        if ((i === name_parts.length - 1) && (e.detail.name.indexOf(name_parts[i]) !== (e.detail.name.length - name_parts[i].length))) {
                            misses++; //prevent false positive when "enable" event of children is emitted before parent
                        }
                    }
                    if (misses === 0) {
                        ctrl = shmi.ctrl(ctrl_name);
                        if (ctrl) {
                            shmi.unlisten("enable", l_id);
                            callback(ctrl);
                        }
                    }
                });
            }
        }
    };
}());

/**
 * runs a callback function when a control matching the specified name expression is inactive
 * or disabled (when currently active).
 *
 * when an array of name expressions is given as argument, all expressions have to be matched
 * before the callback is run.
 *
 * @param {String|String[]} ctrl_name control name expression or array of expressions
 * @param {function} callback function to call with control(-s) as argument when inactive
 * @returns {undefined}
 */
shmi.onDisable = function(ctrl, callback) {
    if (ctrl && Array.isArray(ctrl.events) && (ctrl.events.indexOf('disable') !== -1)) {
        if (ctrl.active === false) {
            callback(ctrl);
        } else {
            var l_id = ctrl.listen('disable', function eventHandler(e) {
                ctrl.unlisten('disable', l_id);
                callback(ctrl);
            });
        }
    } else {
        throw new Error("ERROR: 'disable' event not supported");
    }
};

/**
 * converts unicode string to utf-8 encoding
 *
 * @param {String} s unicode input
 * @returns {String} utf-8 encoded string
 */
shmi.to_utf8 = function(s) {
    return shmi.visuals.session.FileManager.to_utf8(s);
};

/**
 * converts utf-8 encoded string to unicode string
 *
 * @param {String} s utf-8 input
 * @returns {String} unicode encoded string
 */
shmi.from_utf8 = function(s) {
    return shmi.visuals.session.FileManager.from_utf8(s);
};

/**
 * Returns a boolean indicating whether the object has the specified
 * property as its own property (as opposed to inheriting it).
 *
 * @param {Object} obj Object to check the existance of the property on.
 * @param {string|symbol} prop Name of the property to test
 * @returns {boolean} A Boolean indicating whether or not the object has
 *  the specified property as own property.
 */
shmi.objectHasOwnProperty = Object.prototype.hasOwnProperty.call.bind(Object.prototype.hasOwnProperty);

/**
 * runs a callback function when the specified DOM-element becomes (or already is) visible.
 *
 * this function uses the offsetWidth and offsetHeight properties of the element to detect
 * visibility. when either of them becomes non-zero, the element is considered visible.
 *
 * @param {HTMLElement} element element to detect visibility for
 * @param {function} callback function to run when element becomes visible
 * @returns {undefined}
 */
shmi.onVisible = function(element, callback) {
    var num_retries = 0;
    if (arguments[2]) {
        num_retries = arguments[2];
    }
    if ((element.offsetWidth > 0) || (element.offsetHeight > 0)) {
        if (shmi.visuals.session.config.debug) {
            console.log("[shmi.onVisible] element visible", element);
        }
        callback();
    } else {
        if (num_retries > 500) {
            if (shmi.visuals.session.config.debug) {
                console.log("[shmi.onVisible] waiting for a long time to become visible...", element);
            }
            num_retries = 0;
        }
        setTimeout(function() {
            shmi.onVisible(element, callback, num_retries + 1);
        }, shmi.c("ACTION_RETRY_TIMEOUT"));
    }
};

/**
 * Gets the absolute position of an HTML element in the whole Document.
 *
 * @param {HTMLElement} element the element
 * @returns {Object} the absolute position of element {x, y}
 */
shmi.getAbsPosition = function(element) {
    var xScroll = 0,
        yScroll = 0,
        boundingBox = element.getBoundingClientRect();

    while (element) {
        xScroll += element.scrollLeft;
        yScroll += element.scrollTop;
        element = element.offsetParent;
    }

    return { x: boundingBox.left + xScroll, y: boundingBox.top + yScroll };
};

/**
 * Evaluates dynamic content into a provided string.
 *
 * @example
 var str = shmi.evalString(
 "Current time in ms: <%= TIME_NOW %>.",
 { TIME_NOW: Date.now() }
 );
 console.log(str);
 *
 * @param {string} in_text text containing markers for dynamic content
 * @param {object} dyn_content object specifying dynamic content
 * @returns {string} evaluated string
 */
shmi.evalString = function(in_text, dyn_content) {
    var session = shmi.visuals.session, im = session.ItemManager, locale = session.locale;

    /* function to map values to strings from enumeration object */
    function MAP(value, mapObj) { //eslint-disable-line
        var localeString = null,
            localeObj = null;

        if (typeof mapObj === "string") {
            localeString = locale[mapObj];
            if (localeString) {
                try {
                    eval("localeObj = " + localeString);
                } catch (exc) {
                    console.error("[shmi.evalString]", "failed to parse enumeration object from locale-variable:", mapObj);
                    return "INVALID_ENUM";
                }
                mapObj = localeObj;
            }
        }
        if (mapObj[value]) {
            return shmi.localize(mapObj[value]);
        } else {
            return "UNKNOWN";
        }
    }

    /* function to insert formated dates / times from unix-timestamp values */
    function DATE(value, datestring, toUtc) { //eslint-disable-line
        var dt = shmi.requires("visuals.tools.date");
        return dt.formatDateTime(value, {
            datestring: datestring ? datestring : null,
            utc: !!toUtc
        });
    }

    /* convenience function to insert item values */
    function ITEM(i_name) { //eslint-disable-line
        var read_val = im.readValue(i_name);
        return read_val;
    }

    /* convenience function to insert localized string */
    function LOC(var_name) { //eslint-disable-line
        return locale[var_name];
    }

    function processMarkers(_$_, in_str) {
        let keys = Object.keys(_$_);

        in_str = in_str.trim();

        keys.sort((a, b) => a.length - b.length);
        keys.reverse();
        keys.forEach((key) => {
            let proc_re = new RegExp(`(?!_\\$_\\.)\\b${escapeRegExp(key)}\\b`, "g");

            in_str = in_str.replace(proc_re, "_$_." + key);
        });
        return in_str;
    }

    function replace_dyn_markers(in_data, _$_) {
        var matches = in_data.match(/<%=(.*?)%>/g),
            t_re = null;

        matches = (matches === null) ? [] : matches;
        matches.sort((a, b) => a.length - b.length);
        matches.reverse();
        for (var i = 0; i < matches.length; i++) {
            var cur_match = matches[i].match(/<%=(.*?)%>/);
            if (cur_match[1]) {
                if (typeof _$_ !== "object") {
                    _$_ = {};
                }
                var content = null;
                try {
                    content = eval(processMarkers(_$_, cur_match[1]));
                    t_re = new RegExp(escapeRegExp(cur_match[0]), "g");
                    in_data = in_data.replace(t_re, content);
                } catch (exc) {
                    content = "ERROR";
                }
            }
        }
        return in_data;
    }

    /* escape special characters for use in regular expression */
    function escapeRegExp(str) {
        return str.replace(/[-[\]{}()*+?.\\^$|]/g, "\\$&");
    }

    return replace_dyn_markers(in_text, dyn_content);
};

(function() {
    var serverOffset = null,
        connectTime = null,
        serverTimeItem = shmi.c("SERVER_TIME_ITEM"),
        altServerTimeItem = shmi.c("ALT_SERVER_TIME_ITEM");

    /**
     * Get current time on connect server (UTC).
     *
     * @returns {number} current server time as unix timestamp
     */
    shmi.getServerTime = function() {
        var returnTime = Date.now() / 1000,
            im = shmi.requires("visuals.session.ItemManager");

        if (im.getItem(serverTimeItem)) {
            connectTime = im.readValue(serverTimeItem);
        } else if (im.getItem(altServerTimeItem)) {
            connectTime = im.readValue(altServerTimeItem);
        }

        if (connectTime !== null) {
            var curOffset = returnTime - parseInt(connectTime);
            if (serverOffset === null || isNaN(serverOffset)) {
                serverOffset = curOffset;
            } else {
                serverOffset = (serverOffset * 0.7) + (curOffset * 0.3);
            }
            return returnTime - serverOffset;
        }
        return returnTime;
    };
}());

(function() {
    function callComplete(callState) {
        return (callState.ready === callState.total);
    }

    /**
     * Wait for controls to enable and / or items to get initialized.
     *
     * @example
     //wait for a button control matching the name-expression '.notify-button',
     //an item 'SInt' and the resource 'index.html' to become available and then attach a
     //click-listener to the button to display a notification
     shmi.onReady({
            controls: {
                notifyButton: ".notify-button"
            },
            items: {
                valueItem: "Systemzeit"
            },
            resources: {
                index: "index.html"
            }
        }, function(resolved) {
            var clickToken = resolved.controls.notifyButton.listen("click", function(){
                var notificationText = "Current value of item 'SInt': " + resolved.items.valueItem.readValue() + "\n" +
                    "Loading of 'index.html': " + (resolved.resources.index.failed ? "FAILED" : "SUCCEEDED");
                shmi.notify(notificationText, "Value Notification");
            });
        });
     *
     *
     * @param {Object} refs  request options
     * @param {Object} refs.items key value pairs of reference  property and item name
     * @param {Object} refs.controls key value pairs of reference property and control name
     * @param {Object} refs.resources key value pairs of reference property and resource-url
     * @param {function} callback called when all controls and items are ready for use
     */
    shmi.onReady = function(refs, callback) {
        var callState = {
                ready: 0,
                total: 0,
                numItems: 0,
                numControls: 0,
                numResources: 0
            },
            im = shmi.requires("visuals.session.ItemManager"),
            iterObj = shmi.requires("visuals.tools.iterate.iterateObject");
        var options = shmi.cloneObject(refs);
        // count items
        if (typeof options.items === "object") {
            iterObj(options.items, function() {
                callState.numItems += 1;
                callState.total += 1;
            });
        }

        // count controls
        if (typeof options.controls === "object") {
            iterObj(options.controls, function() {
                callState.numControls += 1;
                callState.total += 1;
            });
        }

        // count resources
        if (typeof options.resources === "object") {
            iterObj(options.resources, function() {
                callState.numResources += 1;
                callState.total += 1;
            });
        }

        //wait for items
        if (callState.numItems) {
            iterObj(options.items, function(itmName, varName) {
                var handler = im.getItemHandler();
                var tok = null;
                var done = false;
                handler.setValue = function() {
                    if (done) {
                        return;
                    }
                    done = true;
                    options.items[varName] = im.getItem(itmName);
                    callState.ready += 1;
                    if (shmi.visuals.session.config.debug) {
                        console.debug("item ready: ", itmName);
                    }
                    if (callComplete(callState)) {
                        callback(options);
                    }
                    setTimeout(function() {
                        if (tok !== null) {
                            tok.unlisten();
                        }
                    }, 10);
                };
                tok = im.subscribeItem(itmName, handler);
            });
        }

        //wait for controls
        if (callState.numControls) {
            iterObj(options.controls, function(ctrlName, varName) {
                if (typeof ctrlName === "string") {
                    shmi.onEnable(ctrlName, function(ctrl) {
                        options.controls[varName] = ctrl;
                        callState.ready += 1;
                        if (shmi.visuals.session.config.debug) {
                            console.debug("control ready: ", ctrlName);
                        }
                        if (callComplete(callState)) {
                            callback(options);
                        }
                    });
                } else if (ctrlName.isActive() === true) { //ctrlName is a control reference
                    options.controls[varName] = ctrlName;
                    callState.ready += 1;
                    if (callComplete(callState)) {
                        callback(options);
                    }
                } else {
                    var tok = null;
                    tok = ctrlName.listen("enable", function(evt) {
                        tok.unlisten();
                        options.controls[varName] = evt.source;
                        callState.ready += 1;
                        if (callComplete(callState)) {
                            callback(options);
                        }
                    });
                }
            });
        }

        // wait for resources
        if (callState.numResources) {
            iterObj(options.resources, function(resUrl, varName) {
                shmi.loadResource(resUrl, function(data, failed) {
                    options.resources[varName] = {
                        data: data,
                        failed: failed
                    };
                    callState.ready += 1;
                    if (callComplete(callState)) {
                        callback(options);
                    }
                });
            });
        }

        return options;
    };
}());

/**
 * Returns version-information object of visuals framework.
 *
 * @returns {object} visuals version info
 */
shmi.getVisualsVersion = function() {
    var completeInfo = shmi.visuals.Version.split("-"),
        versionInfo = completeInfo[0].split("."),
        result = {
            major: parseInt(versionInfo[0]),
            minor: parseInt(versionInfo[1]),
            patch: parseInt(versionInfo[2]),
            dev: (completeInfo[1] !== undefined) ? completeInfo[1] : null,
            build: parseInt(shmi.visuals.Build)
        };

    result.lessThan = function lessThan(ver) {
        if (ver[0] > result.major) {
            return true;
        } else if (ver[0] === result.major) {
            if (ver[1] > result.minor) {
                return true;
            } else if (ver[1] === result.minor) {
                if (ver[2] > result.patch) {
                    return true;
                }
            }
        }
        return false;
    };

    result.greaterThan = function greaterThan(ver) {
        if (ver[0] < result.major) {
            return true;
        } else if (ver[0] === result.major) {
            if (ver[1] < result.minor) {
                return true;
            } else if (ver[1] === result.minor) {
                if (ver[2] < result.patch) {
                    return true;
                }
            }
        }
        return false;
    };

    return result;
};

/**
 * Returns version-information of connect host.
 *
 * @returns {object} connect version info
 */
shmi.getConnectVersion = function() {
    var result = shmi.cloneObject(shmi.visuals.session.Host.version);
    result.lessThan = function lessThan(ver) {
        if (ver[0] > result.major) {
            return true;
        } else if (ver[0] === result.major) {
            if (ver[1] > result.minor) {
                return true;
            } else if (ver[1] === result.minor) {
                if (ver[2] > result.patch) {
                    return true;
                }
            }
        }
        return false;
    };

    result.greaterThan = function greaterThan(ver) {
        if (ver[0] < result.major) {
            return true;
        } else if (ver[0] === result.major) {
            if (ver[1] < result.minor) {
                return true;
            } else if (ver[1] === result.minor) {
                if (ver[2] < result.patch) {
                    return true;
                }
            }
        }
        return false;
    };
    return result;
};

/**
 * onActive - Runs a callback function when a provided array of control instances are active / enabled.
 *
 * @param {control[]} controls array of control instances
 * @param {function} callback callback function to run when all provided controls are enabled
 *
 * @returns {undefined}
 */
shmi.onActive = function(controls, callback) {
    var tm = shmi.requires("visuals.task"),
        tasks = [],
        tl = null;

    controls.forEach(function(c, idx) {
        var t = tm.createTask("on-active control-" + idx),
            tokActive = null;
        t.run = function() {
            if (c.isActive()) {
                shmi.decouple(t.complete);
            } else {
                tokActive = c.listen("enable", function() {
                    tokActive.unlisten();
                    tokActive = null;
                    t.complete();
                });
            }
        };
        tasks.push(t);
    });

    if (tasks.length) {
        tl = tm.createTaskList(tasks, false);
        tl.onComplete = callback;
        tl.run();
    } else {
        shmi.decouple(callback);
    }
};

/**
 * decouple - decouple method execution to run as soon as current operation completes
 *
 * @param {function} method method to call after current operation completes
 */
shmi.decouple = function decouple(method) {
    Promise.resolve().then(method);
};

(function() {
    /**
     * testWarn - test if warn condition applies
     *
     * @param {number} value   current item value
     * @param {object} options condition options
     *
     * @returns {boolean} `true` when warn condition applies, `false` else
     */
    function testWarn(value, options) {
        if ((typeof value === "number") && options && options.warn) {
            if (typeof options.warn.min === "number") {
                if (value <= options.warn.min) {
                    return true;
                }
            }
            if (typeof options.warn.max === "number") {
                if (value >= options.warn.max) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * testPrewarn - test if prewarn condition applies
     *
     * @param {number} value   current item value
     * @param {object} options condition options
     *
     * @returns {boolean} `true` when prewarn condition applies, `false` else
     */
    function testPrewarn(value, options) {
        if ((typeof value === "number") && options && options.prewarn) {
            if (typeof options.prewarn.min === "number") {
                if (value <= options.prewarn.min) {
                    return true;
                }
            }
            if (typeof options.prewarn.max === "number") {
                if (value >= options.prewarn.max) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * updateState - update state of CSS classes applied to element
     *
     * @param {HTMLElement} element element to apply CSS classes to
     * @param {number} value   current item value
     * @param options
     *
     * @returns {type} Description
     */
    function updateState(element, value, options) {
        if (testWarn(value, options)) {
            shmi.removeClass(element, "preWarn");
            shmi.addClass(element, "warn");
        } else if (testPrewarn(value, options)) {
            shmi.removeClass(element, "warn");
            shmi.addClass(element, "preWarn");
        } else {
            shmi.removeClass(element, "preWarn");
            shmi.removeClass(element, "warn");
        }
    }

    /**
     * Calls a given callback with the state information
     *
     * @param callback
     * @param value
     * @param options
     */
    function callCallback(callback, value, options) {
        if (!callback) {
            return;
        }

        if (testWarn(value, options)) {
            callback('warn');
        } else if (testPrewarn(value, options)) {
            callback('prewarn');
        } else {
            callback(null);
        }
    }

    /**
     * setOption - update option when item property changed
     *
     * @param {object} ref      conditional reference
     * @param {string[]} propName property name - [0] := "prewarn" | "warn", [1] := "min" | "max"
     * @param {*|number} value    option value to set, option will be unset if not specified
     *
     * @returns {undefined}
     */
    function setOption(ref, propName, value) {
        ref.options = ref.options || {};
        ref.options[propName[0]] = ref.options[propName[0]] || {};
        if (typeof value === "number") {
            ref.options[propName[0]][propName[1]] = value;
        } else {
            ref.options[propName[0]][propName[1]] = null;
        }
    }

    /**
     * createConditional - Creates a conditional for an element to apply CSS classes "warn" or "preWarn" when specified items warn conditions apply.
     *
     * @param {HTMLElement} element element to apply CSS classes to
     * @param {string} itemName name of item to watch
     *
     * @param callback Optional callback. When it is defined then no CSS classes be set. Instead, this callback method will be called with "warn" and "prewarn" as a string to indicate the warn status or null if no warn state exists anymore
     * @example
    var conditional = shmi.createConditional(this.element, "my-varname-1");

    //.. enable conditional, e.g. in control "onEnable" function
    conditional.enable();

    //.. disable conditional when no longer required, e.g. in control "onDisable" function
    conditional.disable();
     *
     * @returns {object} conditional reference to enable/disable
     */
    shmi.createConditional = function(element, itemName, callback) {
        var reference = {
                enable: null,
                disable: null,
                options: null,
                item: itemName
            },
            im = shmi.requires("visuals.session.ItemManager"),
            h = im.getItemHandler(),
            itemValue = null,
            tok = null;

        h.setValue = function setValue(value) {
            itemValue = value;
            if (typeof callback === 'function') {
                callCallback(callback, itemValue, reference.options);
            } else {
                updateState(element, itemValue, reference.options);
            }
        };

        h.setProperties = function setProperties(min, max, step, name, type, warnmin, warnmax, prewarnmin, prewarnmax, precision) {
            setOption(reference, ["prewarn", "min"], prewarnmin);
            setOption(reference, ["prewarn", "max"], prewarnmax);
            setOption(reference, ["warn", "min"], warnmin);
            setOption(reference, ["warn", "max"], warnmax);

            if (typeof itemValue === "number") {
                if (typeof callback === 'function') {
                    callCallback(callback, itemValue, reference.options);
                } else {
                    updateState(element, itemValue, reference.options);
                }
            }
        };

        reference.enable = function enable() {
            if ((tok === null) && (typeof reference.item === "string")) {
                tok = im.subscribeItem(reference.item, h);
            }
        };

        reference.disable = function disable() {
            if (tok !== null) {
                tok.unlisten();
                tok = null;
                itemValue = null;
                reference.options = null;
            }
        };

        return reference;
    };
}());

(function() {
    /**
     * Error class for errors with localized messages.
     */
    shmi.LocalizedError = class LocalizedError extends Error {
        /**
         * Constructs a new localized error.
         *
         * @param {string} message Localizable error message.
         * @param {object} [evalProperties] Additional properties for replacing
         *  placeholders.
         */
        constructor(message, evalProperties) {
            super(
                shmi.evalString(
                    shmi.localize(String(message)),
                    evalProperties
                )
            );
        }
    };
}());

(function() {
    /**
     * Request numeric user input.
     *
     * Creates a `numpad-request` event that is handled by `visuals.handler.default.numpad` per default.
     *
     * @param {object} parameters parameter object
     * @param {string} parameters.unit unit text
     * @param {string} parameters.label label text
     * @param {number} parameters.value initial value
     * @param {function} parameters.callback callback to deliver input value
     * @param {number} parameters.min minimum input value
     * @param {number} parameters.max maximum input value
     * @param {type} parameters.type input value type (2 := Integer, 3 := Float)
     * @param {number} parameters.precision number of possible decimal digits
     * @param {string} parameters["decimal-delimiter"] decimal delimter sign
     * @param {string} parameters.item target item information
     */
    shmi.numpad = function(parameters) {
        /* log message when numpad-request is not handled */
        if (shmi.fire('numpad-request', parameters, shmi) === 0) {
            console.log("no handler registered for 'numpad-request' event");
        }
    };
}());

shmi.pkg("visuals.core");
/**
 * Representation for the state of an Alarm
 *
 * @private
 * @constructor
 * @param id - id of the alarm
 */
shmi.visuals.core.Alarm = function(id) {
    this.id = id;
    this.properties = null;
};

shmi.visuals.core.Alarm.prototype = {
    /**
     * Sets the state properties of the alarm
     * @param properties - string containing property values
     */
    setProperties: function(properties) {
        this.properties = properties;
    },
    ackAlarm: function() {
        var self = this,
            request = shmi.requires("visuals.tools.connect").request;
        request("alarm.acknowledge", [ self.id ], function onRequest(response, err) {
            if (err) {
                console.error("[Alarm] acknowledge failed:", err.category, err.errc, err.message);
            }
        });
    },
    getProperties: function() {
        return shmi.cloneObject(this.properties);
    }
};

(function() {
    shmi.pkg("visuals.core");

    var STATUS_OK = 0,
        MIN_CONNECT_VERSION = [1, 3, 1];

    /**
     * notifyDelayed - add large sets of alarm info in slices
     *
     * @param {AlarmManager} self alarm manager instance
     * @param {string[]} alarmIds alarm ID keys
     * @param {number} targetId subscriber ID
     *
     * @returns {undefined}
     */
    function notifyDelayed(self, alarmIds, targetId) {
        var sendIds = alarmIds.splice(0, 500);

        /* cancel if subscriber no longer active */
        if (!self.subscribers[targetId]) {
            return;
        }

        sendIds.forEach(function(alarmKey, idx) {
            var alarm = self.alarms[alarmKey];
            self.subscribers[targetId].callback(shmi.cloneObject(alarm.properties), (idx === (sendIds.length - 1)));
        });

        if (alarmIds.length) {
            setTimeout(notifyDelayed.bind(null, self, alarmIds, targetId), shmi.c("ACTION_RETRY_TIMEOUT"));
        }
    }

    function processAlarm(alarmInfo) {
        var nv = shmi.requires("visuals.tools.numericValues");

        // Work on a copy and leave the original object alone.
        alarmInfo = shmi.cloneObject(alarmInfo);

        // Historic alarms and live alarms use different properties - woops.
        alarmInfo.items = (alarmInfo.items || []).concat(alarmInfo.context || []);
        alarmInfo.context = alarmInfo.items;

        // Add "formattedValue" to context items, similar to how
        // "formattedValue" works on normal items.
        alarmInfo.items.forEach(function(alarmItemInfo) {
            Object.defineProperty(alarmItemInfo, "formattedValue", {
                enumerable: true,
                configurable: false,
                get: function() {
                    return nv.formatNumber(alarmItemInfo.value, {
                        precision: alarmItemInfo.digits,
                        unit: alarmItemInfo.unit
                    });
                }
            });
        });

        return alarmInfo;
    }

    /**
     * Handles management of Alarms in the Visuals framework.
     *
     * An instance of AlarmManager is automatically instanced by the framework and accessible via reference as `shmi.visuals.session.AlarmManager` .
     *
     * @constructor
     */
    shmi.visuals.core.AlarmManager = function() {
        var self = this;
        self.alarms = {};
        self.subscribers = {};
        self.alarmsLoaded = false;

        shmi.registerMsgHandler("alarm.notify", function(msg) {
            self.setProperties(msg.data, true);
        });
    };

    shmi.visuals.core.AlarmManager.prototype = {
        /**
         * Creates a new alarm with the specified name
         *
         * @private
         * @param name - id of the new alarm
         */
        _createAlarm: function(name) {
            if (this.alarms[name] !== undefined) {
                shmi.log("[AlarmManager] alarm '" + name + "' already exists", 0);
            } else {
                var core = shmi.visuals.core;
                this.alarms[name] = new core.Alarm(parseInt(name));
            }
        },
        /**
         * Removes an Alarm with the specified name from the manager
         *
         * @private
         * @param name - name of the event to remove
         */
        removeAlarm: function(name) {
            delete this.alarms[name];
        },
        /**
         * Removes all Alarms from the manager
         *
         * @private
         */
        removeAll: function() {
            var self = this,
                iter = shmi.requires("visuals.tools.iterate").iterateObject;
            iter(self.subscribers, function(val, targetId) {
                delete self.subscribers[targetId];
            });
        },
        /**
         * Acknowledges the alarm with the specified id
         *
         * Use alarm ID -1 to acknowledge all open alarms.
         *
         * @param {number}    id alarm ID
         * @returns {boolean} true if specified alarm ID was active, false else
         */
        ackAlarm: function(id) {
            var self = this,
                request = shmi.requires("visuals.tools.connect").request,
                alarmActive = false;

            if (id === -1) {
                alarmActive = true;
                request("alarm.acknowledge_all", {}, function onRequest(response, err) {
                    if (err) {
                        console.error("[AlarmManager] acknowledge_all failed:", err.category, err.errc, err.message);
                    }
                });
            } else if (self.alarms[id] !== undefined) {
                self.alarms[id].ackAlarm();
                alarmActive = true;
            }
            return alarmActive;
        },
        /**
         * Subscribes alarms for the specified control
         *
         * @param {control} subscriber control reference of subscribing control
         * @param {function} callback function to call on upates to alarm status
         */
        subscribeAlarms: function(subscriber, callback) {
            var targetId = Date.now(),
                self = this,
                target = self.subscribers[targetId],
                waitTok = null;

            while (target !== undefined) {
                targetId++;
                target = self.subscribers[targetId];
            }
            self.subscribers[targetId] = {};
            target = self.subscribers[targetId];
            target.control = subscriber;
            target.callback = callback;

            /* decouple alarm-data transfer to subscriber */
            if (self.alarmsLoaded) {
                setTimeout(function() {
                    var alarmIds = Object.keys(self.alarms);
                    notifyDelayed(self, alarmIds, targetId);
                }, 10);
            } else {
                waitTok = shmi.listen("alarms-loaded", function onAlarmsReady() {
                    waitTok.unlisten();
                    var alarmIds = Object.keys(self.alarms);
                    notifyDelayed(self, alarmIds, targetId);
                });
            }

            return targetId;
        },
        /**
         * Unsubscribes alarms for the specified subscriber control
         *
         * @param {number} id subscriber id
         */
        unsubscribeAlarms: function(id) {
            delete this.subscribers[id];
        },
        /**
         * Sets state properties for an alarm
         *
         * @private
         * @param properties - property data to apply
         * @param isLast - `true` if last incoming properties
         */
        setProperties: function(properties, isLast) {
            var self = this,
                cv = shmi.getConnectVersion(),
                iter = shmi.requires("visuals.tools.iterate.iterateObject");
            if (cv.lessThan(MIN_CONNECT_VERSION)) {
                console.error("[AlarmManager]", "alarming requires at least connect version:", MIN_CONNECT_VERSION.join("."));
            } else {
                if (!self.alarms[properties.id]) {
                    self._createAlarm(properties.id);
                }
                self.alarms[properties.id].setProperties(properties);
                if (self.alarmsLoaded) {
                    iter(self.subscribers, function(sub, sId) {
                        sub.callback(properties, isLast);
                    });
                }
            }
        },
        /**
         * Requests fresh alarmlist from connect host at session startup
         *
         * @private
         */
        requestAlarmList: function() {
            var self = this;
            self.getLiveAlarms(function onLiveAlarms(err, response) {
                if (Array.isArray(response)) {
                    response.forEach(function(alarmInfo, idx) {
                        self.setProperties(alarmInfo, (idx === (response.length - 1)));
                    });
                    self.alarmsLoaded = true;
                    shmi.fire("alarms-loaded", {}, self);
                }
            });
        },
        /**
         * getAlarm - get alarm object by alarm ID
         *
         * @param  {number} alarmId alarm ID
         * @return {object}         alarm object reference
         */
        getAlarm: function(alarmId) {
            var self = this;
            return self.alarms[alarmId] ? self.alarms[alarmId] : null;
        },
        /**
         * getLiveAlarms - get list of currently active alarms
         *
         * @param  {function} callback callback to run on completion
         * @return {undefined}
         */
        getLiveAlarms: function(callback) {
            var request = shmi.requires("visuals.tools.connect").request;

            request("alarm.live", {}, function onRequest(response, err) {
                if (err) {
                    console.error("[AlarmManager] getLiveAlarms failed:", err.category, err.errc, err.message);
                    callback(err, null);
                } else {
                    callback(STATUS_OK, response.map(processAlarm));
                }
            });
        },
        /**
         * getHistoricAlarms - get list of historically recorded alarms
         *
         * @param  {function} callback callback to run on completion
         * @param  {object} options  limit, filter, offset & sort options
         * @return {undefined}
         */
        getHistoricAlarms: function(callback, options) {
            var request = shmi.requires("visuals.tools.connect").request;

            request("alarm.historic", options, function onRequest(response, err) {
                if (err) {
                    console.error("[AlarmManager] getLiveAlarms failed:", err.category, err.errc, err.message);
                    callback(err, null);
                } else {
                    response.alarms = response.alarms.map(processAlarm);
                    callback(STATUS_OK, response);
                }
            });
        }
    };
}());

(function() {
    shmi.pkg("visuals.core");
    /**
     *
     * Starting point to extend for new controls. All neccessary functions of the Control
     * Interface are implemented and can be overridden by extending controls.
     *
     * @constructor
     * @abstract
     * @param element - the base element of this control
     */
    shmi.visuals.core.BaseControl = function(element) {
        shmi.log("[BaseControl] cannot be instantiated", 3);
    };

    /**
     * Initializes control handler storage objects for event-types defined in
     * 'events' array defined in prototype of control.
     * @param {object} self control instance reference
     *
     * @returns {undefined}
     */
    function initHandlers(self) {
        var ses = shmi.requires("visuals.session");

        ses.Events = ses.Events || {};
        if (Array.isArray(self.events)) {
            self._handlers = {};
            self.events.forEach(function(eventType, idx) {
                if (self._handlers[eventType] !== undefined) {
                    throw new TypeError("Eventtype '%s' is declared more than once.");
                }
                self._handlers[eventType] = {};
                ses.Events[eventType] = ses.Events[eventType] || {};
            });
        } else {
            throw new TypeError("Prototype is missing array of supported event types.");
        }
    }

    /**
     * updateAppearance - update state of CSS modifier on base element
     *
     * @param {object} self control instance reference
     * @param {string} modifier CSS modifier
     * @param {boolean} active `true` if modifier should be active, `false` else
     */
    function updateAppearance(self, modifier, active) {
        if (active) {
            shmi.addClass(self.element, modifier);
        } else {
            shmi.removeClass(self.element, modifier);
        }
    }

    /**
     * ensureConfig - make sure config property exists
     *
     * @param  {object} self control instance reference
     * @return {undefined}
     */
    function ensureConfig(self) {
        self.config = self.config || {};
    }

    /**
     * setName - set name of control
     *
     * @param {object} self control instance reference
     * @param {string} name name of control
     */
    function setName(self, name) {
        var nameParts = name.split(".");

        Object.defineProperty(self, "name", {
            value: name,
            writable: false
        });

        self.element.setAttribute('data-name', nameParts[nameParts.length - 1]);
    }

    /**
     * setCssClasses - apply control CSS classes
     *
     * @param {object} self control instance reference
     */
    function setCssClasses(self) {
        if (self.uiType !== "container") {
            shmi.addClass(self.element, shmi.c("CSS_CONTROL_CLASS"));
        }
        if (self.config['class-name']) {
            var elementClasses = self.config['class-name'].split(' ');
            elementClasses.forEach(function(ec) {
                if (ec.trim() !== "") {
                    shmi.addClass(self.element, ec);
                }
            });
        }
    }

    /**
     * initializeControl - complete initialization of control
     *
     * @param {object} self control instance reference
     */
    function initializeControl(self) {
        if (typeof self.onInit === "function") {
            self.onInit();
        } else {
            console.warn("[" + self.getClassName() + "] initialized - no onInit function defined");
        }

        /* control is purposely deactivated by config */
        if (self.config.disabled) {
            /* prevents the control from enabling */
            self.onEnable = null;
            self.onDisable = null;
            /* adds locked behaviour */
            self.lock();
        }

        self.initialized = true;
        self.fire('init', {});

        if (self.enableOnInit) {
            self.enableOnInit = false;
            self.enable();
        }
    }

    /**
     * defineGetConfig - defines getConfig method per control instance
     *
     * @param {object} self control instance reference
     */
    function defineGetConfig(self) {
        var config = shmi.cloneObject(self.config);

        delete config["config-name"];

        Object.defineProperty(self, "getConfig", {
            value: function() {
                return shmi.cloneObject(config);
            },
            writable: false
        });
    }

    /**
     * unsubscribeOnDisable - unsubscribe supplied tokens when control becomes inactive
     *
     * @param {object} self control instance reference
     * @param {object[]} tokens array of tokens
     */
    function unsubscribeOnDisable(self, tokens) {
        if (self.isActive() && tokens.length) {
            var disableTok = self.listen("disable", function() {
                disableTok.unlisten();
                disableTok = null;
                tokens.forEach(function(t) {
                    t.unlisten();
                });
                tokens = [];
            });
        }
    }

    /**
     * checkGroupConfig - check for group config identifier in config-name and move it to group-config attribute
     *
     * @param {object} self control instance reference
     */
    function checkGroupConfig(self) {
        let el = self.element,
            configPath = el.getAttribute("data-config-name"),
            urlParts = configPath ? configPath.split(" ") : null,
            grpIndex = -1;

        if (!urlParts) {
            return;
        }
        urlParts = urlParts.map((part) => part.trim());
        urlParts = urlParts.filter((part) => (part !== ""));

        grpIndex = urlParts.findIndex((part) => part.indexOf("@") === 0);
        if (grpIndex >= 0) {
            self.element.setAttribute("data-group-config", urlParts[grpIndex]);
            urlParts.splice(grpIndex, 1);
            self.element.setAttribute("data-config-name", urlParts.join(" "));
        }
    }

    /**
     * checkAddControlOptions - check options and add missing config objects
     *
     * @param {object[]} options addControl options
     */
    function checkAddControlOptions(options) {
        if (typeof options === "object" && options !== null) {
            if (!Array.isArray(options)) {
                options = [ options ];
            }
            options.forEach((opt) => {
                if (!opt.config || typeof opt.config !== "object") {
                    opt.config = {};
                }
                if (typeof opt.ui !== "string") {
                    throw new TypeError("Missing `ui` property on option: " + JSON.stringify(opt, null, 4));
                }
                if (Array.isArray(opt.children)) {
                    checkAddControlOptions(opt.children);
                }
            });
        } else {
            throw new TypeError("Invalid options specified for `addControl`.");
        }
    }

    /**
     * updateLegacyCondition - update condition from legacy config format to current format
     *
     * @param {object} condition legacy condition
     * @returns {object} update condition
     */
    function updateLegacyCondition(condition) {
        return {
            type: "condition",
            mode: "AND",
            elements: [
                {
                    type: "comparison",
                    operand1: {
                        type: "item",
                        value: condition.item
                    },
                    operand2: {
                        type: (typeof condition.compare === "string") ? "item" : "value",
                        value: condition.compare
                    },
                    operator: condition.operator
                }
            ]
        };
    }

    /**
     * lockRecursive - locks specified control and children recursively
     *
     * @param {object} control control instance
     *
     * @returns {undefined}
     */
    function lockRecursive(control) {
        control.lock(true);
        if (Array.isArray(control.controls)) {
            control.controls.forEach(function(c) {
                lockRecursive(c);
            });
        }
    }

    /**
     * unlockRecursive - unlocks specified control and children recursively
     *
     * @param {object} control control instance
     *
     * @returns {undefined}
     */
    function unlockRecursive(control) {
        control.unlock(true);
        if (Array.isArray(control.controls)) {
            control.controls.forEach(function(c) {
                unlockRecursive(c);
            });
        }
    }

    shmi.visuals.core.BaseControl.prototype = {
        /**
         * must be overidden to reflect the controls data-ui attribute.
         *
         * @type String
         */
        uiType: "basecontrol",
        events: ["register", "register-name", "enable", "disable", "init", "delete"],
        tooltipProperties: ["tooltip"],
        /**
         * isContainer - must be overidden to reflect if the control is a container (contains
         * other controls). true, if the control is a container; false else.
         *
         * @type Boolean
         */
        isContainer: false,
        /**
         * getClassName - Returns the class name of the control
         *
         * @returns {String} class name
         */
        getClassName: function() {
            return "BaseControl";
        },
        /**
         * getTooltip - Returns a string used for setting the controls tooltip.
         * By default the tooltip is read from the "tooltip" property of the
         * controls configuration. May be overwritten by the control
         * implementation to allow different behaviour.
         *
         * @returns {string}
         */
        getTooltip: function() {
            var self = this;

            if (!Array.isArray(self.tooltipProperties)) {
                return null;
            }

            var tooltipProperties = self.tooltipProperties.filter(function(key) {
                return shmi.objectHasOwnProperty(self.config, key) && self.config[key];
            });

            if (tooltipProperties.length > 0) {
                return self.config[tooltipProperties.shift()];
            }

            return null;
        },
        /**
         * setTooltip - Sets a tooltip on the controls dom element.
         *
         * @param {?string} tooltip Tooltip to set.
         */
        setTooltip: function(tooltip) {
            var self = this;

            shmi.checkArg("tooltip", tooltip, "string", "null");

            if (self.element) {
                if (tooltip) {
                    self.element.setAttribute("title", shmi.localize(tooltip));
                } else {
                    self.element.removeAttribute("title");
                }
            }
        },
        /**
         * parseAttributes - parses custom data-attributes of base element and defines their values in
         * the control configuration, omitting the 'data-' prefix.
         *
         */
        parseAttributes: function() {
            var self = this,
                inl = shmi.requires("visuals.tools.iterate").iterateNodeList;

            ensureConfig(self);

            /* check for old group config identifiers in config-name */
            checkGroupConfig(self);

            inl(self.element.attributes, function(attr, idx) {
                if (attr.nodeName !== "data-group-config" && attr.nodeName.indexOf("data-") === 0) {
                    self.config[attr.nodeName.substr(5)] = attr.nodeValue;
                }
            });
        },
        /**
         * startup - loads configuration and template files, if configured
         *
         * when complete {@link shmi.visuals.core.BaseControl#init} is called
         *
         * @protected
         */
        startup: function() {
            var self = this;

            /* create event handler storage objects */
            initHandlers(self);
            /* hide base element to speed up DOM generation */
            self.element.style.display = "none";

            ensureConfig(self);
            Object.defineProperty(self, "_init_", {
                value: {
                    tokens: []
                },
                writable: false
            });
            self.enableOnInit = false;
            if (self.config['config-name']) {
                if (!Array.isArray(self.config['config-name'])) {
                    self.config['config-name'] = [ self.config['config-name'] ];
                }
                self.loadConfig(0);
            } else {
                shmi.loadGroupConfig(self);
                defineGetConfig(self);
                self.loadTemplate();
            }
        },
        /**
         * loadConfig - load configuration files.
         *
         * @protected
         */
        loadConfig: function(index) {
            var self = this;
            ensureConfig(self);
            if (self.config['config-name'] && self.config['config-name'].length > 0) {
                var cfg_url = self.config['config-name'][index];
                if (cfg_url.indexOf(shmi.c("RES_URL_PREFIX")) === 0) {
                    var res_url = null,
                        url_parts = self.config['config-name'][index].split("@");
                    if (url_parts[0][url_parts[0].length - 1] === "/") {
                        url_parts = url_parts[0].split("/");
                        url_parts.pop(); //pop empty end string
                        res_url = url_parts.join("/");
                    } else {
                        url_parts = url_parts[0].split("/");
                        res_url = url_parts.join("/");
                    }

                    shmi.loadResource(res_url, function loadCfgCB(r, f, url) {
                        self.applyConfig(r, f, index, url);
                    });
                } else {
                    var loadUrl = null;
                    if (cfg_url.indexOf(":") === 0) {
                        loadUrl = cfg_url.replace(":", "") + shmi.c("CONFIG_EXT");
                    } else {
                        loadUrl = shmi.c("CONFIG_PATH") + cfg_url + shmi.c("CONFIG_EXT");
                    }
                    shmi.loadResource(loadUrl, function loadCfgCB(r, f, url) {
                        self.applyConfig(r, f, index, url);
                    });
                }
            } else {
                shmi.loadGroupConfig(self);
                defineGetConfig(self);
                self.loadTemplate();
            }
        },
        /**
         * applyConfig - applies loaded configuration files to the control configuration.
         *
         * @param responseText - content of the loaded config file
         * @param failed - true if loading has failed, false else
         *
         * @protected
         */
        applyConfig: function(responseText, failed, index, url) {
            var self = this,
                iter = shmi.requires("visuals.tools.iterate").iterateObject;

            ensureConfig(self);
            if (!failed && (typeof responseText === "string")) {
                var config = {};
                try {
                    config = JSON.parse(responseText);
                    iter(config, function(val, option) {
                        self.config[option] = config[option];
                    });
                } catch (exc) {
                    console.error("[" + self.getClassName() + "]", "failed to parse configuration:", url, exc);
                }
            } else {
                console.warn("[" + self.getClassName() + "]", "config file not found - 404:", url);
            }
            if (self.config['config-name'].length === (index + 1)) {
                shmi.loadGroupConfig(self);
                defineGetConfig(self);
                self.loadTemplate();
            } else {
                self.loadConfig(index + 1);
            }
        },
        /**
         * loadTemplate - loads the configured template file.
         *
         * @protected
         */
        loadTemplate: function() {
            var self = this;
            ensureConfig(self);
            if (!self.config.template) {
                setCssClasses(self);
                self.init();
            } else if (self.config.template.indexOf(shmi.c("RES_URL_PREFIX")) === 0) {
                shmi.loadResource(self.config.template, self.applyTemplate.bind(self));
            } else {
                var loadUrl = null;
                if (self.config.template.indexOf(":") === 0) {
                    loadUrl = self.config.template.replace(":", "") + shmi.c("TEMPLATE_EXT");
                } else {
                    loadUrl = shmi.c("TEMPLATE_PATH") + self.config.template + shmi.c("TEMPLATE_EXT");
                }
                shmi.loadResource(loadUrl, self.applyTemplate.bind(self));
            }
        },
        /**
         * applyTemplate - applies the loaded template file.
         *
         * @param responseText - content of the loaded template
         * @param failed - true if loading has failed, false else
         *
         * @protected
         */
        applyTemplate: function(responseText, failed) {
            var self = this;

            ensureConfig(self);

            if (!self.element) {
                throw new TypeError("[" + self.getClassName() + "] control has no base element.");
            }

            setCssClasses(self);
            if (typeof self.onTemplate === "function") {
                self.onTemplate(responseText, failed, self.init.bind(self));
            } else {
                if (!failed) {
                    if (self.element instanceof HTMLElement) {
                        if (responseText) {
                            self.element.innerHTML = responseText;
                        }
                    } else if (self.element instanceof SVGElement) {
                        if (responseText) {
                            shmi.setSvgContent(self.element, responseText);
                        }
                    } else {
                        console.error("[" + self.getClassName() + "] Error in template '" + self.config.template +
                            "base element is neither HTMLElement nor SVGElement");
                    }
                } else {
                    console.error("[" + self.getClassName() + "] Template file '" + shmi.c("TEMPLATE_PATH") +
                        self.config.template + shmi.c("TEMPLATE_EXT") + "' not found  - 404");
                }
                self.init();
            }
        },
        /**
         * init - initializes the control
         *
         * Configuration and template files are loaded when init is called.
         * If the extending class implements the onInit callback, it is run before the
         * initialized property is set to true. After completion the control may be enabled.
         *
         * @protected
         */
        init: function() {
            var self = this,
                nameToken = null;

            /* make base element visible again */
            self.element.style.display = "";
            ensureConfig(self);

            // Set tooltip
            self.setTooltip(self.getTooltip());

            if (Array.isArray(self.config._appearances_)) {
                //apply static modifiers
                self.config._appearances_.forEach(function(appearance) {
                    if (appearance.condition === null) {
                        updateAppearance(self, appearance.modifier, true);
                    }
                });
            }

            nameToken = self.listen('register-name', function initNamed(evt) {
                var registerToken = null;

                nameToken.unlisten();
                self._init_.tokens.splice(self._init_.tokens.indexOf(nameToken), 1);
                nameToken = null;

                setName(self, evt.detail.name);

                if (typeof self.onRegister === "function") {
                    if (shmi.isRegistered(self.element, self.uiType)) {
                        self.onRegister(initializeControl.bind(null, self));
                    } else {
                        registerToken = self.listen("register", function() {
                            registerToken.unlisten();
                            self._init_.tokens.splice(self._init_.tokens.indexOf(registerToken), 1);
                            registerToken = null;
                            self.onRegister(initializeControl.bind(null, self));
                        });
                        self._init_.tokens.push(registerToken);
                    }
                } else {
                    initializeControl(self);
                }
            });

            self._init_.tokens.push(nameToken);
            shmi.registerName(self, self.config.name);
        },
        /**
         * onInit - called when configuration and template are applied
         *
         * @abstract
         */
        onInit: function() {
        },
        /**
         * enable - enables the control
         *
         * Runs the extending controls onEnable callback if implemented.
         * If the control is enabled before initialization is complete, execution will be
         * delayed until completion.
         *
         *  @protected
         */
        enable: function() {
            const self = this,
                cm = shmi.requires("visuals.tools.controller"),
                { ConditionObserver } = shmi.requires("visuals.tools.conditions");

            if (!self.initialized) {
                self.enableOnInit = true;
                return;
            }
            if (self.active) {
                return;
            }
            self.active = true;

            if (self.onEnable) {
                self.onEnable();
            }

            self.fire("enable", { name: self.getName() });

            if (Array.isArray(self.config._controllers_)) {
                self.config._controllers_.forEach(function(c) {
                    cm.registerSlot(c.name, c.slot, self);
                });
            }

            if (Array.isArray(self.config._appearances_)) {
                let appearanceTokens = [];
                self.config._appearances_.forEach(function(appearance) {
                    if (appearance.condition !== null) {
                        if (typeof appearance.condition.type !== "string") {
                            appearance.condition = updateLegacyCondition(appearance.condition);
                        }
                        appearanceTokens.push(new ConditionObserver(appearance.condition, (isActive) => {
                            updateAppearance(self, appearance.modifier, isActive);
                        }));
                    }
                });
                unsubscribeOnDisable(self, appearanceTokens);
            }

            if (self.locked === true) {
                self.lock();
            }

            if (self.config._lock_ && self.config._lock_.type === "condition") {
                unsubscribeOnDisable(self, [
                    new ConditionObserver(self.config._lock_, (isActive) => {
                        if (isActive) {
                            lockRecursive(self);
                        } else {
                            unlockRecursive(self);
                        }
                    })
                ]);
            }
        },
        /**
         * onEnable - called when control is enabled
         *
         * @abstract
         */
        onEnable: function() {
        },
        /**
         * disable - disables the control
         *
         * Runs the extending controls onDisable callback if implemented.
         *
         * @protected
         */
        disable: function() {
            var self = this;

            self.enableOnInit = false;
            if (!self.active) {
                return;
            }
            self.active = false;

            if (self.onDisable) {
                self.onDisable();
            }

            self.fire("disable", { name: self.getName() });
        },
        /**
         * onDisable - called when control is disabled
         *
         * @abstract
         */
        onDisable: function() {
        },
        /**
         * subscribeItem - Subscribes this control to an Item of the specified name
         *
         * @param {String} name name of the item
         * @returns {Integer} subscription ID
         *
         * @protected
         */
        subscribeItem: function(name) {
            return shmi.visuals.session.ItemManager.subscribeItem(name, this);
        },
        /**
         * unsubscribeItem - Unsubscribes this control from an Item of specified name with the specified
         * subsciption ID.
         *
         * @param {type} name name of the item
         * @param {type} id subscription ID of the item
         * @returns {undefined}
         *
         * @protected
         */
        unsubscribeItem: function(name, id) {
            shmi.visuals.session.ItemManager.unsubscribeItem(name, id);
        },
        /**
         * setValue - implementation if <ItemSubsciber> setValue function
         *
         * Calls control implementation `onSetValue` when available.
         *
         * @param {type} value
         * @param {type} type
         * @param {type} name
         * @returns {undefined}
         */
        setValue: function(value, type, name) {
            var self = this;
            if (!self.initialized) {
                console.warn("[" + self.getClassName() + "] setValue - not initialized yet.");
            } else if (self.onSetValue) {
                self.onSetValue(value, type, name);
            }
        },
        /**
         * setProperties - implementation if <ItemSubsciber> setProperties function
         *
         * Calls control implementation `onSetProperties` when available.
         *
         * @param {type} min
         * @param {type} max
         * @param {type} step
         * @param {type} name
         * @param {type} type
         * @param {type} warnmin
         * @param {type} warnmax
         * @param {type} prewarnmin
         * @param {type} prewarnmax
         * @param {type} precision
         * @returns {undefined}
         */
        setProperties: function(min, max, step, name, type, warnmin, warnmax, prewarnmin, prewarnmax, precision) {
            if (this.onSetProperties) {
                this.onSetProperties(min, max, step, name, type, warnmin, warnmax, prewarnmin, prewarnmax, precision);
            }
        },
        /**
         * lock - locks control interaction.
         *
         * All user input should be disabled when a control is locked. Calls control implementation `onLock` when available.
         *
         * @param {boolean} forceLock set to true when control should be locked until manually (force-)unlocked
         * @returns {undefined}
         *
         * @protected
         */
        lock: function(forceLock) {
            var self = this;

            if (self.forceLocked === undefined) {
                self.forceLocked = false;
            }

            if (self.initialized && (typeof self.onLock === "function")) {
                self.onLock();
            }
            self.locked = true;
            self.forceLocked = (forceLock === true) ? true : self.forceLocked;
        },
        /**
         * unlock - unlocks control interaction
         *
         * All user input should be enabled when control is unlocked. Calls control implementation `onUnlock` when available.
         *
         * @param {boolean} forceUnlock set to true to unlock a force-locked control manually
         * @returns {undefined}
         *
         * @protected
         */
        unlock: function(forceUnlock) {
            var self = this;

            if ((!self.forceLocked) || (self.forceLocked && forceUnlock)) {
                if (self.initialized && (typeof self.onUnlock === "function")) {
                    self.onUnlock();
                }
                self.locked = false;
                self.forceLocked = false;
            }
        },

        /**
         * setItem - sets or changes a new item for the control.
         *
         * Only used for form controls that are associated with exactly one item value that is configurable with config option `item`.
         *
         * @param {string} item the new item to set.
         *
         * @protected
         */
        setItem: function(item) {
            if (this.onSetItem) { // if the control needs to implement its own setItem process
                this.onSetItem();
            } else if (this.active) { // default setItem process
                this.disable();
                this.config.item = item;
                this.enable();
            } else {
                this.config.item = item;
            }
        },
        /**
         * getItem - retrieve name of current item
         *
         * Only used for form controls that are associated with exactly one item value that is configurable with config option `item`.
         *
         * @returns {String} name of configured item or `null` if none was found
         */
        getItem: function() {
            return (this.config.item) ? this.config.item : null;
        },

        /**
         * isInitialized - checks if the control is initialized.
         *
         * @returns {boolean} initialization state - `true` if initialized, `false` else
         */
        isInitialized: function() {
            return this.initialized;
        },
        /**
         * isActive - checks if control is currently active / enabled.
         *
         * @returns {Boolean} `true` if active, `false` else
         */
        isActive: function() {
            return !!this.active;
        },
        /**
         * getName - retrieve control name
         *
         * @returns {String} name of control or `null` if none set yet
         */
        getName: function() {
            return (this.name) ? this.name : null;
        },
        /* EVENT SUPPORT */
        /**
         * called in control implementation to fire events.
         *
         * @param {String} event_name event type
         * @param {object} data event detail-data
         * @param {boolean} [defer] If set to `true`, the event is fired
         *  asynchronously.
         * @returns {number}
         *
         * @protected
         */
        fire: function(event_name, data, defer = false) {
            const self = this,
                iter = shmi.requires("visuals.tools.iterate").iterateObject;
            self._hasEvent(event_name);

            const s = shmi.visuals.session,
                event_data = {
                    source: self,
                    type: event_name,
                    detail: data
                };

            function fireAway() {
                let fired = 0;

                /* handle local listeners on control */
                iter(self._handlers[event_name], function(val, listener_id) {
                    self._handlers[event_name][listener_id](event_data);
                    fired++;
                });

                /* handle global listeners */
                iter(s.Events[event_name], function(event_function) {
                    if (event_function(event_data)) {
                        fired++;
                    }
                });

                return fired;
            }

            function logFired(firedEventsCount) {
                if (s.config.event_debug === true) {
                    console.log("[", self.getClassName(), "] event", event_data, "fired [", firedEventsCount, "listeners]");
                }
            }

            // Defer event execution
            if (defer) {
                shmi.decouple(() => logFired(fireAway()));
                return 0;
            }

            const fired = fireAway();
            logFired(fired);

            return fired; // return number of event listeners handled
        },
        /**
         * _hasEvent - check if event type is supported by control implementation
         *
         * @param {string} event_name name of event type
         * @returns {boolean} `true` if event type is supported, `false` else
         *
         * @protected
         */
        _hasEvent: function(event_name) {
            if (!Array.isArray(this.events)) {
                throw new Error("ERROR: " + this.getClassName() + " object does not support events");
            }
            if (this.events.indexOf(event_name) === -1) {
                throw new Error("ERROR: " + this.getClassName() + " unsupported event_type '" + event_name + "'");
            }
        },
        /**
         * listen - listen for the specified event type fire by a control instance.
         *
         * @param {string} event_name event type to listen for
         * @param {function} callback callback function to run when event type was fired
         * @returns {object} listener token used to unlisten the event after use
         */
        listen: function(event_name, callback) {
            var self = this;
            self._hasEvent(event_name);

            var listener_id = Date.now();
            while (self._handlers[event_name][listener_id] !== undefined) {
                listener_id++;
            }
            self._handlers[event_name][listener_id] = callback;

            var listenToken = {
                name: event_name, listenerId: listener_id, unlisten: null
            };

            listenToken.unlisten = function() {
                self.unlisten(listenToken);
            };

            return listenToken;
        },
        /**
         * unlisten - stop listening for the specified event type.
         *
         * To stop listening to events, the returned token's `unlisten()` method
         * also allows to stop listening to a control event.
         *
         * @param {string} event_name event type to stop listening to
         * @param {object} token listener token returned by listen function
         * @returns {undefined}
         */
        unlisten: function(event_name, token) {
            /* alternative syntax with just one {object} argument */
            if ((typeof event_name === "object") && (arguments.length === 1)) {
                this._hasEvent(event_name.name);
                delete this._handlers[event_name.name][event_name.listenerId];
            } else {
                this._hasEvent(event_name);
                delete this._handlers[event_name][token.listenerId]; // adapt to use new return {object} of listen function for backwards-compatibility
            }
        },
        /**
         * parseChildren - parses child elements of the control
         *
         * @param {HTMLElement} element element to parse for controls
         * @param {function} onDone function to call on completion
         *
         * @protected
         */
        parseChildren: function(element, onDone) {
            var self = this,
                initToken = null,
                controls = null;

            if (!self.isContainer) {
                throw new TypeError("[" + self.getClassName() + "] not a container control, cannot parse child controls.");
            }

            if (!shmi.testParentChild(self.element, element)) {
                throw new TypeError("[" + self.getClassName() + "] element not contained within control.");
            }

            controls = shmi.parseControls(element, false, self.element);
            controls.forEach(function(c) {
                self.controls.push(c);
            });

            if (self.controls.length === 0) {
                onDone(controls);
            } else {
                initToken = shmi.waitOnInit(self.controls, function() {
                    var idx = self._init_.tokens.indexOf(initToken);
                    if (idx !== -1) {
                        self._init_.tokens.splice(idx, 1);
                    }
                    initToken = null;
                    onDone(controls);
                });
                if (initToken !== null) {
                    self._init_.tokens.push(initToken);
                }
            }
        },
        /**
         * getChildren - get child controls
         *
         * @returns {object[]|null} array of child controls or `null` if control is not a container-control (`isContainer := false`)
         */
        getChildren: function() {
            return this.isContainer ? this.controls : null;
        },
        /**
         * isDeleted - check if control has been deleted
         *
         * @returns {boolean} `true` if control was deleted, `false` else
         */
        isDeleted: function() {
            return this.deleted === true;
        },
        /**
         * _setCssClasses - apply control CSS classes
         *
         * @deprecated
         * @protected
         */
        _setCssClasses: function() {
            var self = this;

            console.warn("[" + self.getClassName() + "]", "_setCssClasses - is deprecated and should not be called by control implementations." +
            " This message is usually generated when BaseControl methods have been replaced, use BaseControl methods 'onTemplate' and 'onRegister'" +
            " to avoid having to override system methods.");

            setCssClasses(self);
        },
        /**
         * getParent - get parent control
         *
         * @returns {object|null} parent control instance or `null` when none is available
         */
        getParent: function() {
            return this.parentContainer || null;
        },
        /**
         * addControl - add child control(-s) to this control instance
         *
         * Control has to implement `onAddControl` method to support adding of child controls.
         *
         * @example <caption>Add Button to Container</caption>
var container = shmi.ctrl(".myContainer"); //make sure a container named 'myContainer' exists in the layout
if (container && container.isInitialized()) {
    container.addControl([
        {
            ui: "button",
            config: {
                label: "Test Button",
                action: [
                    {
                        name: "notify",
                        params: [
                            "Message",
                            "Title"
                        ]
                    }
                ]
            }
        }
    ], function(err, controls) {
        if (err) {
            console.error("Error creating controls:", )
        } else {
            console.log("Controls initialized:", controls);
        }
    });
}
         *
         *
         * @example <caption>Add Container with Nested Buttons to Container</caption>
var container = shmi.ctrl(".myContainer"); //make sure a container named 'myContainer' exists in the layout
if (container && container.isInitialized()) {
    container.addControl([
        {
            ui: "container",
            config: {
                name: "generatedContainer"
            },
            children: [
                {
                    ui: "button",
                    config: {
                        label: "Test Button #1",
                        action: [
                            {
                                name: "notify",
                                params: [
                                    "Message #1",
                                    "Title #1"
                                ]
                            }
                        ]
                    }
                },
                {
                    ui: "button",
                    config: {
                        label: "Test Button #2",
                        action: [
                            {
                                name: "notify",
                                params: [
                                    "Message #2",
                                    "Title #2"
                                ]
                            }
                        ]
                    }
                }
            ]
        }
    ], function(err, controls) {
        if (err) {
            console.error("Error creating controls:", )
        } else {
            console.log("Controls initialized:", controls);
        }
    });
}
         *
         * @param {shmi.visuals.core.BaseControl~ControlOptions} options nested control hierarchy to add with options
         * @param {function} callback function to call when controls have been created & initialized
         */
        addControl: function(options, callback) {
            const self = this;

            if (typeof self.onAddControl === "function") {
                checkAddControlOptions(options);
                self.onAddControl(options, callback);
            } else {
                console.error("[" + self.getClassName() + "]", "no implementation 'onAddControl' for control type:", self.uiType);
                if (typeof callback === "function") {
                    callback(null, []);
                }
            }
        },
        /**
         * isLocked - check if control is locked
         *
         * @returns {boolean} `true` if control is locked, `false` else
         */
        isLocked: function() {
            return this.locked || false;
        }
    };
}());

/**
 * @typedef shmi.visuals.core.BaseControl~ControlOptions
 * @type {Object}
 * @property {string} ui control ui-type
 * @property {object} config control configuration
 * @property {shmi.visuals.core.BaseControl~ControlOptions[]} [children] nested child controls (control must support `addControl` method)
 * @property {module:visuals/tools/controller~ControllerOptions} [controller] controller settings to create controller associated with created control instance
 */

(function() {
    /**
     * @constant
     * @type {number}
     * @default
     */
    const REQUEST_TIMEOUT = 86400000;

    /**
     * Computes unused numeric property (ID) of specified object.
     *
     * @param {object} obj
     * @returns {number} unused numeric property / ID
     */
    function getUnusedIndex(obj) {
        let id = null;

        do {
            id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        } while (obj[id]);

        return id;
    }

    /**
     * Frees request buffers and canceles the request timeout.
     *
     * @param {ConnectSession} self Reference to an instance of `ConnectSession`.
     * @param {number} requestId Id of the request to delete.
     */
    function deleteRequest(self, requestId) {
        const request = self.pendingRequests[requestId];

        if (request !== undefined) {
            clearTimeout(request.timeout);
            unregisterMessageHandlerForRequest(self, request.cmd);
            delete self.pendingRequests[requestId];
        }
    }

    /**
     * Frees request buffers, cancels the request timeout and calls the
     * requests callback with the given data and error information. Exceptions
     * thrown by the callback are caught and logged with additional information
     * on the request sent and the parameters used to call the callback.
     *
     * @param {ConnectSession} self Reference to an instance of `ConnectSession`.
     * @param {number} requestId Id of the request to complete.
     * @param {*} data Data to pass to the request callback.
     * @param {*} error Error information to pass to the request callback.
     */
    function completeRequest(self, requestId, data, error) {
        const request = self.pendingRequests[requestId];

        if (request !== undefined) {
            deleteRequest(self, requestId);
            try {
                request.callback(data, error);
            } catch (e) {
                console.error("Uncaught", e, "\nin api request callback.\n    request: ", request, "\nCallback was called with", "\n    data:", data, "\n    error:", error);
            }
        }
    }

    /**
     * Frees request buffers, cancels the request timeout and calls the
     * request callback with `null` data and the provided reason as error
     * information.
     *
     * @param {ConnectSession} self Reference to an instance of `ConnectSession`.
     * @param {number} requestId Id of the request to cancel.
     * @param {*} [reason] Reason as to why the request was canceled. If no
     *  reason is given, `420` is used.
     */
    function cancelRequest(self, requestId, reason) {
        completeRequest(self, requestId, null, (reason === undefined ? 420 : reason));
    }

    /**
     * Creates and registers a api request object.
     *
     * @param {ConnectSession} self Reference to an instance of `ConnectSession`.
     * @param {string} apiCommand Name of the api command to call.
     * @param {*} parameters Parameters to the api command.
     * @param {function} callback Callback to call on completion or on error.
     * @param {number} [customTimeout] Time in milliseconds in which the api
     *  request has to complete before the operation is canceled.
     * @returns {object} api request object
     */
    function createRequest(self, apiCommand, parameters, callback, customTimeout) {
        const requestId = getUnusedIndex(self.pendingRequests);

        self.pendingRequests[requestId] = {
            id: requestId,
            cmd: apiCommand,
            parameters: parameters,
            callback: callback,
            data: null,
            timeout: setTimeout(function() {
                console.error("[ConnectSession]", "timeout on request:", self.pendingRequests[requestId]);
                cancelRequest(self, requestId);
            }, customTimeout || REQUEST_TIMEOUT),
            timeoutDuration: customTimeout || REQUEST_TIMEOUT
        };

        return self.pendingRequests[requestId];
    }

    /**
     * Adapts promises to the {shmi.visuals.tools.connect~RequestCallback}
     * interface, allowing them to be used with the request API.
     *
     * @param {function} resolve Resolve function that is called when the API
     *  call succeeded.
     * @param {function} reject Reject function that is called when the API
     *  call fails.
     * @param {?object} data Data returned by the API call.
     * @param {?object} error Error returned by the API call.
     */
    function promiseHandler(resolve, reject, data, error) {
        if (error) {
            reject(error);
        } else {
            resolve(data);
        }
    }

    /**
     * Collects and assembles payload data from received messages and
     * fragments.
     *
     * @param {object} request Api request object.
     * @param {object} msg Message to collect payload data from.
     * @returns `true` if the payload has been fully assembled, `false` if
     *  more fragments are required in order to fully assemble the payload.
     */
    function collectPayloadData(request, msg) {
        const iter = shmi.requires("visuals.tools.iterate.iterateObject"),
            isFragment = msg.fragmented || request.data,
            isFinal = !msg.fragmented;

        if (isFragment) {
            if (request.data === null) {
                request.data = msg.data;
            } else if (Array.isArray(msg.data)) {
                request.data.push(...msg.data);
            } else if (typeof msg.data === "object") {
                iter(msg.data, function(val, prop) {
                    if (Array.isArray(val)) {
                        if (shmi.objectHasOwnProperty(request.data, prop)) {
                            request.data[prop].push(...val);
                        } else {
                            request.data[prop] = val;
                        }
                    } else {
                        request.data[prop] = val;
                    }
                });
            }
        } else {
            request.data = msg.data;
        }

        return isFinal;
    }

    /**
     * Converts messages with error codes from connect < 2.2.0 to the new error
     * format.
     *
     * @param {object} msg Received message.
     */
    function translateLegacyError(msg) {
        /* for basic compatibility with connect < 2.2.0 */
        if (msg.error === undefined && (typeof msg.st === "number")) {
            if (msg.st === 0) {
                msg.error = null;
            } else {
                msg.error = {
                    errc: msg.st,
                    category: "connect-2.1:compatibility",
                    message: "generic error"
                };
            }

            delete msg.st;
        }
    }

    /**
     * Message handler handling responses to requests.
     *
     * @param {ConnectSession} self Reference to an instance of `ConnectSession`.
     * @param {object} msg Received message.
     */
    function requestMessageHandler(self, msg) {
        var request = self.pendingRequests[msg.id];

        if (!request) {
            console.error("[ConnectSession]", "unknown request-ID:", msg);
            return;
        }

        /* for basic compatibility with connect < 2.2.0 */
        translateLegacyError(msg);

        if (collectPayloadData(request, msg)) {
            completeRequest(self, msg.id, request.data, msg.error === null ? 0 : msg.error);
        }
    }

    /**
     * Registers the request message handler for the given api command if it
     * hasn't been registered yet. The registered message handler is reference
     * counted so for every call to `registerMessageHandlerForRequest`
     * `unregisterMessageHandlerForRequest` has to be called.
     *
     * @param {ConnectSession} self Reference to an instance of `ConnectSession`.
     * @param {string} apiCommand Name of the command to register the request
     *  message handler for.
     */
    function registerMessageHandlerForRequest(self, apiCommand) {
        if (shmi.objectHasOwnProperty(self.messageHandlerForRequests, apiCommand)) {
            ++self.messageHandlerForRequests[apiCommand].refCnt;
        } else {
            self.messageHandlerForRequests[apiCommand] = {
                handlerId: self.registerMessageHandler(apiCommand, requestMessageHandler.bind(null, self)),
                refCnt: 1
            };
        }
    }

    /**
     * Decrements the reference counter of the request message handler for the
     * given api command and unregisters it if it is no longer used.
     *
     * @param {ConnectSession} self Reference to an instance of `ConnectSession`.
     * @param {string} apiCommand Name of the command to unregister the request
     *  message handler for.
     */
    function unregisterMessageHandlerForRequest(self, apiCommand) {
        const handlerInfo = self.messageHandlerForRequests[apiCommand];

        if (handlerInfo !== undefined && --handlerInfo.refCnt <= 0) {
            delete self.messageHandlerForRequests[apiCommand];
            self.unregisterMessageHandler(apiCommand, handlerInfo.handlerId);
        }
    }

    /**
     * Session of a connection to WebIQ Server.
     * @private
     * @constructor
     */
    shmi.visuals.core.ConnectSession = function ConnectSession(wsUrl) {
        const SocketConnection = shmi.requires("visuals.io.SocketConnection");

        Object.defineProperties(this, {
            wsUrl: {
                configurable: false,
                value: wsUrl,
                writable: false
            },
            socket: {
                configurable: false,
                value: new SocketConnection(wsUrl, this),
                writable: false
            },
            messageHandlers: {
                configurable: false,
                value: {},
                writable: false
            },
            pendingRequests: {
                configurable: false,
                value: {},
                writable: false
            },
            messageHandlerForRequests: {
                configurable: false,
                value: {},
                writable: false
            },
            REQUEST_TIMEOUT: {
                configurable: false,
                value: REQUEST_TIMEOUT,
                writable: false
            }
        });

        Object.freeze(this);
    };

    shmi.visuals.core.ConnectSession.prototype = {
        // Explicitly set `constructor` since we're overwriting the prototype.
        constructor: shmi.visuals.core.ConnectSession,
        /**
         * Connects to the sessions endpoint.
         */
        connect: function(callback) {
            this.socket.connect(callback);
        },
        /**
         * Ends the session by terminating the websocket connection and
         * canceling pending requests.
         */
        disconnect: function disconnect() {
            const iter = shmi.requires("visuals.tools.iterate.iterateObject");

            this.socket.disconnect();
            iter(this.pendingRequests, (val) => {
                cancelRequest(this, val.id);
            });
        },
        /**
         * Passes the given message to registered message handlers for the
         * message's command type.
         *
         * @param {object} message Message
         */
        postMessage: function(message) {
            const handlers = this.messageHandlers[message.cmd];
            if (!handlers) {
                console.warn("[ConnectSession]", "No message handler registered for ", message.cmd, "\n  message: ", message);
                return;
            }

            Object.values(handlers).forEach((handler) => {
                try {
                    handler(message);
                } catch (e) {
                    console.error("Uncaught ", e, "\nin message handler.");
                }
            });
        },
        /**
         * Registers a handler function for a specified message type. All messages
         * beginning with the specified prefix will be directed to the handler
         * function.
         *
         * @param {string} prefix message prefix to register
         * @param {function} callback message handler function
         * @returns {number} handler id - used to unregister handler
         */
        registerMessageHandler: function registerMessageHandler(prefix, callback) {
            /* create message handler obj if not in use yet */
            if (this.messageHandlers[prefix] === undefined) {
                this.messageHandlers[prefix] = {};
            }
            /* generate handler ID */
            var handlerID = getUnusedIndex(this.messageHandlers[prefix]);
            this.messageHandlers[prefix][handlerID] = callback;
            shmi.log("[registerMsgHandler] registered message handler '" + prefix + "'", 2);
            return handlerID;
        },
        /**
         * Unregisters a message handler for the specified message type/prefix.
         * A valid ID (genereated by call to shmi.registerMsgHandler) is
         * required to uniquely identify a registered message handler.
         *
         * @param {string} prefix message prefix of handler to unregister
         * @param {number} handlerID id returned when handler was registered
         * @returns {boolean} true if active handler was unregistered, false if
         *  handler was not found.
         */
        unregisterMessageHandler: function unregisterMessageHandler(prefix, handlerID) {
            var unregistered = false;

            /* delete reference to message handler */
            if (this.messageHandlers[prefix] && this.messageHandlers[prefix][handlerID]) {
                delete this.messageHandlers[prefix][handlerID];
                shmi.log("[unregisterMsgHandler] unregistered message handler '" + prefix + "'", 2);
                unregistered = true;
            }

            /* delete object for whole prefix if no other handlers are registered */
            if ((this.messageHandlers[prefix]) && (Object.keys(this.messageHandlers[prefix]).length === 0)) {
                delete this.messageHandlers[prefix];
            }

            return unregistered;
        },
        /**
         * request - send connect API request and return response via callback.
         *
         * @param  {string} apiCommand connect API command
         * @param  {object} parameters parameter object
         * @param  {shmi.visuals.tools.connect~RequestCallback} callback   callback function to handle response
         * @param  {number} [customTimeout] optional custom timeout, default is `module.REQUEST_TIMEOUT`
         * @param  {string} [target] target app name
         * @return {undefined}
         */
        request: function request(apiCommand, parameters, callback, customTimeout, target) {
            var commandRequest = createRequest(this, apiCommand, parameters, callback, customTimeout),
                msg = {
                    cmd: apiCommand,
                    id: commandRequest.id,
                    data: parameters
                },
                msgText = null;

            if (target) {
                msg.target = target;
            }

            msgText = JSON.stringify(msg);
            registerMessageHandlerForRequest(this, apiCommand);
            this.socket.sendMessage(msgText);
        },
        /**
         * requestPromise - send connect API request and return response via
         * promise.
         *
         * @param  {string} apiCommand connect API command
         * @param  {object} parameters parameter object
         * @param  {object} [options] Additional options
         * @param  {number} [options.customTimeout] custom timeout, default is
         *  `module.REQUEST_TIMEOUT`
         * @param  {string} [options.target] target app name
         * @return {Promise<object>} Promise that is resolved with the API
         *  response's data or rejected with its error.
         */
        requestPromise: function requestPromise(apiCommand, parameters, options) {
            const {
                customTimeout,
                target
            } = options || {};

            return new Promise((resolve, reject) =>
                this.request(apiCommand, parameters, promiseHandler.bind(null, resolve, reject), customTimeout, target)
            );
        }
    };
}());

(function() {
    shmi.pkg("visuals.core");

    /**
     * getFieldValue - retrieve value of named datagrid field
     *
     * @param  {object} alarmInfo alarm info object
     * @param  {string} fieldName name of datagrid field
     * @return {*}
     */
    function getFieldValue(alarmInfo, fieldName) {
        var result = null;

        switch (fieldName) {
        case "level":
            result = alarmInfo.severity;
            break;
        case "status":
            result = (alarmInfo.acknowledgeable && !alarmInfo.acknowledged);
            break;
        case "come":
            result = alarmInfo.timestamp_in;
            break;
        case "gone":
            result = alarmInfo.timestamp_out;
            break;
        case "json":
            result = JSON.stringify(alarmInfo);
            break;
        default:
            if (alarmInfo[fieldName] !== undefined) {
                result = alarmInfo[fieldName];
            }
        }
        return result;
    }
    /**
     * alarmCallback - callback to handle creation of datagrid rows from incoming alarm data
     *
     * @param {DataGridAlarms} self datagrid instance reference
     * @param {object} alarmInfo alarm info object
     * @param {boolean} isLast `true` if alarm is last to be inserted
     * @return {undefined}
     */
    function alarmCallback(self, alarmInfo, isLast) {
        var rowData = [];
        self.fields.forEach(function(fName, idx) {
            var fieldValue = getFieldValue(alarmInfo, fName),
                fieldType = (typeof fieldValue);
            switch (fieldType) {
            case "string":
                rowData.push({
                    type: shmi.c("TYPE_STRING"),
                    value: fieldValue
                });
                break;
            case "boolean":
                rowData.push({
                    type: shmi.c("TYPE_BOOL"),
                    value: fieldValue ? 1 : 0,
                    min: 0,
                    max: 1
                });
                break;
            case "number":
                rowData.push({
                    type: shmi.c("TYPE_FLOAT"),
                    value: fieldValue,
                    min: Number.NaN,
                    max: Number.NaN
                });
                break;
            default:
                rowData.push({
                    type: shmi.c("TYPE_STRING"),
                    value: "NULL",
                    min: Number.NaN,
                    max: Number.NaN
                });
            }
        });

        self.insertRow(rowData, undefined, !isLast);
    }

    /**
     * createVirtualItem - create virtual items for datagrid cell use and set datagrid info
     *
     * @param  {DataGridAlarms} self datagrid instance reference
     * @param  {string} iname virtual item name
     * @param  {object} cell  cell info object
     * @param  {number|undefined} rowId datagrid row ID
     * @param  {number} idx datagrid cell index
     * @return {Item} created virtual item
     */
    function createVirtualItem(self, iname, cell, rowId, idx) {
        var itm = shmi.createVirtualItem(iname, cell.type, cell.min, cell.max, cell.value, null);
        itm.setDataGridInfo(self.name, rowId, idx);
        return itm;
    }

    function updateSubscribers(self, keepOffsets) {
        var iter = shmi.requires("visuals.tools.iterate").iterateObject,
            timeNow = Date.now();

        iter(self.subscribers, function(val, id) {
            if (keepOffsets !== true) {
                self.subscribers[id].offset = 0;
            }
            self.subscribers[id].lastUpdate = timeNow;
            self.subscribers[id].onChange(self._calcState(id));
        });
        self.lastStateUpdate = timeNow;
    }

    function compareColumnValue(col_idx, a, b) {
        if (a[col_idx].value < b[col_idx].value) {
            return -1;
        } else if (a[col_idx].value === b[col_idx].value) {
            return 0;
        } else {
            return 1;
        }
    }

    function sortObj(self, sort_idx, data, order) {
        var im = shmi.requires("visuals.session.ItemManager"),
            iter = shmi.requires("visuals.tools.iterate").iterateObject;

        var cmp_arr = [];
        /* delete row data */
        iter(data, function(val, prop) {
            cmp_arr.push(data[prop]);
            delete data[prop];
        });

        cmp_arr.sort(compareColumnValue.bind(null, sort_idx));
        if (order === "DESC") {
            cmp_arr.reverse();
        }
        for (var i = 0; i < cmp_arr.length; i++) {
            data[i] = cmp_arr[i];
            data[i].forEach(function(cell, idx) {
                var vItemName = "virtual:grid:" + self.name + ":" + i + ":" + idx,
                    itm = im.getItem(vItemName);
                data[i][idx].item = itm;
            });
        }
        updateSubscribedRows(self);
    }

    function updateSubscribedRows(self) {
        var iter = shmi.requires("visuals.tools.iterate").iterateObject,
            rowIds = [];
        iter(self.subscribers, function(sub, id) {
            var subIds = self.getCurrentIDs(id);
            for (var i = 0; (sub.offset + i < self.totalRows) && (i < sub.size); i++) {
                if (rowIds.indexOf(subIds[i]) === -1) {
                    rowIds.push(subIds[i]);
                }
            }
        });
        rowIds.forEach(function(rowId, idx) {
            var row = self.data[rowId];
            if (row) {
                row.forEach(function(cell, jdx) {
                    if (cell.item.readValue(true) !== cell.value) {
                        cell.item.writeValue(cell.value, true);
                    }
                });
            }
        });
    }

    /**
     * DataGrid structure for storage and interaction with connect alarms.
     *
     * @private
     * @constructor
     */
    shmi.visuals.core.DataGridAlarms = function() {
        this.name = "alarms";
        this.fields = ["id", "index", "status", "level", "come", "active", "gone", "group", "json"];
        this.conditions = [];
        this.type = "ALARMS";
        this.data = {};
        this.subscribers = {};
        this.prefix = "virtual:grid:" + this.name + ":";
        this.totalRows = 0;
        this.nextRowId = 0;
        this.taskQueue = [];
        this.order = [0, "ASC"];
        this.filter = {};
        this._subID = null;
        this.AM = shmi.visuals.session.AlarmManager;
        this.indexFields = ["id"];
        this.lastStateUpdate = 0;
        this.stateTO = 0;
        this.singleStateTO = 0;
        this.init();
    };

    shmi.visuals.core.DataGridAlarms.prototype = {
        init: function() {
            var self = this,
                sessionConfig = shmi.visuals.session.config;
            if (!(sessionConfig && sessionConfig["disable-alarm-prefetch"])) {
                self._subID = self.AM.subscribeAlarms(self, alarmCallback.bind(null, self));
            }
        },
        /**
         * Creates a subscription to this data-grid.
         *
         * @param   {number}   offset   data-row offset
         * @param   {number}   size     number of data-rows to retrieve
         * @param   {function} onChange callback function, run when data-grid changes
         * @returns {object}   subscription token
         */
        subscribePage: function(offset, size, onChange) {
            var self = this,
                tmp_id = Date.now(),
                sessionConfig = shmi.visuals.session.config;

            while (self.subscribers[tmp_id] !== undefined) {
                tmp_id++;
            }

            var sub = {};
            sub.id = tmp_id;
            sub.offset = offset;
            sub.size = size;
            sub.onChange = onChange;
            sub.lastUpdate = 0;

            self.subscribers[tmp_id] = sub;

            /* subscribe to AlarmManager if first subscriber */
            if ((Object.keys(self.subscribers).length === 1) && (sessionConfig && sessionConfig["disable-alarm-prefetch"])) {
                self._subID = self.AM.subscribeAlarms(self, alarmCallback.bind(null, self));
            } else {
                shmi.decouple(function() {
                    if (self.subscribers[tmp_id]) {
                        self.subscribers[tmp_id].lastUpdate = Date.now();
                        self.subscribers[tmp_id].onChange(self._calcState(tmp_id));
                    }
                });
            }

            var ret_sub = {};
            ret_sub.id = tmp_id;
            ret_sub.prefix = self.prefix;

            return ret_sub;
        },
        /**
         * Returns array of field-names for this data-grid.
         *
         * @returns {string[]} field-names
         */
        getFields: function(yt) {
            return this.fields;
        },
        /**
         * getIndexFields - get indices of index fields
         *
         * @return {number[]}  array of field indices
         */
        getIndexFields: function() {
            var self = this,
                fields = [];
            self.indexFields.forEach(function(el) {
                var index = self.fields.indexOf(el);
                if (index !== -1) {
                    fields.push(index);
                } else {
                    console.warn("[DataGrid '" + this.name + "'] index field not found: " + el);
                }
            });
            return fields;
        },
        /**
         * getRowIndex - get values of index fields for specified row-ID
         *
         * @param  {number} rowId datagrid-row ID
         * @return {array} array of index field values
         */
        getRowIndex: function(rowId) {
            var self = this,
                rowIndex = [],
                f = this.getIndexFields();

            f.forEach(function(el) {
                rowIndex.push(self.data[rowId][el].value);
            });

            return rowIndex;
        },
        /**
         * searchIndexRowId - description
         *
         * @param  {array} rowIndex array of index field values
         * @return {number} datagrid-row ID matching index values or -1 if not found
         */
        searchIndexRowId: function(rowIndex) {
            var self = this,
                rowId = -1,
                fields = self.getIndexFields(),
                iter = shmi.requires("visuals.tools.iterate").iterateObject;

            iter(self.data, function(data, id) {
                if (self.searchIndexFields(id, fields, rowIndex)) {
                    if (rowId === -1) {
                        rowId = parseInt(id);
                    }
                }
            });

            return rowId;
        },
        /**
         * searchIndexFields - test if index fields of row match specified index values
         *
         * @param  {number} row datagrid-row ID
         * @param  {number[]} fields index field indices
         * @param  {array} rowIndex index field values
         * @return {boolean} `true` if found, `false` else
         */
        searchIndexFields: function(row, fields, rowIndex) {
            var self = this,
                found = 0;
            fields.forEach(function(field, idx) {
                if (self.data[row][field].value === rowIndex[idx]) {
                    found++;
                }
            });
            if (found > 0 && found === fields.length) {
                return true;
            } else {
                return false;
            }
        },
        _getRowByAlarmID: function(alarm_id) {
            var self = this,
                iter = shmi.requires("visuals.tools.iterate").iterateObject,
                retValue = null;
            iter(self.data, function(val, key) {
                if (self.data[key][0].value === alarm_id) {
                    retValue = key;
                }
            });
            return retValue;
        },
        /**
         * Inserts the specified row-data into the DataGrid and returns the newly created row-id.
         *
         * @param {object[]} rowData
         * @returns {Number} newly created row-ID
         */
        insertRow: function(rowData, rid, no_notify) {
            var self = this,
                rowId = 0,
                timeNow = null;

            var cur_row_id = self._getRowByAlarmID(rowData[0].value);

            if (rid !== undefined) {
                rowId = rid;
            } else if (cur_row_id !== null) {
                rowId = cur_row_id;
            } else {
                while (self.data[rowId] !== undefined) {
                    rowId++;
                }
            }
            if (self.data[rowId] === undefined) {
                if ((rowData[2].value === 1) || (rowData[5].value === 1)) {
                    self.data[rowId] = rowData;
                    for (var i = 0; i < rowData.length; i++) {
                        var cell = rowData[i],
                            vItemName = "virtual:grid:" + self.name + ":" + rowId + ":" + i;
                        /* keep reference to virtual item on data object */
                        var IM = shmi.visuals.session.ItemManager;
                        if ((IM.getItem(vItemName) === null) || (IM.getItem(vItemName).initialized === false)) {
                            self.data[rowId][i].item = createVirtualItem(self, vItemName, cell, rowId, i);
                        } else {
                            self.data[rowId][i].item = IM.getItem(vItemName);
                            IM.writeValue(vItemName, cell.value);
                        }
                    }
                }
            } else {
                for (i = 0; i < rowData.length; i++) {
                    if (self.fields[i] === "active") {
                        /* delete inactive alarms (rowData[5].value = false) that do not have to be acknowledged (rowData[2].value = 1) */
                        if ((rowData[i].value === 0) && (rowData[2].value !== 1)) {
                            delete self.data[rowId];
                            break;
                        }
                    }

                    if (self.data[rowId][i].item === undefined) {
                        cell = rowData[i];
                        vItemName = "virtual:grid:" + self.name + ":" + rowId + ":" + i;
                        self.data[rowId][i].item = createVirtualItem(self, vItemName, cell, rowId, i);
                    }
                    self.data[rowId][i].value = rowData[i].value;
                    self.data[rowId][i].item.writeValue(rowData[i].value);
                }
            }

            if (no_notify !== true) {
                self.totalRows = self._calcKeys().length;
                timeNow = Date.now();
                clearTimeout(self.stateTO);
                self.stateTO = 0;
                if (timeNow - self.lastStateUpdate > shmi.c("ACTION_RETRY_TIMEOUT")) {
                    shmi.raf(self.sort.bind(self, self.order[0], self.order[1], true));
                } else {
                    self.stateTO = setTimeout(self.sort.bind(self, self.order[0], self.order[1], true), shmi.c("ACTION_RETRY_TIMEOUT"));
                }
            }

            return self._getRowByAlarmID(rowData[0].value);
        },
        /**
         * Acknowledges alarm of specified data-grid row.
         *
         * @param {number} rowID data-grid row index
         */
        deleteRow: function(rowID) {
            if (Array.isArray(rowID)) {
                for (var i = 0; i < rowID.length; i++) {
                    if (this.data[rowID[i]] !== undefined) {
                        this.AM.ackAlarm(this.data[rowID[i]][0].value);
                        /* ack single alarm */
                    } else {
                        shmi.log("[DataGridAlarms] alarm not found row-id=" + rowID, 2);
                    }
                }
            } else if (this.data[rowID] !== undefined) {
                this.AM.ackAlarm(this.data[rowID][0].value);
                /* ack single alarm */
            } else {
                shmi.log("[DataGridAlarms] alarm not found row-id=" + rowID, 2);
            }
        },
        /**
         * Acknowledges all active alarms.
         *
         */
        deleteAll: function() {
            /* ack all active alarms */
            this.AM.ackAlarm(-1);
        },
        /**
         * Unsubscribes from updates to this data-grid.
         *
         * The subscription ID parameter corresponds to the 'id' property of the subscription
         * token returned by `subscribePage`.
         *
         * @param {number} subID subscription id
         */
        unsubscribe: function(subID) {
            var self = this,
                sessionConfig = shmi.visuals.session.config,
                iter = shmi.requires("visuals.tools.iterate").iterateObject;
            delete self.subscribers[subID];
            /* if no clients left ... */
            if ((Object.keys(self.subscribers).length === 0) && (sessionConfig && sessionConfig["disable-alarm-prefetch"])) {
                /* unsubscribe from AlarmManager */
                self.AM.unsubscribeAlarms(self._subID);
                /* delete row data */
                var IM = shmi.visuals.session.ItemManager;
                iter(self.data, function(val, key) {
                    for (var i = 0; i < self.data[key].length; i++) {
                        IM.removeItem(self.data[key][0].item.name);
                    }
                    delete self.data[key];
                });
            }
        },
        /**
         * Move data-row offset for specified subscription ID.
         *
         * The subscription ID parameter corresponds to the 'id' property of the subscription
         * token returned by `subscribePage`.
         *
         * @param {number} offset data-row offset (>0)
         * @param {number} subID  subscription ID
         */
        setOffset: function(offset, subID) {
            var self = this,
                sub = self.subscribers[subID],
                timeNow = Date.now();
            if (sub !== undefined) {
                if (offset > self.totalRows) {
                    offset = self.totalRows;
                }
                sub.offset = offset;
                clearTimeout(self.singleStateTO);
                self.singleStateTO = 0;
                if (timeNow - sub.lastUpdate > shmi.c("ACTION_RETRY_TIMEOUT")) {
                    sub.lastUpdate = timeNow;
                    shmi.raf(function() {
                        sub = self.subscribers[subID];
                        if (sub && (sub.lastUpdate === timeNow)) {
                            updateSubscribedRows(self);
                            sub.onChange(self._calcState(subID));
                        }
                    });
                } else {
                    self.singleStateTO = setTimeout(function() {
                        sub = self.subscribers[subID];
                        if (sub) {
                            sub.lastUpdate = Date.now();
                            updateSubscribedRows(self);
                            sub.onChange(self._calcState(subID));
                        }
                    }, shmi.c("ACTION_RETRY_TIMEOUT"));
                }
            }
        },
        /**
         * Retrieves the number of rows in this DataGrid.
         *
         * @returns {number} number of rows
         */
        getRowCount: function() {
            return this.totalRows;
        },
        /**
         * filters the specified column for entries matching the specified expression.
         * only column 2 is supported for ALARM-type grids. A single number or an array
         * of numbers can be specified as expression to match alarm classes.
         *
         * @param {number} col column index to filter, has to be equal to 2 to be active
         * @param {number|number[]} expression alarm class(-es) to be displayed - 0 := Info, 1 := Warning, 2 := Alarm
         */
        setFilter: function(col, expression) {
            var self = this,
                iter = shmi.requires("visuals.tools.iterate").iterateObject;
            if (col !== self.fields.indexOf("level")) {
                shmi.log("[DataGridAlarms] filtering not supported for column index " + col, 2);
                return;
            }

            self.filter[self.fields[col]] = expression;

            self.totalRows = self._calcKeys().length;

            clearTimeout(self.stateTO);
            self.stateTO = setTimeout(function() {
                iter(self.subscribers, function(val, id) {
                    self.subscribers[id].offset = 0;
                });
                updateSubscribedRows(self);
                iter(self.subscribers, function(val, id) {
                    self.subscribers[id].onChange(self._calcState(id));
                });
            }, shmi.c("ACTION_RETRY_TIMEOUT"));
        },
        /**
         * returns active filter expression for each data column
         *
         * @returns {string[]} active filter expressions
         */
        getFilters: function() {
            var self = this,
                cur_filters = [];
            for (var i = 0; i < self.fields.length; i++) {
                if (self.filter[self.fields[i]] !== undefined) {
                    cur_filters.push(self.filter[self.fields[i]]);
                } else {
                    cur_filters.push(null);
                }
            }
            return cur_filters;
        },
        /**
         * creates a new query and reloads currently active data
         *
         * @returns {undefined}
         */
        refresh: function() {

        },
        /**
         * Clears applied filter for the specified column. All filters can be cleared
         * with column index -1. Only column index 2 supports filtering
         *
         * @param {number} col index of column to clear filter, `-1` to clear all
         */
        clearFilter: function(col) {
            var self = this,
                iter = shmi.requires("visuals.tools.iterate").iterateObject;
            if ((col === self.fields.indexOf("level")) || (col === -1)) {
                self.filter = {};
                self.totalRows = self._calcKeys().length;
                clearTimeout(self.stateTO);
                self.stateTO = setTimeout(function() {
                    iter(self.subscribers, function(val, id) {
                        self.subscribers[id].offset = 0;
                        self.subscribers[id].onChange(self._calcState(id));
                    });
                }, shmi.c("ACTION_RETRY_TIMEOUT"));
            } else {
                shmi.log("[DataGridAlarms] filtering not supported for column index " + col, 2);
            }
        },
        _calcKeys: function() {
            var matches = [];
            if (this.filter["level"] !== undefined) {
                var keys = Object.keys(this.data),
                    vals = [];
                if (Array.isArray(this.filter["level"])) {
                    vals = this.filter["level"];
                } else {
                    vals.push(this.filter["level"]);
                }
                for (var i = 0; i < keys.length; i++) {
                    if (vals.indexOf(this.data[keys[i]][this.fields.indexOf("level")].value) !== -1) {
                        matches.push(keys[i]);
                    }
                }
            } else {
                matches = Object.keys(this.data);
            }
            return matches;
        },
        /**
         * sorts all data rows of the DataGrid by the specified column index in the
         * provided order.
         *
         * @param {number} col column index
         * @param {string} order sort order: 'ASC' for ascending, 'DESC' for descending
         * @param {boolean} [keepOffsets] set to `true` to leave subscriber offsets unchanged
         */
        sort: function(col, ord, keepOffsets, no_notify) {
            var self = this;

            if (col === -1) {
                self.order = [0, "ASC"];
            } else {
                self.order = [col, ord];
            }

            sortObj(self, self.order[0], self.data, self.order[1]);
            updateSubscribers(self, keepOffsets);
        },
        /**
         * returns row IDs of currently displayed rows.
         *
         * @param {integer} subID subscriber id
         * @returns {Array|shmi.visuals.core.DataGridAlarms.prototype.getCurrentIDs.id_arr}
         */
        getCurrentIDs: function(subID) {
            var id_arr = [],
                sub = this.subscribers[subID],
                keys = this._calcKeys();
            for (var i = sub.offset; i < (sub.offset + sub.size); i++) {
                if (keys[i] !== undefined) {
                    id_arr.push(parseInt(keys[i]));
                } else {
                    break;
                }
            }

            return id_arr;
        },
        /**
         * returns all row IDs of the datagrid
         *
         * @deprecated to delete all entries use deleteAll function
         * @param {integer} subID subscriber id
         * @returns {shmi.visuals.core.DataGridAlarms.prototype.getAllIDs.id_arr|Array}
         */
        getAllIDs: function(subID) {
            var id_arr = [],
                keys = this._calcKeys();
            for (var i = 0; i < keys.length; i++) {
                id_arr.push(parseInt(keys[i]));
            }
            return id_arr;
        },
        /**
         *  retrieve values of a row as array
         *
         * @param {number} rowId row-ID of the data-row to fetch
         * @returns {object[]} row-data array
         */
        getRowData: function(rowId) {
            return (this.data[rowId] !== undefined) ? this.data[rowId] : null;
        },
        /**
         *
         * @private
         * @param {type} subID
         * @returns {shmi.visuals.core.DataGridAlarms.prototype._calcState.state}
         */
        _calcState: function(subID) {
            var sub = this.subscribers[subID],
                state = {};
            state.status = "OK";
            state.totalRows = this.totalRows;
            state.offset = Math.min(sub.offset, Math.max(state.totalRows - 1, 0)); //ensure offset is not larger than dataset

            return state;
        }
    };
}());

(function() {
    shmi.pkg("visuals.core");

    /**
     * getFieldValue - retrieve value of named datagrid field
     *
     * @param  {object} alarmInfo alarm info object
     * @param  {string} fieldName name of datagrid field
     * @return {*}
     */
    function getFieldValue(alarmInfo, fieldName) {
        var result = null;

        switch (fieldName) {
        case "level":
            result = alarmInfo.severity;
            break;
        case "status":
            result = (alarmInfo.acknowledgeable && !alarmInfo.acknowledged);
            break;
        case "come":
            result = alarmInfo.timestamp_in;
            break;
        case "gone":
            result = alarmInfo.timestamp_out;
            break;
        case "json":
            result = JSON.stringify(alarmInfo);
            break;
        case "alarmAck":
            result = alarmInfo.timestamp_acknowledged;
            break;
        case "ackUser":
            result = alarmInfo.acknowledged_by;
            break;
        default:
            if (alarmInfo[fieldName] !== undefined) {
                result = alarmInfo[fieldName];
            }
        }
        return result;
    }

    /**
     * getFilterParameter - calculate filter parameter for alarm-query options
     *
     * @param  {DataGridAlarmsHistoric} self datagrid instance reference
     * @return {object} filter parameter object
     */
    function getFilterParameter(self) {
        var iter = shmi.requires("visuals.tools.iterate.iterateObject"),
            result = {
                mode: self.filterChaining,
                clauses: []
            };
        iter(self.filter, function(filter) {
            result.clauses.push(filter);
        });
        return result;
    }

    //calculate sort parameter for alarm-query options
    var sortFieldMap = {
        "id": "id",
        "index": "index",
        "level": "severity",
        "come": "timestamp_in",
        "gone": "timestamp_out",
        "group": "group",
        "needAck": "acknowledgeable",
        "isAck": "acknowledged",
        "alarmAck": "timestamp_acknowledged",
        "ackUser": "acknowledged_by",
        "json": "id"
    };

    /**
     * getSortParameter - calculate sort parameter array
     *
     * @param  {DataGridAlarmsHistoric} self datagrid instance reference
     * @return {object[]} sort parameter
     */
    function getSortParameter(self) {
        return [{
            column: sortFieldMap[self.fields[self.order[0]]],
            order: self.order[1],
            location: "property"
        }];
    }

    /**
     * getQueryOptions - calculate options parameter for alarm-query
     *
     * @param  {DataGridAlarmsHistoric} self  datagrid instance reference
     * @param  {number} subId subscriber ID
     * @return {object} query options
     */
    function getQueryOptions(self, subId) {
        var sub = self.subscribers[subId],
            options = null,
            iter = shmi.requires("visuals.tools.iterate.iterateObject");
        if (subId === undefined) {
            sub = {
                size: null,
                offset: 0
            };
            iter(self.subscribers, function(val, prop) {
                if (val.size > sub.size) {
                    sub.size = val.size;
                }
                val.offset = 0; //reset subscriber offset
            });
        }
        if (sub) {
            options = {
                limit: sub.size,
                offset: sub.offset,
                filter: getFilterParameter(self),
                sort: getSortParameter(self)
            };
        }
        return options;
    }

    /**
     * reloadAlarms - reload alarm data (after initial loading)
     *
     * @param  {DataGridAlarmsHistoric} self datagrid instance reference
     * @return {undefined}
     */
    function reloadAlarms(self) {
        var am = shmi.requires("visuals.session.AlarmManager"),
            iter = shmi.requires("visuals.tools.iterate.iterateObject"),
            request = createLoadRequest(self);

        iter(self.data, function(val, prop) {
            deleteRow(self, prop);
        });
        self.lastRequest = request;
        am.getHistoricAlarms(function alarmCb(err, alarmData) {
            delete self.requests[request.id];
            if (self.lastRequest === request) {
                self.totalRows = 0;
                if (alarmData && Array.isArray(alarmData.alarms)) {
                    alarmData.alarms.forEach(function(aInfo, idx) {
                        alarmCallback(self, aInfo, idx, (idx !== (alarmData.alarms.length - 1)));
                    });
                    self.totalRows = alarmData.total_count;
                } else {
                    console.error("DataGridAlarmsHistoric", "failed to retrieve historic alarms");
                }
                iter(self.subscribers, function(val, prop) {
                    val.onChange({
                        status: "OK",
                        offset: 0,
                        totalRows: self.totalRows
                    });
                });
            }
        }, getQueryOptions(self));
    }

    /**
     * loadAlarms - load alarm data (initial loading & offset change)
     *
     * @param  {DataGridAlarmsHistoric} self datagrid instance reference
     * @param  {number} subId subscriber ID
     * @return {undefined}
     */
    function loadAlarms(self, subId) {
        var am = shmi.requires("visuals.session.AlarmManager"),
            request = null,
            sub = self.subscribers[subId];
        if (sub) {
            sub = null;
            request = createLoadRequest(self);
            self.lastRequest = request;
            am.getHistoricAlarms(function alarmCb(err, alarmData) {
                delete self.requests[request.id];
                if (self.lastRequest === request) {
                    sub = self.subscribers[subId]; //subscriber has to be looked up again to ensure it still exists after loading
                    if (sub) {
                        self.totalRows = 0;
                        if (alarmData && Array.isArray(alarmData.alarms)) {
                            alarmData.alarms.forEach(function(aInfo, idx) {
                                alarmCallback(self, aInfo, sub.offset + idx, (idx !== (alarmData.alarms.length - 1)));
                            });
                            self.totalRows = alarmData.total_count;
                        } else {
                            console.error("DataGridAlarmsHistoric", "failed to retrieve historic alarms");
                        }
                        sub.onChange({
                            status: "OK",
                            offset: sub.offset,
                            totalRows: self.totalRows
                        });
                    }
                }
            }, getQueryOptions(self, subId));
        }
    }

    /**
     * alarmCallback - callback to handle creation of datagrid rows from incoming alarm data
     *
     * @param  {DataGridAlarmsHistoric} self datagrid instance reference
     * @param  {object} alarmInfo alarm info
     * @param  {number} rowIndex  datagrid row ID
     * @param  {boolean} noNotify  `true` to prevent subscriber notification (when adding multiple rows)
     * @return {undefined}
     */
    function alarmCallback(self, alarmInfo, rowIndex, noNotify) {
        var rowData = [];
        self.fields.forEach(function(fName, idx) {
            var fieldValue = getFieldValue(alarmInfo, fName),
                fieldType = (typeof fieldValue);
            switch (fieldType) {
            case "string":
                rowData.push({
                    type: shmi.c("TYPE_STRING"),
                    value: fieldValue
                });
                break;
            case "boolean":
                rowData.push({
                    type: shmi.c("TYPE_BOOL"),
                    value: fieldValue ? 1 : 0,
                    min: 0,
                    max: 1
                });
                break;
            case "number":
                rowData.push({
                    type: shmi.c("TYPE_FLOAT"),
                    value: fieldValue,
                    min: Number.NaN,
                    max: Number.NaN
                });
                break;
            default:
                rowData.push({
                    type: shmi.c("TYPE_STRING"),
                    value: "NULL",
                    min: Number.NaN,
                    max: Number.NaN
                });
            }
        });

        self.insertRow(rowData, rowIndex, noNotify);
    }

    /**
     * createVirtualItem - create virtual item for use in datagrid cell
     *
     * @param  {DataGridAlarmsHistoric} self datagrid instance reference
     * @param  {string} iname virtual item name
     * @param  {object} cell cell info
     * @param  {number} rowId datagrid row ID
     * @param  {number} idx cell index
     * @return {Item} created virtual item
     */
    function createVirtualItem(self, iname, cell, rowId, idx) {
        var im = shmi.requires("visuals.session.ItemManager"),
            existingItem = im.getItem(iname),
            itm = null;

        if (existingItem && existingItem.initialized) {
            if (existingItem.readValue() !== cell.value) {
                existingItem.writeValue(cell.value);
            }
            return existingItem;
        } else {
            itm = shmi.createVirtualItem(iname, cell.type, cell.min, cell.max, cell.value, null);
            if (self.itemsCreated.indexOf(iname) === -1) {
                self.itemsCreated.push(iname);
            }
            itm.setDataGridInfo(this.name, rowId, idx);
            return itm;
        }
    }

    /**
     * deleteRow - delete datagrid row info
     *
     * @param  {DataGridAlarmsHistoric} self datagrid instance reference
     * @param  {number} rowId datagrid row ID
     * @return {undefined}
     */
    function deleteRow(self, rowId) {
        /* delete row data */
        var row = self.data[rowId];
        if (row && Array.isArray(row)) {
            delete self.data[rowId];
        }
    }

    function createLoadRequest(self) {
        var requestId = 0;
        while (self.requests[requestId] !== undefined) {
            requestId += 1;
        }
        self.requests[requestId] = {
            id: requestId
        };
        return self.requests[requestId];
    }

    /**
     * DataGrid structure for storage and interaction with connect alarms.
     *
     * @private
     * @constructor
     */
    shmi.visuals.core.DataGridAlarmsHistoric = function() {
        this.name = "alarms-historic";
        this.fields = ["id", "index", "level", "come", "gone", "group", "needAck", "isAck", "alarmAck", "ackUser", "json"];
        this.conditions = [];
        this.type = "ALARMS_HISTORIC";
        this.data = {};
        this.subscribers = {};
        this.prefix = "virtual:grid:" + this.name + ":";
        this.totalRows = 0;
        this.nextRowId = 0;
        this.taskQueue = [];
        this.order = [0, "ASC"];
        this.filter = {};
        this.filterChaining = "AND";
        this._subID = null;
        this.AM = shmi.visuals.session.AlarmManager;
        this.indexFields = ["id"];
        this.requests = {};
        this.lastRequest = null;
        this.itemsCreated = [];
        this.init();
    };

    shmi.visuals.core.DataGridAlarmsHistoric.prototype = {
        init: function() {
        },
        /**
         * Creates a subscription to this data-grid.
         *
         * @param   {number}   offset   data-row offset
         * @param   {number}   size     number of data-rows to retrieve
         * @param   {function} onChange callback function, run when data-grid changes
         * @returns {object}   subscription token
         */
        subscribePage: function(offset, size, onChange) {
            var self = this,
                tmp_id = Date.now();
            while (this.subscribers[tmp_id] !== undefined) {
                tmp_id++;
            }

            var sub = {};
            sub.id = tmp_id;
            sub.offset = offset;
            sub.size = size;
            sub.onChange = onChange;
            sub.lastUpdate = 0;
            sub.updateTimeout = 0;
            this.subscribers[tmp_id] = sub;

            /* load alarm data */
            loadAlarms(self, sub.id);

            var ret_sub = {};
            ret_sub.id = tmp_id;
            ret_sub.prefix = this.prefix;

            return ret_sub;
        },
        /**
         * Returns array of field-names for this data-grid.
         *
         * @returns {string[]} field-names
         */
        getFields: function(yt) {
            return this.fields;
        },
        /**
         * getIndexFields - get indices of index fields
         *
         * @return {number[]}  array of field indices
         */
        getIndexFields: function() {
            var self = this,
                fields = [];
            self.indexFields.forEach(function(el) {
                var index = self.fields.indexOf(el);
                if (index !== -1) {
                    fields.push(index);
                } else {
                    console.warn("[DataGrid '" + this.name + "'] index field not found: " + el);
                }
            });
            return fields;
        },
        /**
         * getRowIndex - get values of index fields for specified row-ID
         *
         * @param  {number} rowId datagrid-row ID
         * @return {array} array of index field values
         */
        getRowIndex: function(rowId) {
            var self = this,
                rowIndex = [],
                f = this.getIndexFields();

            f.forEach(function(el) {
                rowIndex.push(self.data[rowId][el].value);
            });

            return rowIndex;
        },
        /**
         * searchIndexRowId - description
         *
         * @param  {array} rowIndex array of index field values
         * @return {number} datagrid-row ID matching index values or -1 if not found
         */
        searchIndexRowId: function(rowIndex) {
            var self = this,
                rowId = -1,
                fields = self.getIndexFields(),
                iter = shmi.requires("visuals.tools.iterate").iterateObject;

            iter(self.data, function(data, id) {
                if (self.searchIndexFields(id, fields, rowIndex)) {
                    if (rowId === -1) {
                        rowId = parseInt(id);
                    }
                }
            });

            return rowId;
        },
        /**
         * searchIndexFields - test if index fields of row match specified index values
         *
         * @param  {number} row datagrid-row ID
         * @param  {number[]} fields index field indices
         * @param  {array} rowIndex index field values
         * @return {boolean} `true` if found, `false` else
         */
        searchIndexFields: function(row, fields, rowIndex) {
            var self = this,
                found = 0;
            fields.forEach(function(field, idx) {
                if (self.data[row][field].value === rowIndex[idx]) {
                    found++;
                }
            });
            if (found > 0 && found === fields.length) {
                return true;
            } else {
                return false;
            }
        },
        /**
         * sets the chaining for filter expressions - used to search multiple columns
         *
         * @param {string} set chaining to AND or OR
         */
        setFilterChaining: function(chaining) {
            var self = this;
            if (chaining === "OR" || chaining === "AND") {
                self.filterChaining = chaining;
            } else {
                console.error("[DataGridAlarmsHistoric] invalid filter chaining mode:", chaining);
            }
        },
        /**
         * Inserts the specified row-data into the DataGrid and returns the newly created row-id.
         *
         * @param {object[]} rowData
         * @returns {Number} newly created row-ID
         */
        insertRow: function(rowData, rid, no_notify) {
            var self = this,
                rowId = null;

            if (rid !== undefined) {
                rowId = rid;
            } else {
                console.error("DataGridAlarmsHistoric", "no row-index specified on insertRow");
                return null;
            }
            if (this.data[rowId] === undefined) {
                this.data[rowId] = rowData;
            }
            var cell,
                vItemName;
            for (var i = 0; i < rowData.length; i++) {
                cell = rowData[i];
                vItemName = "virtual:grid:" + this.name + ":" + rowId + ":" + i;
                /* keep reference to virtual item on data object */
                this.data[rowId][i].item = createVirtualItem(self, vItemName, cell, rowId, i);
                this.data[rowId][i].value = cell.value;
            }
            return rowId;
        },
        /**
         * Acknowledges alarm of specified data-grid row.
         *
         * @param {number} rowID data-grid row index
         */
        deleteRow: function(rowID) {
            //deletion of historic alarms not supported
        },
        /**
         * Acknowledges all active alarms.
         *
         */
        deleteAll: function() {
            //deletion of historic alarms not supported
        },
        /**
         * Unsubscribes from updates to this data-grid.
         *
         * The subscription ID parameter corresponds to the 'id' property of the subscription
         * token returned by `subscribePage`.
         *
         * @param {number} subID subscription id
         */
        unsubscribe: function(subID) {
            var self = this,
                iter = shmi.requires("visuals.tools.iterate.iterateObject");

            delete self.subscribers[subID];
            /* if no clients left ... */
            if (Object.keys(self.subscribers).length === 0) {
                /* delete row data */
                iter(self.data, function(rowData, rowId) {
                    delete self.data[rowId];
                });
                /* delete created items */
                var im = shmi.requires("visuals.session.ItemManager");
                self.itemsCreated.forEach(function(itemName) {
                    im.removeItem(itemName);
                });
                self.itemsCreated = [];
                self.totalRows = 0;
                self.lastRequest = null;
            }
        },
        /**
         * Move data-row offset for specified subscription ID.
         *
         * The subscription ID parameter corresponds to the 'id' property of the subscription
         * token returned by `subscribePage`.
         *
         * @param {number} offset data-row offset (>0)
         * @param {number} subID  subscription ID
         */
        setOffset: function(offset, subID) {
            var self = this,
                sub = self.subscribers[subID],
                timeNow = null;
            if (sub !== undefined) {
                if (offset > self.totalRows) {
                    offset = self.totalRows;
                }
                sub.offset = offset;
                timeNow = Date.now();
                clearTimeout(sub.updateTimeout);
                sub.updateTimeout = 0;
                if (timeNow - sub.lastUpdate > shmi.c("ACTION_RETRY_TIMEOUT")) {
                    sub.lastUpdate = timeNow;
                    shmi.raf(function() {
                        sub = self.subscribers[subID];
                        if (sub && (sub.lastUpdate === timeNow)) {
                            loadAlarms(self, subID);
                        }
                    });
                } else {
                    sub.updateTimeout = setTimeout(function() {
                        sub = self.subscribers[subID];
                        if (sub) {
                            sub.lastUpdate = Date.now();
                            loadAlarms(self, subID);
                        }
                    }, shmi.c("ACTION_RETRY_TIMEOUT"));
                }
            }
        },
        /**
         * Retrieves the number of rows in this DataGrid.
         *
         * @returns {number} number of rows
         */
        getRowCount: function() {
            return this.totalRows;
        },
        /**
         * filters the specified column for entries matching the specified expression.
         * only column 2 is supported for ALARM-type grids. A single number or an array
         * of numbers can be specified as expression to match alarm classes.
         *
         * @param {number} col column index to filter, has to be equal to 2 to be active
         * @param {number|number[]} expression alarm class(-es) to be displayed - 0 := Info, 1 := Warning, 2 := Alarm
         */
        setFilter: function(col, expression) {
            var self = this,
                createEnum = shmi.requires("visuals.tools.enum.createEnum"),
                fields = createEnum(self.fields),
                supportedFields = [fields.level, fields.come, fields.group];

            if (supportedFields.indexOf(col) === -1) {
                shmi.log("[DataGridAlarmsHistoric] filtering not supported for column index " + col, 2);
                return;
            }

            if (col === fields.level) {
                self.filter.level = {
                    column: "severity",
                    mode: "OR",
                    location: "property",
                    clauses: []
                };
                if (Array.isArray(expression)) {
                    expression.forEach(function(inEx) {
                        self.filter.level.clauses.push({
                            operator: "==",
                            value: parseInt(inEx)
                        });
                    });
                } else {
                    self.filter.level.clauses.push({
                        operator: "==",
                        value: parseInt(expression)
                    });
                }
            } else if (col === fields.group) {
                self.filter.group = {
                    column: "group",
                    mode: "OR",
                    location: "property",
                    clauses: []
                };
                if (Array.isArray(expression)) {
                    expression.forEach(function(inEx) {
                        self.filter.group.clauses.push({
                            operator: "==",
                            value: parseInt(inEx)
                        });
                    });
                } else {
                    self.filter.group.clauses.push({
                        operator: "==",
                        value: parseInt(expression)
                    });
                }
            } else if (col === fields.come) {
                self.filter.come = {
                    column: "timestamp_in",
                    mode: "AND",
                    location: "property",
                    clauses: []
                };
                // Convert unix timestamps to API timestamps (1s -> 100ns resolution).
                if (Array.isArray(expression) && (expression.length >= 2)) {
                    self.filter.come.clauses.push({
                        operator: ">=",
                        value: parseInt(expression[0]) * 10000000
                    },
                    {
                        operator: "<=",
                        value: parseInt(expression[1]) * 10000000
                    });
                } else {
                    self.filter.come.clauses.push({
                        operator: ">=",
                        value: parseInt(expression) * 10000000
                    });
                }
            }

            reloadAlarms(self);
        },
        /**
         * returns active filter expression for each data column
         *
         * @returns {string[]} active filter expressions
         */
        getFilters: function() {
            var self = this,
                cur_filters = [];
            for (var i = 0; i < self.fields.length; i++) {
                if (self.filter[self.fields[i]] !== undefined) {
                    cur_filters.push(self.filter[self.fields[i]]);
                } else {
                    cur_filters.push(null);
                }
            }
            return cur_filters;
        },
        /**
         * creates a new query and reloads currently active data
         *
         * @returns {undefined}
         */
        refresh: function() {
            var self = this;
            reloadAlarms(self);
        },
        /**
         * Clears applied filter for the specified column. All filters can be cleared
         * with column index -1. Only column index 2 supports filtering
         *
         * @param {type} col index of column to clear filter
         */
        clearFilter: function(col) {
            var self = this,
                fieldName = null;
            if (col === -1) {
                //clear all filters
                self.filter = {};
            } else if (self.fields[col]) {
                //clear specified field filter
                fieldName = self.fields[col];
                delete self.filter[fieldName];
            }
            reloadAlarms(self);
        },
        /**
         * sorts all data rows of the DataGrid by the specified column index in the
         * provided order.
         *
         * @param {type} col column index
         * @param {type} order sort order: 'ASC' for ascending, 'DESC' for descending
         */
        sort: function(col, ord) {
            var self = this;

            if (col === -1) {
                this.order = [0, "ASC"];
            } else {
                this.order = [col, ord];
            }

            reloadAlarms(self);
        },

        getSortOrder: function() {
            return shmi.cloneObject(this.order);
        },
        /**
         * returns row IDs of currently displayed rows.
         *
         * @param {integer} subID subscriber id
         * @returns {Array|shmi.visuals.core.DataGridAlarmsHistoric.prototype.getCurrentIDs.id_arr}
         */
        getCurrentIDs: function(subID) {
            var self = this,
                id_arr = [],
                sub = this.subscribers[subID];

            for (var i = sub.offset; i < (sub.offset + sub.size); i++) {
                if (i < self.totalRows) {
                    id_arr.push(i);
                }
            }

            return id_arr;
        },
        /**
         * returns all row IDs of the datagrid
         *
         * @deprecated to delete all entries use deleteAll function
         * @param {integer} subID subscriber id
         * @returns {shmi.visuals.core.DataGridAlarmsHistoric.prototype.getAllIDs.id_arr|Array}
         */
        getAllIDs: function(subID) {
            var self = this,
                id_arr = [];
            for (var i = 0; i < self.totalRows; i++) {
                id_arr.push(i);
            }
            return id_arr;
        },
        /**
         *  retrieve values of a row as array
         *
         * @param {number} rowId row-ID of the data-row to fetch
         * @returns {object[]} row-data array
         */
        getRowData: function(rowId) {
            return (this.data[rowId] !== undefined) ? this.data[rowId] : null;
        }
    };
}());

shmi.pkg("visuals.core");

shmi.visuals.core.DataGridDB = function(name, db, table, fields, conditions, indexFields) {
    this.name = name;
    this.db = db;
    this.table = table;
    this.fields = fields;
    this.indexFields = indexFields || [];
    this.conditions = conditions || [];
    this.type = "DB2";
    this.data = {};
    this.subscribers = {};
    this.prefix = "virtual:grid:" + this.name + ":";
    this.nextRowID = 0;
    this.query = null;
    this.totalRows = 0;
    this.taskQueue = [];
    this.order = null;
    this._writeTimeout = 0;
    this.loadTimeout = 15000;
    this._loadTO = 0;
    this.filter = {};
    this.filter.chaining = "AND";
};

shmi.visuals.core.DataGridDB.prototype = {
    /**
     * init - initializes datagrid
     *
     * @private
     * @returns {undefined}
     */
    init: function() {
        this.taskQueue = [];
        this.subscribers = {};
    },
    /**
     * subscribePage - open subscription datagrid row range
     *
     * @param  {number} offset   row offset of result data
     * @param  {number} size     page size of data to load
     * @param  {function} onChange callback to run when datagrid changes
     * @return {object} subscription token
     */
    subscribePage: function(offset, size, onChange) {
        var tmp_id = Date.now();
        while (this.subscribers[tmp_id] !== undefined) {
            tmp_id++;
        }

        var sub = {};
        sub.id = tmp_id;
        sub.offset = offset;
        sub.size = size;
        sub.onChange = onChange;

        this.subscribers[tmp_id] = sub;

        var ret_sub = {};
        ret_sub.id = tmp_id;
        ret_sub.prefix = this.prefix;

        var tasks = [];

        if (this.q_id === undefined) {
            var task_query = {
                type: 'query'
            };
            tasks.push(task_query);
        }

        var task_load = {
            type: 'load',
            subID: tmp_id
        };
        tasks.push(task_load);

        this._queueTasks(tasks);

        return ret_sub;
    },
    /**
     * getFields - get array of datagrid field names
     *
     * @return {string[]} array of field names
     */
    getFields: function() {
        return this.fields;
    },
    /**
     * getIndexFields - get indices of index fields
     *
     * @return {number[]}  array of field indices
     */
    getIndexFields: function() {
        var fields = [];
        this.indexFields.forEach(function(el) {
            var index = this.fields.indexOf(el);
            if (index !== -1) {
                fields.push(index);
            } else {
                shmi.log("[DataGrid '" + this.name + "'] index field not found: " + el, 3);
            }
        }.bind(this));
        return fields;
    },
    /**
     * getRowIndex - get values of index fields for specified row-ID
     *
     * @param  {number} rowId datagrid-row ID
     * @return {array} array of index field values
     */
    getRowIndex: function(rowId) {
        var rowIndex = [];
        var f = this.getIndexFields();
        f.forEach(function(el) {
            rowIndex.push(this.data[rowId][el].value);
        }.bind(this));
        return rowIndex;
    },
    /**
     * searchIndexRowId - get datagrid-row ID of specified index field values
     *
     * @param  {array} rowIndex array of index field values
     * @return {number} datagrid-row ID matching index values or -1 if not found
     */
    searchIndexRowId: function(rowIndex) {
        var self = this,
            rowId = -1,
            fields = self.getIndexFields(),
            iter = shmi.requires("visuals.tools.iterate").iterateObject;

        iter(self.data, function(data, id) {
            if (self.searchIndexFields(id, fields, rowIndex)) {
                if (rowId === -1) {
                    rowId = parseInt(id);
                }
            }
        });

        return rowId;
    },
    /**
     * searchIndexFields - test if index fields of row match specified index values
     *
     * @param  {number} row datagrid-row ID
     * @param  {number[]} fields index field indices
     * @param  {array} rowIndex index field values
     * @return {boolean} `true` if found, `false` else
     */
    searchIndexFields: function(row, fields, rowIndex) {
        var self = this;
        var found = 0;
        fields.forEach(function(field, idx) {
            if (self.data[row][field].value === rowIndex[idx]) {
                found++;
            }
        });
        if (found > 0 && found === fields.length) {
            return true;
        } else {
            return false;
        }
    },
    /**
     * insertRow - insert new rot into datagrid.
     *
     * warning: data also needs to be written to database. this only adds row to
     * datagrid instance.
     *
     * @param  {object[]} rowData row data to insert as new row
     * @return {undefined}
     */
    insertRow: function(rowData) {
        var self = this,
            dgm = shmi.visuals.session.DataGridManager,
            im = shmi.visuals.session.ItemManager,
            iter = shmi.requires("visuals.tools.iterate").iterateObject,
            rowId = this.nextRowID++;
        self.totalRows++;
        self.data[rowId] = rowData;

        self.reset_grid = true;
        for (var i = 0; i < rowData.length; i++) {
            var cell = self.data[rowId][i],
                vItemName = self.prefix + rowId + ":" + i,
                cellItem = im.getItem(vItemName);
            if (cellItem && cellItem.initialized) {
                cell.item = cellItem;
            } else {
                cell.item = shmi.createVirtualItem(vItemName, cell.type, cell.min, cell.max, cell.value,
                    (function(rid, cid) {
                        return function(value, type, name) {
                            if ((!self.data[rid]) || (!self.data[rid][cid])) {
                                return;
                            }

                            var oldValue = self.data[rid][cid].value;
                            self.data[rid][cid].value = value;
                            if (self.reset_grid === true) {
                                return;
                            }

                            if (oldValue === value) {
                                return;
                            }

                            /* save changed row if grid is writable */
                            if ((self.db % 2) !== 0) {
                                clearTimeout(self.data[rid].timeout_id);
                                self.data[rid].timeout_id = setTimeout(function() {
                                    if (shmi.visuals.session.config.debug === true) {
                                        console.log("SAVING DATAGRID (DB2)", rid, self.data[rid]);
                                    }

                                    dgm.saveRowToDB(self.name, rid, false);
                                }, shmi.c("DATAGRID_DB2_WRITE_DELAY"));
                            }
                            try {
                                shmi.log("[DataGrid '" + self.name + "'] updated value: " + value, 1);
                            } catch (exc) {
                                shmi.log("[DataGrid '" + self.name + "'] failed to update value: " + exc, 2);
                            }
                        };
                    })(rowId, i)
                );
                cell.item.setDataGridInfo(self.name, rowId, i);
            }
            /* mark item as writable in case data is from read-write DB */
            cell.item.writable = true;
            cell.item.writeValue(cell.value);
            /* mark items as read only if DB is configured as read only */
            if ((self.db % 2) === 0) {
                cell.item.writable = false;
            }
        }
        self.reset_grid = false;

        iter(self.subscribers, function(val, sub_id) {
            self.subscribers[sub_id].onChange(self._calcState(sub_id));
        });

        shmi.log("[DataGridDB] insertRow", 2);
        return rowId;
    },
    /**
     * deleteRow - delete row of specified datagrid row ID
     *
     * warning: this function will also try to remove row from databse.
     *
     * @param  {number} rowID datagrid row ID
     * @return {undefined}
     */
    deleteRow: function(rowID) {
        var self = this,
            tasks = [],
            iter = shmi.requires("visuals.tools.iterate").iterateObject,
            task_del;
        /* push one or many delete tasks */
        if (Array.isArray(rowID)) {
            for (var i = 0; i < rowID.length; i++) {
                task_del = {
                    type: 'delete',
                    rowID: self.data[rowID[i]].rowID
                };
                tasks.push(task_del);
            }
        } else {
            task_del = {
                type: 'delete',
                rowID: self.data[rowID].rowID
            };
            tasks.push(task_del);
        }

        /* refresh task after delete */
        var task_query = {
            type: 'query'
        };
        tasks.push(task_query);
        iter(self.subscribers, function(val, sub_id) {
            self.subscribers[sub_id].offset = 0;
            var task_load = {
                type: 'load',
                subID: sub_id
            };
            tasks.push(task_load);
        });
        self._queueTasks(tasks);
    },
    /**
     * deleteAll - delete all rows from datagrid instance
     *
     * this function will *NOT* remove data from database
     *
     * @return {undefined}
     */
    deleteAll: function() {
        var tasks = [],
            task_del = {
                type: 'delete-all'
            };
        tasks.push(task_del);
        /* refresh task after delete */
        var task_query = {
            type: 'query'
        };
        tasks.push(task_query);
        for (var sub_id in this.subscribers) {
            this.subscribers[sub_id].offset = 0;
            var task_load = {
                type: 'load',
                subID: sub_id
            };
            tasks.push(task_load);
        }
        this._queueTasks(tasks);
    },
    _queueTasks: function(tasks) {
        shmi.decouple(() => {
            var exec_task = (this.taskQueue.length === 0);
            for (var i = 0; i < tasks.length; i++) {
                this.taskQueue.push(tasks[i]);
            }
            if (exec_task) {
                this._nextTask();
            }
        });
    },
    /**
     * unsubscribe - return / disable active subscription to datagrid range
     *
     * @param  {number} subID subscription ID
     * @return {undefined}
     */
    unsubscribe: function(subID) {
        var s = shmi.visuals.session;

        delete this.subscribers[subID];

        /* if no clients left ... */
        if (Object.keys(this.subscribers).length === 0) {
            /* close query and delete all row data */
            if (this.q_id !== undefined) {
                s.QueryManager.close(this.q_id);
                delete this.q_id;
            }

            var data_keys = Object.keys(this.data);
            for (var i = 0; i < data_keys.length; i++) {
                for (var j = 0; j < this.data[data_keys[i]].length; j++) {
                    shmi.visuals.session.ItemManager.removeItem(this.data[data_keys[i]][j].item.name);
                }
                delete this.data[data_keys[i]];
            }
        }
    },
    /**
     * setOffset - set offset of subscribed datagrid range
     *
     * @param  {number} offset datagrid result offset
     * @param  {number} subID  active subscription ID
     * @return {undefined}
     */
    setOffset: function(offset, subID) {
        if (this.subscribers[subID] !== undefined) {
            this.subscribers[subID].offset = offset;
            var task_load = {
                type: 'load',
                subID: subID
            };
            this._queueTasks([task_load]);
        }
    },
    /**
     * Retrieves the number of rows in this DataGrid.
     *
     * @returns {number} number of rows
     */
    getRowCount: function() {
        return this.totalRows;
    },
    /**
     * filters the specified column for entries matching the specified expression.
     * wildcards may be used in expressions ('_' single character wildcard, '%'
     * multi character wildcard.
     *
     * @param {number} col column index to filter
     * @param {string|string[]} expression filter expression (e.g. "%item%" will retrieve all rows with strings containing 'item' preceeded and followed by arbitrary strings).
     */
    setFilter: function(col, expression) {
        this.filter[this.fields[col]] = expression;
        clearTimeout(this.recalcTO);
        this.recalcTO = setTimeout(function() {
            this.refresh();
        }.bind(this), shmi.c("ACTION_RETRY_TIMEOUT"));
    },
    /**
     * sets the chaining for filter expressions - used to search multiple columns
     *
     * @param {string} set chaining to AND or OR
     */
    setFilterChaining: function(chaining) {
        if (chaining === "OR" || chaining === "AND") {
            this.filter.chaining = chaining;
        } else {
            console.error("[DataGridDB] invalid filter chaining mode:", chaining);
        }
    },
    /**
     * returns active filter expression for each data column
     *
     * @returns {string[]} active filter expressions
     */
    getFilters: function() {
        var self = this,
            cur_filters = [];
        for (var i = 0; i < self.fields.length; i++) {
            if (self.filter[self.fields[i]] !== undefined) {
                cur_filters.push(self.filter[self.fields[i]]);
            } else {
                cur_filters.push(null);
            }
        }
        return cur_filters;
    },
    /**
     * creates a new query and reloads currently active data
     *
     * @returns {undefined}
     */
    refresh: function() {
        var self = this,
            iter = shmi.requires("visuals.tools.iterate").iterateObject,
            tasks = [],
            task_query = {
                type: 'query'
            };
        tasks.push(task_query);
        iter(self.subscribers, function(val, sub_id) {
            self.subscribers[sub_id].offset = 0;
            var task_load = {
                type: 'load',
                subID: sub_id
            };
            tasks.push(task_load);
        });
        self._queueTasks(tasks);
    },
    /**
     * Clears applied filter for the specified column. All filters can be cleared
     * with column index -1.
     *
     * @param {type} col index of column to clear filter
     */
    clearFilter: function(col) {
        var refresh_needed = false;

        if (col === -1) {
            for (var i = 0; i < this.fields.length; i++) {
                if (this.filter[this.fields[i]] !== undefined) {
                    delete this.filter[this.fields[i]];
                    refresh_needed = true;
                }
            }
        } else if (this.filter[this.fields[col]] !== undefined) {
            delete this.filter[this.fields[col]];
            refresh_needed = true;
        }

        if (refresh_needed) {
            clearTimeout(this.recalcTO);
            this.recalcTO = setTimeout(function() {
                this.refresh();
            }.bind(this), shmi.c("ACTION_RETRY_TIMEOUT"));
        }
    },
    /**
     * sorts all data rows of the DataGrid by the specified column index in the
     * provided order.
     *
     * @param {type} col column index
     * @param {type} order sort order: 'ASC' for ascending, 'DESC' for descending
     */
    sort: function(col, order) {
        var old_order = this.order;
        if (col === -1) {
            this.order = null;
        } else {
            this.order = [col, order];
        }

        if (this.order !== old_order) {
            clearTimeout(this.recalcTO);
            this.recalcTO = setTimeout(function() {
                this.refresh();
            }.bind(this), shmi.c("ACTION_RETRY_TIMEOUT"));
        }
    },
    /**
     * returns row IDs of currently display rows.
     *
     * @param {integer} subID subscriber id
     * @returns {Array|shmi.visuals.core.DataGridDB.prototype.getCurrentIDs.id_arr}
     */
    getCurrentIDs: function(subID) {
        var id_arr = [],
            sub = this.subscribers[subID];
        if (sub !== undefined) {
            var i_end = (this.totalRows < (sub.offset + sub.size)) ? this.totalRows : (sub.offset + sub.size),
                i_start = sub.offset;
            for (var i = i_start; i < i_end; i++) {
                id_arr.push(i);
            }
        }
        return id_arr;
    },
    /**
     * returns all row IDs of the datagrid
     *
     * @deprecated to delete all entries use deleteAll function
     * @param {integer} subID subscriber id
     * @returns {shmi.visuals.core.DataGridDB.prototype.getAllIDs.id_arr|Array}
     */
    getAllIDs: function(subID) {
        var id_arr = [];
        for (var i = 0; i < this.totalRows; i++) {
            id_arr.push(i);
        }
        return id_arr;
    },
    /**
     *  retrieve values of a row as array
     *
     * @param {number} rowId row-ID of the data-row to fetch
     * @returns {object[]} row-data array
     */
    getRowData: function(rowId) {
        return (this.data[rowId] !== undefined) ? this.data[rowId] : null;
    },
    /**
     *
     * @private
     * @param {type} subID
     * @returns {shmi.visuals.core.DataGridDB.prototype._calcState.state}
     */
    _calcState: function(subID) {
        var sub = this.subscribers[subID],
            state = {};
        state.status = "OK";
        state.offset = sub.offset;
        state.totalRows = this.totalRows;

        return state;
    },
    /**
     * @private
     * @returns {undefined}
     */
    _doQuery: function() {
        var self = this,
            s = shmi.visuals.session,
            iter = shmi.requires("visuals.tools.iterate").iterateObject,
            sorting = null;
        /* delete row data */
        iter(self.data, function(val, key) {
            delete self.data[key];
        });

        var q_fields = [];
        for (var i = 0; i < self.fields.length; i++) {
            q_fields.push(self.fields[i]);
        }
        q_fields.push("ROWID");
        if (self.q_id !== undefined) {
            s.QueryManager.close(self.q_id);
            delete self.q_id;
        }
        var filter = {
                mode: self.filter.chaining,
                clauses: []
            },
            activeFilters = self.getFilters();

        activeFilters.forEach(function(filterSet, colIdx) {
            var clauses = [];
            if (filterSet !== null) {
                filterSet.forEach(function(filterValue, idx) {
                    clauses.push({
                        operator: "like",
                        value: filterValue
                    });
                });
                filter.clauses.push({
                    "mode": "OR",
                    "column": self.fields[colIdx],
                    "clauses": clauses
                });
            }
        });
        if (self.order !== null) {
            sorting = [
                {
                    column: self.fields[self.order[0]],
                    order: self.order[1]
                }
            ];
        }
        self.q_id = s.QueryManager.query(self._queryCB.bind(self), self.table, q_fields, filter, self.db, sorting);
    },
    /**
     * @private
     * @param {type} subID
     * @returns {undefined}
     */
    _loadData: function(subID) {
        if (this.subscribers[subID] === undefined) {
            this._nextTask();
            return;
        }
        var s = shmi.visuals.session,
            rc = this.subscribers[subID].size,
            off = this.subscribers[subID].offset;
        s.QueryManager.get(this._getLoadCB(subID, off), this.q_id, off, rc > this.totalRows ? this.totalRows : rc);
    },
    /**
     * @private
     * @param {type} status
     * @param {type} count
     * @param {type} rows
     * @returns {undefined}
     */
    _queryCB: function(status, count, rows) {
        var self = this;
        if (status === 0) {
            self.totalRows = count;
            self.nextRowID = self.totalRows;
        } else {
            shmi.notify("[DataGrid '<%= name %>'] Failed to query database (error code: <%= errc %>, message: <%= message %>, category: <%= category %>)", "${V_ERROR}", {
                name: self.name,
                errc: status.errc,
                message: status.message,
                category: status.category
            });
        }

        /* run next task if exists */
        self._nextTask();
    },
    /**
     * @private
     * @param {type} subID
     * @param {type} offset
     * @returns {Function}
     */
    _getLoadCB: function(subID, offset) {
        var makeCells = function(in_arr, rowId) {
            var cell_arr = [];
            for (var i = 0; i < in_arr.length; i++) {
                /* skip ROWID field */
                if (i === (in_arr.length - 1)) {
                    cell_arr.rowID = parseInt(in_arr[i]);
                } else {
                    var cell = {
                        type: shmi.c("TYPE_STRING"),
                        value: in_arr[i],
                        min: Number.NaN,
                        max: Number.NaN
                    };

                    cell_arr.push(cell);
                }
            }
            return cell_arr;
        };

        return function(status, query) {
            var dgm = shmi.visuals.session.DataGridManager,
                im = shmi.visuals.session.ItemManager,
                self = this;
            clearTimeout(self._loadTO);
            if ((status === 0) && (this.subscribers[subID] !== undefined)) {
                var start_i = offset;

                var end_i = (this.totalRows < (offset + this.subscribers[subID].size)) ? this.totalRows : (offset + this.subscribers[subID].size);
                this.reset_grid = true; // indicate that virtual items should not be written, since they are populated with original data
                for (var i = start_i; i < end_i; i++) {
                    var row_data = query.data[i - start_i];
                    this.data[i] = makeCells(row_data, i);
                    clearTimeout(this.data[i].timeout_id);
                    this.data[i].timeout_id = 0;
                    for (var j = 0; j < this.data[i].length; j++) {
                        var cell = this.data[i][j],
                            vItemName = this.prefix + i + ":" + j,
                            cellItem = im.getItem(vItemName);
                        if (cellItem && cellItem.initialized) {
                            cell.item = cellItem;
                        } else {
                            cell.item = shmi.createVirtualItem(vItemName, cell.type, cell.min, cell.max, cell.value,
                                (function(rid, cid) {
                                    return function(value, type, name) {
                                        if ((!this.data[rid]) || (!this.data[rid][cid])) {
                                            return;
                                        }

                                        var oldValue = this.data[rid][cid].value;
                                        this.data[rid][cid].value = value;
                                        if (this.reset_grid === true) {
                                            return;
                                        }

                                        if (oldValue === value) {
                                            return;
                                        }

                                        /* save changed row if grid is writable */
                                        if ((this.db % 2) !== 0) {
                                            clearTimeout(self.data[rid].timeout_id);
                                            self.data[rid].timeout_id = setTimeout(function() {
                                                if (shmi.visuals.session.config.debug === true) {
                                                    console.log("SAVING DATAGRID (DB2)", rid, self.data[rid]);
                                                }

                                                dgm.saveRowToDB(self.name, rid, false);
                                            }, shmi.c("DATAGRID_DB2_WRITE_DELAY"));
                                        }
                                        try {
                                            shmi.log("[DataGrid '" + this.name + "'] updated value: " + value, 1);
                                        } catch (exc) {
                                            shmi.log("[DataGrid '" + this.name + "'] failed to update value: " + exc, 2);
                                        }
                                    }.bind(this);
                                }.bind(this))(i, j)
                            );
                            cell.item.setDataGridInfo(this.name, i, j);
                        }
                        /* mark item as writable in case data is from read-only DB */
                        cell.item.writable = true;
                        cell.item.writeValue(cell.value);
                        /* mark items as read only if DB is configured as read only */
                        if ((this.db % 2) === 0) {
                            cell.item.writable = false;
                        }
                    }
                }
                this.reset_grid = false;
                /* we're done updating with original data now */
                this.subscribers[subID].onChange(this._calcState(subID));
            } else if (status !== 0) {
                shmi.notify("[DataGrid '<%= name %>'] Failed to load from database (error code: <%= errc %>, message: <%= message %>, category: <%= category %>)", "${V_ERROR}", {
                    name: self.name,
                    errc: status.errc,
                    message: status.message,
                    category: status.category
                });
            }

            /* run next task if exists */
            this._nextTask();
        }.bind(this);
    },
    /**
     * @private
     * @returns {undefined}
     */
    _nextTask: function() {
        var self = this;
        if (this.taskQueue.length > 0) {
            var task = this.taskQueue.shift();
            switch (task.type) {
            case 'query':
                if (shmi.visuals.session.config.debug === true) {
                    console.log("QUERY TASK");
                }
                this._doQuery();
                break;
            case 'load':
                if (shmi.visuals.session.config.debug === true) {
                    console.log("LOAD TASK");
                }
                this._loadData(task.subID);
                clearTimeout(this._loadTO);
                this._loadTO = setTimeout(function() {
                    console.error("task timeout", task);
                    self._nextTask();
                }, this.loadTimeout);
                break;
            case 'refresh':
                if (shmi.visuals.session.config.debug === true) {
                    console.log("REFRESH TASK - DISABLED");
                }
                //this.refresh();
                break;
            case 'delete':
                if (shmi.visuals.session.config.debug === true) {
                    console.log("DELETE TASK");
                }
                /* delete stuff */
                this._doDelete(task.rowID);
                break;
            case 'delete-all':
                if (shmi.visuals.session.config.debug === true) {
                    console.log("DELETE-ALL TASK");
                }
                this._doDeleteAll();
                break;
            default:
                shmi.notify("Unknown task type '<%= task_type %>", "${V_ERROR}", { task_type: task.type });
            }
        }
    },
    /**
     * @private
     * @param {type} rowID
     * @returns {undefined}
     */
    _doDelete: function(rowID) {
        if (rowID !== undefined) {
            if (rowID >= 0) {
                shmi.visuals.session.QueryManager.deleteRow(this.table, rowID, function() {
                    shmi.log("[DataGrid '" + this.name + "'] deleted row from DB " + this.db, 2);
                    this._nextTask();
                }.bind(this), this.db);
            } else {
                shmi.log("[DataGrid '" + this.name + "'] invalid ROW-ID " + rowID, 2);
                this._nextTask();
            }
        } else {
            shmi.log("[DataGrid '" + this.name + "'] invalid Grid-Data-ID " + rowID, 2);
            this._nextTask();
        }
    },
    /**
     * @private
     * @returns {undefined}
     */
    _doDeleteAll: function() {
        if (this.q_id !== undefined) {
            shmi.visuals.session.QueryManager.queries[this.q_id].deleteQuery();
        }
        this._nextTask();
    }
};

shmi.pkg("visuals.core");

shmi.visuals.core.DataGridDynamic = function(name, fields, create_index_column, index_name, index_begin, indexFields) {
    this.name = name;
    this.fields = fields || [];
    this.type = "DYNAMIC";
    this.data = {};
    this.subscribers = {};
    this.create_index = create_index_column === true;
    this.index_name = (index_name !== undefined) ? index_name : "INDEX";
    this.index_begin = (index_begin !== undefined) ? index_begin : 0;
    this.prefix = "virtual:grid:" + this.name + ":";
    this.totalRows = 0;
    this.order = "";
    this.filter = {
        chaining: "AND"
    };
    this.indexFields = indexFields || [];
    this.nextRowId = 0;
    this.length_sub_id = null;

    this.item_def_lid = null;
    this.update_all_TO = null;
    this.indexMap = {};
    this.indexFieldIndices = [];

    this.init();
};

shmi.visuals.core.DataGridDynamic.prototype = {
    getChangeHandler: function(rowid, cid) {
        const self = this;

        return (value, type, name) => {
            if (!self.data[rowid][cid].item) {
                return; //cancel callback when item no longer exists
            }
            if (self.data[rowid][cid].item.adapter) {
                value = self.data[rowid][cid].item.readValue(true);
                /* store value without adapter modifications */
            }
            try {
                const oldValue = self.data[rowid][cid].value;

                self.data[rowid][cid].value = value;

                if (oldValue !== value) {
                    shmi.fire("grid-changed", {
                        grid: self,
                        row: rowid,
                        cell: cid,
                        field: self.fields[cid],
                        lastValue: self.data[rowid][cid].value,
                        value: value
                    }, self);
                }
            } catch (exc) {
                shmi.log("[DataGrid '" + self.name + "'] failed to update value: " + exc, 2);
            }
        };
    },
    getIndexString: function getIndexString(rowId) {
        return JSON.stringify(this.indexFieldIndices.map((idx) => this.data[rowId][idx].value));
    },
    init: function() {
        var self = this;

        /* add index to field list if configured and not already present */
        if ((self.create_index === true) && (self.fields.indexOf(self.index_name) === -1)) {
            self.fields.push(self.index_name);
        }

        //initialize index field indices
        const fields = [];
        this.indexFields.forEach((el) => {
            const index = this.fields.indexOf(el);
            if (index !== -1) {
                fields.push(index);
            } else {
                shmi.log("[DataGrid '" + this.name + "'] index field not found: " + el, 3);
            }
        });
        this.indexFieldIndices = fields;
    },
    setFields: function(fields) {
        this.fields = fields;
        /* add index if configured */
        this.init();
    },
    getFields: function() {
        return this.fields;
    },
    /**
     * getIndexFields - get indices of index fields
     *
     * @return {number[]}  array of field indices
     */
    getIndexFields: function() {
        return this.indexFieldIndices;
    },
    /**
     * getRowIndex - get values of index fields for specified row-ID
     *
     * @param  {number} rowId datagrid-row ID
     * @return {array} array of index field values
     */

    getRowIndex: function(rowId) {
        if (!this.data[rowId]) {
            return null;
        }
        return this.indexFieldIndices.map((el) => this.data[rowId][el].value);
    },
    /**
     * searchIndexRowId - description
     *
     * @param  {array} rowIndex array of index field values
     * @return {number} datagrid-row ID matching index values or -1 if not found
     */
    searchIndexRowId: function(rowIndex) {
        const indexedId = this.indexMap[JSON.stringify(rowIndex)];

        return (typeof indexedId === "number") ? indexedId : -1;
    },
    /**
     * searchIndexFields - test if index fields of row match specified index values
     *
     * @param  {number} row datagrid-row ID
     * @param  {number[]} fields index field indices
     * @param  {array} rowIndex index field values
     * @return {boolean} `true` if found, `false` else
     */
    searchIndexFields: function(row, fields, rowIndex) {
        var self = this,
            found = 0;

        if (!self.data[row]) {
            return false;
        }

        fields.forEach(function(field, idx) {
            if (self.data[row][field] && (self.data[row][field].value === rowIndex[idx])) {
                found++;
            }
        });
        if (found > 0 && found === fields.length) {
            return true;
        } else {
            return false;
        }
    },
    /**
     * sets the chaining for filter expressions - used to search multiple columns
     *
     * @param {string} set chaining to AND or OR
     */
    setFilterChaining: function(chaining) {
        var self = this;
        if (chaining === "OR" || chaining === "AND") {
            self.filter.chaining = chaining;
        } else {
            console.error("[DataGridDynamic] invalid filter chaining mode:", chaining);
        }
    },
    /**
     * Inserts the specified row-data into the DataGrid and returns the newly created row-id.
     *
     * @param {object[]} rowData
     * @returns {Number} newly created row-ID
     */
    insertRow: function(rowData, rid, no_notify) {
        var self = this,
            rowId = 0;
        if (rid !== undefined) {
            rowId = rid;
        } else {
            rowId = self.nextRowId++;
        }

        const indexFields = self.indexFieldIndices;
        if (indexFields.length && self.data[rowId]) {
            const oldIndexString = this.getIndexString(rowId);
            if (self.indexMap[oldIndexString] === rowId) { //only delete if it hasn't been replaced / moved yet
                delete self.indexMap[oldIndexString];
            }
        }
        self.data[rowId] = shmi.cloneObject(rowData);
        if (indexFields.length) {
            self.indexMap[this.getIndexString(rowId)] = rowId;
        }
        for (var i = 0; i < rowData.length; i++) {
            var cell = rowData[i],
                vItemName = "virtual:grid:" + self.name + ":" + rowId + ":" + i;
            /* keep reference to virtual item on data object */
            self.data[rowId][i].item = shmi.createVirtualItem(vItemName, cell.type, cell.min, cell.max, cell.value,
                self.getChangeHandler(rowId, i)
            );
            self.data[rowId][i].item.setDataGridInfo(self.name, rowId, i);
        }

        if (self.create_index) {
            var idx_cell = {
                type: shmi.c("TYPE_INT"),
                value: self.index_begin + (Object.keys(self.data).length - 1),
                min: Number.NaN,
                max: Number.NaN,
                item: null,
                item_name: "virtual:grid:" + self.name + ":" + rowId + ":" + rowData.length
            };
            idx_cell.item = shmi.createVirtualItem(idx_cell.item_name, idx_cell.type, idx_cell.min, idx_cell.max, idx_cell.value, () => {});
            idx_cell.item.setDataGridInfo(self.name, rowId, rowData.length);
            self.data[rowId].push(idx_cell);
        }

        if (typeof self.onInsert === "function") {
            self.onInsert(rowData, rid, no_notify, function() {
                if (!no_notify) {
                    self._updateSubscriber();
                }
                shmi.fire('grid-insert-row', { rowId: rowId, rowData: self.data[rowId], grid: self });
            });
        } else {
            if (!no_notify) {
                self._updateSubscriber();
            }
            shmi.fire('grid-insert-row', { rowId: rowId, rowData: self.data[rowId], grid: self });
        }

        return rowId;
    },
    deleteRow: function(rowId) {
        const self = this,
            im = shmi.visuals.session.ItemManager,
            indexFields = self.indexFieldIndices;

        if (shmi.objectHasOwnProperty(self.data, rowId)) {
            self.data[rowId].forEach(function(cell) {
                if (!cell.item) {
                    return;
                }
                im.removeItem(cell.item.name);
                delete cell.item;
            });

            const rowData = self.data[rowId];
            if (indexFields.length && self.data[rowId]) {
                delete self.indexMap[self.getIndexString(rowId)];
            }
            delete self.data[rowId];

            if (typeof self.onDelete === "function") {
                self.onDelete(rowId, function() {
                    self._updateSubscriber();
                    shmi.fire('grid-delete-row', { rowId: rowId, rowData: rowData, grid: self });
                });
            } else {
                self._updateSubscriber();
                shmi.fire('grid-delete-row', { rowId: rowId, rowData: rowData, grid: self });
            }
        }
    },
    deleteAll: function() {
        var self = this,
            im = shmi.visuals.session.ItemManager,
            iter = shmi.requires("visuals.tools.iterate.iterateObject");
        iter(self.data, function(val, id) {
            self.data[id].forEach(function(cell) {
                if (!cell.item) {
                    return;
                }
                im.removeItem(cell.item.name);
                delete cell.item;
            });
            delete self.data[id];
        });
        self.totalRows = 0;
        self.nextRowId = 0;
        self.indexMap = {};

        if (typeof self.onDeleteAll === "function") {
            self.onDeleteAll(function() {
                self._updateSubscriber();
                shmi.fire('grid-delete-all', { grid: self });
            });
        } else {
            self._updateSubscriber();
            shmi.fire('grid-delete-all', { grid: self });
        }
    },
    subscribePage: function(offset, size, onChange) {
        var self = this,
            tmp_id = Date.now();
        while (self.subscribers[tmp_id] !== undefined) {
            tmp_id++;
        }

        var sub = {};
        sub.id = tmp_id;
        sub.offset = offset;
        sub.size = size;
        sub.onChange = onChange;

        self.subscribers[tmp_id] = sub;

        var ret_sub = {};
        ret_sub.id = tmp_id;
        ret_sub.prefix = self.prefix;

        if (typeof this.onSubscribe === "function") {
            /* run custom implementation on datagrid object if implemented (paging)*/
            this.onSubscribe(offset, size, function() {
                /* return onChange after ret_sub is delivered to caller */
                self._updateSubscriber(tmp_id);
            });
        } else {
            /* return onChange after ret_sub is delivered to caller */
            self._updateSubscriber(tmp_id);
        }

        return ret_sub;
    },
    _updateSubscriber: function(subID) {
        var self = this,
            iter = shmi.requires("visuals.tools.iterate.iterateObject");
        if (subID !== undefined) {
            shmi.decouple(function() {
                if (self.subscribers[subID] !== undefined) {
                    var info_obj = self._calcState(subID);
                    self.subscribers[subID].onChange(info_obj);
                }
            });
        } else {
            clearTimeout(self.update_all_TO);
            self.update_all_TO = setTimeout(function() {
                iter(self.subscribers, function(val, sub_id) {
                    var info_obj = self._calcState(sub_id);
                    self.subscribers[sub_id].onChange(info_obj);
                });
            }, shmi.c("DECOUPLE_TIMEOUT"));
        }
    },
    unsubscribe: function(subID) {
        delete this.subscribers[subID];
    },
    setOffset: function(offset, subID) {
        var self = this;
        if (self.subscribers[subID] !== undefined) {
            self.subscribers[subID].offset = offset;
            if (typeof self.onSetOffset === "function") {
                self.onSetOffset(offset, subID, function() {
                    var info_obj = self._calcState(subID);
                    self.subscribers[subID].onChange(info_obj);
                });
            } else {
                shmi.raf(function() {
                    var info_obj = self._calcState(subID);
                    self.subscribers[subID].onChange(info_obj);
                });
            }
        }
    },
    getRowCount: function() {
        return this.totalRows;
    },
    setFilter: function(col, expression) {
        var self = this;
        if (typeof self.onSetFilter === "function") {
            self.onSetFilter(col, expression, function() {
                shmi.fire('grid-set-filter', {
                    grid: self,
                    type: self.type,
                    column: col,
                    field: self.fields[col],
                    expression: expression
                });
            });
        } else {
            shmi.fire('grid-set-filter', {
                grid: self,
                type: self.type,
                column: col,
                field: self.fields[col],
                expression: expression
            });
        }
    },
    getFilters: function() {
    },
    clearFilter: function(col) {
        var self = this;
        if (typeof self.onClearFilter === "function") {
            self.onClearFilter(col, function() {
                shmi.fire('grid-clear-filter', {
                    grid: self,
                    type: self.type,
                    column: col,
                    field: (self.fields[col] === undefined) ? null : self.fields[col]
                });
            });
        } else {
            shmi.fire('grid-clear-filter', {
                grid: self,
                type: self.type,
                column: col,
                field: (self.fields[col] === undefined) ? null : self.fields[col]
            });
        }
    },
    refresh: function() {
        var self = this;
        if (typeof self.onRefresh === "function") {
            self.onRefresh(function() {
                shmi.fire('grid-refresh', { grid: self, type: self.type });
            });
        } else {
            shmi.fire('grid-refresh', { grid: self, type: self.type });
        }
    },
    sort: function(col, order) {
        var self = this;
        if (typeof self.onSort === "function") {
            self.onSort(col, order, function() {
                shmi.fire('grid-sort', {
                    grid: self,
                    type: self.type,
                    column: col,
                    field: self.fields[col],
                    order: order
                });
            });
        } else {
            shmi.fire('grid-sort', { grid: self, type: self.type, column: col, field: self.fields[col], order: order });
        }
    },
    /**
     * returns row IDs of currently display rows.
     *
     * @param {integer} subID subscriber id
     * @returns {Array|shmi.visuals.core.DataGridDB.prototype.getCurrentIDs.id_arr}
     */
    getCurrentIDs: function(subID) {
        var id_arr = [],
            sub = this.subscribers[subID];
        if (sub !== undefined) {
            var i_end = (this.totalRows < (sub.offset + sub.size)) ? this.totalRows : (sub.offset + sub.size),
                i_start = sub.offset;
            for (var i = i_start; i < i_end; i++) {
                id_arr.push(i);
            }
        }
        return id_arr;
    },
    /**
     * returns all row IDs of the datagrid
     *
     * @deprecated to delete all entries use deleteAll function
     * @param {integer} subID subscriber id
     * @returns {shmi.visuals.core.DataGridDB.prototype.getAllIDs.id_arr|Array}
     */
    getAllIDs: function(subID) {
        var id_arr = [];
        for (var i = 0; i < this.totalRows; i++) {
            id_arr.push(i);
        }
        return id_arr;
    },
    getRowData: function(rowID) {
        return (this.data[rowID]) ? this.data[rowID] : null;
    },
    /**
     *
     * @private
     * @param {type} subID
     * @returns {shmi.visuals.core.DataGridDB.prototype._calcState.state}
     */
    _calcState: function(subID) {
        var self = this;
        self.totalRows = Object.keys(self.data).length;
        var sub = self.subscribers[subID],
            state = {};
        state.status = "OK";
        state.offset = sub.offset;
        state.totalRows = self.totalRows;

        return state;
    }
};

(function() {
    shmi.pkg("visuals.core");

    /**
     * getFieldValue - retrieve value of named datagrid field
     *
     * @param  {object} alarmInfo alarm info object
     * @param  {string} fieldName name of datagrid field
     * @return {*}
     */
    function getFieldValue(alarmInfo, fieldName) {
        switch (fieldName) {
        case "id":
            return alarmInfo.id;
        case "status":
            return alarmInfo.acknowledgeable && !alarmInfo.acknowledged;
        case "json":
            return JSON.stringify(alarmInfo);
        case "title":
            return shmi.evalString(shmi.localize(`\${alarm_title_${alarmInfo.index}}`), alarmInfo);
        case "group_title":
            return shmi.evalString(shmi.localize(`\${alarm_group_${alarmInfo.group}}`), alarmInfo);
        default:
            return typeof (alarmInfo[fieldName]) !== "undefined" ? alarmInfo[fieldName] : null;
        }
    }

    /**
     * alarmCallback - callback to handle creation of datagrid rows from incoming alarm data
     *
     * @param {DataGridIQAlarms} self datagrid instance reference
     * @param {object} alarmInfo alarm info object
     * @param {boolean} isLast `true` if alarm is last to be inserted
     * @return {undefined}
     */
    function alarmCallback(self, alarmInfo, isLast) {
        if (isLast) updateDataGrid(self, true);
    }

    /**
     * makeRowFromAlarmInfo - handle creation of datagrid rows from incoming alarm data
     *
     * @param {DataGridIQAlarms} self datagrid instance reference
     * @param {object} alarmInfo alarm info object
     * @param {number} index row index
     * @param {boolean} isLast `true` if alarm is last to be inserted
     * @return {undefined}
     */
    function makeRowFromAlarmInfo(self, alarmInfo, index, isLast) {
        const nv = shmi.requires("visuals.tools.numericValues"),
            uc = shmi.visuals.tools.unitClasses,
            rowData = [];

        // Historic alarms and live alarms use different properties - woops.
        alarmInfo.items = alarmInfo.context;
        //Add "formattedValue" & "unitText" property for more convenient value display
        alarmInfo.items.forEach((itemInfo) => {
            Object.defineProperty(itemInfo, "formattedValue", {
                enumerable: true,
                configurable: false,
                get: () => {
                    if (typeof itemInfo.value === "number") {
                        return nv.formatNumber(itemInfo.value, {
                            "precision": itemInfo.digits,
                            "unit": itemInfo.unit,
                            "show-unit": false
                        });
                    } else {
                        return itemInfo.value;
                    }
                }
            });

            Object.defineProperty(itemInfo, "unitText", {
                enumerable: true,
                configurable: false,
                get: () => {
                    if (typeof itemInfo.unit === "number") {
                        const adapter = uc.getSelectedAdapter(itemInfo.unit);
                        if (adapter) {
                            return adapter.unitText;
                        }
                    }
                    return itemInfo.unit;
                }
            });
        });

        self.fields.forEach(function(fName, idx) {
            const fieldValue = getFieldValue(alarmInfo, fName),
                fieldType = (typeof fieldValue);
            switch (fieldType) {
            case "string":
                rowData.push({
                    type: shmi.c("TYPE_STRING"),
                    value: fieldValue,
                    min: null,
                    max: null
                });
                break;
            case "boolean":
                rowData.push({
                    type: shmi.c("TYPE_BOOL"),
                    value: fieldValue ? 1 : 0,
                    min: 0,
                    max: 1
                });
                break;
            case "number":
                rowData.push({
                    type: shmi.c("TYPE_FLOAT"),
                    value: fieldValue,
                    min: Number.NaN,
                    max: Number.NaN
                });
                break;
            default:
                rowData.push({
                    type: shmi.c("TYPE_STRING"),
                    value: "NULL",
                    min: Number.NaN,
                    max: Number.NaN
                });
            }
        });
        self.insertRow(rowData, index, !isLast);
    }

    /**
     * createVirtualItem - create virtual items for datagrid cell use and set datagrid info
     *
     * @param  {DataGridIQAlarms} self datagrid instance reference
     * @param  {string} iname virtual item name
     * @param  {object} cell  cell info object
     * @param  {number|undefined} rowId datagrid row ID
     * @param  {number} idx datagrid cell index
     * @return {Item} created virtual item
     */
    function createVirtualItem(self, iname, cell, rowId, idx) {
        const im = shmi.requires("visuals.session.ItemManager"),
            existingItem = im.getItem(iname);
        let itm = null;

        if (existingItem && existingItem.initialized) {
            if (existingItem.readValue() !== cell.value) {
                existingItem.writeValue(cell.value);
            }
            return existingItem;
        } else {
            itm = shmi.createVirtualItem(iname, cell.type, cell.min, cell.max, cell.value, null);
            itm.setDataGridInfo(this.name, rowId, idx);
            return itm;
        }
    }

    /**
     * updateSubscribers - updates all datagrid subscribers
     *
     * @param  {DataGridIQAlarms} self datagrid instance reference
     * @param  {boolean} keepOffsets keep offsets
     */
    function updateSubscribers(self) {
        const iter = shmi.requires("visuals.tools.iterate").iterateObject,
            timeNow = Date.now();

        iter(self.subscribers, function(val, id) {
            self.subscribers[id].lastUpdate = timeNow;
            self.subscribers[id].onChange(self._calcState(id));
        });
        self.lastStateUpdate = timeNow;
    }

    /**
     * attachFilter - attaches a filter object to the request object
     *
     * @param  {object} reqObj request object
     * @param  {DataGridIQAlarms} self datagrid instance reference
     */
    function attachFilter(reqObj, self) {
        const severity = self.fields[3],
            timestamp_in = self.fields[4];

        if (self.filter[severity] || self.filter[timestamp_in]) {
            reqObj.filter = {
                "mode": "AND",
                "clauses": []
            };

            if (self.filter[timestamp_in]) {
                reqObj.filter.clauses.push({
                    "mode": "AND",
                    "column": timestamp_in,
                    "location": "property",
                    "clauses": [
                        {
                            "operator": ">=",
                            "value": self.filter[timestamp_in][0] * 10000000
                        },
                        {
                            "operator": "<",
                            "value": self.filter[timestamp_in][1] * 10000000
                        }
                    ]
                });
            }

            if (self.filter[severity]) {
                const subFilterObj = {
                    "mode": "OR",
                    "column": severity,
                    "location": "property",
                    "clauses": []
                };
                self.filter[severity].forEach(function(el) {
                    subFilterObj.clauses.push({
                        "operator": "=",
                        "value": el
                    });
                });
                reqObj.filter.clauses.push(subFilterObj);
            }
        }
        return reqObj;
    }

    /**
     * updateDataGrid - handles the generation of queries or sets the another flag
     *
     * @param  {DataGridIQAlarms} self datagrid instance reference
     */

    function updateDataGrid(self, keepOffsets) {
        const iter = shmi.requires("visuals.tools.iterate").iterateObject;
        if (keepOffsets !== true) {
            iter(self.subscribers, function(val, id) {
                self.subscribers[id].offset = 0;
            });
            self.reqOffset = 0;
        }

        if (self.isQueryRunning) {
            self.needAnotherQuery = true;
        } else {
            sendAlarmQuery(self);
        }
    }

    /**
     * sendAlarmQuery - dispatches the alarm query and finally update grid
     * @param  {DataGridIQAlarms} self datagrid instance reference
     */

    function sendAlarmQuery(self) {
        const request = shmi.requires("visuals.tools.connect").request;

        let reqObj = {
            "mode": self.displayMode,
            "sort": self.filterSort,
            "limit": self.reqSize,
            "offset": self.reqOffset
        };

        reqObj = attachFilter(reqObj, self);

        self.isQueryRunning = true;
        self.needAnotherQuery = false;

        request("alarm.query", reqObj, function onRequest(response, err) {
            self.isQueryRunning = false;

            if (self.needAnotherQuery) {
                sendAlarmQuery(self);
            }
            if (err) {
                console.error("[AlarmManager] getAllAlarms failed:", err.category, err.errc, err.message);
            } else {
                self.data = {};
                response.alarms.forEach(function(el, idx) {
                    makeRowFromAlarmInfo(self, el, idx, false);
                });

                self.totalRows = response.total_count;
                const timeNow = Date.now();
                if (self.stateTO) clearTimeout(self.stateTO);
                self.stateTO = 0;
                if (timeNow - self.lastStateUpdate > self.refreshTimeout) {
                    shmi.decouple(self.updateSubscribers.bind(self));
                } else {
                    self.stateTO = setTimeout(self.updateSubscribers.bind(self), self.refreshTimeout);
                }
            }
        });
    }

    /**
     * DataGrid structure for storage and interaction with connect alarms.
     *
     * @private
     * @constructor
     */
    shmi.visuals.core.DataGridIQAlarms = function(displayMode, gridId) {
        this.name = gridId;
        this.fields = ["id", "index", "status", "severity", "timestamp_in", "active", "timestamp_out", "group", "json", "title", "group_title"];
        this.type = "ALARMS";
        this.data = {};
        this.subscribers = {};
        this.prefix = "virtual:grid:" + this.name + ":";
        this.totalRows = 0;
        this.order = [0, "ASC"];
        this.filter = {};
        this.defaultSort = [{
            "column": "timestamp_in",
            "order": "DESC"
        }];
        this.filterSort = this.defaultSort;
        this.defaultOffset = 0;
        this.defaultSize = 500;
        this.reqOffset = this.defaultOffset;
        this.reqSize = this.defaultSize;
        this._subID = null;
        this.AM = shmi.visuals.session.AlarmManager;
        this.indexFields = ["id"];
        this.lastStateUpdate = 0;
        this.stateTO = 0;
        this.singleStateTO = 0;
        this.displayMode = displayMode;
        this.refreshTimeout = 150;
        this.isQueryRunning = false;
        this.needAnotherQuery = false;
        this.indexMap = {};
        this.indexFieldIndices = [];

        this.init();
    };

    shmi.visuals.core.DataGridIQAlarms.prototype = {
        getIndexString: function getIndexString(rowId) {
            return JSON.stringify(this.indexFieldIndices.map((idx) => this.data[rowId][idx].value));
        },
        init: function() {
            //initialize index field indices
            const fields = [];
            this.indexFields.forEach((el) => {
                const index = this.fields.indexOf(el);
                if (index !== -1) {
                    fields.push(index);
                } else {
                    shmi.log("[DataGrid '" + this.name + "'] index field not found: " + el, 3);
                }
            });
            this.indexFieldIndices = fields;
        },
        /**
         * sets the requested display mode
         *
         * @param {string} mode display mode ('all', 'live', 'historic')
         */
        setDisplayMode: function(mode) {
            const self = this;

            self.displayMode = mode;
            updateDataGrid(self, false);
        },
        /**
         * Creates a subscription to this data-grid.
         *
         * @param   {number}   offset   data-row offset
         * @param   {number}   size     number of data-rows to retrieve
         * @param   {function} onChange callback function, run when data-grid changes
         * @returns {object}   subscription token
         */
        subscribePage: function(offset, size, onChange) {
            const self = this;
            let tmp_id = Date.now();

            self.reqOffset = offset;
            self.reqSize = size;

            while (self.subscribers[tmp_id] !== undefined) {
                tmp_id++;
            }

            self.subscribers[tmp_id] = {
                id: tmp_id,
                offset: offset,
                size: size,
                onChange: onChange,
                lastUpdate: 0
            };

            /* subscribe to AlarmManager if first subscriber */
            if (Object.keys(self.subscribers).length === 1) {
                if (self.displayMode !== "live") {
                    updateDataGrid(self, false);
                }
                self._subID = self.AM.subscribeAlarms(self, alarmCallback.bind(null, self));
            }
            shmi.decouple(function() {
                self.subscribers[tmp_id].lastUpdate = Date.now();
                self.subscribers[tmp_id].onChange(self._calcState(tmp_id));
            });

            const ret_sub = {
                id: tmp_id,
                prefix: self.prefix
            };

            return ret_sub;
        },
        /**
         * Returns array of field-names for this data-grid.
         *
         * @returns {string[]} field-names
         */
        getFields: function(yt) {
            return this.fields;
        },
        /**
         * getIndexFields - get indices of index fields
         *
         * @return {number[]}  array of field indices
         */
        getIndexFields: function() {
            return this.indexFieldIndices;
        },
        /**
         * getRowIndex - get values of index fields for specified row-ID
         *
         * @param  {number} rowId datagrid-row ID
         * @return {array} array of index field values
         */
        getRowIndex: function(rowId) {
            if (!this.data[rowId]) {
                return null;
            }
            return this.indexFieldIndices.map((el) => this.data[rowId][el].value);
        },
        /**
         * searchIndexRowId - description
         *
         * @param  {array} rowIndex array of index field values
         * @return {number} datagrid-row ID matching index values or -1 if not found
         */
        searchIndexRowId: function(rowIndex) {
            const indexedId = this.indexMap[JSON.stringify(rowIndex)];

            return (typeof indexedId === "number") ? indexedId : -1;
        },
        /**
         * searchIndexFields - test if index fields of row match specified index values
         *
         * @param  {number} row datagrid-row ID
         * @param  {number[]} fields index field indices
         * @param  {array} rowIndex index field values
         * @return {boolean} `true` if found, `false` else
         */
        searchIndexFields: function(row, fields, rowIndex) {
            const self = this;
            let found = 0;

            if (!self.data[row]) {
                return false;
            }

            fields.forEach(function(field, idx) {
                if (self.data[row][field] && (self.data[row][field].value === rowIndex[idx])) {
                    found++;
                }
            });
            if (found > 0 && found === fields.length) {
                return true;
            } else {
                return false;
            }
        },
        /**
         * Inserts the specified row-data into the DataGrid and returns the newly created row-id.
         *
         * @param {object[]} rowData
         * @param {Number} rid row id from response
         * @returns {Number} newly created row-ID
         */
        insertRow: function(rowData, rid) {
            const self = this,
                rowId = rid;

            if (typeof rid === "undefined") {
                console.error("DataGridIQAlarms", "no row-index specified on insertRow");
                return null;
            }

            const indexFields = self.indexFieldIndices;
            if (indexFields.length && self.data[rowId]) {
                delete self.indexMap[this.getIndexString(rowId)];
            }

            if (this.data[rowId] === undefined) {
                this.data[rowId] = rowData;
            }

            rowData.forEach((cell, i) => {
                const vItemName = `virtual:grid:${this.name}:${rowId}:${i}`;

                /* keep reference to virtual item on data object */
                this.data[rowId][i].item = createVirtualItem(self, vItemName, cell, rowId, i);
                this.data[rowId][i].value = cell.value;
            });

            if (indexFields.length) {
                self.indexMap[this.getIndexString(rowId)] = rowId;
            }

            return rowId;
        },
        /**
         * Acknowledges alarm of specified data-grid row.
         *
         * @param {number} rowID data-grid row index
         */
        deleteRow: function(rowID) {
            if (Array.isArray(rowID)) {
                rowID.forEach((id) => {
                    if (this.data[id] !== undefined) {
                        this.AM.ackAlarm(this.data[id][0].value);
                        /* ack single alarm */
                    } else {
                        shmi.log("[DataGridIQAlarms] alarm not found row-id=" + id, 2);
                    }
                });
            } else if (this.data[rowID] !== undefined) {
                this.AM.ackAlarm(this.data[rowID][0].value);
                /* ack single alarm */
            } else {
                shmi.log("[DataGridIQAlarms] alarm not found row-id=" + rowID, 2);
            }
        },
        /**
         * Acknowledges all active alarms.
         *
         */
        deleteAll: function() {
            /* ack all active alarms */
            this.AM.ackAlarm(-1);
        },
        /**
         * Unsubscribes from updates to this data-grid.
         *
         * The subscription ID parameter corresponds to the 'id' property of the subscription
         * token returned by `subscribePage`.
         *
         * @param {number} subID subscription id
         */
        unsubscribe: function(subID) {
            const self = this,
                sessionConfig = shmi.visuals.session.config,
                iter = shmi.requires("visuals.tools.iterate").iterateObject;

            delete self.subscribers[subID];

            /* if no clients left ... */
            if ((Object.keys(self.subscribers).length === 0) && (sessionConfig && sessionConfig["disable-alarm-prefetch"])) {
                /* unsubscribe from AlarmManager */
                self.AM.unsubscribeAlarms(self._subID);
                /* delete row data */
                iter(self.data, function(val, key) {
                    for (let i = 0; i < self.data[key].length; i++) {
                        shmi.visuals.session.ItemManager.removeItem(self.data[key][0].item.name);
                    }
                    delete self.data[key];
                });
                self.indexMap = {};
            }
        },
        /**
         * Move data-row offset for specified subscription ID.
         *
         * The subscription ID parameter corresponds to the 'id' property of the subscription
         * token returned by `subscribePage`.
         *
         * @param {number} offset data-row offset (>0)
         * @param {number} subID  subscription ID
         */
        setOffset: function(offset, subID) {
            const self = this,
                sub = self.subscribers[subID];

            if (sub !== undefined) {
                if (offset > self.totalRows) {
                    offset = self.totalRows;
                }
                self.reqOffset = offset;
                sub.offset = offset;
                updateDataGrid(self, true);
            }
        },
        /**
         * Retrieves the number of rows in this DataGrid.
         *
         * @returns {number} number of rows
         */
        getRowCount: function() {
            return this.totalRows;
        },
        /**
         * filters the specified column for entries matching the specified expression.
         *
         * @param {number} col column index to filter
         * @param {number|number[]} filter expression
         */
        setFilter: function(col, expression) {
            const self = this;

            self.filter[self.fields[col]] = expression;
            updateDataGrid(self, false);
        },
        /**
         * returns active filter expression for each data column
         *
         * @returns {string[]} active filter expressions
         */
        getFilters: function() {
            const self = this;

            return self.fields.map(
                (field) => self.filter[field] || null
            );
        },
        /**
         * Clears applied filter for the specified column. All filters can be cleared
         * with column index -1. Only column index 2 supports filtering
         *
         * @param {number} col index of column to clear filter, `-1` to clear all
         */
        clearFilter: function(col) {
            const self = this;

            delete (self.filter[self.fields[col]]);
            updateDataGrid(self, false);
        },
        /**
         * triggers update of all subscribers
         */
        updateSubscribers: function() {
            const self = this;
            updateSubscribers(self);
        },
        /**
         * sorts all data rows of the DataGrid by the specified column index in the
         * provided order.
         *
         * @param {number} col column index
         * @param {string} order sort order: 'ASC' for ascending, 'DESC' for descending
         * @param {boolean} [keepOffsets] set to `true` to leave subscriber offsets unchanged
         */
        sort: function(col, ord, keepOffsets) {
            const self = this;
            if (col === -1) {
                self.filterSort = self.defaultSort;
            } else {
                self.filterSort = [{
                    "column": self.fields[col],
                    "order": ord
                }];
            }
            updateDataGrid(self, keepOffsets);
        },
        /**
         * returns row IDs of currently displayed rows.
         *
         * @param {integer} subID subscriber id
         * @returns {Array|shmi.visuals.core.DataGridIQAlarms.prototype.getCurrentIDs.id_arr}
         */
        getCurrentIDs: function(subID) {
            const id_arr = [],
                sub = this.subscribers[subID],
                keys = Object.keys(this.data);

            for (let i = 0; i < sub.size; i++) {
                if (keys[i] !== undefined) {
                    id_arr.push(parseInt(keys[i]));
                } else {
                    break;
                }
            }
            return id_arr;
        },
        /**
         * returns all row IDs of the datagrid
         *
         * @deprecated to delete all entries use deleteAll function
         * @param {integer} subID subscriber id
         * @returns {shmi.visuals.core.DataGridIQAlarms.prototype.getAllIDs.id_arr|Array}
         */
        getAllIDs: function(subID) {
            return Object.keys(this.data).map((key) => parseInt(key));
        },
        /**
         *  retrieve values of a row as array
         *
         * @param {number} rowId row-ID of the data-row to fetch
         * @returns {object[]} row-data array
         */
        getRowData: function(rowId) {
            return (this.data[rowId] !== undefined) ? this.data[rowId] : null;
        },
        /**
         *
         * @private
         * @param {type} subID
         * @returns {shmi.visuals.core.DataGridIQAlarms.prototype._calcState.state}
         */
        _calcState: function(subID) {
            const sub = this.subscribers[subID];

            return {
                status: 'OK',
                totalRows: this.totalRows,
                offset: Math.min(sub.offset, Math.max(this.totalRows - 1, 0)) //ensure offset is not larger than dataset
            };
        }
    };
}());
shmi.pkg("visuals.core");

/**
 * Manager for data-grids holding tabular data to be used with the table control.
 *
 * An instance of DataGridManager is automatically instanced during initialization and may be referenced via `shmi.visuals.session.DataGridManager`.
 *
 * @constructor
 */
shmi.visuals.core.DataGridManager = function() {
    this.grids = {};
    this.initialized = false;

    this.loadGridMap();
};

shmi.visuals.core.DataGridManager.prototype = {
    restart: function() {
        var self = this,
            iter = shmi.requires("visuals.tools.iterate.iterateObject");
        iter(self.grids, function(val, name) {
            self.grids[name].init();
        });
    },
    loadGridMap: function() {
        shmi.loadResource(
            shmi.c("DGM_GRID_MAP_PATH"), this.applyGridMap.bind(this)
        );
    },
    applyGridMap: function(response, failed, url) {
        this.config = this.config || {};
        /* init alarms grid */
        var DG = new shmi.visuals.core.DataGridAlarms();
        this.grids["alarms"] = DG;
        /* init alarms-historic grid */
        this.grids["alarms-historic"] = new shmi.visuals.core.DataGridAlarmsHistoric();

        if (!failed) {
            this.grid_map = {};
            try {
                this.grid_map = JSON.parse(response, url).grids;
            } catch (exc) {
                console.error("[DataGridManager] failed to parse datagrid map:", url, exc);
            }
            if (Array.isArray(this.grid_map) && (this.grid_map.length > 0)) {
                this.loadGrid();
            } else {
                this.grid_map = [];
                this.applyGrid("", true);
            }
        } else {
            shmi.log("[GridManager] grid map not found - 404", 2);
            this.grid_map = [];
            this.applyGrid("", true);
        }
    },
    loadGrid: function() {
        shmi.loadResource(
            shmi.evalString(shmi.c("GRID_PATH_PATTERN"), { name: this.grid_map.shift() }), this.applyGrid.bind(this)
        );
    },
    /**
     * Retrieves reference to data-grid of specified name.
     *
     * @param   {string} name data-grid name
     * @returns {object} data-grid reference or null if no data-grid of specified name exists
     */
    getGrid: function(name) {
        if (this.grids[name] !== undefined) {
            return this.grids[name];
        }
        return null;
    },
    /**
     * Subscribes to a database grid using transparent paging
     *
     * @param {string} name grid name
     * @param {integer} offset initial offset
     * @param {integer} size number of entries per page
     * @param {function} onChange callback function run if grid content changed
     * @returns {object} subscription info
     */
    subscribePage: function(name, offset, size, onChange) {
        if (this.grids[name] !== undefined) {
            if (this.grids[name].subscribePage) {
                return this.grids[name].subscribePage(offset, size, onChange);
            }
        }
        return null;
    },
    /**
     * Changes the current offset of a transparent paging database grid. Only
     * affects DB2 type grids.
     *
     * @param {string} name grid name
     * @param {integer} offset new offset
     * @param {integer} subID subscriber id
     * @returns {undefined}
     */
    setOffset: function(name, offset, subID) {
        if (this.grids[name] !== undefined) {
            if (this.grids[name].setOffset) {
                this.grids[name].setOffset(offset, subID);
            }
        }
    },
    /**
     * sorts all data rows of the DataGrid by the specified column index in the
     * provided order.
     *
     * @param {string} name grid name
     * @param {integer} col column index, -1 resets sorting
     * @param {string} order sort order: 'ASC' for ascending, 'DESC' for descending
     */
    sort: function(name, col, order) {
        if (this.grids[name] !== undefined) {
            if (this.grids[name].sort) {
                this.grids[name].sort(col, order);
            }
        }
    },
    /**
     * filters the specified column for entries matching the specified expression.
     * wildcards may be used in expressions ('_' single character wildcard, '%'
     * multi character wildcard.
     *
     * @param {string} name grid name
     * @param {number} col column index to filter
     * @param {string} expression filter expression (e.g. "%item%" will retrieve all rows with strings containing 'item' preceeded and followed by arbitrary strings).
     */
    setFilter: function(name, col, expr) {
        if (this.grids[name] !== undefined) {
            if (this.grids[name].setFilter) {
                this.grids[name].setFilter(col, expr);
            }
        }
    },
    /**
     * sets the chaining for multiple filter expressions - used to search multiple columns at a time
     *
     * @param {string} set chaining to AND or OR
     */
    setFilterChaining: function(name, chaining) {
        if (this.grids[name] !== undefined) {
            if (this.grids[name].setFilterChaining) {
                this.grids[name].setFilterChaining(chaining);
            }
        }
    },
    /**
     * Clears applied filter for the specified column. All filters can be cleared
     * with column index -1.
     *
     * @param {string} name grid name
     * @param {type} col index of column to clear filter
     */
    clearFilter: function(name, col) {
        if (this.grids[name] !== undefined) {
            if (this.grids[name].clearFilter) {
                this.grids[name].clearFilter(col);
            }
        }
    },
    /**
     * Deletes all rows matching currently applied filters. Only available for
     * DB2 type grids.
     *
     * @param {string} name grid name
     * @returns {undefined}
     */
    deleteAll: function(name) {
        if (this.grids[name] !== undefined) {
            if (this.grids[name].deleteAll) {
                this.grids[name].deleteAll();
            }
        }
    },
    /**
     * returns row IDs of currently display rows. Only available for DB2 type grids.
     *
     * @param {string} name grid name
     * @param {integer} subID subscriber id
     * @returns {Array|shmi.visuals.core.DataGridDB.prototype.getCurrentIDs.id_arr}
     */
    getCurrentIDs: function(name, subID) {
        if (this.grids[name] !== undefined) {
            if (this.grids[name].getCurrentIDs) {
                return this.grids[name].getCurrentIDs(subID);
            }
        }
        return [];
    },
    /**
     * Returns all row IDs of the datagrid. Only available for DB2 type grids.
     *
     * @param {string} name grid name
     * @deprecated to delete all entries use deleteAll function
     * @param {integer} subID subscriber id
     * @returns {shmi.visuals.core.DataGridDB.prototype.getAllIDs.id_arr|Array}
     */
    getAllIDs: function(name, subID) {
        if (this.grids[name] !== undefined) {
            if (this.grids[name].getAllIDs) {
                return this.grids[name].getAllIDs(subID);
            }
        }
        return [];
    },
    /**
     * Returns field names of the datagrid. Only available for DB2 type grids.
     *
     * @param {type} name grid name
     * @returns {shmi.visuals.core.DataGridDB.prototype.getAllIDs.id_arr|Array}
     */
    getFields: function(name) {
        if (this.grids[name] !== undefined) {
            if (this.grids[name].getFields) {
                return this.grids[name].getFields();
            }
        }
        return [];
    },
    /**
     * returns active filter expression for each data column
     *
     * @returns {string[]} active filter expressions
     */
    getFilters: function(name) {
        var self = this;
        var filters = null;
        if (self.grids[name] !== undefined) {
            if (self.grids[name].getFilters) {
                filters = self.grids[name].getFilters();
            }
        }
        return filters;
    },
    /**
     * Retrieves the number of rows in this DataGrid. Only rows matching
     * applied filters are counted.
     *
     * @param {string} name grid name
     * @returns {number} number of rows, -1 of grid is not available
     */
    getRowCount: function(name) {
        if (this.grids[name] !== undefined) {
            if (this.grids[name].getRowCount) {
                return this.grids[name].getRowCount();
            }
        }
        return -1;
    },
    /**
     * @private
     * @param {type} response
     * @param {type} failed
     * @returns {undefined}
     */
    applyGrid: function(response, failed, url) {
        if (!failed) {
            var grid_data = {};

            try {
                grid_data = JSON.parse(response);
            } catch (exc) {
                console.error("[DataGridManager] failed to parse datagrid config:", url, exc);
            }

            /* no type configured */
            if (grid_data.type === undefined) {
                console.error("[DataGridManager]", "no grid type configured:", url);
                /* default case: JSON-file input */
            } else if ((grid_data.type === "DB") || (grid_data.type === "DB2")) {
                this.grids[grid_data.name] = new shmi.visuals.core.DataGridDB(grid_data.name, shmi.c(grid_data.db), grid_data.table, grid_data.fields, grid_data.conditions, grid_data.indexFields);
            } else if ((grid_data.type === "DYNAMIC")) {
                this.grids[grid_data.name] = new shmi.visuals.core.DataGridDynamic(grid_data.name, grid_data.fields, grid_data.create_index_column, grid_data.index_name, grid_data.index_begin, grid_data.indexFields);
            } else if (grid_data.type === "RECIPE") {
                this.grids[grid_data.name] = new shmi.visuals.core.DataGridRecipe(grid_data.name, grid_data.recipe_template_id);
            }
            shmi.log("[GridManager] grid '" + grid_data.name + "' loaded", 1);
        } else if (url !== undefined) { //when url is undefined, there were no grids configured => no log message
            shmi.log("[GridManager] grid data [" + url + "] not found - 404", 2);
        }

        if (this.grid_map.length > 0) {
            this.loadGrid();
        } else {
            this.initialized = true;
            shmi.fire("datagrid-manager", {
                ready: this.initialized
            }, this);
        }
    },
    /**
     * subscribes to the DataGrid with the specfied name. An empty DataGrid will be created
     * if none exists.
     *
     * @private
     * @param {string} name DataGrid name
     * @param {object} subscriber DataGrid subscriber to receive insert / delete updates
     * @returns {object} subscription info
     */
    subscribe: function(name, subscriber) {
        var subscription = null;

        if (this.grids[name] === undefined) {
            shmi.log("[GridManager] subscribe - grid '" + name + "' not found", 2);
            /* create empty grid */
            this.grids[name] = new shmi.visuals.core.DataGrid(name, {});
        }

        subscription = this.grids[name].subscribe(subscriber);

        return subscription;
    },
    /**
     * unsubscribes the specified subscription ID
     *
     * @param {string} name DataGrid name
     * @param {number} id subscription ID
     */
    unsubscribe: function(name, id) {
        if (this.grids[name] !== undefined) {
            this.grids[name].unsubscribe(id);
        } else {
            shmi.log("[GridManager] unsubscribe - grid '" + name + "' not found", 2);
        }
    },
    /**
     * Deletes a row matching the specified row-ID.
     *
     * @param {string} name DataGrid name
     * @param {integer|integer[]} rowId row-ID, or Array of row-IDs for DB2 type grids
     */
    deleteRow: function(name, rowId) {
        if (this.grids[name] !== undefined) {
            this.grids[name].deleteRow(rowId);
        } else {
            shmi.log("[GridManager] deleteRow - grid '" + name + "' not found", 2);
        }
    },
    /**
     * Inserts the specified row-data into the specified grid.
     *
     * @param {string} name DataGrid name
     * @param {object[]} rowData data to insert into DataGrid
     * @returns {number} row-ID of inserted data
     */
    insertRow: function(name, rowData) {
        var rowId = null;
        if (this.grids[name] !== undefined) {
            rowId = this.grids[name].insertRow(rowData);
        } else {
            shmi.log("[GridManager] insertRow - grid '" + name + "' not found", 2);
        }
        return rowId;
    },
    /**
     * Retrieve data-row of specified data-grid name and row-index.
     *
     * @param   {string}   name data-grid name
     * @param   {number}   row  row-index
     * @returns {object[]} data of specified row or null if none exists
     */
    getRowData: function(name, row) {
        var rowData = null;
        if (this.grids[name] !== undefined) {
            rowData = this.grids[name].getRowData(row);
        } else {
            shmi.log("[GridManager] getRowData - grid '" + name + "' not found", 2);
        }
        return rowData;
    },
    /* Retrieve Values of a Column as Array - Sorting*/
    getColumnData: function(name, col) {
        var colData = null;
        if (this.grids[name] !== undefined) {
            colData = this.grids[name].getColumnData(col);
        } else {
            shmi.log("[GridManager] getColumnData - grid '" + name + "' not found", 2);
        }
        return colData;
    },
    /**
     * Loads database data into a DataGrid. The DataGrid will be created if not already present.
     *
     * @private
     * @param {string} g_name DataGrid name
     * @param {string} t_name DB table name
     * @param {string[]} fields DB field array
     * @param {string[]} conditions WHERE conditions
     * @param {number} [dbID] DB ID
     * @param {number} [paging] true if paging should be enabled, false else
     * @param {number} [pageSize] number of results per page
     */
    loadGridFromDB: function(g_name, t_name, p_fields, conditions, dbID, paging, pageSize) {
        var fields = [];
        for (var i = 0; i < p_fields.length; i++) {
            fields.push(p_fields[i]);
        }
        var s = shmi.visuals.session;
        dbID = dbID ? dbID : shmi.c("DB_HMI_RO");

        /* create new grid if not already present; used when creating grids programmatically */
        var new_grid = new shmi.visuals.core.DataGrid(g_name, {}, paging, pageSize, "DB");
        shmi.def(this.grids, g_name, new_grid);
        if ((this.grids[g_name].fields === undefined) || (this.grids[g_name].fields.length === 0)) {
            var g_fields = [];
            var idx = 0;
            while (g_fields.length < fields.length) {
                g_fields.push(fields[idx]);
                idx++;
            }
            this.grids[g_name].fields = g_fields;
        }

        /* field data extraction */
        function getFieldData(str) {
            /*
             * example for input string format:
             * '"Gast","aaa",,,"1","gast,operator,Entwickler",,,"1","0",,"",';
             *
             */

            var tmp_str = str.replace(/^,/, "\" \","); //replace missing first field data
            tmp_str = tmp_str.replace(/,$/, ",\" \""); //replace missing last field data
            tmp_str = tmp_str.replace(/""/g, "\" \""); //replace other empty field indicator
            while (tmp_str.replace(/,,/g, ",\" \",") !== tmp_str) {
                tmp_str = tmp_str.replace(/,,/g, ",\" \",");	//replace missing middle field data
            }
            return tmp_str.match(/[^"]+(?=(",)|"$)/g);
        }

        /* query load callback */
        var q_cb = function(stat, q) {
            shmi.log("[DataGridManager] status: " + stat, shmi.c("LOG_INFO"));
            shmi.log("[DataGridManager] query: " + q, shmi.c("LOG_INFO"));
            s.DataGridManager.grids[g_name].query = q;

            var q_result_count = q.datalength;
            s.DataGridManager.grids[g_name].totalRows = q_result_count;
            shmi.log("TOTAL RESULTS: " + q_result_count, 1);

            var j = 0;
            while (j < Object.keys(q.data).length) {
                var data = getFieldData(q.data[j]),
                    cells = [],
                    rowID = -1;
                for (var k = 0; k < data.length; k++) {
                    /* do not copy last field: appended ROWID */
                    if (k === (data.length - 1)) {
                        rowID = parseInt(data[k]);
                    } else {
                        var c = {};
                        c.type = shmi.c("TYPE_STRING");
                        c.value = data[k];
                        c.min = Number.NaN;
                        c.max = Number.NaN;
                        cells.push(c);
                    }
                }
                var g_rid = s.DataGridManager.insertRow(g_name, cells);
                s.DataGridManager.grids[g_name].data[g_rid].rowID = rowID;
                i++;
            }
            /* save table plus DB- and ROW-ID on row object */
            s.DataGridManager.grids[g_name].dbID = q.dbId;
            s.DataGridManager.grids[g_name].dbTable = q.table;

            /* create grid fields array */
            //s.DataGridManager.grids[g_name].fields = [];
            //for(var i=0;i<q.fields.length-1;i++){
            //    s.DataGridManager.grids[g_name].fields.push(q.fields[i]);
            //}

            shmi.log("[DataGridManager] grid '" + g_name + "' loaded", shmi.c("LOG_MSG"));
        };

        /* APPEND ROWID FIELD TO EVERY QUERY */
        if (Array.isArray(fields)) {
            var added = false;
            if (s.DataGridManager.grids[g_name].fields !== undefined) {
                /* only add ROWID on alerady active grid if not already present */
                if (fields.length === s.DataGridManager.grids[g_name].fields.length) {
                    fields.push("ROWID");
                    added = true;
                }
            } else {
                /* always add ROWID on new grids */
                fields.push("ROWID");
                added = true;
            }
            if (added === true) {
                shmi.log("[DataGridManager] adding ROWID to fields list", shmi.c("LOG_INFO"));
            }
        }
        /* query data from DB */
        s.QueryManager.queryDirect(q_cb, t_name, fields, conditions, dbID, pageSize, 0);
        /* query remains open until there are no subscribers left */
    },
    /**
     * Saves the specfied row to the database, if data was loaded from the database
     *
     * @private
     * @param {string} g_name DataGrid name
     * @param {number} r_id row-ID
     * @param {boolean} create true if data should be saved as a new record, false if existing should be updated
     */
    saveRowToDB: function(g_name, r_id, create) {
        if ((this.grids[g_name] !== undefined) && Array.isArray(this.grids[g_name].fields)) {
            var vals = [],
                fields = [],
                cells = this.grids[g_name].getRowData(r_id),
                db_id = (this.grids[g_name].type === "DB2") ? this.grids[g_name].db : this.grids[g_name].dbID;

            for (var i = 0; i < cells.length; i++) {
                if (cells[i].value === " ") {
                    vals.push(null);
                } else {
                    vals.push(cells[i].value);
                }
                fields.push(this.grids[g_name].fields[i]);
            }
            shmi.log("[DataGridManager] fields: " + fields, shmi.c("LOG_INFO"));
            shmi.log("[DataGridManager] values: " + vals, shmi.c("LOG_INFO"));
            var db_table,
                q_id;
            if (create === true) {
                /* insert new row */
                db_table = (this.grids[g_name].type === "DB2") ? this.grids[g_name].table : this.grids[g_name].dbTable;
                q_id = shmi.visuals.session.QueryManager.insert(db_table, fields, vals, function(status, rowid) {
                    this.grids[g_name].data[r_id].rowID = rowid;

                    if (status !== 0) {
                        shmi.notify("Insert record failed with status: " + status + " Row-ID: " + rowid);
                        this.grids[g_name].deleteRow(r_id);
                    } else {
                        this.grids[g_name].refresh();
                    }

                    /* close query */
                    shmi.visuals.session.QueryManager.queries[q_id].close();
                }.bind(this), db_id);
            } else {
                /* update existing row */
                db_table = (this.grids[g_name].type === "DB2") ? this.grids[g_name].table : this.grids[g_name].dbTable;
                q_id = shmi.visuals.session.QueryManager.update(db_table, fields, vals, cells.rowID, function(status, query) {
                    if (status !== 0) {
                        shmi.notify("Status (update): " + status);
                    }
                    shmi.visuals.session.QueryManager.queries[q_id].close();
                }, db_id);
            }
        }
    }
};

(function() {
    shmi.pkg("visuals.core");

    /**
     * Logging helpers
     */
    var logger = {
        /**
         * Logger for errors
         * @function
         */
        error: console.error.bind(console, "[DataGridRecipe]"),
        /**
         * Logger for warnings
         * @function
         */
        warn: console.warn.bind(console, "[DataGridRecipe]"),
        /**
         * Logger for logs
         * @function
         */
        log: console.log.bind(console, "[DataGridRecipe]"),
        /**
         * Logger for debug messages
         * @function
         */
        debug: console.debug.bind(console, "[DataGridRecipe]")
    };

    // declare private functions - START

    var nextId = 1;

    /**
     * Returns a unique id
     *
     * @private
     * @returns {number} Unique id
     */
    function generateId() {
        return nextId++;
    }

    /**
     * Create a datagrid row from a recipe.
     *
     * @private
     * @param {shmi.visuals.core.Recipe} recipe
     * @returns {object[]}
     */
    function makeRowDataFromRecipe(recipe) {
        shmi.checkArg("recipe", recipe, "shmi.visuals.core.Recipe");

        return [
            {
                type: shmi.c("TYPE_INTEGER"),
                value: recipe.id,
                min: Number.NaN,
                max: Number.NaN
            },
            {
                type: shmi.c("TYPE_STRING"),
                value: recipe.name,
                min: Number.NaN,
                max: Number.NaN
            },
            {
                type: shmi.c("TYPE_STRING"),
                value: recipe.comment,
                min: Number.NaN,
                max: Number.NaN
            },
            {
                type: shmi.c("TYPE_BOOL"),
                value: (typeof recipe.versionId === "number") ? 1 : 0,
                min: Number.NaN,
                max: Number.NaN
            }
        ];
    }

    /**
     * Inserts a row into the datagrid and creates new virtual items if
     * necessary.
     *
     * @private
     * @param {DataGridRecipe} self Reference to a DataGridRecipe.
     * @param {number} rowId ROWID of the row
     * @param {object[]} rowData Rowdata
     */
    function makeRow(self, rowId, rowData) {
        var im = shmi.visuals.session.ItemManager;

        shmi.checkArg("self", self, "shmi.visuals.core.DataGridRecipe");
        shmi.checkArg("rowId", rowId, "number");
        shmi.checkArg("rowData", rowData, "array");

        self.totalRows++;
        self.data[rowId] = rowData;

        rowData.forEach(function(cell, i) {
            var vItemName = this.prefix + rowId + ":" + i,
                cellItem = im.getItem(vItemName);

            if (cellItem && cellItem.initialized) {
                cell.item = cellItem;
                cellItem.setValue(cell.value);
            } else {
                cell.item = shmi.createVirtualItem(vItemName, cell.type, cell.min, cell.max, cell.value,
                    function(rid, cid, value, type, name) {
                        var row = this.getRowData(rid);

                        if (row && row[cid]) {
                            row[cid].value = value;
                        }
                    }.bind(this, rowId, i)
                );
                cell.item.setDataGridInfo(this.name, rowId, i);
            }

            cell.item.writable = false;
        }, self);
    }

    /**
     * Generates the result parameter for subscriber functions.
     *
     * @private
     * @param {DataGridRecipe} self Reference to a DataGridRecipe.
     * @param {object} sub Subscription to generate info for.
     * @returns {object}
     */
    function calcState(self, sub) {
        shmi.checkArg("self", self, "shmi.visuals.core.DataGridRecipe");
        shmi.checkArg("subID", sub, "object");

        if (!sub) {
            return {
                status: "FAILED",
                totalRows: self.totalRows || 0
            };
        }

        return {
            status: "OK",
            offset: sub.offset,
            size: sub.size,
            totalRows: self.totalRows
        };
    }

    /**
     * Start a deferred refresh. May be called multiple times within the same
     * VM tick and will only trigger a refresh once.
     *
     * @private
     * @param {DataGridRecipe} self Reference to a DataGridRecipe.
     */
    function delayedRefresh(self) {
        shmi.checkArg("self", self, "shmi.visuals.core.DataGridRecipe");

        if (self.refreshTimeout !== null) {
            clearTimeout(self.refreshTimeout);
        }

        self.refreshTimeout = setTimeout(self.refresh.bind(self), shmi.c("ACTION_RETRY_TIMEOUT"));
    }

    /**
     * Pushes a task into the task queue and starts a task worker if there are
     * no pending tasks.
     *
     * @private
     * @param {DataGridRecipe} self Reference to a DataGridRecipe.
     * @param {object} task Task to schedule.
     */
    function pushTask(self, task) {
        shmi.checkArg("self", self, "shmi.visuals.core.DataGridRecipe");
        shmi.checkArg("task", task, "object");

        self.taskQueue.push(task);
        processTaskQueue(self);
    }

    /**
     * Delete row task.
     *
     * @private
     * @param {DataGridRecipe} self Reference to a DataGridRecipe.
     * @param {object} task Scheduled task.
     * @returns {boolean} `true` if the task has been started (=recipe exists), `false`
     *  else.
     */
    function taskDelete(self, task) {
        shmi.checkArg("self", self, "shmi.visuals.core.DataGridRecipe");
        shmi.checkArg("task", task, "object");

        var recipe = self.rowObjectData[task.rowID];

        if (!recipe) {
            return false;
        }

        recipe.delete(onTaskDone.bind(null, self));

        return true;
    }

    /**
     * Fetch all data task.
     *
     * @private
     * @param {DataGridRecipe} self Reference to a DataGridRecipe.
     * @param {object} task Scheduled task.
     * @returns {boolean} `true`
     */
    function taskFetchAll(self, task) {
        shmi.checkArg("self", self, "shmi.visuals.core.DataGridRecipe");
        shmi.checkArg("task", task, "object");

        var rm = shmi.requires("visuals.session.RecipeManager"),
            taskModule = shmi.requires("visuals.task"),
            ranges = calculateRequestRanges(self),
            taskArray,
            taskList;

        taskArray = ranges.map(function(range) {
            var t = taskModule.createTask("fetch-" + range.begin + "-" + range.end);
            t.run = function run() {
                rm.listRecipes(self.recipeTemplateId, {
                    filter: buildFilterExpression(self),
                    sort: buildSortExpression(self),
                    offset: range.begin,
                    limit: range.end - range.begin,
                    include_metadata: false,
                    include_values: true
                }, function(recipes, err) {
                    if (err) {
                        logger.error("Error while loading recipe data", err);
                        t.fail();
                    } else {
                        self.totalRows = 0;
                        recipes.recipes.forEach(function(recipe, idx) {
                            self.rowObjectData[range.begin + idx] = recipe;
                            makeRow(self, range.begin + idx, makeRowDataFromRecipe(recipe));
                        });
                        t.complete();
                        shmi.fire("datagrid-ready", {});
                    }
                });
            };

            return t;
        });

        function onComplete() {
            var iter = shmi.requires("visuals.tools.iterate.iterateObject");
            onTaskDone(self, null);
            iter(self.subscribers, doRefreshSubscriber.bind(null, self));
        }

        // Check if there are tasks to be executed. If not, we're done.
        if (taskArray.length === 0) {
            onComplete();
        } else {
            taskList = taskModule.createTaskList(taskArray);
            taskList.onComplete = onComplete;
            taskList.run();
        }

        return true;
    }

    /**
     * Load data for a single subscription task.
     *
     * @private
     * @param {DataGridRecipe} self Reference to a DataGridRecipe
     * @param {object} task Scheduled task.
     * @returns {boolean} `true`
     */
    function taskLoad(self, task) {
        shmi.checkArg("self", self, "shmi.visuals.core.DataGridRecipe");
        shmi.checkArg("task", task, "object");

        var rm = shmi.requires("visuals.session.RecipeManager");

        rm.listRecipes(self.recipeTemplateId, {
            filter: buildFilterExpression(self),
            sort: buildSortExpression(self),
            offset: task.offset,
            limit: task.size,
            include_metadata: false,
            include_values: true
        }, function(recipes, err) {
            if (err) {
                logger.error("Error while loading recipe data", err);
            } else {
                recipes.recipes.forEach(function(recipe, idx) {
                    self.rowObjectData[task.offset + idx] = recipe;
                    makeRow(self, task.offset + idx, makeRowDataFromRecipe(recipe));
                });
            }

            onTaskDone(self, null);
        });

        return true;
    }

    /**
     * Starts execution of the given task.
     *
     * @private
     * @param {DataGridRecipe} self Reference to a DataGridRecipe.
     * @param {object} task Task to execute.
     */
    function executeTask(self, task) {
        shmi.checkArg("self", self, "shmi.visuals.core.DataGridRecipe");
        shmi.checkArg("task", task, "object");

        var taskmap = {
                "delete": taskDelete.bind(null, self),
                "fetch_all": taskFetchAll.bind(null, self),
                "load": taskLoad.bind(null, self)
            },
            taskFunc = taskmap[task.type];

        if (!taskFunc) {
            logger.error("Unknown type for task", task.type);
            return;
        }

        self.tasksRunning++;
        if (task.serialized) {
            self.tasksJoin = true;
        }

        if (!taskFunc(task)) {
            logger.error("Failed to start task", task);
            onTaskDone(self, null);
        }
    }

    /**
     * Gets a list of tasks from the task queue that can be executed in
     * parallel. If a serialized task is on top of the queue, an empty array
     * is returned until `popSerialized` is set to true, in which case only the
     * serialized task is returned.
     *
     * @private
     * @param {DataGridRecipe} self Reference to a DataGridRecipe.
     * @param {boolean} [popSerialized] Whether to allow getting a task marked
     *  `serialized` or not.
     * @returns {object[]} Tasks that can be executed in parallel.
     */
    function getTasks(self, popSerialized) {
        var tasks = [],
            foundSerialized;

        shmi.checkArg("self", self, "shmi.visuals.core.DataGridRecipe");
        shmi.checkArg("popSerialized", popSerialized, "boolean", "undefined");

        if (self.taskQueue.length === 0) {
            return [];
        }

        foundSerialized = self.taskQueue.some(function(task, idx) {
            if (task.serialized) {
                tasks = self.taskQueue.splice(0, idx);
            }

            return !!task.serialized;
        });

        if (!foundSerialized) {
            tasks = self.taskQueue;
            self.taskQueue = [];
        } else if (foundSerialized && popSerialized) {
            tasks.push(self.taskQueue.shift());
        }

        return tasks;
    }

    /**
     * Executes the next set of tasks.
     *
     * @private
     * @param {DataGridRecipe} self Reference to a DataGridRecipe
     */
    function processTaskQueue(self) {
        shmi.checkArg("self", self, "shmi.visuals.core.DataGridRecipe");

        getTasks(self, !this.tasksJoin).forEach(executeTask.bind(null, self));
    }

    /**
     * Helper that handles end of task tasks like decreasing the running task
     * counter or scheduling new tasks.
     *
     * @private
     * @param {DataGridRecipe} self Reference to a DataGridRecipe.
     * @param {?shmi.visuals.tools.connect~RequestError} err Error
     */
    function onTaskDone(self, err) {
        shmi.checkArg("self", self, "shmi.visuals.core.DataGridRecipe");
        shmi.checkArg("err", err, "object", "null");

        if (err) {
            logger.error("Task command failed", err);
        } else if (self.tasksRunning === 0) {
            logger.warn("tasksRunning is 0 but there are still tasks running");
        }

        if (--self.tasksRunning === 0) {
            self.tasksJoin = false;
            processTaskQueue(self);
        }
    }

    /**
     * Calculate the ranges to request from WebIQ Server by merging the
     * requested ranges for all subscribers.
     *
     * @private
     * @param {DataGridRecipe} self Reference to a DataGridRecipe.
     * @returns {object[]} Ranges to request.
     */
    function calculateRequestRanges(self) {
        var ranges = [],
            subscribers = [],
            iterObj = shmi.requires("visuals.tools.iterate.iterateObject");

        shmi.checkArg("self", self, "shmi.visuals.core.DataGridRecipe");

        iterObj(self.subscribers, function(subscriber) {
            subscribers.push(subscriber);
        });

        subscribers.sort(function(lhs, rhs) {
            return rhs.offset - lhs.offset;
        }).forEach(function(sub, idx) {
            if (idx === 0) {
                ranges.push({
                    begin: sub.offset,
                    end: sub.offset + sub.size
                });

                return;
            }

            var top = ranges[ranges.length - 1];

            if (top.end < sub.offset) {
                ranges.push({
                    begin: sub.offset,
                    end: sub.offset + sub.size
                });
            } else if (top.end < sub.offset + sub.size) {
                sub.end = sub.offset + sub.size;
            }
        });

        return ranges;
    }

    /**
     * Notify the given subscriber about changes made to its subscribed data.
     *
     * @private
     * @param {DataGridRecipe} self Reference to a DataGridRecipe.
     * @param {object} sub Subscriber object
     */
    function doRefreshSubscriber(self, sub) {
        shmi.checkArg("self", self, "shmi.visuals.core.DataGridRecipe");
        shmi.checkArg("sub", sub, "object");

        sub.onChange(calcState(self, sub));
    }

    /**
     * Generates the filter parameter object for the given DataGridRecipe.
     *
     * @private
     * @param {DataGridRecipe} self Reference to a DataGridRecipe.
     * @returns {shmi.visuals.tools.connect~FilterParameters.filter}
     */
    function buildFilterExpression(self) {
        shmi.checkArg("self", self, "shmi.visuals.core.DataGridRecipe");

        return {
            mode: self.filterChaining,
            clauses: self.getFilters().map(function(filterSet, colIdx) {
                if (filterSet === null) {
                    return null;
                }

                return {
                    location: "property",
                    mode: "OR",
                    column: self.getFields()[colIdx],
                    clauses: filterSet.map(function(val) {
                        return {
                            operator: "like",
                            value: val
                        };
                    })
                };
            }).filter(function(f) {
                return f !== null;
            })
        };
    }

    /**
     * Generates the sort parameter for the given DataGridRecipe.
     *
     * @private
     * @param {DataGridRecipe} self Reference to a DataGridRecipe.
     * @returns {object[]}
     */
    function buildSortExpression(self) {
        shmi.checkArg("self", self, "shmi.visuals.core.DataGridRecipe");

        if (self.order === null) {
            return [];
        }

        return [{
            column: self.getFields()[self.order[0]],
            order: self.order[1]
        }];
    }
    // declare private functions - END

    shmi.visuals.core.DataGridRecipe = function DataGridRecipe(name, recipeTemplateId) {
        this.name = name;
        this.recipeTemplateId = recipeTemplateId;
        this.type = "Recipe";
        this.data = {};
        this.rowObjectData = {};
        this.subscribers = {};
        this.prefix = "virtual:grid:" + this.name + ":";
        this.nextRowID = 0;
        this.totalRows = 0;
        this.order = null;
        this.filter = {};
        this.filterChaining = "AND";
        this.taskQueue = [];
        this.tasksRunning = 0;
        this.tasksJoin = false;
        this.refreshTimeout = null;
    };

    shmi.visuals.core.DataGridRecipe.prototype = {
        // Explicitly set `constructor` since we're overwriting the prototype.
        constructor: shmi.visuals.core.DataGridRecipe,
        /**
         * init - initializes datagrid
         *
         * @private
         */
        init: function() {
            this.taskQueue = [];
            this.subscribers = {};
        },
        /**
         * subscribePage - open subscription datagrid row range
         *
         * @param  {number} offset   row offset of result data
         * @param  {number} size     page size of data to load
         * @param  {function} onChange callback to run when datagrid changes
         * @return {object} subscription token
         */
        subscribePage: function(offset, size, onChange) {
            shmi.checkArg("offset", offset, "number");
            shmi.checkArg("size", size, "number");
            shmi.checkArg("onChange", onChange, "function");

            var sub = {
                id: generateId(),
                offset: offset,
                size: size,
                onChange: onChange
            };

            this.subscribers[sub.id] = sub;

            var ret_sub = {
                id: sub.id,
                prefix: this.prefix
            };

            pushTask(this, {
                type: "load",
                offset: offset,
                size: size
            });

            return ret_sub;
        },
        /**
         * getFields - get array of datagrid field names
         *
         * @return {string[]} array of field names
         */
        getFields: function() {
            return ["recipe_id", "recipe_name", "comment", "values_set"];
        },
        /**
         * getIndexFields - get indices of index fields
         *
         * @return {number[]}  array of field indices
         */
        getIndexFields: function() {
            return [0];
        },
        /**
         * getRowIndex - get values of index fields for specified row-ID
         *
         * @param  {number} rowId datagrid-row ID
         * @return {array} array of index field values
         */
        getRowIndex: function(rowId) {
            shmi.checkArg("rowId", rowId, "number");

            var rowData = this.getRowData(rowId);

            if (!rowData) {
                return null;
            }

            return this.getIndexFields().map(function(el) {
                return rowData[el].value;
            });
        },
        /**
         * searchIndexRowId - get datagrid-row ID of specified index field values
         *
         * @param  {number[]} rowIndex array of index field values
         * @return {number} datagrid-row ID matching index values or -1 if not found
         */
        searchIndexRowId: function(rowIndex) {
            var fields = this.getIndexFields(),
                rowId = -1;

            shmi.checkArg("rowIndex", rowIndex, "array");

            Object.keys(this.data).some(function(id) {
                if (this.searchIndexFields(parseInt(id), fields, rowIndex)) {
                    rowId = id;

                    return true;
                }

                return false;
            }.bind(this));

            return rowId;
        },
        /**
         * searchIndexFields - test if index fields of row match specified index values
         *
         * @param  {number} row datagrid-row ID
         * @param  {number[]} fields index field indices
         * @param  {number[]} rowIndex index field values
         * @return {boolean} `true` if found, `false` else
         */
        searchIndexFields: function(row, fields, rowIndex) {
            shmi.checkArg("row", row, "number");
            shmi.checkArg("fields", fields, "array");
            shmi.checkArg("rowIndex", rowIndex, "array");

            return fields.length > 0 && this.data[row].every(function(cell, idx) {
                return cell.value === rowIndex[idx];
            });
        },
        /**
         * insertRow - insert new row into datagrid.
         *
         * @param  {object[]} rowData row data to insert as new row
         */
        insertRow: function(rowData, noNotify) {
            var iter = shmi.requires("visuals.tools.iterate").iterateObject,
                rowId = this.nextRowID++;

            shmi.checkArg("rowData", rowData, "array");
            makeRow(this, rowId, rowData);

            if (!noNotify) {
                iter(this.subscribers, function(val) {
                    val.onChange(calcState(this, val));
                }.bind(this));
            }

            return rowId;
        },
        /**
         * deleteRow - delete row of specified datagrid row ID
         *
         * warning: this function will also try to remove row from databse.
         *
         * @param  {number|number[]} rowID datagrid row ID
         */
        deleteRow: function(rowID) {
            shmi.checkArg("rowID", rowID, "number", "array");

            /* push one or many delete tasks */
            (Array.isArray(rowID) ? rowID : [rowID]).forEach(function(id) {
                pushTask(this, {
                    type: "delete",
                    rowID: parseInt(id)
                });
            }, this);

            /* refresh task after delete */
            pushTask(this, {
                type: "fetch_all",
                serialized: true
            });
        },
        /**
         * deleteAll - delete all rows from datagrid instance
         */
        deleteAll: function() {
            this.deleteRow(Object.keys(this.rowObjectData));
        },
        /**
         * unsubscribe - return / disable active subscription to datagrid range
         *
         * @param  {number} subID subscription ID
         */
        unsubscribe: function(subID) {
            var im = shmi.requires("visuals.session.ItemManager"),
                iter = shmi.requires("visuals.tools.iterate.iterateObject");

            shmi.checkArg("subID", subID, "number");

            delete this.subscribers[subID];

            /* if no clients left ... */
            if (Object.keys(this.subscribers).length === 0) {
                iter(this.data, function(row) {
                    row.forEach(function(cell) {
                        im.removeItem(cell.item.name);
                    });
                });
                this.data = {};
                this.rowObjectData = {};
            }
        },
        /**
         * setOffset - set offset of subscribed datagrid range
         *
         * @param  {number} offset datagrid result offset
         * @param  {number} subID  active subscription ID
         */
        setOffset: function(offset, subID) {
            shmi.checkArg("offset", offset, "number");
            shmi.checkArg("subID", subID, "number");

            if (this.subscribers[subID] !== undefined) {
                this.subscribers[subID].offset = offset;
                pushTask(this, {
                    type: "load",
                    subID: subID
                });
            }
        },
        /**
         * Retrieves the number of rows in this DataGrid.
         *
         * @returns {number} number of rows
         */
        getRowCount: function() {
            return this.totalRows;
        },
        /**
         * filters the specified column for entries matching the specified expression.
         * wildcards may be used in expressions ('_' single character wildcard, '%'
         * multi character wildcard.
         *
         * @param {number} col column index to filter
         * @param {string} expression filter expression (e.g. "%item%" will retrieve all rows with strings containing 'item' preceeded and followed by arbitrary strings).
         */
        setFilter: function(col, expression) {
            this.filter[this.getFields()[col]] = expression;
            delayedRefresh(this);
        },
        /**
         * sets the chaining for filter expressions - used to search multiple columns
         *
         * @param {string} set chaining to AND or OR
         */
        setFilterChaining: function(chaining) {
            shmi.checkArg("chaining", chaining, "string");

            if (chaining === "OR" || chaining === "AND") {
                this.filterChaining = chaining;
                delayedRefresh(this);
            } else {
                logger.error("Invalid filter chaining mode:", chaining);
            }
        },
        /**
         * returns active filter expression for each data column
         *
         * @returns {string[]} active filter expressions
         */
        getFilters: function() {
            return this.getFields().map(function(fieldName) {
                return shmi.objectHasOwnProperty(this.filter, fieldName) ? this.filter[fieldName] : null;
            }.bind(this));
        },
        /**
         * creates a new query and reloads currently active data
         */
        refresh: function() {
            var iter = shmi.requires("visuals.tools.iterate").iterateObject;

            iter(this.subscribers, function(subscriber) {
                subscriber.offset = 0;
            });

            this.data = {};
            this.rowObjectData = {};
            this.totalRows = 0;

            pushTask(this, {
                type: "fetch_all",
                serialized: true
            });
        },
        /**
         * Clears applied filter for the specified column. All filters can be cleared
         * with column index -1.
         *
         * @param {number} col index of column to clear filter
         */
        clearFilter: function(col) {
            var refresh_needed = false;

            shmi.checkArg("col", col, "number");

            if (col === -1) {
                refresh_needed = Object.keys(this.filter).length > 0;
                this.filter = {};
            } else if (this.filter[this.getFields()[col]] !== undefined) {
                delete this.filter[this.getFields()[col]];
                refresh_needed = true;
            }

            if (refresh_needed) {
                delayedRefresh(this);
            }
        },
        /**
         * sorts all data rows of the DataGrid by the specified column index in the
         * provided order.
         *
         * @param {number} col column index
         * @param {string} order sort order: 'ASC' for ascending, 'DESC' for descending
         */
        sort: function(col, order) {
            var old_order = this.order;

            shmi.checkArg("col", col, "number");
            shmi.checkArg("col", order, "string");

            if (col === -1) {
                this.order = null;
            } else {
                this.order = [col, order];
            }

            if (this.order !== old_order) {
                delayedRefresh(this);
            }
        },
        /**
         * returns row IDs of currently display rows.
         *
         * @param {number} subID subscriber id
         * @returns {number[]}
         */
        getCurrentIDs: function(subID) {
            shmi.checkArg("subID", subID, "number");

            var sub = this.subscribers[subID];

            if (sub === undefined) {
                return [];
            }

            return Object.keys(this.data).map(function(rowID) {
                return parseInt(rowID);
            }).filter(function(rowID) {
                return sub.offset <= rowID && rowID < sub.offset + sub.size;
            });
        },
        /**
         * returns all row IDs of the datagrid
         *
         * @returns {number[]}
         */
        getAllIDs: function() {
            return Object.keys(this.data);
        },
        /**
         *  retrieve values of a row as array
         *
         * @param {number} rowId row-ID of the data-row to fetch
         * @returns {object[]} row-data array
         */
        getRowData: function(rowId) {
            shmi.checkArg("rowId", rowId, "number");

            return (this.data[rowId] !== undefined) ? this.data[rowId] : null;
        }
    };
}());

(function() {
    shmi.pkg("visuals.core");

    /**
     * Default properties.
     */
    const propertyRegistry = {
        "user": {
            events: ["login-state"],
            basePath: "shmi.visuals.session.UserManager.currentUser"
        }
    };

    /**
     * getValueByPath - get value of object based on property path
     *
     * @param {object} initialValue initial value to start with
     * @param {string} path property path delimited by "."
     * @returns {*} requested value or `null` if not found
     */
    function getValueByPath(initialValue, path) {
        return path.split(".").reduce((base, elementName) => {
            if (typeof base !== "object" || base === null) {
                return null;
            } else if (!shmi.objectHasOwnProperty(base, elementName)) {
                return null;
            }

            return base[elementName];
        }, initialValue);
    }

    /**
     * Returns the longest matching base for the given variable name or `null`,
     * if no matching prefix exist.
     *
     * @param {string} variableName Name of the environment variable
     * @param {string[]} enabledBases
     * @returns {?string} Key for the registered variable or `null`.
     */
    function getKeyForVariable(variableName, enabledBases) {
        // Get key for the registered variable with the longest matching
        // prefix.
        return enabledBases.reduce((previousProperty, current) => {
            if (variableName === current || variableName.startsWith(`${current}.`)) {
                return !previousProperty || current.length > previousProperty ? current : previousProperty;
            }

            return null;
        });
    }

    /**
     * Gets detailed information on an environment variable.
     *
     * @param {EnvironmentManager} self
     * @param {string} variableName Name of the environment variable
     * @param {string[]} enabledBases
     */
    function getDetailed(self, variableName, enabledBases) {
        // Get key for the registered variable with the longest matching
        // prefix.
        const basePropertyKey = getKeyForVariable(variableName, enabledBases);

        if (!basePropertyKey) {
            // No variable found with a shared prefix.
            return null;
        }

        const basePropertyInfo = self._propertyRegistry[basePropertyKey];
        const subPropertyPath = variableName.substr(basePropertyKey.length + 1);

        // Get the registered variable.
        const baseProperty = getValueByPath(window, basePropertyInfo.basePath);

        // Check if the registered variable itself was requested...
        if (basePropertyKey === variableName) {
            return {
                variableName,
                basePropertyKey,
                basePropertyInfo,
                value: baseProperty
            };
        }

        // ...otherwise continue resolving.
        return {
            variableName,
            basePropertyKey,
            basePropertyInfo,
            value: getValueByPath(baseProperty, subPropertyPath)
        };
    }

    /**
     * Gets the value of an environment variable.
     *
     * @param {EnvironmentManager} self
     * @param {string} variableName Name of the environment variable
     * @param {string[]} enabledBases
     */
    function getFrom(self, variableName, enabledBases) {
        const result = getDetailed(self, variableName, enabledBases);

        if (!result) {
            return null;
        }

        return result.value;
    }

    /**
     * Callback called when a registered event is fired.
     *
     * @param {EnvironmentManager} self
     * @param {string} eventName Name of the event being handled
     */
    function onEventCallback(self, eventName) {
        const allBases = Object.keys(self._propertyRegistry);

        self._tokens.forEach((token) => {
            const info = getDetailed(self, token.variableName, allBases);
            if (!info || !info.basePropertyInfo.events.includes(eventName)) {
                return;
            }

            // Update value if we get a value change or anything that can't
            // be properly compared by `===`.
            if (token.lastValue !== info.value || (typeof info.value === "object" && info.value !== null)) {
                token.gotInitialValue = true;
                token.lastValue = info.value;
                token.callback(info.value);
            }
        });
    }

    /**
     * Attaches the event listener responsible for triggering variable updates
     * to the given event.
     *
     * @param {EnvironmentManager} self
     * @param {string} eventName Name of the event to attach the event listener
     *  to.
     */
    function registerEvent(self, eventName) {
        if (self._events.includes(eventName)) {
            return;
        }

        self._events.push(eventName);
        self._eventListeners.push(
            shmi.listen(eventName, onEventCallback.bind(null, self, eventName))
        );
    }

    /**
     * Returns an unused token id.
     *
     * @param {EnvironmentManager} self
     * @returns {number} Unused token id.
     */
    function getFreeTokenId(self) {
        let newId;

        do {
            newId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        } while (self._tokenIdSet.has(newId));

        self._tokenIdSet.add(newId);
        return newId;
    }

    /**
     * Provides an interface for observing environment values.
     */
    shmi.visuals.core.EnvironmentManager = class EnvironmentManager {
        constructor() {
            const { iterateObject } = shmi.requires("shmi.visuals.tools.iterate");
            this._propertyRegistry = {};
            this._tokenIdSet = new Set;
            this._tokens = [];
            this._events = [];
            this._eventListeners = [];

            // Register defaults.
            iterateObject(propertyRegistry, ({ basePath, events }, propertyPath) => this.registerVariable(propertyPath, basePath, events));
        }

        /**
         * Unregisters event listeners and frees resources.
         */
        destroy() {
            this._eventListeners.forEach((listener) => listener.unlisten());
            this._eventListeners = [];
            this._events = [];
            this._tokens = [];
            this._tokenIdSet.clear();
            this._propertyRegistry = {};
        }

        /**
         * Registers a global variable as environment variable. Listens for
         * value updates via events.
         *
         * @param {string} variableName Name of the environment variable.
         * @param {string} basePath Path to the variable relative to the
         *  `window` property
         * @param {string|string[]} eventName Name(s) of the event(s) that
         *  indicate a change in the variable's contents.
         */
        registerVariable(variableName, basePath, eventName) {
            shmi.checkArg("variableName", variableName, "string");
            shmi.checkArg("basePath", basePath, "string");
            shmi.checkArg("eventName", eventName, "string", "array");

            if (shmi.objectHasOwnProperty(this._propertyRegistry, variableName)) {
                throw new Error("Environment variable already registered");
            }

            if (!Array.isArray(eventName)) {
                eventName = [eventName];
            }

            this._propertyRegistry[variableName] = {
                events: eventName,
                basePath
            };

            eventName.forEach(registerEvent.bind(this, this));
        }

        /**
         * Gets the value of an environment variable.
         *
         * @param {string} variableName Name of the environment variable.
         * @returns {*} Value of the environment variable or `null`, if no
         *  variable exists with the given name.
         */
        get(variableName) {
            shmi.checkArg("variableName", variableName, "string");

            return getFrom(this, variableName, Object.keys(this._propertyRegistry));
        }

        /**
         * Subscribes an environment variable.
         *
         * @param {string} variableName Name of the environment variable to
         *  subscribe.
         * @param {function} callback Callback called when the enviroment
         *  variable changes.
         * @returns {object} Token to the subscription. Used to undo the
         *  subscription.
         */
        subscribe(variableName, callback) {
            shmi.checkArg("variableName", variableName, "string");
            shmi.checkArg("callback", callback, "function");

            const token = {
                variableName,
                lastValue: null,
                id: getFreeTokenId(this),
                callback,
                active: true,
                unlisten: () => {
                    token.active = false;
                    const idx = this._tokens.findIndex(({ id }) => id === token.id);
                    if (idx > 0) {
                        this._tokens.splice(idx, 1);
                    }
                    this._tokenIdSet.delete(token.id);
                }
            };

            shmi.decouple(() => {
                if (!token.active || token.gotInitialValue) {
                    return;
                }

                const value = this.get(token.variableName);
                token.gotInitialValue = true;
                token.lastValue = value;
                token.callback(value);
            });

            this._tokens.push(token);
            return token;
        }
    };
})();

(function() {
    shmi.pkg("visuals.core");

    function doSaveTransfer(self, transfer) {
        var request = shmi.requires("visuals.tools.connect").request,
            chunk = null,
            b64_chunk = null;
        if (transfer.offset >= transfer.data.length) {
            request("fs.close", transfer.connect_id, function onClose(response, err) {
                if (err) {
                    console.error("[FileManager] error closing file:", err);
                }
                if (!transfer.failed) {
                    transfer.callback(0, transfer);
                } else {
                    transfer.callback(transfer.err.errc, transfer);
                }
                delete self.transfers[transfer.id];
            });
        } else {
            chunk = transfer.data.slice(transfer.offset, transfer.offset + self.chunkSize);
            b64_chunk = transfer.utf8 ? btoa(self.to_utf8(chunk)) : btoa(chunk);
            request("fs.write", {
                file_id: transfer.connect_id,
                data: b64_chunk
            }, function onWrite(response, err) {
                if (err) {
                    transfer.failed = true;
                    transfer.err = err;
                    transfer.offset = transfer.data.length;
                } else {
                    transfer.offset += self.chunkSize;
                }
                doSaveTransfer(self, transfer);
            });
        }
    }

    /**
     * Manager to upload files to the host filesystem.
     *
     * An instance of FileManager is automatically instanced during initialization and can
     * be referenced via `shmi.visuals.session.FileManager`.
     *
     * @constructor
     */
    shmi.visuals.core.FileManager = function() {
        var self = this;
        self.transfers = {};
        self.chunkSize = 4096;
    };

    shmi.visuals.core.FileManager.prototype = {
        to_utf8: function(s) {
            return unescape(encodeURIComponent(s));
        },

        from_utf8: function(s) {
            return decodeURIComponent(escape(s));
        },
        /**
         * save data to host filesystem. Data can either be text based or an ArrayBuffer
         * retrieved using the FileReader API or similar.
         *
         * @param {String} path destination path
         * @param {String|ArrayBuffer} data data to save
         * @param {function} callback callback to run when operation completes
         * @param {Boolean} utf8 true when data is UTF-8 encoded text, false else
         * @returns {Number} transfer id of save operation
         */
        save: function(path, data, callback, utf8) {
            var self = this,
                request = shmi.requires("visuals.tools.connect").request,
                id = 0;
            while (self.transfers[id] !== undefined) {
                id++;
            }
            self.transfers[id] = {
                id: id,
                connect_id: null,
                type: "save",
                data: data ? data : "",
                offset: 0,
                err: null,
                callback: callback,
                complete: false,
                started: false,
                failed: false,
                utf8: (utf8 === true)
            };

            request("fs.open", {
                path: path,
                force: true,
                open_mode: [ "out" ]
            }, function(response, err) {
                var transfer = self.transfers[id];
                if (err !== 0) {
                    transfer.failed = true;
                    transfer.err = err;
                    transfer.callback(err.errc, transfer);
                    delete self.transfers[transfer.id];
                } else {
                    transfer.started = true;
                    transfer.connect_id = response;
                    doSaveTransfer(self, transfer);
                }
            });

            return id;
        }
    };
}());

shmi.pkg("visuals.core");

/**
 * Interface definition ItemSubscriber
 *
 * @private
 */
shmi.visuals.core.IfItemSubscriber = function() {};
shmi.visuals.core.IfItemSubscriber.prototype = {};

(function() {
    /**
     * replace module name with a custom name for the local-script.
     *
     * All local-script should be attached to the "custom.ls" package.
     * If more than one script is required for an application, a common root package
     * should be created (e.g. "custom.ls.customerName.*").
     */

    var MODULE_NAME = "visuals.core",
        module = shmi.pkg(MODULE_NAME);

    // MODULE CODE - START

    /* private variables */
    var writeQueue = {};

    /* private functions */

    var errLog = (function() {
        var MN = "[" + MODULE_NAME + ".Item]  ";
        MN += " ".repeat(Math.max(0, MN.length - 20));

        return console.error.bind(console, MN);
    }());

    /**
     * Takes a set of values to write from the queue and executes a write on
     * WebIQ Server. Does nothing if the send queue is empty or if a write
     * operation is currently in progress.
     *
     * @private
     */
    function writeNextQueuedValue() {
        var request = shmi.requires("visuals.tools.connect").request,
            iter = shmi.requires("visuals.tools.iterate").iterateObject,
            im = shmi.requires("visuals.session.ItemManager"),
            sendValues = {};

        // Get all items from the queue for which there are currently no writes
        // in progress.
        iter(writeQueue, function(data, itemName) {
            if (!data.inProgress) {
                sendValues[itemName] = data.value;
                data.inProgress = true;
            }
        });

        // Exit early if there are no items to write.
        if (Object.keys(sendValues).length === 0) {
            return;
        }

        request("io.write", {
            direct: false,
            values: sendValues
        }, function onRequest(response, err) {
            if (err) {
                console.error("[ItemManager] io.write failed:", err.category, err.errc, err.message, sendValues);
            } else {
                iter(response, function(ec, itemName) {
                    if (ec !== null) {
                        console.error("[ItemManager] io.write failed: (", itemName, ":", sendValues[itemName], ")", ec.category, ec.errc, ec.message);
                    } else if (im.writeEventEnabled) {
                        shmi.fire("write-item", sendValues);
                    }
                });
            }

            iter(sendValues, function(value, itemName) {
                if (writeQueue[itemName].value === value) {
                    delete writeQueue[itemName];
                } else {
                    writeQueue[itemName].inProgress = false;
                }
            });

            writeNextQueuedValue();
        });
    }

    /**
     * Pushes a set of values to write into the write queue. If no there is
     * no ongoing write operation, the value is written immediately.
     *
     * @private
     * @param {*} values Set of values to write as key, value pair, where a key
     *  is the name of the item and the value is the value to write to the item.
     */
    function queueWrite(values) {
        var iter = shmi.requires("visuals.tools.iterate").iterateObject;

        // Insert each item with its new value into the write queue.
        iter(values, function(value, itemName) {
            if (shmi.objectHasOwnProperty(writeQueue, itemName)) {
                writeQueue[itemName].value = value;
            } else {
                writeQueue[itemName] = {
                    value: value,
                    inProgress: false
                };
            }
        });

        writeNextQueuedValue();
    }

    /**
     * logs uiType property and control name (if applicable) of the specified subscriber object
     *
     * @private
     * @param {Item} self
     * @param {Subscriber} subscriber
     * @returns {undefined}
     */
    function logSubscriber(self, subscriber) {
        if ((subscriber === null) || (subscriber === undefined)) {
            shmi.log("[Item '" + self.name + "'] logSubscriber: specified subscriber does not exist!", 3);
        } else {
            shmi.log("[Item '" + self.name + "'] UI Type: " + subscriber.uiType, 2);
            if ((subscriber.config !== undefined)) {
                shmi.log("[Item '" + self.name + "'] Control Name: " + subscriber.config.name, 2);
            }
        }
    }

    /**
     * @private
     * @param {Item} self
     * @param {any} value
     * @returns {any}
     */
    function toType(self, value) {
        switch (self.type) {
        case shmi.c("TYPE_STRING"):
            break;
        case shmi.c("TYPE_BOOL"):
            if (typeof value === "boolean") {
                value = value === true ? 1 : 0;
            } else {
                value = parseInt(value);
            }
            break;
        case shmi.c("TYPE_INT"):
            value = parseInt(value);
            break;
        case shmi.c("TYPE_FLOAT"):
            value = parseFloat(value);
            break;
        default:
            shmi.log("[Item '" + self.name + "'] unknown type " + self.type, shmi.c("LOG_INFO"));
            break;
        }
        return value;
    }

    /**
     * getType - get type mapping from string to numerical
     *
     * @param  {string} value string type name
     * @return {number}       numerical type id
     */
    function getType(value) {
        var typeInfo = {
            "int": 2,
            "long": 2,
            "longlong": 2,
            "uint": 2,
            "ulong": 2,
            "ulonglong": 2,
            "float": 3,
            "double": 3,
            "bool": 1,
            "boolean": 1,
            "string": 0,
            "error": -1
        };

        if (value === null) {
            return null; //after unsubscribe
        } else {
            return typeInfo[value];
        }
    }

    function setUnitText(self, updateTarget) {
        if (typeof updateTarget.setUnitText === "function") {
            var unitSet = false;
            if (self.adapter && self.adapter.unitText) {
                updateTarget.setUnitText(self.adapter.unitText);
                unitSet = true;
            }
            if (!unitSet && (typeof self.unit === "string") && (self.unit.trim() !== "")) {
                updateTarget.setUnitText(self.unit);
            }
        }
    }

    function applyLockStatus(self, updateTarget) {
        if ((typeof updateTarget.lock === "function") && (typeof updateTarget.unlock === "function")) {
            if (self.writable) {
                updateTarget.unlock();
            } else {
                updateTarget.lock();
            }
        }
    }

    function applyProperties(self, updateTarget) {
        /* apply item properties */
        var tmpProps = {
            min: self.min,
            max: self.max,
            step: self.step,
            warnmin: self.warnmin,
            warnmax: self.warnmax,
            prewarnmin: self.prewarnmin,
            prewarnmax: self.prewarnmax,
            precision: self.digits
        };

        /* set label token if set */
        if ((self.labelToken) && (self.labelToken.trim() !== "")) {
            if (typeof updateTarget.setLabel === "function") {
                var re = /#(.+?)#/g,
                    str = self.labelToken.trim();
                str = str.replace(re, function(match, p1) {
                    return "${" + p1 + "}";
                });
                updateTarget.setLabel(str);
            }
        }

        /* process output if adapter is set */
        if (self.adapter) {
            var iterObj = shmi.requires("visuals.tools.iterate.iterateObject"),
                doNotConvert = ["precision", "step"];

            iterObj(tmpProps, function(pVal, pName) {
                if (pVal === null || doNotConvert.indexOf(pName) !== -1) {
                    return;
                }
                tmpProps[pName] = self.adapter.outFunction(pVal);
            });
        }

        /* set unit text if set */
        setUnitText(self, updateTarget);

        if (typeof updateTarget.setProperties === "function") {
            updateTarget.setProperties(tmpProps.min, tmpProps.max, tmpProps.step,
                self.name, self.type, tmpProps.warnmin, tmpProps.warnmax, tmpProps.prewarnmin, tmpProps.prewarnmax, tmpProps.precision);
        }
    }

    /**
     * Constructs a subscribable Item
     *
     * @constructor shmi.visuals.core.Item
     *
     * @param {string} name name of the item
     * @param {boolean} virtual `true` to construct virtual item
     */
    module.Item = function(name, virtual) {
        this.name = name;
        this.readable = false;
        this.writable = false;
        this.lockable = false;
        this.supervisor = false;
        this.locked = false;

        this.virtual = !!(virtual);

        this.errorcode = null;
        this.index = null;
        this.type = null;
        this.min = null;
        this.max = null;
        this.step = null;
        this.prewarnmin = null;
        this.prewarnmax = null;
        this.warnmin = null;
        this.warnmax = null;

        /* changed from 0 to prevent missing first .setValue call on update targets */
        this.value = undefined;

        this.initialized = false;
        // Virtual items are always "subscribed".
        this.subscribed = !!(virtual);
        this.valueSet = false;

        this.bitmask = null;
        this.unit = null;
        this.unitClass = null;
        this.labelToken = "";
        this.digits = -1;

        this.interval = 100;
        this.lastSetTime = 0;

        this._dataGridInfo = null;

        this._updateTargets = {};

        this._updateValue = this.value;

        Object.defineProperty(this, "formattedValue", {
            enumerable: true,
            configurable: false,
            get: function() {
                var nv = shmi.requires("visuals.tools.numericValues");

                return nv.formatNumber(this.value, {
                    precision: this.digits,
                    unit: this.unit
                });
            }.bind(this)
        });
    };

    /** @lends shmi.visuals.core.Item */
    module.Item.prototype = {
        /**
         * Sets state properties for the item
         *
         * @private
         * @param properties - item property data
         */
        setProperties: function(properties) {
            var uc = shmi.requires("visuals.tools.unitClasses");

            this.errorcode = 0;
            this.index = 0;
            this.type = getType(properties.value_type);

            this.locked = false;
            this.supervisor = properties.access.indexOf("supervisor") !== -1;
            this.lockable = properties.access.indexOf("lock") !== -1;
            this.writable = properties.access.indexOf("write") !== -1;
            this.readable = properties.access.indexOf("read") !== -1;

            this.min = properties.min;
            this.max = properties.max;
            this.step = properties.step;
            if (properties.warn) {
                this.warnmin = properties.warn.min;
                this.warnmax = properties.warn.max;
            } else {
                this.warnmin = null;
                this.warnmax = null;
            }

            if (properties.prewarn) {
                this.prewarnmin = properties.prewarn.min;
                this.prewarnmax = properties.prewarn.max;
            } else {
                this.prewarnmin = null;
                this.prewarnmax = null;
            }

            this.bitmask = 0;

            this.digits = properties.digits;

            /* unit & unitclass settings */
            this.unit = properties.unit;
            if (!isNaN(this.unit)) {
                this.unitClass = parseInt(this.unit);
                this.adapter = uc.getSelectedAdapter(this.unitClass);
            } else {
                this.unitClass = null;
                this.adapter = null;
            }

            this.labelToken = properties.label;

            if ([-1, null].indexOf(this.type) === -1) {
                this.initialized = true;
            } else {
                this.initialized = false;
                this.valueSet = false;
                this.value = undefined;
                this._updateValue = undefined;
            }

            this.notifyLockStatus();
        },
        /**
         * Returns current properties for the item.
         *
         * @returns {object} item properties
         */
        getProperties: function() {
            return {
                access: {
                    read: this.readable,
                    write: this.writable
                },
                min: this.min,
                max: this.max,
                step: this.step,
                digits: this.digits,
                label: this.labelToken,
                unit: this.unit,
                unitClass: (typeof this.unitClass === "number" && !isNaN(this.unitClass)) ? this.unitClass : null,
                initialized: this.initialized,
                type: this.type,
                warn: {
                    min: this.warnmin,
                    max: this.warnmax
                },
                prewarn: {
                    min: this.prewarnmin,
                    max: this.prewarnmax
                }
            };
        },
        /**
         * Adds a new update target to the Item
         *
         * @private
         * @param target - target for updates
         * @return id update target id
         */
        addUpdateTarget: function(target) {
            var targetId = Date.now();
            while (this._updateTargets[targetId] !== undefined) {
                targetId++;
            }
            this._updateTargets[targetId] = target;

            this.notifyLockStatus(targetId);
            this.notifyUpdateTargets(targetId);

            shmi.log("[Item] subscribed item '" + this.name + "' with id " + targetId, 1);
            return targetId;
        },
        /**
         * Removes update target with specified id
         *
         * @private
         * @param targetId - update target id of target to remove
         */
        removeUpdateTarget: function(targetId) {
            if (targetId === undefined) {
                shmi.log("[Item] target id undefined", 1);
                return;
            }
            if (targetId === null) {
                shmi.log("[Item] target id null", 1);
                return;
            }
            delete this._updateTargets[targetId];
            shmi.log("[Item] unsubscribed item '" + this.name + "' with id " + targetId, 1);
        },
        /**
         * Writes the specified value to connect
         *
         * @param {any} value value to write
         * @param {boolean} ignoreAdapter true when value should be set in original unit
         */
        writeValue: function(value, ignoreAdapter) {
            var self = this,
                sendValues = {},
                setValue;

            if (!self.initialized) {
                errLog("tried to write uninitialized item:", self.name);
                return;
            } else if (!self.subscribed) {
                errLog("tried to write to not subscribed item:", self.name);
                return;
            }

            /* process input if adapter is set */
            if (!ignoreAdapter && self.adapter) {
                setValue = self.adapter.inFunction(value);
            } else {
                setValue = value;
            }

            if (((this.type === shmi.c("TYPE_INT")) || (this.type === shmi.c("TYPE_FLOAT"))) && (typeof this.min === 'number') && (typeof this.max === 'number') && ((this.min !== 0) || (this.max !== 0))) {
                if (setValue < this.min) {
                    setValue = this.min;
                }
                if (setValue > this.max) {
                    setValue = this.max;
                }
            }

            if (toType(self, setValue) === self.value) {
                return;
                /* don't do anything if value is not changed */
            }

            if (self.virtual) {
                if (self.writable) self.setValue(setValue);
            } else {
                sendValues[self.name] = self.type === shmi.c("TYPE_BOOL") ? setValue === 1 : toType(self, setValue);
                queueWrite(sendValues);
            }
        },
        /**
         * Reads current value of item.
         *
         * @param {boolean} ignoreAdapter true to read value in original unit
         * @returns {type} current item value
         */
        readValue: function(ignoreAdapter) {
            var self = this,
                reportValue;

            /* process output if adapter is set */
            if (self.adapter && !ignoreAdapter) {
                reportValue = self.adapter.outFunction(self.value);
            } else {
                reportValue = self.value;
            }

            return reportValue;
        },
        /**
         * Only writes to an item if it has the expected value. May be used for
         * synchronized write access to items used by multiple clients at once.
         *
         * @param {number} expected Value the item is expected to have.
         * @param {number} desired New value to write.
         * @param {shmi.visuals.core.Item~cmpxchgCallback} callback Callback
         *  indicating success or failure. If the item did not have the
         *  expected value, the items' new value is returned as well.
         */
        compareExchange: function(expected, desired, callback) {
            var self = this,
                request = shmi.requires("visuals.tools.connect").request,
                im = shmi.requires("visuals.session.ItemManager");

            if (!self.initialized) {
                errLog("attempted to compare & exchange with an uninitialized item:", self.name);
                callback(null, false, {
                    category: "shmi:connect:api:io",
                    errc: 2147483647,
                    message: "((unknown error))"
                });
            }

            if (self.virtual) {
                if (!self.writable) {
                    callback(self.value, false, {
                        category: "shmi:connect:api:io",
                        errc: 2,
                        message: "no write access"
                    });
                } else if (self.value !== expected) {
                    callback(self.value, true, {
                        category: "shmi:connect:api:io",
                        errc: 6,
                        message: "expectation failed"
                    });
                } else {
                    callback(null, false, null);
                }
            } else {
                request("io.compare_exchange", {
                    item_alias: self.name,
                    expected: expected,
                    desired: desired
                }, function(response, err) {
                    if (!err && im.writeEventEnabled) {
                        shmi.fire("write-item", { [self.name]: desired });
                    }
                    callback(
                        response,
                        (err && err.category === "shmi:connect:api:io" && err.errc === 6),
                        err
                    );
                });
            }
        },
        /**
         * returns custom properties bitmask if defined
         *
         * @returns {Number} custom properties bitmask
         */
        getBitmask: function() {
            return this.bitmask;
        },
        /**
         * Tests if the item is a member of a datagrid structure.
         *
         * @returns {Boolean}
         */
        isDataGridMember: function() {
            if (this._dataGridInfo !== null) {
                return true;
            }
            return false;
        },
        /**
         * If the item is a member of a datagrid structure, this function returns an object
         * with name, row- and cell-index of the item within the datagrid.
         *
         * properties: {
         *  gridName: <Name of Datagrid>,
         *  rowIndex: <Row Index>,
         *  cellIndex: <Cell Index>
         * }
         *
         * @returns {shmi.visuals.core.Item._dataGridInfo}
         */
        getDataGridInfo: function() {
            return this._dataGridInfo;
        },
        /**
         * Sets datagrid info on the item. Called by DataGrid init functions.
         *
         * @private
         * @param {string} gridName name of datagrid
         * @param {number} rowIndex row index
         * @param {number} cellIndex cell index
         * @returns {undefined}
         */
        setDataGridInfo: function(gridName, rowIndex, cellIndex) {
            this._dataGridInfo = {
                gridName: gridName,
                rowIndex: rowIndex,
                cellIndex: cellIndex
            };
        },
        /**
         * resets datagrid info on the item. Called by DataGrid on item delete.
         *
         * @private
         * @returns {undefined}
         */
        clearDataGridInfo: function() {
            this._dataGridInfo = null;
        },
        /**
         * Sets the value of the item
         *
         * @private
         * @param value - new value to set
         */
        setValue: function(value) {
            if (!this.initialized) {
                return;
            }
            this.value = toType(this, value);
            this.valueSet = true;

            var curTime = Date.now(),
                dt = curTime - this.lastSetTime;
            if (this.lastSetTime !== 0) {
                this.interval = this.interval + ((dt - this.interval) / 2);
                this.interval = Math.round(this.interval);
            }

            /* skip to the last value if updated to frequently (standby / background / congestion) */
            if (!this.subscribed) {
                // Item is not marked as subscribed and thus observers aren't
                // notified about this value change.
            } else if (dt >= shmi.c("MIN_UPDATE_INTERVAL")) {
                this.lastSetTime = curTime;
                this.notifyUpdateTargets();
            } else {
                clearTimeout(this.setTO);
                this.setTO = setTimeout(function() {
                    this.lastSetTime = curTime;
                    this.notifyUpdateTargets();
                }.bind(this), shmi.c("MIN_UPDATE_INTERVAL") - dt);
            }
        },
        /**
         * Notifies update targets of value change
         * @private
         */
        notifyUpdateTargets: function(utId) {
            var self = this,
                iter = shmi.requires("visuals.tools.iterate").iterateObject,
                reportValue,
                updateTarget = null;

            if (self.initialized && self.subscribed && self.valueSet) {
                /* process output if adapter is set */
                if (self.adapter) {
                    reportValue = self.adapter.outFunction(self.value);
                } else {
                    reportValue = self.value;
                }

                if (utId !== undefined) {
                    updateTarget = self._updateTargets[utId];
                    if (updateTarget) {
                        try {
                            updateTarget.setValue(reportValue, self.type, self.name);
                        } catch (exc) {
                            errLog("exception running setValue on subscriber:", utId, exc);
                        }
                    } else {
                        errLog("subscriber not found:", utId);
                    }
                } else if (self._updateValue !== self.value) { /* do not run update callbacks if value is unchanged */
                    iter(self._updateTargets, function(val, targetId) {
                        try {
                            self._updateTargets[targetId].setValue(reportValue, self.type, self.name);
                        } catch (exc) {
                            errLog("exception running setValue on subscriber:", targetId, exc);
                        }
                    });
                    self._updateValue = self.value;
                }
            }
        },
        /**
         * Notifies update targets of state change
         * @private
         */
        notifyLockStatus: function(utId) {
            var self = this,
                updateTarget = null,
                iterObj = shmi.requires("visuals.tools.iterate.iterateObject");

            if (utId !== undefined) {
                updateTarget = self._updateTargets[utId];
                if (!updateTarget) {
                    errLog("subscriber not found:", utId);
                    logSubscriber(self, self._updateTargets[utId]);
                } else {
                    applyLockStatus(self, updateTarget);
                    applyProperties(self, updateTarget);
                }
            } else {
                iterObj(self._updateTargets, function(currentTarget) {
                    applyLockStatus(self, currentTarget);
                    applyProperties(self, currentTarget);
                });
            }
        }
    };
    // MODULE CODE - END
})();

(function() {
    var MODULE_NAME = "visuals.core",
        module = shmi.pkg(MODULE_NAME);

    // MODULE CODE - START

    /* private variables */

    /* private functions */
    var errLog = (function() {
        var MN = "[" + MODULE_NAME + ".BitItem]  ";
        MN += " ".repeat(Math.max(0, MN.length - 20));

        return console.error.bind(console, MN);
    }());

    /**
     * Regenerates the items properties.
     *
     * @private
     * @param {BitItem} self Reference to a BitItem
     */
    function updateProperties(self) {
        var im = shmi.requires("visuals.session.ItemManager"),
            item = im.getItem(self.parentItemName),
            access = [];

        if (self.parentItemIsCompatible) {
            if (item.writable) {
                access.push("write");
            }

            if (item.readable) {
                access.push("read");
            }
        }

        self.setProperties({
            access: access,
            min: 0,
            max: 1,
            step: 1,
            value_type: "boolean",
            warn: null,
            prewarn: null,
            digits: 0,
            precision: 0,
            unit: null,
            label: null
        });
    }

    /**
     * Subscribes the parent item with appropriate handlers.
     *
     * @private
     * @param {BitItem} self Reference to a BitItem
     */
    function subscribeParentItem(self) {
        var im = shmi.requires("visuals.session.ItemManager");

        self.parentItemToken = im.subscribeItem(self.parentItemName, {
            setValue: function setValue(value) {
                var valueIsCompatible = (typeof (value) === 'number' || typeof (value) === 'boolean');
                if (self.parentItemIsCompatible !== valueIsCompatible) {
                    self.parentItemIsCompatible = valueIsCompatible;
                    updateProperties(self);
                }

                if (valueIsCompatible) {
                    self.setValue(!!self.bitMask && (value & self.bitMask) === self.bitMask);
                }
            },
            setProperties: updateProperties.bind(null, self)
        });
    }

    /**
     * Unsubscribes the parent item.
     *
     * @private
     * @param {BitItem} self Reference to a BitItem
     */
    function unsubscribeParentItem(self) {
        if (self.parentItemToken) {
            self.parentItemToken.unlisten();
            self.parentItemToken = null;
            self.setProperties({
                access: [],
                min: 0,
                max: 1,
                step: 1,
                value_type: null,
                warn: null,
                prewarn: null,
                digits: 0,
                precision: 0,
                unit: null,
                label: null
            });
        }
    }

    /**
     * Starts the compare and exchange operation for the given bit item. May
     * automatically retry setting or clearing the items bit.
     *
     * @private
     * @param {BitItem} self Reference to a BitItem
     * @param {Item} item Reference to the parent item
     * @param {*} expected Value
     */
    function startWriteBits(self, item, expected) {
        var currentAction = self.pendingAction,
            desired;

        if (expected === null || typeof (expected) === "undefined") {
            expected = item.readValue(true);
        }

        desired = (self.pendingAction === "set") ? (expected | self.bitMask) : (expected & ~self.bitMask);

        if (self.pendingAction === null) {
            // Nothing to do!
            return;
        } else if (self.pendingAction === "set" && (expected & self.bitMask) === self.bitMask) {
            // Nothing to do!
            self.pendingAction = null;
            return;
        } else if (self.pendingAction === "unset" && (expected & self.bitMask) === 0) {
            // Nothing to do!
            self.pendingAction = null;
            return;
        }

        item.compareExchange(expected, desired, function cmpxchgCb(response, retry, err) {
            if (retry) {
                startWriteBits(self, item, response);

                return;
            } else if (err) {
                errLog("failed to apply bitmask", err);
            }

            if (currentAction !== self.pendingAction) {
                // Retry!
                startWriteBits(self, item, desired);
            } else {
                self.pendingAction = null;
            }
        });
    }

    /* public functions */

    /**
     * Item that maps its value to a given bit of another item of numberic
     * type.
     * @constructor shmi.visuals.core.BitItem
     *
     * @param {string} virtualName Name of the item
     * @param {string} itemName Name of the parent item
     * @param {number} bitIdx Index of the bit to map the item to.
     */
    module.BitItem = function(virtualName, itemName, bitIdx) {
        shmi.visuals.core.Item.call(this, virtualName, true);

        this.parentItemName = itemName;
        this.parentItemToken = null;
        this.parentItemIsCompatible = true;
        this.pendingAction = null;
        this.bitMask = bitIdx === null ? null : 1 << bitIdx;
    };

    /** @lends shmi.visuals.core.BitItem */
    module.BitItem.prototype = {
        /**
         * Writes the specified value to connect
         *
         * @param {any} value value to write
         */
        writeValue: function(value) {
            var self = this,
                im = shmi.requires("visuals.session.ItemManager"),
                item = im.getItem(self.parentItemName);

            if (!self.initialized) {
                errLog("tried to write uninitialized item:", self.name);
                return;
            } else if (!self.subscribed) {
                errLog("tried to write to not subscribed item:", self.name);
                return;
            }

            if (value === 1 || value === '1' || value === 'true') {
                value = true;
            } else if (value === 0 || value === '0' || value === 'false') {
                value = false;
            } else if (value !== true && value !== false) {
                errLog("tried to write invalid value to bit item:", value);
                return;
            }

            if (!item) {
                errLog("unable to find parent item", self.parentItemName);
                return;
            }

            var startNewAction = self.pendingAction === null;
            self.pendingAction = value ? "set" : "unset";
            if (startNewAction) {
                startWriteBits(self, item);
            }
        },
        /**
         * Adds a new update target to the Item
         *
         * @private
         * @param target - target for updates
         * @return id update target id
         */
        addUpdateTarget: function(target) {
            if (this.bitMask !== null && Object.keys(this._updateTargets).length === 0) {
                subscribeParentItem(this);
            }

            return shmi.visuals.core.Item.prototype.addUpdateTarget.call(this, target);
        },
        /**
         * Removes update target with specified id
         *
         * @private
         * @param targetId - update target id of target to remove
         */
        removeUpdateTarget: function(targetId) {
            shmi.visuals.core.Item.prototype.removeUpdateTarget.call(this, targetId);

            if (this.bitMask !== null && Object.keys(this._updateTargets).length === 0) {
                unsubscribeParentItem(this);
            }
        }
    };
    // MODULE CODE - END

    shmi.extend(module.BitItem, shmi.visuals.core.Item);
})();

/**
 * Callback for compare exchange operations.
 * @callback shmi.visuals.core.Item~cmpxchgCallback
 * @param {(boolean|number|string|null)} actualValue Value the item
 *  actually had if the compare exchange operation failed due to the
 *  expected value not being the items actual value.
 * @param {boolean} retry Whether or not the operation failed due to the
 *  expected value not being the items actual value. If set, in most cases,
 *  the items new value should be evaluated and the operation should be
 *  tried again.
 * @param {module:visuals/tools/connect~RequestError} error
 */

(function() {
    shmi.pkg("visuals.core");

    ////////

    var maxQueueLength = 100,
        timeoutLength = 50,
        inProgress = false,
        actionMap = {},
        tickTimeout = null;

    /**
     * Reschedules the timer responsible for calling `subscriptionTickHandler`.
     * If the action queue contains more than `maxQueueLength` entries and
     * the tick handler has already been scheduled, no action is performed.
     *
     * @private
     */
    function reschedule() {
        // If the tick handler has already been queued and the action queue
        // hit its limit, don't cancel the current tick handlers timeout but
        // let the timer expire.
        if (tickTimeout !== null && Object.keys(actionMap).length >= maxQueueLength) {
            return;
        }

        // If the tick handler has already been queued, cancel it before
        // scheduling a new one.
        if (tickTimeout !== null) {
            clearTimeout(tickTimeout);
        }

        tickTimeout = setTimeout(subscriptionTickHandler, timeoutLength);
    }

    /**
     * Returns an array of item names that were scheduled for the given action.
     *
     * @private
     * @param {string} action
     * @returns {string[]} Array of item names
     */
    function queueFromActionMap(action) {
        var iter = shmi.requires("visuals.tools.iterate").iterateObject,
            out = [];
        iter(actionMap, function(queuedAction, itemName) {
            if (queuedAction === action && out.length < maxQueueLength) {
                out.push(itemName);
                delete actionMap[itemName];
            }
        });

        return out;
    }

    function sendRequest(command, queue) {
        var request = shmi.requires("visuals.tools.connect").request;

        inProgress = true;
        request(command, queue, function onRequest(response, err) {
            if (err) {
                console.error("[ItemManager] " + command + " failed:", err.category, err.errc, err.message);
            }
            inProgress = false;

            // Do more work.
            subscriptionTickHandler();
        });
    }

    /**
     * Handler responsible for subscribing/unsubscribing items on WebIQ Server.
     *
     * @private
     */
    function subscriptionTickHandler() {
        var im = shmi.visuals.session.ItemManager;
        tickTimeout = null;

        // Check if there is still a pending request. If so, we need to wait
        // for that request to finish before doing any more work. The request
        // handler function will reschedule this handler at some point.
        if (inProgress) {
            return;
        }

        // Get items that need to be subscribed.
        var queue = queueFromActionMap('subscribe');
        if (queue.length > 0) {
            if (shmi.visuals.session.config.debug) {
                console.debug("SUB", queue);
            }
            queue.forEach(function(itemName) {
                var item = im.getItem(itemName);
                if (item) {
                    item.type = null; //set type back to uninitialized
                }
            });
            sendRequest("io.subscribe", queue);
        } else {
            // Get items that need to be unsubscribed.
            queue = queueFromActionMap('unsubscribe');
            if (queue.length > 0) {
                if (shmi.visuals.session.config.debug) {
                    console.debug("UNSUB", queue);
                }
                queue.forEach(function(itemName) {
                    var item = im.getItem(itemName);
                    if (item) {
                        item.type = null; //set type back to uninitialized
                    }
                });
                sendRequest("io.unsubscribe", queue);
            }
        }
    }

    /**
     * Queues a subscribe action. If the item is currently queued to be
     * unsubscribed but the subscription is still active on WebIQ Server,
     * resurrect the subscription instead of resubscribing the item.
     *
     * @private
     * @param {Item} item Item to subscribe.
     */
    function subscribeItem(item) {
        var prevAction = actionMap[item.name];

        item.subscribed = true;
        if (prevAction === "unsubscribe") {
            // Item is queued to be unsubscribed. Reverse the unsubscription.
            if (item.initialized) {
                item._updateValue = undefined;
                item.notifyUpdateTargets();
            }
            delete actionMap[item.name];
        } else if (prevAction === "subscribe") {
            // Item is already queued to be subscribed.
        } else {
            actionMap[item.name] = "subscribe";
            reschedule();
        }
    }

    /**
     * Queues an unsubscribe action. If the item is currently queued to be
     * subscribed, the subscribe action is removed and no calls to WebIQ Server
     * are made.
     *
     * @private
     * @param {Item} item Item to unsubscribe.
     */
    function unsubscribeItem(item) {
        var prevAction = actionMap[item.name];

        item.subscribed = false;
        if (prevAction === "subscribe") {
            // Item is queued to be subscribed. Just remove it from the queue.
            delete actionMap[item.name];
        } else if (prevAction === "unsubscribe") {
            // Item is already queued to be unsubscribed.
        } else {
            actionMap[item.name] = "unsubscribe";
            reschedule();
        }
    }

    function setItemInfo(self, msg) {
        self.setProperties(msg.data);
    }

    function setItemValues(self, msg) {
        var iter = shmi.requires("visuals.tools.iterate").iterateObject;
        iter(msg.data, function(itemValue, itemName) {
            self.setValue(itemName, itemValue);
        });
    }

    function createBitItem(itemName) {
        var tokens = itemName.match(/^bit\[(\d+)\]:(.+)$/);

        if (!tokens) {
            return new shmi.visuals.core.BitItem(itemName, null, null);
        }

        return new shmi.visuals.core.BitItem(itemName, tokens[2], parseInt(tokens[1]));
    }

    /**
     * Manages subscriptions and general access to items either connected to process-data (connect based items) or local values (virtual items).
     *
     * An instance of ItemManager is automatically created during application startup and can be accessed via the session object:
     * @example <caption>getting a reference to the ItemManager</caption>
     var ses = shmi.visuals.session; //get reference to session
     var im = ses.ItemManager; //get reference to ItemManager instance
     *
     * @constructor
     */
    shmi.visuals.core.ItemManager = function() {
        var self = this;

        self.items = {};
        self.writeEventEnabled = false;
        self.next_id = 0;

        shmi.registerMsgHandler("item.info", function(msg) {
            setItemInfo(self, msg);
        });

        shmi.registerMsgHandler("io.values", function(msg) {
            setItemValues(self, msg);
        });
    };

    shmi.visuals.core.ItemManager.prototype = {
        /**
         * creates an item-handler object with stubs for all interface functions
         *
         * @returns {object} item-handler object
         */
        getItemHandler: function() {
            var noop = function() {
            };
            return {
                setValue: noop,
                setProperties: noop,
                lock: noop,
                unlock: noop
            };
        },
        /**
         * Creates a new item with the specified name
         *
         * @private
         * @param name - name of the new item
         */
        _createItem: function(name) {
            if (typeof (name) !== 'string') {
                shmi.log("[ItemManager] invalid item name '" + name + "'", 3);
                return;
            } else if (this.items[name] !== undefined) {
                shmi.log("[ItemManager] item '" + name + "' already exists", 1);
                return;
            }

            if ((name.indexOf("virtual:") === 0) || (name.indexOf("objmap:") === 0)) {
                this.items[name] = new shmi.visuals.core.Item(name, true);
            } else if (name.indexOf("bit[") === 0) {
                this.items[name] = createBitItem(name);
            } else {
                this.items[name] = new shmi.visuals.core.Item(name);
            }
        },
        /**
         * Generate a new id to use for JSON API messages.
         *
         * @private
         * @returns {number} An id that is unique for this instance of the
         *  ItemManager.
         */
        _getNextId: function() {
            return ++this.next_id;
        },
        /**
         * Get reference to item of specified name.
         *
         * @param   {string}                 name name of item
         * @returns {shmi.visuals.core.Item} reference to item or null if no matching item was fount
         */
        getItem: function(name) {
            if (this.items[name] !== undefined) {
                return this.items[name];
            }
            return null;
        },
        /**
         * Removes item with the specified name from the manager
         *
         * @private
         * @param name - name of item to remove
         */
        removeItem: function(name) {
            var self = this,
                iter = shmi.requires("visuals.tools.iterate").iterateObject;

            if (self.items[name]) {
                iter(self.items[name]._updateTargets, function(value, targetId) {
                    delete self.items[name]._updateTargets[targetId];
                });
                delete self.items[name];
            }
        },
        /**
         * Removes all subscribers from the manager
         *
         * @private
         */
        removeAll: function() {
            var self = this,
                removed = 0,
                iter = shmi.requires("visuals.tools.iterate").iterateObject;
            iter(self.items, function(val, name) {
                iter(self.items[name]._updateTargets, function(value, targetId) {
                    delete self.items[name]._updateTargets[targetId];
                    removed++;
                });
            });
            shmi.log("[ItemManager] removed all subscribers (" + removed + ")", 1);
        },
        /**
         * Write value to an item matching the specified name
         *
         * @param name - name of item
         * @param value - new value for item
         */
        writeValue: function(name, value) {
            if (this.items[name] === undefined) {
                console.warn("[ItemManager]", "tried to write non-existing item:", name);
            } else {
                this.items[name].writeValue(value);
            }
        },
        /**
         * Reads the current value of an item
         *
         * @param name - name of item
         * @return value - current value of item
         */
        readValue: function(name) {
            if (!this.items[name]) {
                return null;
            }
            return this.items[name].readValue();
        },
        /**
         * Sets the value of the specified item. Called on value-change message from connect host.
         *
         * @private
         * @param name - name of the item
         * @param value - new value of the item
         */
        setValue: function(name, value) {
            if (this.items[name] === undefined) {
                console.warn("[ItemManager]", "tried to set-value non-existing item:", name);
            } else {
                this.items[name].setValue(value);
            }
        },
        /**
         * Only writes to an item if it has the expected value. May be used for
         * synchronized write access to items used by multiple clients at once.
         *
         * @param {string} name Name of the item to execute the operation on.
         * @param {number} expected Value the item is expected to have.
         * @param {number} desired New value to write.
         * @param {shmi.visuals.core.Item~cmpxchgCallback} callback Callback
         *  indicating success or failure. If the item did not have the
         *  expected value, the items' new value is returned as well.
         */
        compareExchange: function(name, expected, desired, callback) {
            if (this.items[name] === undefined) {
                console.warn("[ItemManager]", "attempted to compare & exchange on a non-existing item:", name);
                callback(null, false, {
                    category: "shmi:connect:api:io",
                    code: 2147483647,
                    message: "((unknown error))"
                });
            } else {
                this.items[name].compareExchange(expected, desired, callback);
            }
        },
        /**
         * Subscribes item of specified name to specified subscriber. The subscriber must implement
         * the following interface functions:
         * setValue: <function(value)>,
         * setProperties: <function(min,max,..)>,
         * lock: <function>,
         * unlock: <function>
         *
         * @param name - name of item to subscribe
         * @param subscriber - subscription target control
         * @return subscriber token
         * @example <caption>Subscribing to an item</caption>
         var im = shmi.requires("visuals.session.ItemManager"),
            itemHandler = im.getItemHandler(),
            itemName = "DSin1",
            tok = null;

         itemHandler.setValue = function(v) {
                console.log("item value:", v);
            };
         //subscribe item to receive value updates:
         tok = im.subscribeItem(itemName, itemHandler);

         //... when subsription is no longer needed, unsubscribe:
         im.unsubscribeItem(tok);

         */
        subscribeItem: function(name, subscriber) {
            var self = this,
                isNewSubscription = false;

            if (self.items[name] === undefined) {
                self._createItem(name);
            }

            if ((name !== null) && self.items[name] && (!self.items[name].virtual) && (Object.keys(self.items[name]._updateTargets).length === 0)) {
                isNewSubscription = true;
            }

            var listenToken = {
                name: name,
                subscriberId: self.items[name].addUpdateTarget(subscriber),
                unlisten: null
            };
            listenToken.unlisten = function() {
                self.unsubscribeItem(listenToken);
            };

            if (isNewSubscription) {
                subscribeItem(self.items[name]);
            }

            return listenToken;
        },
        /**
         * Unsubscribes item-handler linked to specified subscriber token.
         *
         * @param token - subscriber token
         */
        unsubscribeItem: function(token) {
            var self = this,
                itemName = null;
            if (arguments.length === 1) {
                if (self.items[token.name] !== undefined) {
                    self.items[token.name].removeUpdateTarget(token.subscriberId);
                    itemName = token.name;
                }
            } else if (self.items[arguments[0]] !== undefined) { // backwards compatibility
                self.items[arguments[0]].removeUpdateTarget(arguments[1].subscriberId);
                itemName = arguments[0];
            }
            if ((itemName !== null) && self.items[itemName] && (!self.items[itemName].virtual) && (Object.keys(self.items[itemName]._updateTargets).length === 0)) {
                unsubscribeItem(self.items[itemName]);
            }
        },
        /**
         * Subscribes array of items.
         *
         * @param {string[]} items item names
         * @param {function} [valuesCallback=null] callback to run on value changes
         * @param {function} [propertiesCallback=null] callback to run on property changes
         * @return {object} subscriber token
         * @example <caption>Subscribing multiple item</caption>
         const im = shmi.requires("visuals.session.ItemManager");
         let tok = null;

         //subscribe items:
         tok = im.subscribe(["DSin1", "DSaw1"], (name, value, type) => {
             console.log(`New value for item '${name}': ${value}`);
         }, (name, properties) => {
            console.log(`Properties changed for item '${name}': ${JSON.stringify(properties, null, 4)}`);
         });

         //... when subsription is no longer needed, unsubscribe:
         tok.unlisten();

         */
        subscribe: function(items, valuesCallback = null, propertiesCallback = null) {
            let tokens = items.map((itemName) => {
                const h = this.getItemHandler();

                h.setValue = (typeof valuesCallback === "function") ? (value, type, name) => valuesCallback(name, value, type) : () => {};
                h.setProperties = (typeof propertiesCallback === "function") ? () => propertiesCallback(itemName, this.getItem(itemName).getProperties()) : () => {};

                return this.subscribeItem(itemName, h);
            });

            return {
                unlisten: () => {
                    tokens.forEach((t) => t.unlisten());
                    tokens = [];
                }
            };
        },
        /**
         * Applies specified property data. Called by '@item' message handler when connect
         * changed item properties.
         *
         * @private
         * @param properties property data
         */
        setProperties: function(properties) {
            if (this.items[properties.item_alias] === undefined) {
                this._createItem(properties.item_alias);
            }
            this.items[properties.item_alias].setProperties(properties);
        },
        /**
         * Writes into items without requiring the items to be subscribed.
         *
         * @param {object} itemValues Object where each key is an item alias
         *  and the associated value is the value to write.
         * @param {function} callback Callback to call when the write operation
         *  has completed. The first argument passed to the callback is the
         *  status code of the entire write operation. On success or error code
         *  1 the second argument passed to the callback is an object where
         *  each key is the name of an item and the associated value is the
         *  result of the write operation. On any other error code the second
         *  argument may be an empty object or a string with a short error
         *  description.
         */
        writeDirect: function(itemValues, callback) {
            var request = shmi.requires("visuals.tools.connect").request,
                self = this;
            request("io.write", {
                direct: true,
                values: itemValues
            }, function onRequest(response, err) {
                if (!err && self.writeEventEnabled) {
                    shmi.fire("write-item", itemValues);
                }
                callback(err, response);
            });
        },
        /**
         * Reads item values without requiring the items to be subscribed.
         * Note: Reading items using this method may require WebIQ Server to
         * query each items value from the PLC, introducing additional overhead.
         *
         * @param {array} itemNames An array of item names.
         * @param {function} callback Callback to call when the read operation
         *  has completed. The first argument passed to the callback is the
         *  status code of the read operation. On success the second argument
         *  is an object where each key indicates the name of an item and its
         *  associated value is the read value. On error the contents of the
         *  second argument is undefined. On error 1, the second argument may
         *  contain a partial read result, however `null` values may either
         *  indicate a read error or an actual `null` value for that item.
         */
        readDirect: function(itemNames, callback) {
            var request = shmi.requires("visuals.tools.connect").request;
            request("io.read", itemNames, function onRequest(response, err) {
                callback(err, response);
            });
        },
        /**
         * Enables firing of write-item events, whenever an item is written by the User/HMI
         *
         * @example <caption>Listening to write-item events</caption>
         const im = shmi.requires("visuals.session.ItemManager");
         let tok = null;

         im.enableWriteEvent();
         tok = shmi.listen("write-item", function(evt){
            console.log(evt.detail);
         });

         //... when event listener is no longer needed, unlisten:
         tok.unlisten();

         */
        enableWriteEvent: function() {
            this.writeEventEnabled = true;
        },
        /**
         * Disables firing of write-item events, whenever an item is written by the User/HMI
         */
        disableWriteEvent: function() {
            this.writeEventEnabled = false;
        }
    };
}());

/* removed */

(function() {
    shmi.pkg("visuals.core");
    /**
     * Manages database I/O for the Visuals framework.
     *
     * An Instance of QueryManager is created during initialization and can be referenced via
     * `shmi.visuals.session.QueryManager`.
     *
     * @constructor
     */
    shmi.visuals.core.QueryManager = function() {
        this.queries = {};
    };

    /**
     * getDatabaseParameter - translate old numerical DB IDs to identifiers
     *
     * @param {string|number} inputParameter input parameter supplied by caller
     *
     * @returns {string|null} DB identifier
     */
    function getDatabaseParameter(inputParameter) {
        //name lookup for backwards compatibility
        var nameMap = [
            null, null,
            "internal:project", "internal:project",
            "internal:user", "internal:user",
            "internal:hmi", "internal:hmi"
        ];

        if (typeof inputParameter === "number") {
            return nameMap[inputParameter];
        }

        return inputParameter;
    }

    /**
     * getQueryId - generate ID for new query
     *
     * @param  {object} self query-manager instance reference
     * @return {number}      id
     */
    function getQueryId(self) {
        var id = 1;
        while (self.queries[id] !== undefined) {
            id += 1;
        }
        return id;
    }

    shmi.visuals.core.QueryManager.prototype = {
        /**
         * query - Runs a query on the given table for the specified columns
         *
         * @param {shmi.visuals.core.Query~queryCallback} callback function to run on completion
         * @param {string} table name of table to query
         * @param {string[]} columns columns to query
         * @param {object} filter filter conditions
         * @param {string|number} databasePath database identifier or relative path
         * @param {object[]} sorting column sort settings
         * @return {number} query id
         */
        query: function(callback, table, columns, filter, databasePath, sorting) {
            var self = this,
                request = shmi.requires("visuals.tools.connect").request,
                queryId = getQueryId(self),
                queryParams = {
                    database_path: getDatabaseParameter(databasePath),
                    table_name: table,
                    columns: columns,
                    filter: filter
                };

            self.queries[queryId] = {
                open: false,
                failed: false,
                connect_id: null,
                close: false
            };

            if (Array.isArray(sorting)) {
                queryParams.sort = sorting;
            }

            request("db.open", queryParams, function onRequest(response, err) {
                if (err) {
                    console.error("[QueryManager] query failed:", err.category, err.errc, err.message);
                    self.queries[queryId].failed = true;
                    if (!self.queries[queryId].close) {
                        callback(err, 0, []);
                    } else {
                        self.close(queryId);
                    }
                } else {
                    self.queries[queryId].open = true;
                    self.queries[queryId].connect_id = response.query_id;
                    if (!self.queries[queryId].close) {
                        callback(0, response.total_count, response.columns);
                    } else {
                        self.close(queryId);
                    }
                }
            });
            return queryId;
        },
        /**
         * queryDirect - Runs a query on the given table for the specified fields and directly retrieves
         * the queried data.
         *
         * When using `queryDirect`, queries are closed automatically on completion.
         *
         * @param {shmi.visuals.core.Query~getDataCallback} callback function to run on completion
         * @param {string} table name of table to query
         * @param {string[]} columns fields to query
         * @param {object} filter where conditions
         * @param {string|number} databasePath database identifier or relative path
         * @param {number} [count] number of results to retrieve
         * @param {number} [offset] offset in resultset to start with
         */
        queryDirect: function(callback, table, columns, filter, databasePath, count, offset) {
            var self = this,
                queryId = null;
            //query: function(callback, table, columns, filter, databasePath)
            queryId = self.query(function(queryStatus, queryCount, queryColumns) {
                if (queryStatus === 0) {
                    self.get(function onGet(getStatus, getData) {
                        self.close(queryId);
                        callback(getStatus, getData);
                    }, queryId, offset || 0, count || 2147483647);
                } else {
                    self.close(queryId);
                    callback(queryStatus, null);
                }
            }, table, columns, filter, databasePath);
        },
        /**
         * get - Retrieves data from query
         *
         * @param callback - function to run on completion
         * @param id - query id
         * @param offset - index offset of data
         * @param count - number of rows to retrieve
         */
        get: function(callback, id, offset, count) {
            var self = this,
                request = shmi.requires("visuals.tools.connect").request,
                query = self.queries[id];

            if (!query) {
                throw new Error("[QueryManager] query ID does not exist: " + id);
            }

            request("db.get", {
                query_id: query.connect_id,
                offset: offset,
                limit: count
            }, function onRequest(response, err) {
                if (err) {
                    console.error("[QueryManager] get failed:", err.category, err.errc, err.message);
                    callback(err, null);
                } else {
                    callback(0, { data: response.rows });
                }
            });
        },
        /**
         * close - Closes query of specified id
         *
         * @param id - query id
         * @param {function} [callback] optional callback on completion
         */
        close: function(id, callback) {
            var self = this,
                request = shmi.requires("visuals.tools.connect").request,
                query = self.queries[id];

            if (!query) {
                throw new Error("[QueryManager] query ID does not exist: " + id);
            }

            if (query.open) {
                delete self.queries[id];
                request("db.close", query.connect_id, function onRequest(response, err) {
                    if (err) {
                        console.error("[QueryManager] close failed:", err.category, err.errc, err.message);
                    }
                    if (callback) {
                        if (err) {
                            callback(err);
                        } else {
                            callback(0);
                        }
                    }
                });
            } else if (query.failed) {
                delete self.queries[id];
            } else {
                //will be closed when db.open completes
                query.close = true;
            }
        },
        /**
         * insert - Inserts values into specified columns of given table.
         *
         * Only one row may be inserted at any time.
         *
         * @param {string} table table to insert into
         * @param {string[]} columns column names
         * @param {any[]} values data values
         * @param {function} callback function to run on completion
         * @param {string|number} databasePath database identifier or relative path
         * @param {string} [on_conflict] behaviour when insert fails, possible values: "fail" (default), "ignore", "replace"
         */
        insert: function(table, columns, values, callback, databasePath, on_conflict) {
            var request = shmi.requires("visuals.tools.connect").request;

            request("db.insert", {
                database_path: databasePath,
                table_name: table,
                on_conflict: on_conflict || "fail",
                columns: columns,
                rows: [ values ]
            }, function onRequest(response, err) {
                if (err) {
                    console.error("[QueryManager] insert failed:", err.category, err.errc, err.message);
                    callback(err, null);
                } else {
                    callback(0, response.last_insert_id[0]);
                }
            });
        },
        /**
         * update - update values of database row
         *
         * @param   {string}   table table name
         * @param   {string[]} columns column names
         * @param   {array}    values data values to update into resultset
         * @param   {number}   rowid db row ID to update
         * @param   {function} callback callback function to be run on completion
         * @param   {string|number} databasePath database identifier or relative path
         */
        update: function(table, columns, values, rowid, callback, databasePath) {
            var request = shmi.requires("visuals.tools.connect").request,
                valuesObj = {};

            if (columns.length !== values.length) {
                throw new Error("[QueryManager] number of values does not match number of columns!");
            }

            columns.forEach(function(c, idx) {
                valuesObj[c] = values[idx];
            });

            request("db.update", {
                database_path: databasePath,
                table_name: table,
                values: valuesObj,
                filter: [
                    {
                        mode: "AND",
                        column: "rowid",
                        clauses: [
                            {
                                operator: "==",
                                value: rowid
                            }
                        ]
                    }
                ]
            }, function onRequest(response, err) {
                if (err) {
                    console.error("[QueryManager] update failed:", err.category, err.errc, err.message);
                    callback(err, null);
                } else {
                    callback(0, response.affected_rows);
                }
            });
        },
        /**
         * deleteRow - Deletes a row of data from a database.
         *
         * @param {string} table DB table name
         * @param {number} rowid ROWID to delete
         * @param {function} callback function called when row is deleted
         * @param {string|number} databasePath database identifier or relative path
         * @returns {undefined}
         */
        deleteRow: function(table, rowid, callback, databasePath) {
            var request = shmi.requires("visuals.tools.connect").request;

            request("db.delete", {
                database_path: databasePath,
                table_name: table,
                filter: [
                    {
                        mode: "AND",
                        column: "rowid",
                        clauses: [
                            {
                                operator: "==",
                                value: rowid
                            }
                        ]
                    }
                ]
            }, function onRequest(response, err) {
                if (err) {
                    console.error("[QueryManager] delete failed:", err.category, err.errc, err.message);
                    callback(err, null);
                } else {
                    callback(0, response.affected_rows);
                }
            });
        },
        /**
         * customSQL - Execute SQLite statesments on the custom database.
         *
         * Custom SQL statements are always executed on database ID shmi.c("DB_USR_RW").
         *
         * @param {string} statement SQLite statement to execute
         * @param {function} callback callback function
         * @param {string|number} databasePath database identifier or relative path
         * @param {object} [parameters] optional parameter object
         * @returns {undefined}
         */
        customSQL: function(statement, callback, databasePath, parameters) {
            var request = shmi.requires("visuals.tools.connect").request;

            request("db.sql", {
                database_path: databasePath,
                sql: statement,
                parameters: parameters || {}
            }, function onRequest(response, err) {
                if (err) {
                    console.error("[QueryManager] delete failed:", err.category, err.errc, err.message);
                    callback(err, null);
                } else {
                    callback(0, response);
                }
            });
        },
        /**
         * executePreparedStatement - Execute a named prepared SQLite statement
         *
         * @param {string} statement_name name of the prepared statement
         * @param {object} parameters key-/value-pairs or an array of values to use as parameters for the statements placeholders.
         * @param {function} callback callback function
         * @returns {undefined}
         */
        executePreparedStatement: function(statement_name, parameters, callback) {
            var request = shmi.requires("visuals.tools.connect").request;

            request("db.prepared.execute", {
                statement_name: statement_name,
                parameters: parameters
            }, function onRequest(response, err) {
                if (err) {
                    console.error("[QueryManager] prepared query failed:", err.category, err.errc, err.message);
                    callback(err, null);
                } else {
                    callback(0, response);
                }
            });
        }
    };
})();

(function() {
    'use strict';
    shmi.pkg("visuals.core");

    /**
     * Checks whether or not the given value could be a timestamp.
     *
     * @private
     * @param {*} x Value to check.
     * @returns {boolean} `true` if the given value could be a timestamp,
     *  `false` else.
     */
    function isValidTimestamp(x) {
        return !isNaN(x) && x !== null;
    }

    /**
     * Container class holding a single recipes value including modification
     * timestamp and user.
     *
     * @constructor
     * @private
     * @param {shmi.visuals.core.RecipeManager~Primitive} value
     * @param {number} modifiedTimestamp
     * @param {?string} modifiedBy
     */
    function ValueUpdate(value, modifiedTimestamp, modifiedBy) {
        this.value = value;
        this.modifiedTimestamp = isValidTimestamp(modifiedTimestamp) ? new Date(modifiedTimestamp / 10000) : null;
        this.modifiedBy = modifiedBy || null;

        Object.freeze(this);
    }

    /**
     * Helper function that converts a "normal object" holding value updates as
     * key-, value-pairs into an object where the value of each pair is a
     * `ValueUpdate` object.
     *
     * Helper function used to convert API responses to internally used
     * objects.
     *
     * @private
     * @param {object} obj Key-, Value-pairs containing "normal objects" for
     *  value updates.
     * @returns {object.<string,ValueUpdate>} Key-, Value-store where each key
     *  of the input object has been assigned a `ValueUpdate` object.
     */
    ValueUpdate.convertObject = function convertObject(obj) {
        var iterObj = shmi.requires("visuals.tools.iterate.iterateObject"),
            newobj = {};

        if (obj) {
            iterObj(obj, function(value, key) {
                newobj[key] = new ValueUpdate(value.value, value.modified_timestamp, value.modified_by);
            });
        }

        return newobj;
    };

    /**
     * Recipe management class. Provides functions to capture, apply or modify
     * recipes.
     *
     * @constructor
     * @param {number} id Id of the recipe.
     * @param {number} templateId Id of the template used by the recipe.
     * @param {number} versionId Version id of the recipe.
     * @param {number} versionNum Version number.
     * @param {string} name Name of thre recipe.
     * @param {?string} createdBy Username of the user who captured recipe
     *  values for the first time.
     * @param {number} createdTimestamp Timestamp in 100ns resolution of when
     *  recipe values were captured first.
     * @param {?string} modifiedBy Username of the user who captured the
     *  latest recipe values.
     * @param {number} modifiedTimestamp Timestamp in 100ns resolution of when
     *  recipe values were captured last.
     * @param {?string} comment User-defined comment for the recipe.
     * @param {?shmi.visuals.core.RecipeManager~ValueMap} metadata Metadata.
     * @param {shmi.visuals.core.RecipeManager~ValueMap} values Recipe values.
     * @param {shmi.visuals.core.RecipeManager} manager Reference to the manager.
     */
    shmi.visuals.core.Recipe = function(id, templateId, versionId, versionNum, name, createdBy, createdTimestamp, modifiedBy, modifiedTimestamp, comment, metadata, values, manager) {
        Object.defineProperties(this, {
            id: {
                value: id,
                configurable: false,
                writable: false
            },
            templateId: {
                value: templateId,
                configurable: false,
                writable: false
            },
            manager: {
                value: manager,
                configurable: false,
                writable: false
            }
        });

        this.versionId = versionId;
        this.versionNum = versionNum;
        this.name = name;
        this.createdBy = createdBy;
        this.createdTimestamp = isValidTimestamp(createdTimestamp) ? new Date(createdTimestamp / 10000) : null;
        this.modifiedBy = modifiedBy;
        this.modifiedTimestamp = isValidTimestamp(modifiedTimestamp) ? new Date(modifiedTimestamp / 10000) : null;
        this.comment = comment || null;
        this.metadata = metadata || {};
        this.values = ValueUpdate.convertObject(values);

        Object.seal(this);
    };

    shmi.visuals.core.Recipe.prototype = {
        /**
         * Creates a clone of this recipe with a new name.
         *
         * @param {string} recipeName Unique name of the new recipe.
         * @param {shmi.visuals.core.RecipeManager~getRecipeCallback} callback
         */
        clone: function(newName, callback) {
            var request = shmi.requires("visuals.tools.connect").request;

            shmi.checkArg('newName', newName, 'string');
            shmi.checkArg('callback', callback, 'function');

            request("recipe.clone", {
                recipe_id: this.id,
                new_name: newName
            }, function(newId, err) {
                if (err) {
                    callback(null, err);
                } else if (this.versionId === null) {
                    // Recipe does not have a version. Don't call
                    // `recipe.version.copy`.
                    this.manager.getRecipe(newId, callback);
                } else {
                    // Recipe does have a version so we need to copy over the
                    // recorded values as well.
                    request("recipe.version.copy", {
                        recipe_version_id: this.versionId,
                        destination_recipe: newId
                    }, function(newVersionId, err2) {
                        if (err2) {
                            callback(null, err2);
                        } else {
                            this.manager.getRecipe(newId, callback);
                        }
                    }.bind(this));
                }
            }.bind(this));
        },

        /**
         * Fetches and stores recipe data for this recipe from WebIQ Server.
         *
         * @param {shmi.visuals.core.RecipeManager~noResultCallback} callback
         */
        refresh: function(callback) {
            shmi.checkArg('callback', callback, 'function');

            this.manager.getRecipe(this.id, function(response, err) {
                if (!err) {
                    this.versionId = response.versionId;
                    this.versionNum = response.versionNum;
                    this.name = response.name;
                    this.createdBy = response.createdBy;
                    this.createdTimestamp = isValidTimestamp(response.createdTimestamp) ? new Date(response.createdTimestamp / 10000) : null;
                    this.modifiedBy = response.modifiedBy;
                    this.modifiedTimestamp = isValidTimestamp(response.modifiedTimestamp) ? new Date(response.modifiedTimestamp / 10000) : null;
                    this.comment = response.comment || null;
                    this.metadata = response.metadata || {};
                    this.values = response.values;
                }
                callback(err);
            }.bind(this));
        },

        /**
         * Delete this recipe.
         *
         * @param {shmi.visuals.core.RecipeManager~noResultCallback} callback
         */
        delete: function(callback) {
            var request = shmi.requires("visuals.tools.connect").request;

            shmi.checkArg('callback', callback, 'function');

            request("recipe.del", this.id, function(response, err) {
                callback(err);
            });
        },

        /**
         * Change recipe information.
         *
         * @param {?string} name New name of the recipe.
         * @param {?shmi.visuals.core.RecipeManager~ValueMap} metadata Metadata for the new recipe.
         * @param {boolean} keepExisting Whether to extend the existing set metadata instead of replacing it. Defaults to `true`.
         * @param {shmi.visuals.core.RecipeManager~noResultCallback} callback
         */
        set: function(name, metadata, keepExisting, callback) {
            var request = shmi.requires("visuals.tools.connect").request,
                params = {
                    recipe_id: this.id
                };

            shmi.checkArg('name', name, 'string', 'null');
            shmi.checkArg('metadata', metadata, 'object', 'null');
            shmi.checkArg('keepExisting', keepExisting, 'boolean');
            shmi.checkArg('callback', callback, 'function');

            if (name !== null) {
                params.name = name;
            }

            if (metadata) {
                params.metadata = metadata;
            }

            if (keepExisting !== null) {
                params.keep_existing = keepExisting;
            }

            request("recipe.set", params, function(response, err) {
                if (err) {
                    callback(err);
                } else {
                    this.refresh(callback);
                }
            }.bind(this));
        },

        /**
         * Store the current PLC state in the given recipe.
         *
         * @param {?string} comment User-defined comment to store with the
         *  recipe.
         * @param {shmi.visuals.core.RecipeManager~noResultCallback} callback
         */
        capture: function(comment, callback) {
            var request = shmi.requires("visuals.tools.connect").request,
                params = {
                    recipe_id: this.id
                };

            shmi.checkArg('comment', comment, 'string', 'null');
            shmi.checkArg('callback', callback, 'function');

            if (comment !== null) {
                params.comment = comment;
            }

            //replace existing version
            if (this.versionNum) {
                params.version = this.versionNum;
            }

            request("recipe.capture", params, function(response, err) {
                if (err) {
                    callback(err);
                } else {
                    this.refresh(callback);
                }
            }.bind(this));
        },

        /**
         * Applies the recipe.
         *
         * @param {shmi.visuals.core.RecipeManager~noResultCallback} callback
         */
        apply: function(callback) {
            var request = shmi.requires("visuals.tools.connect").request;

            shmi.checkArg('callback', callback, 'function');

            request("recipe.apply", this.versionId, callback);
        },

        /**
         * Writes item values to the recipe.
         *
         * @param {shmi.visuals.core.RecipeManager~ValueMap} writeData
         * @param {shmi.visuals.core.RecipeManager~noResultCallback} callback
         */
        write: function(writeData, callback) {
            var request = shmi.requires("visuals.tools.connect").request;

            shmi.checkArg('writeData', writeData, 'object');
            shmi.checkArg('callback', callback, 'function');

            request("recipe.version.write", {
                recipe_version_id: this.versionId,
                values: writeData
            }, function(response, err) {
                if (err) {
                    callback(err);
                } else {
                    this.refresh(callback);
                }
            }.bind(this));
        }
    };
}());

(function() {
    'use strict';
    shmi.pkg("visuals.core");

    /**
     * Manages recipe data for the Visuals framework.
     *
     * An instance of RecipeManager is automatically created during initialization and can be
     * referenced via `shmi.visuals.session.RecipeManager`.
     * @constructor
     */
    shmi.visuals.core.RecipeManager = function() {
        Object.freeze(this);
    };

    shmi.visuals.core.RecipeManager.prototype = {
        /**
         * Creates a new template for recipes
         *
         * @param {string} templateName Unique name of the template to create.
         * @param {string[]} items List of items recipes using this template should record.
         * @param {shmi.visuals.core.RecipeTemplate~MetadataMap} metadata Set of metadata recipes using this template inherit.
         * @param {shmi.visuals.core.RecipeManager~getTemplateCallback} callback
         */
        createTemplate: function(templateName, items, metadata, callback) {
            var request = shmi.requires("visuals.tools.connect").request;

            shmi.checkArg('templateName', templateName, 'string');
            shmi.checkArg('items', items, 'array');
            shmi.checkArg('metadata', metadata, 'object');
            shmi.checkArg('callback', callback, 'function');

            request("recipe.template.add", {
                template_name: templateName,
                items: items,
                metadata: metadata
            }, function(newId, err) {
                if (err) {
                    callback(null, err);
                } else {
                    this.getTemplate(newId, callback);
                }
            }.bind(this));
        },

        /**
         * Requests information on the given recipe template.
         *
         * @param {number} templateId
         * @param {shmi.visuals.core.RecipeManager~getTemplateCallback} callback
         */
        getTemplate: function(templateId, callback) {
            var request = shmi.requires("visuals.tools.connect").request;

            shmi.checkArg('templateId', templateId, 'number');
            shmi.checkArg('callback', callback, 'function');

            request("recipe.template.get", templateId, function(response, err) {
                if (err) {
                    callback(null, err);
                } else {
                    callback(new shmi.visuals.core.RecipeTemplate(
                        response.template_id,
                        response.template_name,
                        response.items.map((item) => item.item_alias),
                        response.metadata,
                        this
                    ), null);
                }
            }.bind(this));
        },

        /**
         * Request a list of recipe templates.
         *
         * @param {shmi.visuals.tools.connect~FilterParameters} filterOptions
         * @param {boolean} [filterOptions.include_items] Whether or not to
         *  include the set of items to capture for each recipe template.
         *  Defaults to `false`.
         * @param {boolean} [filterOptions.include_metadata] Whether or not to
         *  include metadata information for each recipe template. Defaults to
         *  `true`.
         * @param {shmi.visuals.core.RecipeManager~listTemplateCallback} callback
         */
        listTemplates: function(filterOptions, callback) {
            var request = shmi.requires("visuals.tools.connect").request;

            shmi.checkArg('filterOptions', filterOptions, 'object');
            shmi.checkArg('callback', callback, 'function');

            request("recipe.template.list", filterOptions, function(response, err) {
                if (err) {
                    callback(null, err);
                } else {
                    response.templates = response.templates.map(function(val) {
                        return new shmi.visuals.core.RecipeTemplate(
                            val.template_id,
                            val.template_name,
                            Array.isArray(val.items) ? val.items.map((item) => item.item_alias) : null,
                            val.metadata,
                            this
                        );
                    }.bind(this));
                    callback(response, null);
                }
            }.bind(this));
        },

        /**
         * Get information on a recipe, including its (latest) recorded values.
         *
         * @param {number} recipeId Id of the recipe to get.
         * @param {shmi.visuals.core.RecipeManager~getRecipeCallback} callback
         */
        getRecipe: function(recipeId, callback) {
            var request = shmi.requires("visuals.tools.connect").request;

            shmi.checkArg('recipeId', recipeId, 'number');
            shmi.checkArg('callback', callback, 'function');

            request("recipe.get", recipeId, function(recipeData, err1) {
                if (err1) {
                    callback(null, err1);
                } else {
                    request("recipe.version.latest", recipeId, function(versionData, err2) {
                        if (err2) {
                            callback(new shmi.visuals.core.Recipe(recipeData.recipe_id, recipeData.template_id, null, null, recipeData.name, null, null, null, null, null, recipeData.metadata, null, this), null);
                        } else {
                            callback(new shmi.visuals.core.Recipe(recipeData.recipe_id, recipeData.template_id, versionData.recipe_version_id, versionData.version, recipeData.name, versionData.created_by, versionData.created_timestamp, versionData.modified_by, versionData.modified_timestamp, versionData.comment, recipeData.metadata, versionData.values, this), null);
                        }
                    }.bind(this));
                }
            }.bind(this));
        },

        /**
         * Request a list of recipes.
         *
         * @param {number} templateId Id of the template to list recipes for.
         * @param {shmi.visuals.tools.connect~FilterParameters} filterOptions
         * @param {boolean} [filterOptions.include_values] Whether or not to
         *  include recipe values. Defaults to `false`.
         * @param {boolean} [filterOptions.include_metadata] Whether or not to
         *  include metadata information for each recipe. Defaults to `true`.
         * @param {shmi.visuals.core.RecipeManager~listRecipeCallback} callback
         */
        listRecipes: function(templateId, filterOptions, callback) {
            var self = this,
                request = shmi.requires("visuals.tools.connect").request,
                iterObj = shmi.requires("visuals.tools.iterate.iterateObject"),
                includeValues = filterOptions.include_values || false;

            shmi.checkArg('templateId', templateId, 'number');
            shmi.checkArg('filterOptions', filterOptions, 'object');
            shmi.checkArg('callback', callback, 'function');

            if (shmi.objectHasOwnProperty(filterOptions, 'include_values')) {
                delete filterOptions.include_values;
            }

            filterOptions.template_id = templateId;
            request("recipe.list", filterOptions, function(response, err) {
                var refcnt = 0;

                function collectCallback(data, resp, e) {
                    if (refcnt <= 0) {
                        // Someone set the refcount to 0 - do nothing.
                        return;
                    } else if (!e) {
                        iterObj(resp, function(val, key) {
                            data[key] = val;
                        });
                    }

                    if (--refcnt === 0) {
                        response.recipes = response.recipes.map(function(val) {
                            return new shmi.visuals.core.Recipe(
                                val.recipe_id,
                                val.template_id,
                                val.recipe_version_id,
                                val.version,
                                val.name,
                                val.created_by,
                                val.created_timestamp,
                                val.modified_by,
                                val.modified_timestamp,
                                val.comment,
                                val.metadata,
                                val.values,
                                self
                            );
                        });
                        callback(response, null);
                    }
                }

                if (err) {
                    callback(null, err);
                } else if (response.recipes.length <= 0 || !includeValues) {
                    response.recipes = response.recipes.map(function(val) {
                        return new shmi.visuals.core.Recipe(val.recipe_id, val.template_id, null, null, val.name, null, null, null, null, null, val.metadata, null, self);
                    });
                    callback(response, null);
                } else {
                    refcnt = response.recipes.length;

                    response.recipes.forEach(function(elem) {
                        request("recipe.version.latest", elem.recipe_id, collectCallback.bind(null, elem));
                    });
                }
            });
        }
    };
}());

/**
 * Enum for primitive types.
 * Can be one of the following values:
 * * undefined
 * * string
 * * int
 * * uint
 * * double
 * * bool
 *
 * @typedef {string} shmi.visuals.core.RecipeManager~PrimitiveType
 */

/**
 * Any primitive javascript value.
 * @typedef {(boolean|number|string)} shmi.visuals.core.RecipeManager~Primitive
 */

/**
 * @typedef {Object.<string,shmi.visuals.core.RecipeManager~Primitive>} shmi.visuals.core.RecipeManager~ValueMap
 */

/**
 * Get recipe template callback
 *
 * @callback shmi.visuals.core.RecipeManager~getTemplateCallback
 * @param {shmi.visuals.core.RecipeTemplate} template The requested recipe template.
 * @param {?shmi.visuals.tools.connect~RequestError} err Error information.
 */

/**
 * List recipe template callback
 *
 * @callback shmi.visuals.core.RecipeManager~listTemplateCallback
 * @param {object} templates
 * @param {shmi.visuals.core.RecipeTemplate[]} templates.templates List of requested
 *  templates.
 * @param {number} templates.total_count Total number of results, ignoring
 *  offset and limit.
 * @param {?shmi.visuals.tools.connect~RequestError} err Error information.
 */

/**
 * Get recipe callback
 *
 * @callback shmi.visuals.core.RecipeManager~getRecipeCallback
 * @param {shmi.visuals.core.Recipe} recipe The requested recipe.
 * @param {?shmi.visuals.tools.connect~RequestError} err Error Information.
 */

/**
 * List recipe callback
 *
 * @callback shmi.visuals.core.RecipeManager~listRecipeCallback
 * @param {object} recipes
 * @param {shmi.visuals.core.Recipe[]} recipes.recipes List of requested recipes.
 * @param {number} recipes.total_count Total number of results, ignoring
 *  offset and limit.
 * @param {?shmi.visuals.tools.connect~RequestError} err Error Information.
 */

/**
 * Callback for requests that do not return any data except for the error
 * code. If no error code is given, the requested operation succeeded.
 *
 * @callback shmi.visuals.core.RecipeManager~noResultCallback
 * @param {?shmi.visuals.tools.connect~RequestError} err Error Information
 */

(function() {
    'use strict';
    shmi.pkg("visuals.core");

    /**
     * Recipe Template management class. Provides functions to modify a
     * a template or to create and list recipes.
     *
     * @constructor
     * @param {number} id Recipe template id.
     * @param {string} name Name of the recipe template.
     * @param {shmi.visuals.core.RecipeTemplate~Metadata} metadata Set of metadata.
     * @param {shmi.visuals.core.RecipeManager} manager Reference to the manager.
     */
    shmi.visuals.core.RecipeTemplate = function(id, name, items, metadata, manager) {
        Object.defineProperties(this, {
            id: {
                value: id,
                configurable: false,
                writable: false
            },
            manager: {
                value: manager,
                configurable: false,
                writable: false
            }
        });

        this.name = name;
        this.items = items || [];
        this.metadata = metadata || {};

        Object.seal(this);
    };

    shmi.visuals.core.RecipeTemplate.prototype = {
        /**
         * Creates a new recipe from this template.
         *
         * @param {string} recipeName Unique name of the new recipe.
         * @param {shmi.visuals.core.RecipeManager~ValueMap} metadata Metadata for the new recipe.
         * @param {shmi.visuals.core.RecipeManager~getRecipeCallback} callback
         */
        createRecipe: function(recipeName, metadata, callback) {
            var request = shmi.requires("visuals.tools.connect").request;

            shmi.checkArg('recipeName', recipeName, 'string');
            shmi.checkArg('metadata', metadata, 'object');
            shmi.checkArg('callback', callback, 'function');

            request("recipe.add", {
                template_id: this.id,
                recipe_name: recipeName,
                metadata: metadata || {}
            }, function(newId, err) {
                if (err) {
                    callback(null, err);
                } else {
                    this.manager.getRecipe(newId, callback);
                }
            }.bind(this));
        },

        /**
         * Creates a clone of the current template with a new name.
         *
         * @param {string} newName Unique name for the cloned template.
         * @param {shmi.visuals.core.RecipeManager~getTemplateCallback} callback
         */
        clone: function(newName, callback) {
            var request = shmi.requires("visuals.tools.connect").request;

            shmi.checkArg('newName', newName, 'string');
            shmi.checkArg('callback', callback, 'function');

            request("recipe.template.clone", {
                template_id: this.id,
                new_name: newName
            }, function(newId, err) {
                if (err) {
                    callback(null, err);
                } else {
                    this.manager.getTemplate(newId, callback);
                }
            }.bind(this));
        },

        /**
         * Alters the recipe template.
         *
         * @param {?string} templateName New name of the template.
         * @param {?string[]} items New/Additional set of items to record.
         * @param {?shmi.visuals.core.RecipeTemplate~Metadata} metadata New/Additional set of metadata recipes using this template inherit.
         * @param {boolean} keepExisting Whether to extend the existing set of items and metadata instead of replacing it. Defaults to `true`.
         * @param {shmi.visuals.core.RecipeManager~noResultCallback} callback
         */
        set: function(templateName, items, metadata, keepExisting, callback) {
            var request = shmi.requires("visuals.tools.connect").request,
                params = {
                    template_id: this.id,
                    keep_existing: keepExisting
                };

            shmi.checkArg('templateName', templateName, 'string', 'null');
            shmi.checkArg('items', items, 'array', 'null');
            shmi.checkArg('metadata', metadata, 'metadata', 'null');
            shmi.checkArg('keepExisting', keepExisting, 'boolean');
            shmi.checkArg('callback', callback, 'function');

            if (templateName !== null) {
                params.name = templateName;
            }

            if (items !== null) {
                params.items = items;
            }

            if (metadata !== null) {
                params.metadata = metadata;
            }

            request("recipe.template.set", params, function(response, err) {
                if (err) {
                    callback(err);
                } else {
                    this.refresh(callback);
                }
            }.bind(this));
        },

        /**
         * Fetches and stores template recipe data for this template from
         * WebIQ Server.
         *
         * @param {shmi.visuals.core.RecipeManager~noResultCallback} callback
         */
        refresh: function(callback) {
            shmi.checkArg('callback', callback, 'function');

            this.manager.getTemplate(this.id, function(response, err) {
                if (!err) {
                    this.name = response.name;
                    this.items = response.items || [];
                    this.metadata = response.metadata || {};
                }
                callback(err);
            }.bind(this));
        },

        /**
         * Deletes this recipe template and the derived recipes.
         *
         * @param {shmi.visuals.core.RecipeManager~noResultCallback} callback
         */
        delete: function(callback) {
            var request = shmi.requires("visuals.tools.connect").request;

            shmi.checkArg('callback', callback, 'function');

            request("recipe.template.del", this.id, function(response, err) {
                callback(err);
            });
        },

        /**
         * Request a list of recipes.
         *
         * @param {shmi.visuals.tools.connect~FilterParameters} filterOptions
         * @param {boolean} [filterOptions.include_values] Whether or not to
         *  include recipe values. Defaults to `false`.
         * @param {boolean} [filterOptions.include_metadata] Whether or not to
         *  include metadata information for each recipe. Defaults to `true`.
         * @param {shmi.visuals.core.RecipeManager~listRecipeCallback} callback
         */
        listRecipes: function(filterOptions, callback) {
            this.manager.listRecipes(this.id, filterOptions, callback);
        }
    };
}());

/**
 * @typedef {Object} shmi.visuals.core.RecipeTemplate~Metadata
 * @property {?shmi.visuals.core.RecipeManager~Primitive} default_value
 *  Default value for the given metadata key.
 * @property {?shmi.visuals.core.RecipeManager~PrimitiveType} value_type
 *  Type of the value. Only required if `default_value` is `null`.
 */

/**
 * Map of metadata information for recipe templates. Each key-, value-pair
 * maps (default-)value-information to a metadata name.
 * @typedef {Object.<string,shmi.visuals.core.RecipeTemplate~Metadata>} shmi.visuals.core.RecipeTemplate~MetadataMap
 */


shmi.pkg("visuals.core");

(function() {
    // -------- Helper functions --------

    function loadOptional(self, propName, modName) {
        try {
            self[propName] = shmi.requires(modName);
            if (shmi.visuals.session.config.debug) {
                console.debug("optional module '", modName, "' loaded");
            }
        } catch (exc) {
            if (shmi.visuals.session.config.debug) {
                console.debug("optional module '", modName, "' not available");
            }
        }
    }

    function isUnitClass(unitText) {
        if (typeof unitText === "string") {
            if (unitText.trim() === "") {
                return false;
            }
        }
        return (!isNaN(unitText));
    }

    /**
     * processTrendData - apply unit-class settings to retreived trend data
     *
     * @param {Object} self trend-manager reference
     * @param {string} trendName name of trend
     * @param {string} valueName name of item
     * @param {number} dataValue value to process
     * @returns {number}
     */
    function processTrendData(self, trendName, valueName, dataValue) {
        if (dataValue === true) {
            dataValue = 1;
        } else if (dataValue === false) {
            dataValue = 0;
        }
        if (self.unitClassModule && self.trendInfo[trendName]) {
            var items = self.trendInfo[trendName].items;
            var item = items.find(function(trendItem) {
                return (trendItem.name && trendItem.name === valueName);
            });
            if (item) {
                if (isUnitClass(item.unit)) {
                    var unitClass = parseInt(item.unit),
                        adapter = self.unitClassModule.getSelectedAdapter(unitClass);

                    if (adapter) {
                        dataValue = adapter.outFunction(dataValue);
                    }
                }
            }
        }
        return dataValue;
    }

    function applyAdapterSettings(item, adapter) {
        item.unit = adapter.unitText;
        item.min = adapter.outFunction(item.min);
        item.max = adapter.outFunction(item.max);
    }

    function processTrendInfo(self, trendInfo) {
        var items = trendInfo.items,
            im = shmi.requires("visuals.session.ItemManager"),
            iter = shmi.requires("visuals.tools.iterate.iterateObject");

        items.forEach(function(item, idx) {
            var realItem = im.getItem(item.name);

            if (self.customInfo[item.name]) {
                iter(self.customInfo[item.name], function(val, prop) {
                    item[prop] = val;
                });
            }

            if (isUnitClass(item.unit)) {
                var unitClass = parseInt(item.unit),
                    ucAdapter = self.unitClassModule.getSelectedAdapter(unitClass);
                if (ucAdapter) {
                    applyAdapterSettings(item, ucAdapter);
                }
            } else if (realItem && realItem.adapter) {
                applyAdapterSettings(item, realItem.adapter);
            }
        });

        return trendInfo;
    }

    // -------- Manager implementation --------

    /**
     * Manages trending data for the Visuals framework.
     *
     * An instance of TrendManager is automatically created during initialization and can be
     * referenced via `shmi.visuals.session.TrendManager`.
     *
     * @constructor
     */
    shmi.visuals.core.TrendManager = function() {
        var self = this;
        self.subscribers = {};
        self.trendInfo = {};

        /* register message handler for trend information requests */
        shmi.registerMsgHandler("trend.live.data", function onLiveTrendData(msg) {
            var sub = self.subscribers[msg.data.id];
            if (sub) {
                msg.data.values.forEach(function(trendValue, idx) {
                    msg.data.values[idx] = processTrendData(self, sub.trend_name, sub.items[idx], trendValue);
                });
                sub.callback(0, {
                    name: sub.trend_name,
                    data: [
                        msg.data
                    ]
                });
            } else {
                console.warn("[TrendManager] subscriber not found, ID:", msg.data.id);
            }
        });

        this.unitClassModule = null;
        this.customInfo = {};

        loadOptional(this, "unitClassModule", "visuals.tools.unitClasses");
    };

    shmi.visuals.core.TrendManager.prototype = {
        /**
         * Available aggregation methods
         */
        AGG_METHODS: {
            key: {
                "last": 0,
                "avg": 1,
                "min": 2,
                "max": 3
            },
            /* value -> key mapping */
            value: [
                "last", "avg", "min", "max" /* key -> value mapping */
            ]
        },
        /**
         * Overrides trend-info provided by connect host for specified item.
         *
         * @example Usage example
         var tm = shmi.requires("visuals.session.TrendManager");
         tm.setCustomInfo("SInt", {
            label: "Temperature",
            unit: "°C",
            min: -100,
            max: 100,
            prewarn_min: -80,
            prewarn_max: 80,
            warn_min: -90,
            warn_max: 90
         });
         *
         * @throws {TypeError} type of argument does not match
         * @param {string} itemName name of item
         * @param {object} itemInfo (partial) item info
         */
        setCustomInfo: function(itemName, itemInfo) {
            var self = this;
            if ((typeof itemName !== "string") || (itemName.trim() === "")) {
                throw new TypeError("argument 'itemName' is not a string");
            }

            if ((typeof itemInfo !== "object") || (itemInfo === null)) {
                throw new TypeError("argument 'itemInfo' is not an object");
            }

            self.customInfo[itemName] = itemInfo;
        },
        /**
         * requests data of the specified trend. returns requested data using the specified callback
         * function after completion.
         *
         * the callback function will be called once all (currently recorded) values have been
         * retrieved. if end_time is set to -1, the callback function will be called again, each
         * time a new set of values is recorded.
         *
         * @param {string} trend_name trend name
         * @param {number} start_time start timestamp of data to retrieve
         * @param {number} end_time end timestamp of data to retrieve; 0 : all until last recorded, -1 : all until last recorded, then keep sending newly recorded values to callback
         * @param {shmi.visuals.core.TrendManager~openTrendCallback} callback callback function
         * @param {number} [unit] aggregation unit in seconds
         * @param {number} [aggregate] aggregate method (0=None [last value], 1=Avg, 2=Min, 3=Max)
         * @param {string[]} [items] retrieve trend-data only for specified items
         * @returns {number} trend subscription id (if end_time is not equal to -1, this id will be -1 and no subscription will be registered)
         */
        openTrend: function(trend_name, start_time, end_time, callback, unit, aggregate, items) {
            var self = this,
                request = shmi.requires("visuals.tools.connect").request,
                subId = -1,
                params = null;

            aggregate = aggregate || 0;
            items = items || (self.trendInfo[trend_name] ? self.trendInfo[trend_name].items.map((item) => item.name) : []);
            params = {
                trend_name: trend_name,
                timestamp_start: start_time,
                aggregation_type: self.AGG_METHODS.value[aggregate],
                aggregation_unit: unit || 1,
                live: false,
                items: items
            };

            /* generate trend subscription id if new values are subscribed to */
            if (end_time === -1) {
                subId = 1;
                while (self.subscribers[subId] !== undefined) {
                    subId++;
                }
                self.subscribers[subId] = {
                    query_id: subId,
                    trend_name: trend_name,
                    items: items,
                    callback: callback,
                    aggregate: aggregate,
                    close: false,
                    open: false
                };
                params.live = true;
                params.live_trend_id = subId;
            } else {
                params.timestamp_end = Math.round(end_time);
            }

            request("trend.query", params, function onRequest(response, err) {
                var result = {
                    name: trend_name,
                    data: []
                };
                if (err) {
                    callback(err, result);
                } else {
                    response.rows.forEach(function(trendRow) {
                        trendRow.values.forEach(function(val, idx) {
                            trendRow.values[idx] = processTrendData(self, trend_name, items[idx], val);
                        });
                        result.data.push(trendRow);
                    });
                    callback(0, result);
                }
                if (end_time === -1) {
                    self.subscribers[subId].open = true;
                    if (self.subscribers[subId].close) {
                        self.closeTrend(trend_name, subId);
                    }
                }
            });

            return subId;
            /* will be -1 unless end_time was specified as -1 */
        },
        /**
         * stops a trend that was opened for live display of new records (end_time = -1).
         *
         * @param {string} trend_name trend name
         * @param {number} subscription_id trend subscription id
         */
        closeTrend: function(trend_name, subscription_id) {
            var self = this,
                request = shmi.requires("visuals.tools.connect").request,
                sub = self.subscribers[subscription_id];
            if (sub !== undefined) {
                if (sub.open) {
                    request("trend.unsubscribe", sub.query_id, function onUnsubscribe(response, err) {
                        delete self.subscribers[subscription_id];
                        if (err) {
                            console.error("[TrendManager] error unsubscribing:", err);
                        }
                    });
                } else {
                    sub.close = true;
                }
            }
        },
        /**
         * Retrieves a list of available trend names.
         *
         * @param {shmi.visuals.core.TrendManager~getTrendListCallback} callback callback function for request answer
         */
        getTrendList: function(callback) {
            var request = shmi.requires("visuals.tools.connect").request;

            request("trend.list", {}, function onRequest(response, err) {
                var result = [];
                if (err) {
                    callback(result, err);
                } else {
                    if (response.recorders) {
                        console.warn("[TrendManager] renaming response property: 'recorders' -> 'trends'");
                        response.trends = response.recorders;
                    }
                    response.trends.forEach(function(tn) {
                        result.push(tn.trend_name);
                    });
                    callback(result, 0);
                }
            });
        },
        /**
         * requests trend-information from the server and runs the specified callback on completion
         *
         * @param {string} trend_name name of trend
         * @param {shmi.visuals.core.TrendManager~getTrendInfoCallback} callback callback function for request answer
         * @param {string[]} [itemList] list of items to receive trend information for
         */
        getTrendInfo: function(trend_name, callback, itemList) {
            var self = this,
                request = shmi.requires("visuals.tools.connect").request;

            request("trend.info", {
                trend_name: trend_name,
                items: itemList || []
            }, function onRequest(response, err) {
                //OLD - Start
                var processedInfo = shmi.cloneObject(response),
                    hash = {};

                if (err) {
                    callback(null, err);
                } else {
                    if (!self.trendInfo[response.trend_name]) { // save trend info
                        self.trendInfo[response.trend_name] = shmi.cloneObject(response);
                        processedInfo = processTrendInfo(self, processedInfo);
                    } else { // add items to the trend info
                        self.trendInfo[response.trend_name].items.forEach(function(trendItem) {
                            hash[trendItem.name] = true; // existing item names
                        });
                        response.items.forEach(function(trendItem) {
                            if (hash[trendItem.name]) {
                                return; // item already exists in the trend info
                            }
                            self.trendInfo[response.trend_name].items.push(shmi.cloneObject(trendItem));
                        });
                        // sort items by name
                        self.trendInfo[response.trend_name].items.sort(function(a, b) {
                            return a.name > b.name;
                        });
                        processedInfo = processTrendInfo(self, processedInfo);
                    }
                    callback(processedInfo, 0);
                }
            });
        }
    };

    /**
     * getTrendData callback function
     *
     * @callback shmi.visuals.core.TrendManager~openTrendCallback
     * @param {number} status code (0 - success, 1 - Error 1, n - Error n)
     * @param {TrendData} trend information
     */

    /**
     * getTrendInfo callback function
     *
     * @callback shmi.visuals.core.TrendManager~getTrendInfoCallback
     * @param {number} status code (0 - success, 1 - Error 1, n - Error n)
     * @param {TrendInfo} trend information
     */

    /**
     * getTrendList callback function
     *
     * @callback shmi.visuals.core.TrendManager~getTrendListCallback
     * @param {TrendList} list of trend names as JSON object
     *
     */
}());

shmi.pkg("visuals.core");
/**
 * Creates a new UiAction from the specified string (-array) or object (-array).
 *
 * UiActions can be used when controls should execute user configurable actions on interactions.
 * Control authors may provide one ore multiple options in a control to define parameters for UiActions
 * that are used to create executable UiAction instances in the control code.
 *
 * To create your own UiActions to be used with controls that provide configurable UiActions, see [[shmi:link:WebIQLibrary/Documentation/External/how-to-create-a-custom-ui-action|How To - Create A Custom UI Action]].
 *
 * @example <caption>creating & executing a UiAction from pre-defined parameters</caption>
var core = shmi.visuals.core,
    parameters = [ //UiAction parameters
        { //first action sets the active view of a screen control to index 2
            "name": "setview",
            "params": [
                ".screen",
                2
            ]
        },
        { //second action opens a notification
            "name": "notify",
            "params": [
                "message",
                "title"
            ]
        }
    ],
    action = null;

//.. initialize UiAction (e.g. in `onInit` method of a control)
action = new core.UiAction(parameters);

//.. later action will be executed (e.g. in a mouse-/touch-handler)
action.execute();
//.. action can be re-used and executed again
action.execute();
 *
 * @constructor
 * @param {string|string[]|object|object[]} actionParameter parameter to create ui-action(-s). DEPRECATED: {string|string[]} parameter types in short-notation are no longer supported and will be removed in upcoming versions.
 * @param {object} [owner] optional instance reference to owner control
 *
 * @returns {UiAction}
 */
shmi.visuals.core.UiAction = function(actionParameter, owner) {
    this.actionParameter = actionParameter;
    this.owner = (owner !== undefined) ? owner : null;
    if (shmi.visuals.session && shmi.visuals.session.config && (shmi.visuals.session.config.action_debug === true)) {
        if (this.owner === null) {
            console.log("UiAction - no owner provided", this);
        } else {
            console.log("UiAction - owner:", owner, this);
        }
    }
    this.onExecute = [];
    this.init();
};

shmi.visuals.core.UiAction.prototype = {
    init: function() {
        var index = 0,
            actions;
        if (Array.isArray(this.actionParameter)) {
            actions = this.actionParameter;
        } else if (typeof this.actionParameter === 'object') {
            actions = [this.actionParameter];
        } else {
            actions = [this.actionParameter];
        }

        var self = this;
        while (index < actions.length) {
            var action = actions[index];

            if (typeof action === "string") {
                var data = action.split(':'),
                    name = data[0];

                data.shift();
                console.warn("[UiAction]", "the following UI-action configuration is using deprecated string notiation and should be updated to object notation:", action);
                if (shmi.visuals.session.userActions && shmi.visuals.session.userActions[name]) {
                    this.onExecute.push((function(actionName, params) {
                        return function(param1, param2, param3) {
                            shmi.visuals.session.userActions[actionName](params, param1, param2, param3, self.owner);
                        };
                    })(name, data));
                } else if (shmi.visuals.session.sysActions && shmi.visuals.session.sysActions[name]) {
                    this.onExecute.push((function(actionName, params) {
                        return function(param1, param2, param3) {
                            shmi.visuals.session.sysActions[actionName](params, param1, param2, param3, self.owner);
                        };
                    })(name, data));
                } else {
                    console.warn("[UiAction]", "unknown UI-action:", action);
                }
            } else if (typeof action === 'object') {
                if (shmi.visuals.session.userActions && shmi.visuals.session.userActions[action.name]) {
                    this.onExecute.push((function(actionName, params) {
                        return function(param1, param2, param3) {
                            shmi.visuals.session.userActions[actionName](params, param1, param2, param3, self.owner);
                        };
                    })(action.name, action.params));
                } else if (shmi.visuals.session.sysActions && shmi.visuals.session.sysActions[action.name]) {
                    this.onExecute.push((function(actionName, params, relative) {
                        return function(param1, param2, param3) {
                            shmi.visuals.session.sysActions[actionName](params, param1, param2, param3, relative ? self.owner : null);
                        };
                    })(action.name, action.params, action.relative));
                } else {
                    console.warn("[UiAction]", "unknown UI-action:", action.name);
                }
            }

            index++;
        }
    },
    /**
     * Executes ui-action.
     *
     * Up to three dynamic parameters may be provided when executing a ui-action.
     *
     */
    execute: function(param1, param2, param3) {
        for (var i = 0; i < this.onExecute.length; i++) {
            this.onExecute[i](param1, param2, param3);
            /*
            try{
                this.onExecute[i](param1, param2, param3);
            } catch(exc){
                shmi.log("[UiAction] Exception executing UiAction: "+exc, 3);
            }
            */
        }
        shmi.log("[UiAction] executed " + this.onExecute.length + " actions", 1);
    }
};

shmi.pkg("visuals.session");

shmi.visuals.session.sysActions = shmi.visuals.session.sysActions || {};

shmi.visuals.session.sysActions['dialog'] = function(params) {
    var dialogControl = null;
    if ((params.length === 3) && (params[2] === "relative")) {
        dialogControl = shmi.ctrl(params[0], arguments[4]);
    } else {
        dialogControl = shmi.ctrl(params[0]);
    }

    if (dialogControl) {
        switch (params[1]) {
        case "show":
        case "open":
            dialogControl.show();
            break;
        case "hide":
        case "close":
            dialogControl.hide();
            break;
        case "default":
            console.error("[UiAction] - dialog", "unknown dialog action '" + params[1] + "'.");
            break;
        default:
            break;
        }
    } else {
        console.error("[UiAction] - dialog", "could not find dialog:", params[0]);
    }
};

shmi.visuals.session.sysActions['set-theme'] = function(params) {
    var themeSuffix = "-theme",
        elem = document.documentElement,
        curClass = null,
        removeClasses = [];
    if (params.length !== 1) {
        for (var i = 0; i < elem.classList.length; i++) {
            curClass = elem.classList[i];
            if (curClass.indexOf(themeSuffix) === (curClass.length - themeSuffix.length)) {
                removeClasses.push(curClass);
            }
        }
        removeClasses.forEach(function(cssClass) {
            elem.classList.remove(cssClass);
        });
    } else {
        for (var j = 0; j < elem.classList.length; j++) {
            curClass = elem.classList[j];
            if (curClass.indexOf(themeSuffix) === (curClass.length - themeSuffix.length)) {
                removeClasses.push(curClass);
            }
        }
        removeClasses.forEach(function(cssClass) {
            elem.classList.remove(cssClass);
        });
        elem.classList.add(params[0]);
    }
};

(function() {
    /**
     * stopSubscription - unsubscribe provided token when called
     *
     * @param {object} subState subscriber state reference object
     * @returns {undefined}
     */
    function stopSubscription(subState) {
    //decouple to make sure subState.token has been set
        shmi.decouple(function() {
            if (subState.token) {
                subState.token.unlisten();
                subState.token = null;
            }
        });
    }

    /**
     * writeBitItem - subscribe & write value to bit-item
     *
     * @param {string} bitItemName name of bit-item
     * @param {boolean} bitValue value to write
     */
    function writeBitItem(bitItemName, bitValue) {
        var im = shmi.requires("visuals.session.ItemManager");

        var item = null,
            subState = {
                token: null
            },
            sub = im.getItemHandler(),
            itemExists = false,
            propertiesSet = false,
            inProgress = false;

        sub.setProperties = function setProperties(min, max, step, name, type) {
            if (propertiesSet) {
                return;
            }

            if (typeof type === "number") {
                if (type !== -1) {
                    item = im.getItem(bitItemName);
                    if (item) {
                        itemExists = true;
                    }
                }
                propertiesSet = true;

                if (!itemExists) {
                    console.error("Attempted to write to non-existing item:", bitItemName);
                    stopSubscription(subState);
                }
            }
        };
        sub.setValue = function setValue(value) {
            if (propertiesSet && itemExists && !inProgress) {
                inProgress = true;
                im.writeValue(bitItemName, bitValue ? 1 : 0);
                stopSubscription(subState);
            }
        };
        subState.token = im.subscribeItem(bitItemName, sub);
    }

    shmi.visuals.session.sysActions['write-item'] = function(params) {
        if (params.length !== 2) {
            shmi.log("[UserAction] write-item - UI-action requires two parameters (<item alias>, <value to set>)", 2);
        } else {
            var im = shmi.visuals.session.ItemManager,
                param = {};

            param[params[0]] = params[1];

            if (typeof params[0] === "string" && params[0].indexOf("bit[") !== 0 && (params[0].indexOf("virtual:") === 0 || (im.getItem(params[0]) && im.getItem(params[0]).virtual))) {
                im.writeValue(params[0], params[1]);
            } else if (typeof params[0] === "string" && params[0].indexOf("bit[") === 0) {
                writeBitItem(params[0], params[1]);
            } else {
                im.writeDirect(param, function() {});
            }
        }
    };
}());

shmi.visuals.session.sysActions['logout'] = function(params) {
    var url = null;
    if (params[0] === true) { //prevent auto-login
        url = new URL(window.location.href);
        url.searchParams.set("autoLogin", "false");
        window.location.href = url.toString();
    } else {
        window.location.reload();
    }
};

shmi.visuals.session.sysActions['logout-confirm'] = function(params) {
    shmi.confirm(params[0] ? params[0] : "logout?", function(conf) {
        if (conf) {
            var url = null;
            if (params[1] === true) { //prevent auto-login
                url = new URL(window.location.href);
                url.searchParams.set("autoLogin", "false");
                window.location.href = url.toString();
            } else {
                window.location.reload();
            }
        }
    });
};

shmi.visuals.session.sysActions['toggle-class'] = function(params) {
    if (params.length === 2) {
        var name = params[0],
            cssClass = params[1],
            element = shmi.getElementByName(name);
        if (element) {
            if (shmi.hasClass(element, cssClass)) {
                shmi.removeClass(element, cssClass);
            } else {
                shmi.addClass(element, cssClass);
            }
        } else {
            shmi.log("[UserAction] toggle-class - no element found by name '" + name + "'", 2);
        }
    }
};

shmi.visuals.session.sysActions['add-class'] = function(params) {
    if (params.length !== 2) {
        shmi.log("[UserAction] add-class - needs two parameters", 2);
    } else {
        var name = params[0],
            cssClass = params[1],
            element = shmi.getElementByName(name);
        shmi.log("[UserAction] add-class - name: " + name + " cssClass: " + cssClass, 2);
        if (element) {
            shmi.addClass(element, cssClass);
        } else {
            shmi.log("[UserAction] add-class - no element found by name '" + name + "'", 2);
        }
    }
};

shmi.visuals.session.sysActions['remove-class'] = function(params) {
    if (params.length !== 2) {
        shmi.log("[UserAction] remove-class - needs two parameters", 2);
    } else {
        var name = params[0],
            cssClass = params[1],
            element = shmi.getElementByName(name);
        shmi.log("[UserAction] remove-class - name: " + name + " cssClass: " + cssClass, 2);
        if (element) {
            shmi.removeClass(element, cssClass);
        } else {
            shmi.log("[UserAction] remove-class - no element found by name '" + name + "'", 2);
        }
    }
};

/**
 * ui-action 'setview' sets the active view of a panel control.
 *
 * @param {string[]} params
 * @param {string} params[0] name of screen control
 * @param {string} params[1] index of view
 */
shmi.visuals.session.sysActions['setview'] = function(params) {
    if (params.length !== 2) {
        shmi.log("[UserAction] setview - needs two parameters", 2);
    } else {
        var control = shmi.ctrl(params[0]);
        if (control) {
            try {
                control.setView(parseInt(params[1]));
                shmi.log("[UserAction] setview - view set", 1);
            } catch (exc) {
                shmi.log("[UserAction] exception setting view for panel: " + exc, 2);
            }
        } else {
            shmi.log("[UserAction] setview - no element found by name '" + params[0] + "'", 2);
        }
    }
};

/**
 * make 'setview' available to panels under same action name 'screen-setview' to support object notation
 * @type type
 */
shmi.visuals.session.sysActions['screen-setview'] = shmi.visuals.session.sysActions['setview'];

/**
 * ui-action 'ask-save' for save dialogs. executes a callback function
 * with a string representing the user selected option as parameter.
 *
 * @param {string[]} params
 * @param {string} params[0] confirmation ID
 * @param {string} params[1] 'SAVE', 'NOSAVE' or 'CANCEL' depending on user selection
 */
shmi.visuals.session.sysActions['ask-save'] = function(params) {
    if (params.length !== 2) {
        shmi.log("[UserAction] ask-save - needs two parameters", 2);
    } else if (shmi.visuals.session.AskSaves[params[0]] !== undefined) {
        var save = params[1] === "SAVE",
            cont = (params[1] === "SAVE" || params[1] === "NOSAVE");
        shmi.visuals.session.AskSaves[params[0]](save, cont);
        delete shmi.visuals.session.AskSaves[params[0]];
    } else {
        shmi.log("[UserAction] ask-save - Save request '" + params[0] + "' was not found", 2);
    }
};

/**
 * ui-action 'confirm' for confirmation dialogs. executes a callback function
 * with a boolean representing the user selected option as parameter.
 *
 * @param {string[]} params
 * @param {string} params[0] confirmation ID
 * @param {string} params[1] 'TRUE' or 'FALSE' depending on user selection
 */
shmi.visuals.session.sysActions['confirm'] = function(params) {
    if (params.length !== 2) {
        shmi.log("[UserAction] confirm - needs two parameters", 2);
    } else if (shmi.visuals.session.Confirmations[params[0]] !== undefined) {
        var param = (params[1] === "TRUE");
        shmi.visuals.session.Confirmations[params[0]](param);
        delete shmi.visuals.session.Confirmations[params[0]];
    } else {
        shmi.log("[UserAction] confirm - Confirmation request '" + params[0] + "' was not found", 2);
    }
};

shmi.visuals.session.sysActions['grid'] = function(params) {
    if (params.length < 2) {
        shmi.log("[UserAction] grid - needs at least two parameters", 2);
    } else {
        var grid = shmi.visuals.session.DataGridManager.grids[params[0]];
        if (grid !== undefined) {
            switch (params[1]) {
            case 'next-page':
                grid.nextPage();
                break;
            case 'previous-page':
                grid.previousPage();
                break;
            case 'refresh':
                if (grid.refresh) {
                    grid.refresh();
                }
                break;
            case 'delete-selected':
                var owner = arguments[4],
                    ctable = shmi.ctrl(params[2], owner),
                    selected = [];
                if (ctable !== undefined) {
                    selected = ctable.getSelectedRows().selRows;
                } else {
                    shmi.log("[UserAction] grid:delete-selected - complex-table '" + params[2] + "' not found", 2);
                }
                for (var i = 0; i < selected.length; i++) {
                    grid.deleteRow(selected[i]);
                }
                break;
            default:
                shmi.log("[UserAction] grid - unknown function '" + params[1] + "' configured", 3);
            }
        } else {
            shmi.log("[UserAction] grid - DataGrid '" + params[0] + "' not found!", 3);
        }
    }
};

shmi.visuals.session.sysActions['createrow'] = function(params) {
    if (params.length < 2) {
        shmi.log("[UserAction] createrow - needs at least two parameters", 2);
    } else {
        var form = shmi.ctrl(params[0]),
            grid = shmi.visuals.session.DataGridManager.grids[params[1]];
        if (form !== undefined) {
            var form_data = [];
            for (var i = 0; i < grid.fields.length; i++) {
                form_data.push({
                    "field": grid.fields[i],
                    "type": 4,
                    "value": ""
                });
            }

            /**
             *
             * @param values
             */
            var writeRow = function(values) {
                var grid_arr = [],
                    c;
                for (i = 0; i < grid.fields.length; i++) {
                    c = {
                        type: 4,
                        min: Number.NaN,
                        max: Number.NaN,
                        value: undefined,
                        field: grid.fields[i]
                    };
                    grid_arr.push(c);
                }

                for (var j = 0; j < values.length; j++) {
                    c = {
                        type: 4,
                        min: Number.NaN,
                        max: Number.NaN,
                        value: values[j].value,
                        field: values[j].field
                    };
                    var g_i = grid.fields.indexOf(c.field);
                    if (g_i !== -1) {
                        grid_arr[g_i] = c;
                    }
                }

                /* insert into grid */
                var r_id = grid.insertRow(grid_arr);
                /* insert into DB */
                shmi.visuals.session.DataGridManager.saveRowToDB(grid.name, r_id, true);
            };

            form.setValues(form_data, writeRow);
        } else {
            shmi.log("[UserAction] createrow - Form '" + params[0] + "' not found!", 3);
        }
    }
};

shmi.visuals.session.sysActions['test-action'] = function(static_params, dyn_params) {
    console.log("UiAction: test-action", static_params, dyn_params);
};

shmi.visuals.session.sysActions['notify'] = function(static_params, dyn_params) {
    shmi.notify(static_params[0], static_params[1]);
};

/**
 * Set active user locale.
 *
 * @example
//string notation
var act_str = "setlocale:en-GB";

//object notation
var act_obj = {
    name: "setlocale",
    params: [ "en-GB" ]
};
 * @param {string[]} static_params locale identifier
 * @param {string[]} dyn_params
 * @returns {undefined}
 */
shmi.visuals.session.sysActions['setlocale'] = function(static_params, dyn_params) {
    if (static_params.length === 1) {
        var um = shmi.requires("visuals.session.UserManager");
        um.setLocale(static_params[0]);
    } else {
        console.error("[UiAction:setlocale] missing parameter: Locale");
    }
};

/**
 * Acknowledge all alarms.
 */
shmi.visuals.session.sysActions['acknowledge-all-alarms'] = function() {
    shmi.requires("visuals.session.AlarmManager").ackAlarm(-1);
};

/**
 * Navigate by specifying names of control / view pairs as parameters
 * @example
//string notation
var act_str = "navigate:screen_1:view_1:panel_1:view_2";

//object notation
var act_obj = {
    name: "navigate",
    params: [ "screen_1", "view_1", "panel_1", "view_2" ]
};
 * @param {string[]} params control / view names
 * @returns {undefined}
 */
shmi.visuals.session.sysActions['navigate'] = function(params) {
    var names = params,
        old_parent = null;
    names.forEach(function(name, idx, arr) {
        if ((idx % 2) !== 0) {
            return;
        }
        var parent = shmi.ctrl("." + name, old_parent);

        if (parent === null) {
            throw new Error("could not resolve control: " + name);
        }

        var view_found = false;
        if (parent.uiType === "screen") {
            parent.viewElements.forEach(function(vElem, inner_idx) {
                if (view_found) {
                    return;
                }
                if (vElem.getAttribute("data-name") === arr[idx + 1]) {
                    parent.setView(inner_idx);
                    view_found = true;
                }
            });
        } else {
            parent.controls.forEach(function(ctrl, inner_idx) {
                if (view_found) {
                    return;
                }
                if ((ctrl.uiType === "view") && (ctrl.element.getAttribute("data-name") === arr[idx + 1])) {
                    parent.setView(inner_idx);
                    view_found = true;
                }
            });
        }

        if (!view_found) {
            throw new Error("could not resolve control: " + arr[idx + 1]);
        }

        old_parent = parent;
    });
};

(function() {
    shmi.pkg("visuals.core");

    var inactivityTimeout = 0;

    /**
     * Object representing a user account.
     *
     * Creates a new User
     *
     * @constructor
     * @param name - username of new user
     */
    shmi.visuals.core.User = function(name) {
        this.loggedIn = false;
        this.name = name;
        this.locale = null;
        this.actUrl = null;
        this.homeUrl = null;
        this.groupList = [];
        this.userData = {};
        this.groupData = {};
        this.autoLogoffTime = 0;
        this.newPasswordRequired = 0;
        this.firstName = null;
        this.lastName = null;
        this.description = null;
    };

    shmi.visuals.core.User.prototype = {
        /**
         * Sets property data of User
         *
         * @param properties - property data
         */
        setProperties: function(properties) {
            this.loggedIn = (properties !== null);
            this.locale = properties ? properties.locale_id : null;
            this.actUrl = null; //obsolete
            this.homeUrl = null; //obsolete
            this.groupList = properties ? properties.groups : [];
            this.userData = properties && properties.data ? properties.data : {};
            this.groupData = properties && properties.group_data ? properties.group_data : {};
            this.firstName = properties && typeof properties.first_name === "string" ? properties.first_name : null;
            this.lastName = properties && typeof properties.last_name === "string" ? properties.last_name : null;
            this.description = properties && typeof properties.comment === "string" ? properties.comment : null;

            //check if password has expired
            var newPasswordRequired = properties ? properties.password_is_expired : false;
            if (this.loggedIn) {
                this.newPasswordRequired = newPasswordRequired;
                if (this.newPasswordRequired) {
                    console.info("[User]", "current password expired");
                }
            }

            //set auto-logoff time to fixed value for testing
            var autoLogoffTime = properties ? properties.auto_logout_duration : 0;
            if (!isNaN(autoLogoffTime)) {
                this.autoLogoffTime = autoLogoffTime;
                console.debug("[User]", "auto-logoff set to", autoLogoffTime, "seconds.");
            }
        },

        /**
         * Resets inactivity timer of current user. Called from Mouse- &
         * TouchListeners on any user-activity via 'UserManager.resetInactivity()'.
         *
         */
        resetInactivity: function() {
            var self = this;

            clearTimeout(inactivityTimeout);
            inactivityTimeout = 0;

            if (self.autoLogoffTime > 0) {
                inactivityTimeout = setTimeout(function() {
                    shmi.visuals.session.UserManager.logout();
                    console.debug("[User]", "user logged out after being inactive for", self.autoLogoffTime, "seconds");
                }, self.autoLogoffTime * 1000);
            }
        },
        /**
         * Looks up the given key in user data and group data and returns its
         * value. Lookup location may be specified. User data takes priority
         * over group data.
         *
         * @param {string} key Key of the value to lookup.
         * @param {string|string[]} [lookupIn] Where to look for the user data.
         *  Can be either "user" or "group" or an array with both. If the
         *  parameter is omitted, both user data and group data are used as
         *  lookup locations.
         * @returns {*} The requested value or `null` if no value for the given
         *  key could be found.
         */
        getUserData: function getUserData(key, lookupIn) {
            shmi.checkArg("key", key, "string");
            shmi.checkArg("lookupIn", lookupIn, "string", "array", "undefined");

            if (typeof (lookupIn) === "undefined") {
                lookupIn = ["user", "group"];
            } else if (typeof (lookupIn) === "string") {
                lookupIn = [lookupIn];
            }

            if (lookupIn.includes("user") && shmi.objectHasOwnProperty(this.userData, key)) {
                return this.userData[key];
            } else if (lookupIn.includes("group") && shmi.objectHasOwnProperty(this.groupData, key)) {
                return this.groupData[key];
            }

            return null;
        }
    };
}());

shmi.pkg("visuals.core");
/**
 * Handles User management for the Visuals framework.
 *
 * This class cannot be instanced manually but is automatically instanced by the visuals
 * framework and may be accessed via `shmi.visuals.session.UserManager`.
 *
 * @constructor
 */
shmi.visuals.core.UserManager = function() {
    this.currentUser = null;
    this.loggedIn = false;
    this.userList = {};
    this.userListCallback = null;
    this.credentialProviders = [];
    this.credentialProviderNextId = 0;

    this.registerDefaultCredentialProviders();
};

shmi.visuals.core.UserManager.prototype = {
    /**
     * Registers a credential provider.
     *
     * @param {number} priority Priority of the credential provider. Higher
     *  values equal to higher priority. Default credential providers have
     *  priority `0`.
     * @param {shmi.visuals.core.UserManager~CredentialProvider} providerFunc
     *  The credential provider function to register.
     * @returns {number} Id of the provider.
     */
    registerCredentialProvider: function registerCredentialProvider(priority, providerFunc) {
        shmi.checkArg("priority", priority, "number");
        shmi.checkArg("providerFunc", providerFunc, "function");

        const id = ++this.credentialProviderNextId;

        this.credentialProviders.push({
            id: id,
            priority: priority,
            func: providerFunc
        });

        this.credentialProviders.sort(({ priority: lhs }, { priority: rhs }) => rhs - lhs);

        return id;
    },
    /**
     * Unregisters a credential provider. Does not affect credential queries
     * currently in progress.
     *
     * @param {number} providerId Id of the provider to unregister.
     */
    unregisterCredentialProvider: function unregisterCredentialProvider(providerId) {
        shmi.checkArg("providerId", providerId, "number");

        const providerIndex = this.credentialProviders.findIndex(({ id }) => id === providerId);
        this.credentialProviders.splice(providerIndex);
    },
    /**
     * Registers default credentials provider for url parameters and
     * "project.json".
     *
     * @private
     */
    registerDefaultCredentialProviders: function registerDefaultCredentialProviders() {
        // Register credentials provider for url parameters.
        this.registerCredentialProvider(0, () => {
            const session = shmi.visuals.session;

            if (!session.URLParameters.usr || !session.URLParameters.pwd) {
                return null;
            }

            return {
                username: session.URLParameters.usr,
                password: session.URLParameters.pwd
            };
        });

        // Register credentials provider for auto-login configured in
        // "project.json".
        this.registerCredentialProvider(0, () => {
            const session = shmi.visuals.session;

            if (session.URLParameters.autoLogin === "false") {
                return null;
            } else if (!session.config['auto-login'] || !session.config['auto-login']['enabled']) {
                return null;
            } else if (!session.config['auto-login']['user']) {
                console.warn("[UserManager] Auto-Login is enabled in configuration but no 'user' given.");
                return null;
            } else if (!session.config['auto-login']['password']) {
                console.warn("[UserManager] Auto-Login is enabled in configuration but no 'password' given.");
                return null;
            }

            return {
                username: session.config['auto-login']['user'],
                password: session.config['auto-login']['password']
            };
        });

        // Register credentials provider for observer auto-login configured in
        // "project.json".
        this.registerCredentialProvider(0, () => {
            const session = shmi.visuals.session;

            if (session.URLParameters.autoLogin === "false") {
                return null;
            } else if (!session.config.observer || !session.config.observer.enabled || !session.observerAllowed) {
                return null;
            } else if (!session.config.observer.user) {
                console.warn("[UserManager] Auto-Observer is enabled in configuration but no 'user' given.");
                return null;
            } else if (!session.config.observer.password) {
                console.warn("[UserManager] Auto-Observer is enabled in configuration but no 'password' given.");
                return null;
            }

            return {
                username: session.config.observer.user,
                password: session.config.observer.password
            };
        });
    },
    /**
     * Sets the list of available users
     *
     * @param users - users available
     * @private
     */
    setUserList: function(users) {
        var self = this,
            iter = shmi.requires("visuals.tools.iterate").iterateObject;
        iter(self.userList, function(val, name) {
            delete self.userList[name];
        });
        iter(users, function(val, name) {
            self.userList[users[name]] = new shmi.visuals.core.User(users[name]);
        });
        if (self.userListCallback) {
            self.userListCallback(self.userList);
            self.userListCallback = null;
        }
    },
    /**
     * Sets properties of user
     *
     * @param {string} name username
     * @param {object} properties properties for user
     * @param {function} [callback] callback to run when properties have been applied
     * @param {object} [error] error information if login failed
     * @private
     */
    setProperties: function(name, properties, callback, error) {
        var self = this,
            wasLoggedIn = false,
            oldLocale = null;

        function testPasswordExpired() {
            if (self.currentUser.loggedIn && self.currentUser.newPasswordRequired) {
                shmi.fire("password-expired", {
                    name: self.currentUser.name,
                    user: self.currentUser
                }, self, true);
            }
        }

        if (this.currentUser) {
            if (this.currentUser.name === name) {
                wasLoggedIn = this.currentUser.loggedIn;
                oldLocale = this.currentUser.locale;
                this.currentUser.setProperties(properties);
                if (this.currentUser.loggedIn && (!wasLoggedIn)) {
                    if (callback) {
                        callback(0);
                    }
                    shmi.fire('login-state', {
                        name: name,
                        loggedIn: true,
                        locale: this.currentUser.locale
                    }, this);
                } else if (this.currentUser.loggedIn && wasLoggedIn) {
                    if (oldLocale !== this.currentUser.locale) {
                        this._reloadLocale();
                    }
                    shmi.fire('login-state', {
                        name: name,
                        loggedIn: true,
                        locale: this.currentUser.locale
                    }, this);
                } else if (callback) {
                    callback(error ? error : 1);
                    shmi.fire('login-state', {
                        name: name,
                        loggedIn: false,
                        locale: this.currentUser.locale
                    }, this);
                } else if (this.currentUser.loggedIn) {
                    /* no action required; prevent erroneous 'invalid credentials' log */
                } else {
                    shmi.log("[UserManager] already logged-in user tried to login with invalid credentials", 2);
                    shmi.fire('login-state', {
                        name: name,
                        loggedIn: false,
                        locale: this.currentUser.locale
                    }, this);
                }
            } else {
                if (callback) {
                    callback(0);
                }

                wasLoggedIn = this.currentUser.loggedIn;
                oldLocale = this.currentUser.locale;
                this.currentUser.name = name;
                this.currentUser.setProperties(properties);
                if (this.currentUser.loggedIn && wasLoggedIn) {
                    if (oldLocale !== this.currentUser.locale) {
                        this._reloadLocale();
                    }
                    shmi.fire('login-state', {
                        name: name,
                        loggedIn: true,
                        locale: this.currentUser.locale
                    }, this);
                } else if (this.currentUser.loggedIn) {
                    this._reloadLocale();
                    shmi.fire('login-state', {
                        name: name,
                        loggedIn: true,
                        locale: this.currentUser.locale
                    }, this);
                } else {
                    shmi.fire('login-state', {
                        name: name,
                        loggedIn: false,
                        locale: this.currentUser.locale
                    }, this);
                }
            }
            this.currentUser.resetInactivity();
            testPasswordExpired();
        } else if (this.userList[name]) {
            this.userList[name].setProperties(properties);
        } else {
            shmi.log("[UserManager] User '" + name + "' not found.", 2);
        }
    },
    _reloadLocale: function() {
        var self = this,
            s = shmi.visuals.session,
            um = s.UserManager;

        /**
         *
         */
        function load_json_locale() {
            shmi.decouple(function() {
                shmi.loadResource(shmi.evalString(shmi.c("LOCALE_PATH_PATTERN"), {
                    index: um.currentUser.locale
                }), self._resetSession.bind(self));
            });
        }

        if (s.config.load_locale_db === true) {
            if (typeof shmi.loadDBLocale === "function") {
                shmi.loadDBLocale(um.currentUser.locale, load_json_locale);
            } else {
                load_json_locale();
            }
        } else {
            load_json_locale();
        }
    },
    _resetSession: function(responseText, failed, url) {
        shmi.visuals.session.locale = shmi.visuals.session.locale || {};
        if (!failed) {
            var viewpos = {};

            /* merge new locale with existing, to keep untranslated texts */
            var new_locale = {},
                iter = shmi.requires("visuals.tools.iterate").iterateObject;
            try {
                new_locale = JSON.parse(responseText);
                iter(new_locale, function(val, loc_var) {
                    shmi.visuals.session.locale[loc_var] = new_locale[loc_var];
                });
            } catch (exc) {
                console.error("[UserManager] failed to parse new locale:", url, exc);
            }
            shmi.visuals.session.ItemManager.removeAll();
            shmi.visuals.session.AlarmManager.removeAll();
            shmi.decouple(
                shmi.visuals.session.DataGridManager.restart.bind(shmi.visuals.session.DataGridManager)
            );

            /* delete controls */
            iter(shmi.visuals.session.names, function(val, prop) {
                //delete top-level controls
                if (prop.indexOf(".") === -1) {
                    shmi.deleteControl(val.ctrl);
                }
            });

            /* clear body content */
            while (document.body.firstChild) {
                document.body.removeChild(document.body.firstChild);
            }

            if (shmi.visuals.session.config['show-load-screen']) {
                /* create loading div */
                var bgDiv = document.createElement('div'),
                    overlayConfig = shmi.pkg("visuals.session.SysControlConfig.loadingOverlay");
                bgDiv = document.createElement(overlayConfig.tagName || 'DIV');
                shmi.addClass(bgDiv, overlayConfig['class-name'] || 'loading-box-overlay');
                if (overlayConfig.template) {
                    shmi.loadResource(shmi.c("TEMPLATE_PATH") + overlayConfig.template + shmi.c("TEMPLATE_EXT"), function(data, resrcFailed) {
                        if (!resrcFailed) {
                            bgDiv.innerHTML = data;
                        }
                    });
                }
                document.body.appendChild(bgDiv);
            }

            shmi.decouple(() => {
                this.restartSession(viewpos, bgDiv);
                shmi.log("[RESTART] CALLED", 0);
                /* re-run start-scripts */
                if (shmi.visuals.session.startScripts) {
                    iter(shmi.visuals.session.startScripts, function(val, script) {
                        shmi.log("[RESTART] running script: " + script, 0);
                        try {
                            shmi.visuals.session.startScripts[script]();
                        } catch (exc) {
                            shmi.log("[RESTART] failed to execute start-script '" + script + "': " + exc, 2);
                        }
                    });
                }
            });
            shmi.log("[UserManager] Bookmark: " + viewpos, 0);
        } else {
            console.error("[UserManager] failed to load locale resource:", url);
        }
    },
    /**
     * Requests login for specified user name and password
     *
     * @param {string} name - user name
     * @param {string} pw - password
     * @param {function} callback - function to run on request completion
     */
    requestLogin: function(name, pw, callback) {
        var self = this,
            session = shmi.requires("visuals.session"),
            connection = session.SocketConnection,
            param = null,
            request = shmi.requires("visuals.tools.connect").request;

        if (connection.connected !== true) {
            throw new Error("socket connection is not established yet");
        }
        this.currentUser = new shmi.visuals.core.User(name);
        /* remember entered password */
        this.pwd = pw;

        param = {
            username: name,
            password: pw
        };

        request("user.login", param, function onRequest(response, err) {
            if (err === 0) {
                self.setProperties(name, response, callback, err);
                if (connection.connectCallback && self.currentUser && self.currentUser.loggedIn) {
                    connection.connectCallback = null;
                }
            } else {
                //unsuccessful login attempt
                self.setProperties(name, null, callback, err);
            }
        });
    },
    requestAutoLogin: function(callback) {
        const self = this,
            providers = this.credentialProviders.slice();

        function tryNext() {
            if (providers.length === 0) {
                return Promise.reject(new Error("Auto-Login credentials exhausted"));
            } else {
                const provider = providers.shift();
                return Promise.resolve(provider.func()).then((credentials) => {
                    if (!credentials) {
                        return tryNext();
                    }

                    return new Promise((resolve, reject) => {
                        self.requestLogin(credentials.username, credentials.password, (error) => {
                            if (provider.statusCallback) {
                                provider.statusCallback(!error);
                            }

                            if (error) {
                                reject(error);
                            } else {
                                resolve();
                            }
                        });
                    });
                });
            }
        }

        tryNext().then(callback.bind(null, 0)).catch(callback.bind(null));
    },
    /**
     * Requests login using given authentication token.
     *
     * @param {string} authToken authentication token
     * @param {function} callback function to run on request completion
     */
    requestTokenAuth: function(authToken, callback) {
        const self = this,
            session = shmi.requires("visuals.session"),
            connection = session.SocketConnection,
            { request } = shmi.requires("visuals.tools.connect");

        if (connection.connected !== true) {
            throw new Error("socket connection has not been established yet");
        }

        self.currentUser = null;
        self.pwd = null;

        request("user.auth", { token: authToken }, function onRequest(response, err) {
            if (err === 0) {
                self.currentUser = new shmi.visuals.core.User(response.username);
                self.setProperties(response.username, response, callback, err);
                if (connection.connectCallback && self.currentUser && self.currentUser.loggedIn) {
                    connection.connectCallback = null;
                }
            } else if (typeof callback === "function") {
                //unsuccessful login attempt
                self.setProperties(null, null, callback, err);
            }
        });
    },
    /**
     * Requests authentication token.
     *
     * @param {object} options Options for the requested authentication token.
     * @param {function} callback function to receive the token or error code.
     */
    requestAuthToken: function(options, callback) {
        const session = shmi.requires("visuals.session"),
            connection = session.SocketConnection,
            { request } = shmi.requires("visuals.tools.connect");

        if (connection.connected !== true) {
            throw new Error("socket connection has not been established yet");
        }

        request("user.token", options, function onRequest(response, err) {
            if (err === 0) {
                callback(response, null);
            } else if (typeof callback === "function") {
                callback(null, err);
            }
        });
    },
    /**
     * Requests the user-list from connect
     *
     * @param callback - function to run on request completion
     */
    requestUserList: function(callback) {
        var self = this,
            request = shmi.requires("visuals.tools.connect").request;
        if (shmi.visuals.session.SocketConnection.connected !== true) {
            throw new Error("socket connection is not established yet");
        }
        this.userListCallback = callback;
        request("user.list", {}, function(response, err) {
            var users = [];
            if (response && Array.isArray(response.users)) {
                response.users.forEach(function(usr) {
                    users.push(usr.username);
                });
            } else {
                console.error("[UserManager] could not retrieve userlist:", err.category, err.errc, err.message);
            }
            self.setUserList(users);
        });
    },
    /**
     * logout - logs out current user
     *
     * @param  {function} callback callback to be run after logout
     * @return {undefined}
     */
    logout: function(callback) {
        var self = this,
            request = shmi.requires("visuals.tools.connect").request,
            iterObj = shmi.requires("visuals.tools.iterate.iterateObject"),
            im = shmi.visuals.session.ItemManager;

        //close opened views
        iterObj(im.views, function(vItem, vName) {
            im.closeView(vName);
        });

        request("user.logout", {}, function onRequest(response, err) {
            if (err === 0) {
                self.setProperties(null, null);
            }
            if (typeof callback === "function") {
                callback(response, err);
            }
        });
    },
    /**
     * Changes the current users password
     *
     * @param {string} currentPassword Current password
     * @param {string} newPassword New Password
     * @param {function} [callback] Callback called upon completion
     */
    changePassword: function(currentPassword, newPassword, callback) {
        var request = shmi.requires("visuals.tools.connect").request;

        request("user.setpw", {
            current_password: currentPassword,
            new_password: newPassword
        }, function(response, status) {
            if (!status) {
                this.pwd = newPassword;
            }

            if (callback) {
                callback(response, status);
            }
        });
    },
    restartSession: function(viewpos, bgDiv) {
        /* Set Project Content */
        var docFragment = document.createDocumentFragment(),
            fragDiv = document.createElement('div');
        fragDiv.innerHTML = shmi.visuals.session.ProjectSource;
        docFragment.appendChild(fragDiv);
        while (docFragment.firstChild.firstChild) {
            document.body.appendChild(docFragment.firstChild.firstChild);
        }
        shmi.visuals.session.names = {};
        var viewportMeta = document.getElementById('viewportMeta');
        if (viewportMeta) {
            viewportMeta.setAttribute('content',
                viewportMeta.getAttribute('content').replace('user-scalable=no', 'user-scalable=yes'));
        }

        /* re-init virtual items (and actions) */
        shmi.loadResource(shmi.c("VIRTUAL_ITEMS_CONFIG_PATH"), function(data, failed, url) {
            if (!failed) {
                shmi.visuals.init.initVItems(JSON.parse(data));
            } else {
                console.error("error loading virtual-item config", url);
            }

            /* check init status of controls */
            const controlInstances = shmi.visuals.parser.parseProject(viewpos);
            shmi.waitOnInit(controlInstances, () => {
                const evt = document.createEvent("Event"),
                    session = shmi.visuals.session;

                shmi.log("[UserManager] All controls initialized", 2);

                evt.initEvent("resize", true, true);
                window.dispatchEvent(evt);

                if (shmi.visuals.session.config['show-load-screen']) {
                    setTimeout(function() {
                        if (session.config['load-screen-transition'] === false) {
                            document.body.removeChild(bgDiv);
                        } else {
                            bgDiv.style.opacity = 0;
                            bgDiv.addEventListener('transitionend', function() {
                                document.body.removeChild(bgDiv);
                            });
                            bgDiv.addEventListener('webkitTransitionEnd', function() {
                                document.body.removeChild(bgDiv);
                            });
                        }
                    }, shmi.c("LOAD_TIMEOUT"));
                }

                shmi.fire('parser-ready', {}, shmi.visuals.session);
            });
        });
    },
    /**
     * Resets inactivity timer of current user. Called from Mouse- &
     * TouchListeners on any user-activity.
     *
     * @private
     */
    resetInactivity: function() {
        if (this.currentUser && this.currentUser.loggedIn) {
            this.currentUser.resetInactivity();
        }
    },
    /**
     * setLocale - Set locale of currently logged in user.
     *
     * @param {string} localeId locale to set for current user
     * @param {function} [callback] optional callback to run on completion
     *
     * @returns {undefined}
     */
    setLocale: function(localeId, callback) {
        var self = this,
            oldLocale = null,
            parserTok = null,
            localeInfo = self.getLocaleInfo(),
            c = shmi.requires("visuals.tools.connect");

        if (!(self.currentUser && self.currentUser.loggedIn)) {
            throw new Error("No user logged in, cannot change locale");
        }

        if (!(localeInfo && localeInfo.locales && localeInfo.locales[localeId])) {
            throw new Error("Locale not configured: " + localeId);
        }

        oldLocale = self.currentUser.locale;

        c.request("user.setlang", {
            locale_id: localeId
        }, function onResponse(data, err) {
            if (err === 0) {
                self.currentUser.locale = localeId;
                if (oldLocale !== localeId) {
                    self._reloadLocale();
                    parserTok = shmi.listen("parser-ready", function() {
                        parserTok.unlisten();
                        shmi.fire('login-state', {
                            name: self.currentUser.name,
                            loggedIn: true,
                            locale: localeId
                        }, self);
                        if (callback) {
                            callback(err);
                        }
                    });
                } else if (callback) {
                    callback(err);
                }
            } else {
                shmi.notify("${V_ERROR_LOCALE_CHANGE}", "${V_ERROR}", {
                    LOCALE: localeId,
                    ERROR_CODE: err
                });
                if (callback) {
                    callback(err);
                }
            }
        });
    },
    /**
     * getLocaleInfo - get information on configured locales.
     *
     * @returns {object}
     */
    getLocaleInfo: function() {
        return shmi.cloneObject(shmi.visuals.session.localeInfo);
    },
    /**
     * Looks up the given key in user data and group data and returns its
     * value. Lookup location may be specified. User data takes priority
     * over group data.
     *
     * @param {string} key Key of the value to lookup.
     * @param {string|string[]} [lookupIn] Where to look for the user data.
     *  Can be either "user" or "group" or an array with both. If the
     *  parameter is omitted, both user data and group data are used as
     *  lookup locations.
     * @returns {*} The requested value or `null` if no value for the given
     *  key could be found.
     */
    getUserData: function getUserData(key, lookupIn) {
        if (!this.currentUser) {
            return null;
        }

        return this.currentUser.getUserData(key, lookupIn);
    },
    /**
     * Modifies user data. Key-, value-pairs with a `null`-value are removed
     * from the users' data store. KV-pairs not included in `data` are left
     * unchanged. Only primitives may be used as values. Note that changes made
     * to user data are only visible after the callback has been called.
     *
     * @param {object} data Object treated as list of Key-, value-pairs.
     * @param {shmi.visuals.tools.connect~RequestCallback} [callback] Callback
     *  called upon completion
     *
     * @example
shmi.visuals.session.UserManager.setUserData({
    "hello": "world",
    "deleteme": null
});
     */
    setUserData: function setUserData(data, callback) {
        const { ConnectSession } = shmi.visuals.session;

        shmi.checkArg("data", data, "object");
        shmi.checkArg("callback", callback, "function", "undefined");

        if (!this.currentUser) {
            throw new Error("No user logged in, cannot set user data");
        }

        ConnectSession.request("user.set_data", data, (response, error) => {
            if (!error && this.currentUser) {
                Object.entries(data).forEach(([key, value]) => {
                    if (value === undefined) {
                        // undefined values are excluded from json
                        // serialization and thus not changed.
                    } else if (value === null) {
                        delete this.currentUser.userData[key];
                    } else {
                        this.currentUser.userData[key] = value;
                    }
                });
            }

            if (callback) {
                callback(response, error);
            } else if (error) {
                console.error("[UserManager]", "Failed to set user data.", "\n\tWebIQ Server returned", error, "\n\tData was", data);
            }
        });
    },
    /**
     * Clears all user data.
     *
     * @param {shmi.visuals.tools.connect~RequestCallback} [callback] Callback
     *  called upon completion
     */
    clearUserData: function clearUserData(callback) {
        const { ConnectSession } = shmi.visuals.session;

        shmi.checkArg("callback", callback, "function", "undefined");

        if (!this.currentUser) {
            throw new Error("No user logged in, cannot clear user data");
        }

        ConnectSession.request("user.clear_data", {}, (response, error) => {
            if (!error && this.currentUser) {
                this.currentUser.userData = {};
            }

            if (callback) {
                callback(response, error);
            } else if (error) {
                console.error("[UserManager]", "Failed to clear user data.", "\n\tWebIQ Server returned", error);
            }
        });
    }
};

/**
 * Credential Provider
 *
 * @callback shmi.visuals.core.UserManager~CredentialProvider
 * @returns {Promise<?shmi.visuals.core.UserManager~Credentials>|shmi.visuals.core.UserManager~Credentials}
 *  Promise that is resolved with the credentials of the user to login as. May
 *  be resolved with `null` if no credentials are available. Rejecting this
 *  promise cancels the auto-login process.
 */

/**
 * Login Credentials
 *
 * @callback shmi.visuals.core.UserManager~Credentials
 * @property {string} username Username of the user.
 * @property {string} password Password to use for logging in.
 */

(function() {
    shmi.pkg("visuals.io");

    var TOUCH_MODE_TIMEOUT = 1000;

    /**
     * isTouchMode - test if touch input is active
     *
     * @param  {Event} event input event
     * @return {boolean} `true` if touch mode is active, `false` else
     */
    function isTouchMode(event) {
        if (event.sourceCapabilities) {
            return event.sourceCapabilities.firesTouchEvents;
        } else if (event.timeStamp - shmi.visuals.io.TouchListener.prototype.lastTimeStamp < TOUCH_MODE_TIMEOUT) {
            return true;
        } else {
            return false;
        }
    }

    /**
 * Mouse Input Listener
 *
 * @constructor
 * @param element - element to listen for mouse-events on
 * @param functions - functions to execute on mouse-events
 */
    shmi.visuals.io.MouseListener = function(element, functions) {
        if (/iPhone/.test(navigator.userAgent) || /iPad/.test(navigator.userAgent) || /Android/.test(navigator.userAgent)) {
            this.inactive = true;
            return;
        }
        this.element = element;
        this.startX = 0;
        this.startY = 0;
        this.dx = 0;
        this.dy = 0;
        this.totalDx = 0;
        this.totalDy = 0;
        this.last_click_time = 0;
        this.double_click_time = 500;
        this.mousepressed = false;
        this.moved = false;
        this.functions = functions;

        this.mousedown = this.mouseDown.bind(this);
        this.mouseup = this.mouseUp.bind(this);
        this.mousemove = this.mouseMove.bind(this);
        this.mouseover = this.mouseOver.bind(this);
        this.mouseout = this.mouseOut.bind(this);
        this.mousewheel = this.mouseWheel.bind(this);
        this.moveDiv = null;

        this._inactiveReset = function() {
            shmi.visuals.session.UserManager.resetInactivity();
        };

        this.init();
    };

    shmi.visuals.io.MouseListener.prototype = {
    /**
     * Initializes the listener
     */
        init: function() {
        },
        /**
     * Disables the shmi.visuals.io.MouseListener
     */
        disable: function() {
            if (this.inactive) {
                return;
            }
            this.mousepressed = false;

            if (window.navigator.msPointerEnabled) {
                this.element.removeEventListener('MSPointerDown', this.mousedown);
                this.element.removeEventListener('MSPointerOver', this.mouseover);
                this.element.removeEventListener('MSPointerUp', this.mouseup);
                this.element.removeEventListener('MSPointerMove', this.mousemove);
                this.element.removeEventListener('MSPointerOut', this.mouseout);
                if (this.moveDiv) {
                    this.moveDiv.removeEventListener('MSPointerMove', this.mousemove);
                    this.moveDiv.removeEventListener('MSPointerUp', this.mouseup);
                    this.moveDiv.removeEventListener('MSPointerOut', this.mouseout);
                    document.body.removeChild(this.moveDiv);
                    this.moveDiv = null;
                }
            } else {
                this.element.removeEventListener('mousedown', this.mousedown);
                this.element.removeEventListener('mouseover', this.mouseover);
                this.element.removeEventListener('mouseup', this.mouseup);
                this.element.removeEventListener('mousemove', this.mousemove);
                this.element.removeEventListener('mouseout', this.mouseout);
                if (this.moveDiv) {
                    this.moveDiv.removeEventListener('mousemove', this.mousemove);
                    this.moveDiv.removeEventListener('mouseup', this.mouseup);
                    this.moveDiv.removeEventListener('mouseout', this.mouseout);
                    document.body.removeChild(this.moveDiv);
                    this.moveDiv = null;
                }
            }

            if (this.functions.onWheel) {
                this.element.removeEventListener('mousewheel', this.mousewheel);
                this.element.removeEventListener('DOMMouseScroll', this.mousewheel);
            }
        },
        /**
     * Enables the shmi.visuals.io.MouseListener
     *
     */
        enable: function() {
            if (this.inactive) {
                return;
            }
            if (window.navigator.msPointerEnabled) {
                this.element.removeEventListener('MSPointerDown', this.mousedown);
                this.element.removeEventListener('MSPointerOver', this.mouseover);
                this.element.removeEventListener('MSPointerUp', this.mouseup);
                this.element.removeEventListener('MSPointerMove', this.mousemove);
                this.element.removeEventListener('MSPointerOut', this.mouseout);
                if (this.moveDiv) {
                    this.moveDiv.removeEventListener('MSPointerMove', this.mousemove);
                    this.moveDiv.removeEventListener('MSPointerUp', this.mouseup);
                    this.moveDiv.removeEventListener('MSPointerOut', this.mouseout);
                    document.body.removeChild(this.moveDiv);
                    this.moveDiv = null;
                }
                this.element.addEventListener('MSPointerMove', this.mousemove);
                this.element.addEventListener('MSPointerUp', this.mouseup);
                this.element.addEventListener('MSPointerOut', this.mouseout);
                this.element.addEventListener('MSPointerDown', this.mousedown);
            } else {
                this.element.removeEventListener('mousedown', this.mousedown);
                this.element.removeEventListener('mouseover', this.mouseover);
                this.element.removeEventListener('mouseup', this.mouseup);
                this.element.removeEventListener('mousemove', this.mousemove);
                this.element.removeEventListener('mouseout', this.mouseout);
                if (this.moveDiv) {
                    this.moveDiv.removeEventListener('mousemove', this.mousemove);
                    this.moveDiv.removeEventListener('mouseup', this.mouseup);
                    this.moveDiv.removeEventListener('mouseout', this.mouseout);
                    document.body.removeChild(this.moveDiv);
                    this.moveDiv = null;
                }
                this.element.addEventListener('mouseover', this.mouseover);
                this.element.addEventListener('mouseout', this.mouseout);
                this.element.addEventListener('mousedown', this.mousedown);
                this.element.addEventListener('mousemove', this.mousemove);
                this.element.addEventListener('mouseup', this.mouseup);
            }

            if (this.functions.onWheel) {
                this.element.addEventListener('mousewheel', this.mousewheel);
                this.element.addEventListener('DOMMouseScroll', this.mousewheel);
            }
        },
        /**
     * Called when mouse is pressed
     *
     * @param event - mouse event that caused function call
     */
        mouseDown: function(event) {
            this._inactiveReset();

            if (event.button !== 0 || isTouchMode(event)) {
                return;
            }

            this.moved = false;
            this.startX = event.clientX;
            this.startY = event.clientY;
            this.totalDx = 0;
            this.totalDy = 0;
            this.dx = 0;
            this.dy = 0;
            this.mousepressed = true;
            if (this.functions.onPress && !event.consumed) {
                this.functions.onPress(this.startX, this.startY, event);
                event.consumed = true;
            }
            if (this.functions.onDrag) {
                event.stopPropagation();
            }
        },
        /**
     * Called when mouse is released
     *
     * @param event - mouse event that caused the function call
     */
        mouseUp: function(event) {
            this._inactiveReset();

            if (isTouchMode(event)) {
                return;
            }

            if (this.functions.onRelease) {
                this.functions.onRelease(event.clientX, event.clientY, event);
            }
            if (!this.moved && this.mousepressed && this.functions.onClick) {
                event.preventDefault();
                if (!event.consumed) {
                    event.consumed = true;

                    if (this.functions.onDoubleClick) {
                        var cur_time = Date.now();
                        if ((cur_time - this.last_click_time) < this.double_click_time) {
                            this.functions.onDoubleClick(event.clientX, event.clientY, event);
                        } else {
                            this.functions.onClick(event.clientX, event.clientY, event);
                            this.last_click_time = cur_time;
                        }
                    } else {
                        this.functions.onClick(event.clientX, event.clientY, event);
                    }
                }
            }
            this.mousepressed = false;

            if (this.functions.onDrag) {
                event.stopPropagation();
            }
            this.moved = false;
            if (window.navigator.msPointerEnabled) {
                if (this.moveDiv) {
                    this.moveDiv.removeEventListener('MSPointerMove', this.mousemove);
                    this.moveDiv.removeEventListener('MSPointerUp', this.mouseup);
                    this.moveDiv.removeEventListener('MSPointerOut', this.mouseout);
                    document.body.removeChild(this.moveDiv);
                    this.moveDiv = null;
                }
            } else if (this.moveDiv) {
                this.moveDiv.removeEventListener('mousemove', this.mousemove);
                this.moveDiv.removeEventListener('mouseup', this.mouseup);
                this.moveDiv.removeEventListener('mouseout', this.mouseout);
                document.body.removeChild(this.moveDiv);
                this.element.addEventListener('mouseout', this.mouseout);
                this.moveDiv = null;
            }
        },
        /**
     * Called when mouse is moved
     *
     * @param event - mouse event that caused the function called
     */
        mouseMove: function(event) {
            this._inactiveReset();

            if (isTouchMode(event)) {
                return;
            }

            if (!this.mousepressed) {
                return;
            }
            this.dx = event.clientX - this.startX;
            this.dy = event.clientY - this.startY;
            this.totalDx += this.dx;
            this.totalDy += this.dy;
            this.startX = event.clientX;
            this.startY = event.clientY;
            this.moved = (Math.abs(this.totalDx) + Math.abs(this.totalDy) >= shmi.c("MIN_MOVED_PX"));
            if (this.functions.onDrag) {
                if (!this.moved) {
                    return;
                }
                if (event.shmi && event.shmi.listeners) {
                    var li = event.shmi.listeners.pop();
                    while (li !== undefined) {
                        li.mouseUp(event);
                        li = event.shmi.listeners.pop();
                    }
                }
                this.functions.onDrag(this.dx, this.dy, event);
                if (window.navigator.msPointerEnabled) {
                /* bind ms-pointer to element while dragging */
                    try {
                        event.target.setPointerCapture(event.pointerId);
                    } catch (exc) {
                        try {
                            event.target.msSetPointerCapture(event.pointerId);
                        } catch (exc2) {
                            shmi.log('Error - Could not set pointer capture of event: ' + exc2, 2);
                        }
                    }
                } else if (this.moveDiv === null) {
                /* creates overlay to capture mouse movement */
                    this.moveDiv = document.createElement('div');
                    this.moveDiv.setAttribute('class', 'mouselistener-overlay');

                    if (window.navigator.msPointerEnabled) {
                        this.element.removeEventListener('MSPointerOut', this.mouseout);
                        document.body.appendChild(this.moveDiv);
                        this.moveDiv.addEventListener('MSPointerMove', this.mousemove);
                        this.moveDiv.addEventListener('MSPointerUp', this.mouseup);
                    } else {
                        this.element.removeEventListener('mouseout', this.mouseout);
                        document.body.appendChild(this.moveDiv);
                        this.moveDiv.addEventListener('mousemove', this.mousemove);
                        this.moveDiv.addEventListener('mouseup', this.mouseup);
                        this.moveDiv.addEventListener('mouseout', this.mouseout);
                    }
                }
                event.stopPropagation();
            } else {
                event.shmi = event.shmi || {};
                event.shmi.listeners = event.shmi.listeners || [];
                event.shmi.listeners.push(this);
            }
        },
        /**
     * Called when mouse is over base element
     *
     * @param event - mouse event that caused the function call
     */
        mouseOver: function(event) {
            this._inactiveReset();

            if (isTouchMode(event)) {
                return;
            }

            if (shmi.testParentChild(this.element, event.relatedTarget)) {
                return;
            }
            if (this.functions.onRelease && this.mousepressed) {
                this.functions.onRelease(event.clientX, event.clientY, event);
            }
            this.mousepressed = false;

            if (this.functions.onEnter) {
                this.functions.onEnter();
            }
        },
        /**
     * Called when mouse leaves the base element
     *
     * @param event - mouse event that caused the function call
     * @param force - forces event to fire event if it was caused on another element
     */
        mouseOut: function(event, force) {
            this._inactiveReset();

            if (isTouchMode(event)) {
                return;
            }

            if (shmi.testParentChild(this.element, event.relatedTarget)) {
            //only fire if relatedTarget is not a child of the anchor element!
                if (!force) return;
            } else if (this.moveDiv) {
                var oTarget = event.srcElement || event.originalTarget;
                if (this.moveDiv !== oTarget) {
                    return;
                }
            }
            if (this.functions.onRelease && this.mousepressed) {
                this.functions.onRelease(event.clientX, event.clientY, event);
            }
            this.mousepressed = false;
            if (this.moveDiv) {
                this.moveDiv.removeEventListener('mousemove', this.mousemove);
                this.moveDiv.removeEventListener('mouseup', this.mouseup);
                this.moveDiv.removeEventListener('mouseout', this.mouseout);
                document.body.removeChild(this.moveDiv);
                this.moveDiv = null;
            }
            if (this.functions.onLeave) {
                this.functions.onLeave();
            }
        },
        /**
     * Called when mouse wheel is rotated
     *
     * @param event - mouse event that caused the function call
     */
        mouseWheel: function(event) {
            this._inactiveReset();

            if (isTouchMode(event)) {
                return;
            }

            event.stopPropagation();
            //event.preventDefault();
            if (this.functions.onWheel) {
                if (event.type === "DOMMouseScroll") {
                    this.functions.onWheel(-50 * event.detail, event);
                } else {
                    this.functions.onWheel(event.wheelDelta, event);
                }
            }
        }
    };
}());

shmi.pkg("visuals.io");
/**
 * Resource Loader for the Visuals framework. Resources are cached in memory.
 *
 * @private
 * @constructor
 */
shmi.visuals.io.ResourceLoader = function() {
    this.resources = {};
    this.active = 0;
};

shmi.visuals.io.ResourceLoader.prototype = {
    /**
     * Loads resource from specified url
     *
     * @param {string} url URL to load
     * @param {shmi.visuals.io~resourceCallback} callback callback function for resource request
     * @param binary
     * @param {boolean} forceRemote set to true to force a http-request, even though the object may be cached in memory
     */
    loadResource: function(url, callback, forceRemote, binary) {
        if (this.resources[url] && !forceRemote) {
            this.addCallback(url, callback);
        } else if (forceRemote) {
            shmi.visuals.io.loadResourceHttp(url, function(response, failed) {
                callback(response, failed, url);
            }, binary);
        } else {
            this.active++;
            this.createResource(url);
            this.addCallback(url, callback);
            shmi.visuals.io.loadResourceHttp(url, function(response, failed) {
                if (response === null) {
                    failed = true;
                }
                this.resources[url].data = response;
                this.resources[url].failed = failed;
                this.notifyCallbacks(url);
            }.bind(this), binary);
        }
    },
    /**
     * Runs callback functions for completed loads
     *
     * @private
     * @param url - url that completed loading
     */
    notifyCallbacks: function(url) {
        var self = this,
            resource = self.resources[url];

        if (resource && Array.isArray(resource.callbacks)) {
            //process callbacks
            resource.callbacks.forEach(function(resCb) {
                if (typeof resCb === "function") {
                    resCb(resource.data, resource.failed, url);
                }
            });
            //clear list of unprocessed callbacks
            resource.callbacks = [];
        }
    },
    /**
     * Creates a new resource
     *
     * @private
     * @param url - url of the resource
     */
    createResource: function(url) {
        this.resources[url] = {};
        this.resources[url].data = null;
        this.resources[url].failed = false;
        this.resources[url].callbacks = [];
    },
    /**
     * Adds callback funtion for resource
     *
     * @private
     * @param url - url of resource
     * @param callback - function to run on completion
     */
    addCallback: function(url, callback) {
        if ((this.resources[url].data !== null) || this.resources[url].failed) {
            callback(this.resources[url].data, this.resources[url].failed, url);
        } else {
            this.resources[url].callbacks.push(callback);
        }
    }
};

(function() {
    shmi.pkg("visuals.io");

    /**
     * Calls `shmi.fire` if eventing is enabled for the SocketConnection.
     *
     * @param {shmi.visuals.io.SocketConnection} self Reference to an instance
     *  of a SocketConnection.
     * @param {string} eventName Name of the event to broadcast
     * @param {*} eventData Event data.
     */
    function broadcastEvent(self, eventName, eventData) {
        if (self.eventsEnabled) {
            shmi.fire(eventName, eventData, self);
        }
    }

    /**
     * Handler function for the websockets `onopen` callback.
     *
     * @param {shmi.visuals.io.SocketConnection} self Reference to an instance
     *  of a SocketConnection.
     */
    function onSocketOpen(self) {
        shmi.log("[SocketConnection] On Open", 0);
        const sessionData = {
            observerAllowed: false,
            Host: {}
        };

        self.connecting = false;
        self.connected = true;

        self.connectSession.request("connect.info", {}, function(data, status) {
            if (status !== 0) {
                broadcastEvent(self, "session-data-update", {
                    error: status
                });

                if (self.connectCallback) {
                    shmi.log("[SocketConnection] Connect Callback", 0);
                    self.connectCallback(shmi.c("FAIL"));
                }

                return;
            }

            sessionData.Host.name = data.hostname;
            sessionData.Host.version = data.version;
            if (data.version.patch === undefined) {
                sessionData.Host.version.patch = data.version.revision;
            }
            sessionData.project = data.current_project;
            self.connectSession.request("util.islocal", {}, function(response, err) {
                if (err) {
                    console.warn("[SocketConnection]", "unable to check whether client is on local network interface");
                }
                sessionData.observerAllowed = (response === true);
                self.sessionInfo = sessionData;
                broadcastEvent(self, "connection-state", {
                    established: true,
                    url: self.url,
                    error: null,
                    connecting: false
                });

                broadcastEvent(self, "session-data-update", sessionData);

                if (self.connectCallback) {
                    shmi.log("[SocketConnection] Connect Callback", 0);
                    self.connectCallback(shmi.c("SUCCESS"));
                }
            });
        });
    }

    /**
     * Handler function for the websockets `onmessage` callback.
     *
     * @param {shmi.visuals.io.SocketConnection} self Reference to an instance
     *  of a SocketConnection.
     */
    function onSocketMessage(self, message) {
        if (self.debugCallback) {
            self.debugCallback(message.data);
        }

        self.connectSession.postMessage(JSON.parse(message.data));
    }

    /**
     * Handler function for the websockets `onclose` callback.
     *
     * @param {shmi.visuals.io.SocketConnection} self Reference to an instance
     *  of a SocketConnection.
     */
    function onSocketClose(self) {
        shmi.log("[SocketConnection] connection closed (URL: '" + self.url + "')", 2);

        self.connected = false;
        broadcastEvent(self, "connection-state", {
            established: false,
            url: self.url,
            error: null,
            connecting: false
        });
        self.connect(self.connectCallback);
    }

    /**
     * Handler function for the websockets `onerror` callback.
     *
     * @param {shmi.visuals.io.SocketConnection} self Reference to an instance
     *  of a SocketConnection.
     */
    function onSocketError(self, err) {
        shmi.log("[SocketConnection] connection error: " + err, 2);
        console.log("ERROR Event:", err);
        broadcastEvent(self, "connection-state", {
            established: false,
            url: self.url,
            error: err,
            connecting: false
        }, self);
    }

    /**
     * Creates a new SocketConnection to wrap a WebScoket connecting to the
     * specified URL.
     *
     * @private
     * @constructor
     * @param {String} url the WebSocket URI to connect this socket connection with.
     */
    shmi.visuals.io.SocketConnection = function(url, connectSession) {
        this.socket = null;
        this.url = url;
        this.protocol = "smarthmi-connect";
        this.connecting = false;
        this.connected = false;
        this.aksreconnect = false;
        this.attempts = 0;
        this.maxConnectionAttempts = parseInt(shmi.visuals.session.config['max-connection-attempts']) || shmi.c("DEFAULT_CONNECTION_ATTEMPTS");
        this.connectCallback = null;
        this.debugCallback = null;
        this.msgHandlers = {};
        this.timeout = parseInt(shmi.visuals.session.config['socket-timeout']) || shmi.c("DEFAULT_CONNECTION_TIMEOUT");
        this.timeoutId = 0;
        this.connectSession = connectSession;
        this.eventsEnabled = false;
    };

    shmi.visuals.io.SocketConnection.prototype = {
        // Explicitly set `constructor` since we're overwriting the prototype.
        constructor: shmi.visuals.io.SocketConnection,
        /**
         * Initializes the connection
         */
        init: function() {
            /* setup socket event handlers */
            this.socket.onopen = onSocketOpen.bind(null, this);
            this.socket.onmessage = onSocketMessage.bind(null, this);
            this.socket.onclose = onSocketClose.bind(null, this);
            this.socket.onerror = onSocketError.bind(null, this);
        },
        /**
         * Used to retrieve the WebSocket providing connectivity for this socket
         * connection.
         *
         */
        getSocket: function() {
            return this.socket;
        },
        enableEvents: function() {
            this.eventsEnabled = true;
        },
        /**
         * Used to establish a connection to the specified WebSocket server.
         * @param {shmi.visuals.io.SocketConnection~connectCallback} callback callback function
         */
        connect: function(callback) {
            var self = this;
            self.connectCallback = callback;
            try {
                if (self.connected) {
                    shmi.log("[SocketConnection] socket already connected, disconnecting first ... ", 2);
                    self.socket.close();
                }
            } catch (exc) {
                shmi.log("[SocketConnection] could not connect to socket");
            }
            self.connecting = true;
            broadcastEvent(self, "connection-state", {
                established: false,
                url: self.url,
                error: null,
                connecting: true
            });

            if ((self.maxConnectionAttempts !== -1) && (self.attempts >= self.maxConnectionAttempts)) {
                broadcastEvent(self, "connection-failed", {
                    socket: self,
                    session: shmi.visuals.session
                });

                if (typeof callback === "function") {
                    callback(shmi.c("FAIL"));
                }
                return;
                /* cancel execution until reconnect() is called from confirm dialog */
            }
            self.socket = new WebSocket(self.url, self.protocol);
            self.attempts++;
            shmi.log("[SocketConnection] Connecting...", 2);

            self.init();
        },
        /**
         * Used to disconnect the WebSocket from the server
         *
         */
        disconnect: function() {
            this.connected = false;
            if (this.socket !== null) {
                this.socket.close();
            }
            this.socket = null;
        },
        /**
         * Used to send the specified message to the WebSocket-Server, if a connection
         * is established
         *
         * @param {String} msg the message to send to the WebSocket server
         */
        sendMessage: function(msg) {
            if (this.socket !== null) {
                if (this.socket.readyState === 1) {
                    if (this.debugSendCallback) {
                        this.debugSendCallback(msg);
                    }
                    this.socket.send(msg);
                } else {
                    shmi.log("[SocketConnection] EOS2 - state " + this.socket.readyState, 0);
                }
            } else {
                shmi.log("[SocketConnection] EOS1 - state " + this, 0);
            }
        },
        isConnected: function() {
            return this.connected;
        }
    };
}());
/**
 * Callback function for connection attempt.
 *
 * @callback shmi.visuals.io.SocketConnection~connectCallback
 * @param {number} status shmi.c("SUCCESS") on success, shmi.c("FAIL") on failure
 */

(function() {
    shmi.pkg("visuals.io");
    /* Helper functions */

    /**
     * getOffsetLeft - get left offset of HTMLElement
     *
     * @param  {HTMLElement} elem element to calculate offset for
     * @return {number}      left offset in px
     */
    function getOffsetLeft(elem) {
        var offsetLeft = 0;
        do {
            if (!isNaN(elem.offsetLeft)) {
                offsetLeft += elem.offsetLeft;
            }
            elem = elem.offsetParent;
        } while (elem);
        return offsetLeft;
    }

    /**
     * getOffsetTop - get top offset of HTMLElement
     *
     * @param  {HTMLElement} elem element to calculate offset for
     * @return {number}      top offset in px
     */
    function getOffsetTop(elem) {
        var offsetTop = 0;
        do {
            if (!isNaN(elem.offsetTop)) {
                offsetTop += elem.offsetTop;
            }
            elem = elem.offsetParent;
        } while (elem);
        return offsetTop;
    }

    /**
     * updateTimestamp - save event timestamp to touchlistener prototype
     *
     * @param  {number} timestamp event timestamp
     * @return {undefined}
     */
    function updateTimestamp(timestamp) {
        shmi.visuals.io.TouchListener.prototype.lastTimeStamp = timestamp;
    }

    /**
     * Touch Input Listener
     *
     * @constructor
     * @param element - element to listen for touch-events on
     * @param functions - functions to execute on touch-events
     * @param [active] - use active event listener when `true`. Defaults to `false` if unspecifiedd
     */
    shmi.visuals.io.TouchListener = function(element, functions, active) {
        if (window.navigator.msPointerEnabled) {
            this.inactive = true;
            return;
        }
        this.element = element;
        this.touches = {};
        this.last_click_time = 0;
        this.double_click_time = 500;
        this.moved = false;
        this.functions = functions;
        this.prevent_drag_scroll_x = true;
        this.prevent_drag_scroll_y = true;
        this.passive = (active === undefined) ? true : !active;

        this.touchstart = this.touchStart.bind(this);
        this.touchend = this.touchEnd.bind(this);
        this.touchmove = this.touchMove.bind(this);
        this.touchcancel = this.touchCancel.bind(this);
        this.mouseover = function() {
            if (this.functions.onLeave) {
                document.body.removeEventListener('mouseover', this.mouseover);
                this.functions.onLeave();
            }
        }.bind(this);

        this._inactiveReset = function() {
            shmi.visuals.session.UserManager.resetInactivity();
        };

        this.init();
    };

    shmi.visuals.io.TouchListener.prototype = {
        lastTimeStamp: 0,
        /**
         * Initializes the Touch Listener
         *
         */
        init: function() {},
        /**
         * Disables the Touch Listeners
         *
         */
        disable: function() {
            if (this.inactive) {
                return;
            }
            this.element.removeEventListener('touchstart', this.touchstart);
            this.element.removeEventListener('touchend', this.touchend);
            this.element.removeEventListener('touchcancel', this.touchend);
            this.element.removeEventListener('touchmove', this.touchmove);
        },
        /**
         * Enables the Touch Listener
         *
         */
        enable: function() {
            if (this.inactive) {
                return;
            }
            this.element.removeEventListener('touchstart', this.touchstart);
            this.element.addEventListener('touchstart', this.touchstart, { passive: this.passive });
        },
        /**
         * Retrieves number of touches on base element
         *
         */
        getNumberOfTouches: function() {
            var self = this,
                iter = shmi.requires("visuals.tools.iterate").iterateObject,
                numtouches = 0;
            iter(self.touches, function(val, prop) {
                numtouches++;
            });
            return numtouches;
        },
        /**
         * Called when base element is touched
         *
         * @param event - touch event that caused function call
         */
        touchStart: function(event) {
            this._inactiveReset();
            updateTimestamp(event.timeStamp);
            for (var i = 0; i < event.changedTouches.length; i++) {
                if (shmi.testParentChild(this.element, event.changedTouches[i].target)) {
                    var t = event.changedTouches[i],
                        id = t.identifier;
                    this.touches[id] = {};
                    this.touches[id].startPageX = t.pageX;
                    this.touches[id].startPageY = t.pageY;
                    this.touches[id].pageX = t.pageX;
                    this.touches[id].pageY = t.pageY;
                    this.touches[id].startX = t.clientX;
                    this.touches[id].startY = t.clientY;
                    this.touches[id].dx = 0;
                    this.touches[id].dy = 0;
                    this.touches[id].time = Date.now();
                    if (this.functions.onDrag) {
                        this.cancelTimer(id);
                    }
                    if (this.functions.onEnter) {
                        document.body.removeEventListener('mouseover', this.mouseover);
                        document.body.addEventListener('mouseover', this.mouseover);
                        event.preventDefault();
                        this.functions.onEnter();
                    }
                    if (this.functions.onPress && !event.consumed) {
                        this.functions.onPress(this.touches[id].startX, this.touches[id].startY, event);
                        event.consumed = true;
                    }
                }
            }
            if (this.functions.onDrag) {
                event.stopPropagation();
            }
            this.element.removeEventListener('touchend', this.touchend);
            this.element.removeEventListener('touchcancel', this.touchend);
            this.element.removeEventListener('touchmove', this.touchmove);
            this.element.addEventListener('touchend', this.touchend);
            this.element.addEventListener('touchcancel', this.touchend);
            this.element.addEventListener('touchmove', this.touchmove);
        },
        cancelTimer: function(id) {
            if (this.touches[id] === undefined) {
                /* touch is already canceled */
                return;
            }

            if (this.touches[id].checktime === this.touches[id].time) {
                this.touchCancel({});
            } else {
                this.touches[id].checktime = this.touches[id].time;
                setTimeout(function() {
                    this.cancelTimer(id);
                }.bind(this), shmi.c("DRAG_TIMEOUT"));
            }
        },
        /**
         * Called when touch is removed from base element
         *
         * @param event - touch event that caused the function call
         */
        touchEnd: function(event) {
            this._inactiveReset();
            updateTimestamp(event.timeStamp);
            var x = 0,
                y = 0;
            for (var i = 0; i < event.changedTouches.length; i++) {
                if (shmi.testParentChild(this.element, event.changedTouches[i].target)) {
                    var t = event.changedTouches[i];
                    var id = t.identifier;
                    if (this.touches[id] !== undefined) {
                        x = this.touches[id].startX;
                        y = this.touches[id].startY;
                        if (this.functions.onRelease) {
                            this.functions.onRelease(x, y, event);
                        }
                        delete this.touches[id];
                    }
                }
            }

            if (this.getNumberOfTouches() === 0) {
                if (!this.moved && this.functions.onClick) {
                    if (!event.consumed) {
                        event.consumed = true;
                        if (this.functions.onDoubleClick) {
                            var cur_time = Date.now();
                            if ((cur_time - this.last_click_time) < this.double_click_time) {
                                this.functions.onDoubleClick(x, y, event);
                            } else {
                                this.functions.onClick(x, y, event);
                                this.last_click_time = cur_time;
                            }
                        } else {
                            this.functions.onClick(x, y, event);
                        }
                    }
                    event.preventDefault();
                }
                this.element.removeEventListener('touchmove', this.touchmove);
                this.element.removeEventListener('touchend', this.touchend);
                this.element.removeEventListener('touchcancel', this.touchend);
                this.moved = false;
            }
            if (this.functions.onDrag) {
                event.stopPropagation();
            }
        },
        touchCancel: function(event) {
            var self = this,
                iter = shmi.requires("visuals.tools.iterate").iterateObject;
            self._inactiveReset();
            updateTimestamp(event.timeStamp);
            iter(self.touches, function(val, prop) {
                delete self.touches[prop];
            });
            if (self.functions.onRelease) {
                self.functions.onRelease(0, 0, event);
            }
            self.element.removeEventListener('touchmove', self.touchmove);
            self.element.removeEventListener('touchend', self.touchend);
            self.element.removeEventListener('touchcancel', self.touchend);
            self.moved = false;
        },
        /**
         * Called when touch moved on base element
         *
         * @param event - touch event that caused the function call
         */
        touchMove: function(event) {
            var self = this,
                iter = shmi.requires("visuals.tools.iterate").iterateObject;
            self._inactiveReset();
            updateTimestamp(event.timeStamp);
            /* dragging */
            if (self.getNumberOfTouches() === 1) {
                var dx = 0,
                    dy = 0,
                    totalDx = 0,
                    totalDy = 0;
                for (var i = 0; i < event.changedTouches.length; i++) {
                    if (shmi.testParentChild(self.element, event.changedTouches[i].target)) {
                        var t = event.changedTouches[i],
                            id = t.identifier;
                        dx = t.clientX - self.touches[id].startX;
                        dy = t.clientY - self.touches[id].startY;
                        self.touches[id].startX = t.clientX;
                        self.touches[id].startY = t.clientY;
                        self.touches[id].time = Date.now();
                        if (self.touches[id].totalDx !== undefined) {
                            self.touches[id].totalDx += dx;
                            self.touches[id].totalDy += dy;
                        } else {
                            self.touches[id].totalDx = dx;
                            self.touches[id].totalDy = dy;
                        }
                        totalDx = self.touches[id].totalDx;
                        totalDy = self.touches[id].totalDy;

                        break;
                    }
                }

                if ((Math.abs(totalDx) >= shmi.c("MIN_MOVED_PX")) || (Math.abs(totalDy) >= shmi.c("MIN_MOVED_PX"))) {
                    self.moved = true;
                } else {
                    if (self.functions.onDrag) {
                        if (Math.abs(totalDx) > Math.abs(totalDy)) {
                            if (self.prevent_drag_scroll_x) {
                                event.stopPropagation();
                                event.preventDefault();
                            }
                        } else if (self.prevent_drag_scroll_y) {
                            event.stopPropagation();
                            event.preventDefault();
                        }
                    }
                    self.moved = false;
                    return;
                }

                if (self.functions.onDrag) {
                    //event.preventDefault();
                    event.stopPropagation();
                    self.functions.onDrag(dx, dy, event);
                }
            } else {
                self.moved = true;
            }
            /* dragging - end */

            /* rotating & scaling */
            if (self.getNumberOfTouches() === 2) {
                //refresh touches
                for (i = 0; i < event.changedTouches.length; i++) {
                    if (shmi.testParentChild(self.element, event.changedTouches[i].target)) {
                        t = event.changedTouches[i];
                        id = t.identifier;
                        dx = t.clientX - self.touches[id].startX;
                        dy = t.clientY - self.touches[id].startY;
                        self.touches[id].startX = t.clientX;
                        self.touches[id].startY = t.clientY;

                        self.touches[id].pageDx = (self.touches[id].pageX === undefined) ? t.pageX - self.touches[id].startPageX : t.pageX - self.touches[id].pageX;

                        self.touches[id].pageDy = (self.touches[id].pageY === undefined) ? t.pageY - self.touches[id].startPageY : t.pageY - self.touches[id].pageY;

                        self.touches[id].pageX = t.pageX;
                        self.touches[id].pageY = t.pageY;
                        self.touches[id].dx = dx;
                        self.touches[id].dy = dy;
                        self.touches[id].time = Date.now();
                    }
                }
                var points = [];
                iter(self.touches, function(tObj, tId) {
                    var p = {};
                    p.x = tObj.startX - tObj.dx;
                    p.y = tObj.startY - tObj.dy;
                    points.push(p);
                });

                iter(self.touches, function(tObj, tId) {
                    var p = {};
                    p.x = tObj.startX;
                    p.y = tObj.startY;
                    points.push(p);
                });

                if (self.functions.onRotate) {
                    event.preventDefault();
                    var x1 = (points[0].x - points[1].x) / 2,
                        y1 = (points[0].y - points[1].y) / 2,
                        x2 = (points[2].x - points[3].x) / 2,
                        y2 = (points[2].y - points[3].y) / 2,
                        rotation = Math.atan2(y2, x2) - Math.atan2(y1, x1);
                    self.functions.onRotate(rotation);
                }

                var sPoints = [];
                iter(self.touches, function(tObj, tId) {
                    sPoints.push({
                        x: tObj.startPageX - getOffsetLeft(self.element),
                        y: tObj.startPageY - getOffsetTop(self.element)
                    });
                });
                iter(self.touches, function(tObj, tId) {
                    sPoints.push({
                        x: tObj.pageX - getOffsetLeft(self.element),
                        y: tObj.pageY - getOffsetTop(self.element)
                    });
                });

                if (self.functions.onScale) {
                    event.preventDefault();
                    var dxT0 = Math.abs(sPoints[0].x - sPoints[1].x),
                        dyT0 = Math.abs(sPoints[0].y - sPoints[1].y),
                        dxT1 = Math.abs(sPoints[2].x - sPoints[3].x),
                        dyT1 = Math.abs(sPoints[2].y - sPoints[3].y),
                        sx = ((dxT0 === 0) || (dxT0 / dyT0 < 0.3)) ? 1 : dxT1 / dxT0,
                        sy = ((dyT0 === 0) || (dyT0 / dxT0 < 0.3)) ? 1 : dyT1 / dyT0,
                        l1 = Math.sqrt(Math.pow((sPoints[0].x - sPoints[1].x), 2) + Math.pow((sPoints[0].y - sPoints[1].y), 2)),
                        l2 = Math.sqrt(Math.pow((sPoints[2].x - sPoints[3].x), 2) + Math.pow((sPoints[2].y - sPoints[3].y), 2)),
                        sTotal = l2 / l1,
                        posX = (sPoints[2].x + sPoints[3].x) / 2,
                        posY = (sPoints[2].y + sPoints[3].y) / 2;
                    self.functions.onScale(sTotal, posX, posY, sx, sy, sPoints);
                }
            }
            /* rotating & scaling - end */
        }
    };
})();

shmi.pkg("visuals.gfx");
/**
 * Creates a frame-request-based Animation object.
 *
 * @example
var gfx = shmi.visuals.gfx;
var anim = new gfx.Animation(
function(val){
    console.log("draw callback called with parameter: "+val;
},
function(){
    console.log("animation complete");
}
);
 // set initial animation value
 anim.setCurrentValue(10);
 //animates from 10 to 100 over 500ms
 anim.start( 100, 500)

 * @constructor
 * @param {function} drawCallback - Function to call when updating the animated object
 * @param {function} completeCallback - Function to call when the animation has completed
 * @param {string} timing_mode time mode - defaults to "linear" if unset
 */
shmi.visuals.gfx.Animation = function(drawCallback, completeCallback, timing_mode) {
    this.startValue = 0;
    this.endValue = 0;
    this.currentValue = 0;
    this.animDuration = 0;
    this.startTime = null;
    this.drawCallback = drawCallback;
    this.completeCallback = completeCallback;
    this.requestID = 0;
    this.animate = false;
    this.priority = false;
    this.timer_func = (this.TIMERS[timing_mode] !== undefined) ? this.TIMERS[timing_mode] : this.TIMERS.linear;
};

shmi.visuals.gfx.Animation.prototype = {
    /**
     * Contains timer functions for use in animations.
     *
     * Each timer function performs an alpha value mapping a_in -> a_out where
     * a_in is the progress of the animation duration ([0,1] 0:= animation started,
     * 1:= animation duration complete) and a_out is the progress between start-
     * and end-values ([0,1] 0 := animation at start-value, 1 := animation at
     * end-value).
     *
     * Custom timers may be added in external scripts by extending the prototype
     * of shmi.visuals.gfx.Animation
     * @example
     //add quadratic ease-in timer
     var ease_in_quad = function(a) { return a*a; };
     var anim = shmi.visuals.gfx.Animation;
     gfx.prototype.TIMERS['ease_in_quad'] = ease_in_quad;
     //now the 'timing_mode' parameter in the constructor accepts the value 'ease_in_quad'

     *
     * @type {object}
     */
    TIMERS: {
        linear: function(a) {
            return a;
        }, /* no ease, linear mode */
        ease_in: function(a) {
            return a * a * a;
        }, /* cubic ease-in */
        ease_out: function(a) {
            return (a - 1) * (a - 1) * (a - 1) + 1;
        }, /* cubic ease-out */
        ease_in_out: function(a) {
            return (a < 0.5) ? 4 * a * a * a : (a - 1) * (2 * a - 2) * (2 * a - 2) + 1;
        } /* cubic ease-in & ease-out */
    },
    /**
     * Starts animating to the specified end value over the specified duration.
     *
     * @param endValue - the end value of the animation
     * @param animDuration - the duration of the animation in ms
     */
    start: function(endValue, animDuration) {
        this.startValue = this.currentValue;
        this.endValue = endValue;
        if (animDuration !== undefined) {
            this.animDuration = animDuration;
        }
        this.animate = true;
        this.startTime = null;
        if (this.requestID) {
            shmi.caf(this.requestID);
        }
        this.requestID = shmi.raf(this.draw.bind(this), this.priority);
    },
    /**
     * Sets the current value of the animation.
     *
     * @param value - the new current value of the animation
     */
    setCurrentValue: function(value) {
        this.currentValue = value;
    },
    /**
     * Calculates the current value while animating and runs the draw-callback when
     * frames are requested from the Browser.
     *
     * @param timestamp - current runtime of the animation
     */
    draw: function(timestamp) {
        if (!this.animate) {
            if (this.completeCallback) {
                this.completeCallback();
                shmi.log("[Animation] complete callback called", 0);
            }
            return;
        }
        if (this.startTime === null) {
            this.startTime = timestamp;
        }
        if (this.animDuration) {
            var range = this.endValue - this.startValue,
                cur_duration = timestamp - this.startTime;
            if (cur_duration > this.animDuration) {
                cur_duration = this.animDuration;
            }

            var t_alpha = cur_duration / this.animDuration;
            if (t_alpha > 1) {
                t_alpha = 1;
            }

            var cur_fraction = cur_duration / this.animDuration,
                value = range * this.timer_func(cur_fraction);
            this.currentValue = this.startValue + value;
            if (range >= 0) {
                if (this.currentValue >= this.endValue) {
                    this.currentValue = this.endValue;
                    this.animate = false;
                    this.startTime = null;
                }
            } else if (this.currentValue <= this.endValue) {
                this.currentValue = this.endValue;
                this.animate = false;
                this.startTime = null;
            }
            this.drawCallback(this.currentValue);
        } else {
            this.currentValue = this.endValue;
            this.animate = false;
            this.startTime = null;
            this.drawCallback(this.endValue);
        }
        shmi.caf(this.requestID);
        this.requestID = shmi.raf(this.draw.bind(this), this.priority);
    },
    /**
     * Stops the animation.
     *
     */
    stop: function() {
        this.animate = false;
    }
};

/* Unfortunately we can't really import stuff from other files due to
 * limitations of our module system so for now this will have to do:
 */
/* eslint-disable max-classes-per-file */
(function() {
    "use strict";
    shmi.pkg("visuals.gfx");

    /**
     * Private global storage for timer functions.
     * Can be accessed by static timer functions of the `AnimationBundle`
     * class.
     *
     * Each timer function performs an alpha value mapping a_in -> a_out where
     * a_in is the progress of the animation duration ([0,1] 0:= animation started,
     * 1:= animation duration complete) and a_out is the progress between start-
     * and end-values ([0,1] 0 := animation at start-value, 1 := animation at
     * end-value).
     */
    const TIMER_FUNCS = {
        /* no ease, linear mode */
        linear: (a) => a,
        /* cubic ease-in */
        ease_in: (a) => a * a * a,
        /* cubic ease-out */
        ease_out: (a) => (a - 1) * (a - 1) * (a - 1) + 1,
        /* cubic ease-in & ease-out */
        ease_in_out: (a) => ((a < 0.5) ? 4 * a * a * a : (a - 1) * (2 * a - 2) * (2 * a - 2) + 1)
    };

    /**
     * The default and fallback timer is `linear`.
     */
    const DEFAULT_TIMER = "linear";

    /**
     * Returns the timer function with the given name.
     *
     * @param {string} functionName Name of the timer function to return.
     * @returns {function} Requested timer function or the linear timer
     *  function if the requested one does not exist.
     */
    function getTimerFunction(functionName) {
        const out = TIMER_FUNCS[functionName];
        if (!out) {
            throw new Error(`Timer function "${functionName}" does not exist.`);
        }

        return out;
    }

    /**
     * Management class for alpha transitions.
     */
    class AlphaTransition {
        /**
         * constructs a transition for an alpha value.
         *
         * @param {number} [initialValue] Initial value
         * @param {string} [timingMode] Name of the timer function to use.
         *  Defaults to "linear".
         */
        constructor(initialValue = null, timingMode = DEFAULT_TIMER) {
            this._initialValue = initialValue;
            this._currentValue = initialValue;
            this._targetValue = null;
            this._startTime = null;
            this._currentTime = null;
            this._duration = 0;
            this._timerFunc = getTimerFunction(timingMode);
        }

        /**
         * Starts transitioning the current alpha value to the given target.
         *
         * @param {number} targetValue Target value
         * @param {number} duration Duration of the transition in milliseconds.
         * @param {string} [timingMode] Name of the timer function to use.
         *  Defaults to the last function in use.
         */
        start(targetValue, duration, timingMode) {
            if (this.isDone()) {
                this._currentTime = null;
            }

            if (timingMode) {
                this._timerFunc = getTimerFunction(timingMode);
            }

            // If we haven't seen any other values before, we can't really
            // transition without undesirable behavior. In this case
            // "transition" instantly.
            if (this._currentValue === null) {
                this._currentValue = targetValue;
            }

            this._initialValue = this._currentValue;
            this._startTime = this._currentTime;
            this._targetValue = targetValue;
            this._duration = duration;
        }

        /**
         * Sets the current alpha value to the given initial value and starts
         * transitioning this value to the given starget.
         *
         * @param {number} initialValue Initial value
         * @param {number} targetValue Target value
         * @param {number} duration Duration of the transition in milliseconds.
         * @param {string} [timingMode] Name of the timer function to use.
         *  Defaults to the last function in use.
         */
        startFrom(initialValue, targetValue, duration, timingMode) {
            this._currentValue = initialValue;
            this.start(targetValue, duration, timingMode);
        }

        /**
         * Stops the transition.
         */
        cancel() {
            this._duration = 0;
            this._targetValue = this._currentValue;
        }

        /**
         * Calculates a new alpha value for the given timestamp and updates
         * the current one. The new alpha value will be a value between the
         * initial value and the target. The first timestamp seen by `update`
         * after a transition has been started is used as the transition start
         * time.
         *
         * @param {number} timestamp Timestamp
         */
        update(timestamp) {
            if (this.isDone()) {
                // Nothing to do.
                return;
            } else if (!this._startTime) {
                this._startTime = timestamp;
            }

            // Compute alpha value progress. If duration is 0, progress is
            // either 1 or NaN (which is handled seperately).
            const animationProgress = Math.min(Math.max(0, (timestamp - this._startTime) / this._duration), 1),
                animationProgressTransformed = this._timerFunc(animationProgress),
                newValue = this._initialValue + (this._targetValue - this._initialValue) * animationProgressTransformed;

            // Update internal state.
            this._currentValue = isNaN(newValue) ? this._targetValue : newValue;
            this._currentTime = timestamp;
        }

        /**
         * Checks whether the transition is done.
         *
         * @returns {boolean} `true` if the transition is done,
         *  `false` else.
         */
        isDone() {
            return this._currentValue === this._targetValue;
        }

        /**
         * Returns the current alpha value.
         *
         * @returns {number}
         */
        getValue() {
            return this._currentValue;
        }
    }

    // Private functions for class AnimationBundle
    //

    /**
     * Checks if all alpha transitions are done.
     *
     * @private
     * @param {AnimationBundle} self
     * @returns {boolean} `true` if all alpha transitions are done, `false`
     *  else.
     */
    function allAnimationsDone(self) {
        for (const idx in self._animations) {
            if (!self._animations[idx].isDone()) {
                return false;
            }
        }

        return true;
    }

    /**
     * Animation frame callback. Updates alpha transitions, fetches alpha
     * values and calls the callback.
     *
     * @private
     * @param {AnimationBundle} self
     * @param {number} timestamp Timestamp provided by the animation frame.
     */
    function onDraw(self, timestamp) {
        const result = {};
        for (const idx in self._animations) {
            const anim = self._animations[idx];

            anim.update(timestamp);
            result[idx] = anim.getValue();
        }

        self._raf = null;
        queueAnimationFrame(self);
        self._animationCallback(Object.freeze(result));

        if (self._completeCallback && allAnimationsDone(self)) {
            self._completeCallback();
        }
    }

    /**
     * Queues a new animation frame if there is active transitions.
     *
     * @private
     * @param {AnimationBundle} self
     * @param {boolean} [force] If set, queues an animation frame even if all
     *  animations are done.
     */
    function queueAnimationFrame(self, force = false) {
        if (!self._raf && (force || !allAnimationsDone(self))) {
            self._raf = shmi.raf(onDraw.bind(null, self));
        }
    }

    /**
     * Gets an `AlphaTransition` for the given animation name. If no object for
     * the given name is found a new `AlphaTransition` will be created.
     *
     * @private
     * @param {AnimationBundle} self
     * @param {string} animationName Name of the animation
     * @returns {AlphaTransition}
     */
    function getAnimation(self, animationName) {
        let anim = self._animations[animationName];
        if (!anim) {
            anim = new AlphaTransition;
            self._animations[animationName] = anim;
        }

        return anim;
    }

    //
    //

    /**
     * Management class for frame-request-based animations. Each animation is
     * represented by an alpha value that is transitioned from its initial
     * value to its target over a certain duration. Alpha values are reported
     * to the animation callback. Once all alpha values have transitioned to
     * their target values, the complete callback is called.
     *
     * @example
const anim = new shmi.visuals.gfx.Animation(
    (alphaValues) => console.log("draw callback called with parameter:", alphaValues),
    () => console.log("animation complete")
);
// Animates "myAnimation" from 10 to 100 over 500ms.
anim.startFrom(10, 100, 500, "myAnimation");
// Animates "mySlowAnimation" from 10 to 100 over 10000ms.
anim.startFrom(10, 100, 10000, "mySlowAnimation");
// Prepares "myPreparedAnimation" to start from 10. It can later be animated to a desired value with `anim.start()`
anim.prepare("myPreparedAnimation", 10);
// Animates "myPreparedAmination" from its current value (10 in this example) to 100 over 250ms
anim.start(100, 250, "myPreparedAnimation");

     */
    shmi.visuals.gfx.AnimationBundle = class AnimationBundle {
        /**
         * Constructs a new `AnimationBundle` that calls the given callback
         * with the set of its current alpha values for every step of the
         * animation.
         *
         * @param {function} animationCallback Callback animated values are
         *  reported to for each animation step.
         * @param {?function} [completeCallback] Callback called when
         *  animations are done.
         */
        constructor(animationCallback, completeCallback = null) {
            shmi.checkArg("animationCallback", animationCallback, "function");
            shmi.checkArg("completeCallback", completeCallback, "function", "null");

            this._animations = {};
            this._animationCallback = animationCallback;
            this._completeCallback = completeCallback;
            this._raf = null;
        }

        /**
         * Registers a new timer function.
         *
         * @example
//add quadratic ease-in timer
shmi.visuals.gfx.AnimationBundle.registerTimerFunction("ease_in_quad", (a) => a*a);

         *
         * @param {string} functionName
         * @param {function} timerFunc
         * @throws {Error} If a timer with the given name already exists.
         */
        static registerTimerFunction(functionName, timerFunc) {
            shmi.checkArg("functionName", functionName, "string");
            shmi.checkArg("timerFunc", timerFunc, "function");

            if (shmi.objectHasOwnProperty(TIMER_FUNCS, functionName)) {
                throw new Error(`Timer with name ${functionName} has already been registered`);
            }

            TIMER_FUNCS[functionName] = timerFunc;
        }

        /**
         * Checks if a timer function with the given name exists.
         *
         * @param {string} functionName
         * @returns {boolean} `true` if the timer function exists, `false`
         *  else.
         */
        static timerFunctionExists(functionName) {
            return shmi.objectHasOwnProperty(TIMER_FUNCS, functionName);
        }

        /**
         * Returns an array of names of known timer functions.
         *
         * @returns {string[]}
         */
        static timerFunctions() {
            return Object.keys(TIMER_FUNCS);
        }

        /**
         * Prepares a new animation. Preparing animations before using them
         * allows setting the initial timer mode without starting it.
         *
         * @param {string} animationName Name of the animation to prepare.
         * @param {?number} [initialValue] Initial value for the animation.
         * @param {string} [timingMode] Initial timer mode.
         * @throws {Error} If an animation with the given name already exists.
         */
        prepare(animationName, initialValue = null, timingMode = DEFAULT_TIMER) {
            shmi.checkArg("animationName", animationName, "string");
            shmi.checkArg("initialValue", initialValue, "number", "null");
            shmi.checkArg("timingMode", timingMode, "string");

            if (this._animations[animationName]) {
                throw new Error(`Animation with name ${animationName} already exists`);
            }

            this._animations[animationName] = new AlphaTransition(initialValue, timingMode);
        }

        /**
         * Starts an animation with the given name from its default value.
         *
         * @param {number} targetValue Target value.
         * @param {number} duration Duration of the animation in milliseconds.
         * @param {string} [animationName] Name of the animation to start.
         */
        start(targetValue, duration, animationName = "default", timingMode = null) {
            shmi.checkArg("targetValue", targetValue, "number");
            shmi.checkArg("duration", duration, "number");
            shmi.checkArg("animationName", animationName, "string");
            shmi.checkArg("timingMode", timingMode, "string", "null");

            getAnimation(this, animationName).start(targetValue, duration, timingMode);
            queueAnimationFrame(this, true);
        }

        /**
         * Starts an animation with the given name.
         *
         * @param {number} startValue Initial value.
         * @param {number} targetValue Target value.
         * @param {number} duration Duration of the animation in milliseconds.
         * @param {string} [animationName] Name of the animation to start.
         */
        startFrom(startValue, targetValue, duration, animationName = "default", timingMode = null) {
            shmi.checkArg("startValue", startValue, "number");
            shmi.checkArg("targetValue", targetValue, "number");
            shmi.checkArg("duration", duration, "number");
            shmi.checkArg("animationName", animationName, "string");
            shmi.checkArg("timingMode", timingMode, "string", "null");

            getAnimation(this, animationName).startFrom(startValue, targetValue, duration, timingMode);
            queueAnimationFrame(this, true);
        }

        /**
         * Cancels an animation.
         *
         * @param {number} [animationName] Name of the animation to cancel.
         * @param {boolean} [deleteAnimation] Deletes the animation. It will
         *  no longer be reported to the animation callback.
         */
        cancel(animationName = "default", deleteAnimation = false) {
            shmi.checkArg("animationName", animationName, "string");
            shmi.checkArg("deleteAnimation", deleteAnimation, "boolean");

            if (this._animations[animationName]) {
                if (deleteAnimation) {
                    delete this._animations[animationName];
                } else {
                    this._animations[animationName].cancel();
                }

                if (this._raf && allAnimationsDone(this)) {
                    shmi.caf(this._raf);
                    this._raf = null;
                }
            }
        }

        /**
         * Call animation callback again with current values.
         */
        refresh() {
            queueAnimationFrame(this, true);
        }

        /**
         * Returns an object containing values for each animation.
         *
         * @returns {object}
         */
        getValues() {
            const result = {};
            for (const idx in this._animations) {
                result[idx] = this._animations[idx].getValue();
            }

            return Object.freeze(result);
        }
    };
}());

shmi.pkg("visuals.gfx");
/**
 * Creates a new Movable to transform HTML Elements.
 *
 * @classdesc Provides transformation operations for HTML elements
 * @constructor
 * @param {HTMLElement} el - element to perform transformations on
 * @param {object} [options] initial options
 * @param {number} [options.scale] initial common scale
 * @param {number} [options.scaleX] initial x-scale
 * @param {number} [options.scaleY] initial y-scale
 * @param {number} [options.translateX] initial x-translation
 * @param {number} [options.translateY] initial y-translation
 */
shmi.visuals.gfx.Movable = function(el, options) {
    this.el = el;
    /**
     * css transition style used if setTransition(true) is set
     * @default
     */
    this.transitionStyle = 'all .25s';
    this.s = (options && typeof options.scale === "number") ? options.scale : 1.0;
    /**
     * x-axis scale
     */
    this.sx = (options && typeof options.scaleX === "number") ? options.scaleX : 1.0;
    /**
     * y-axis scale
     */
    this.sy = (options && typeof options.scaleY === "number") ? options.scaleY : 1.0;
    this.startX = 0;
    this.startY = 0;
    this.rotatable = true;
    this.scalable = true;
    /**
     * x-axis translation
     */
    this.tx = (options && typeof options.translateX === "number") ? options.translateX : 0;
    /**
     * y-axis translation
     */
    this.ty = (options && typeof options.translateY === "number") ? options.translateY : 0;
    /**
     * rotation (°)
     */
    this.rot = 0;
    this.max_s = 1.5;
    this.min_s = 0.5;
    this.transition = false;
    this.tfComplete = false;
    this.requestID = 0;
    this.priority = false;

    this.tf = "scale(1.0) translate(0px, 0px) rotate(0deg)";
    this.draw();
};

shmi.visuals.gfx.Movable.prototype = {
    /*
     * Rotates element by specified degree
     *
     * @param rot - rotation in degree
     */
    rotate: function(rot) {
        this.rot += rot;
        this.update();
    },
    /**
     * Translates element relatively by specified values
     *
     * @param {Number} dx x-axis translation value
     * @param {Number} dy y-axis translation value
     */
    translate: function(dx, dy) {
        this.tx += dx;
        this.ty += dy;
        this.update();
    },
    /**
     * Scales element by specified scale
     *
     * @param s - new scale factor
     */
    scale: function(s) {
        this.s *= s;
        if (this.s < this.min_s) {
            this.s = this.min_s;
        } else if (this.s > this.max_s) {
            this.s = this.max_s;
        }
        this.sx *= s;
        if (this.sx < this.min_s) {
            this.sx = this.min_s;
        } else if (this.sx > this.max_s) {
            this.sx = this.max_s;
            this.sy *= s;
        }
        if (this.sy < this.min_s) {
            this.sy = this.min_s;
        } else if (this.sy > this.max_s) {
            this.sy = this.max_s;
        }
        this.update();
    },
    /**
     * Applies current transformations
     * @private
     */
    draw: function() {
        if (this.tfComplete) {
            this.tf = `scale3d(${this.sx.toFixed(3)}, ${this.sy.toFixed(3)}, 1) rotate3d(0,0,1,${this.rot.toFixed(3)}deg)`;
            this.el.style.transform = this.tf;
            this.startX = this.startX + this.tx;
            this.startY = this.startY + this.ty;
            this.tx = 0;
            this.ty = 0;
            this.tfComplete = false;
        } else {
            this.updateTransform();
            this.el.style.transform = this.tf;
        }
    },
    /**
     * Hooks transform update to browser frame request
     *
     */
    update: function() {
        if (this.requestID) {
            shmi.caf(this.requestID);
        }
        this.requestID = shmi.raf(this.draw.bind(this), this.priority);
    },
    /**
     * Calculates new css for current transformations
     *
     * @private
     */
    updateTransform: function() {
        this.tf = `translate3d(${this.tx.toFixed(0)}px, ${this.ty.toFixed(0)}px, 0px)`;
        if (this.scalable) {
            this.tf += ` scale3d(${this.sx.toFixed(3)}, ${this.sy.toFixed(3)}, 1)`;
        }
        if (this.rotatable) {
            this.tf += ` rotate3d(0,0,1,${this.rot.toFixed(0)}deg)`;
        }
    },
    /**
     * Applies specified transition style to element
     *
     * @param {String} transition - transition style for element
     */
    setTransition: function(transition) {
        this.transition = transition;
        if (this.transition) {
            this.el.style.transition = this.transitionStyle;
        } else {
            this.el.style.transition = '';
        }
    },
    /**
     * Finalizes transform
     *
     * @private
     */
    completeTransform: function() {
        this.tfComplete = true;
        this.update();
    },
    forceAccOff: function() {
        /* this only exists for compatibility */
        this.draw();
    }
};

//bind function work-around
if (!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function() {
            },
            fBound = function() {
                return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}
//bind function work-around end

//Disable MSHoldVisual
document.documentElement.addEventListener("MSHoldVisual", function(e) {
    e.preventDefault();
}, false);

/**
 * Constants
 *
 */
/* minimum required connect version */
shmi.c("MIN_CONNECT_VERSION", 0.921);

/* time to wait before termination a connection if no @ping was received */
shmi.c("DEFAULT_CONNECTION_TIMEOUT", -1);

/* number of attempts to connect before displaying a warning */
shmi.c("DEFAULT_CONNECTION_ATTEMPTS", 1);

/* default for project config option 'initial-view' */
shmi.c("DEFAULT_VIEW", "View1");

/* number of query results to retrieve if no count is specified */
shmi.c("DEFAULT_QUERY_RESULTS", 4096);

/** connect database indices **/
/* connect config database read-only */
shmi.c("DB_CFG_RO", 0);
/* connect config database read-write */
shmi.c("DB_CFG_RW", 1);
/* connect hmi database read-only */
shmi.c("DB_HMI_RO", 2);
/* connect hmi database read-write */
shmi.c("DB_HMI_RW", 3);
/* connect user database read-only */
shmi.c("DB_USR_RO", 4);
/* connect user database read-write */
shmi.c("DB_USR_RW", 5);
/* custom database read-only */
shmi.c("DB_CUSTOM_RO", 6);
/* custom database read-write */
shmi.c("DB_CUSTOM_RW", 7);

/* paths and extensions */
shmi.c("TEMPLATE_PATH", "templates/");
shmi.c("TEMPLATE_EXT", ".html");
shmi.c("CONFIG_PATH", "json/");
shmi.c("CONFIG_EXT", ".json");

shmi.c("APP_CONFIG_PATH", "json/project.json");
shmi.c("GROUP_CONFIG_PATH", "json/groups/config.json");
shmi.c("LOCALE_INDEX_PATH", "json/locale/index.json");
shmi.c("LOCALE_PATH_PATTERN", "json/locale/lang/<%= index %>.json");
shmi.c("KEYBOARD_PATH_PATTERN", "json/locale/keyboard/<%= index %>.json");
shmi.c("MEDIA_QUERIES_CONFIG_PATH", "json/media-queries.json");
shmi.c("SYS_CONTROLS_CONFIG_PATH", "json/sys-config/sys-controls.json");
shmi.c("SYS_HANDLERS_CONFIG_PATH", "json/sys-config/sys-handlers.json");
shmi.c("VIRTUAL_ITEMS_CONFIG_PATH", "json/virtual-items.json");
shmi.c("DGM_GRID_MAP_PATH", "json/grids/grid_map.json");
shmi.c("GRID_PATH_PATTERN", "json/grids/<%= name %>.json");
shmi.c("UNITCLASS_CONFIG_PATH", "json/unit-classes.json");

/* delay after project load to display splash */
shmi.c("LOAD_TIMEOUT", 350);

/* timeout used to decouple execution from current function */
shmi.c("DECOUPLE_TIMEOUT", 50);
/* timeout used to wait between retries */
shmi.c("ACTION_RETRY_TIMEOUT", 150);

/* timeout used to wait before considering a drag as canceled */
shmi.c("DRAG_TIMEOUT", 1000);

/* used to indicate success */
shmi.c("SUCCESS", 0);

/* used to indicate failure */
shmi.c("FAIL", 1);

/* minimum interval (ms) between value updates, before considered a burst */
shmi.c("MIN_UPDATE_INTERVAL", 9);

/* time between frames when no native requestAnimationFrame function is detected */
shmi.c("RAF_FALLBACK_TIMEOUT", 33);

/* interval used when checking if all controls are initialized */
shmi.c("CHECK_INIT_INTERVAL", 100);

/* log levels */
shmi.c("LOG_DEBUG", 0); // only for debug purposes
shmi.c("LOG_INFO", 1); // informational messages
shmi.c("LOG_MSG", 2); // messages intended for user display; recoverable errors
shmi.c("LOG_ERROR", 3); // unrecoverable error messages

// item types
shmi.c("TYPE_STRING", 0);
shmi.c("TYPE_BOOL", 1);
shmi.c("TYPE_INT", 2);
shmi.c("TYPE_FLOAT", 3);

shmi.c("DEFAULT_PAGE_SIZE", 25); // number of simultaneously displayed items in paged lists

shmi.c("CSS_CONTROL_CLASS", "ctrl"); // css class which will be added to all controls

shmi.c("NAME_SUFFIX", "_"); // suffix used to enumerate unnamed or ambiguously named controls

shmi.c("MIN_MOVED_PX", 15); // amount of pixels necessary to be counted as a drag vs. a click (mouse- & touch-input)

shmi.c("RES_URL_PREFIX", "res://"); // URL prefix for dynamic resources stored in the ResourceLoader with shmi.putResource(..)

shmi.c("DATAGRID_DB2_WRITE_DELAY", 250); // delay after which items are written back to the database when changed

shmi.c("DEFAULT_LAYOUT_URL", "layouts/default.html"); // URL of default layout / entrypoint

shmi.c("SERVER_TIME_ITEM", "Systemzeit");

shmi.c("ALT_SERVER_TIME_ITEM", "SYS_TIME");

shmi.c("MIN_PASSWORD_LENGTH", 3);

shmi.pkg("visuals.session");

shmi.visuals.session.GfxState = {};

shmi.visuals.session.GfxState.logAnimFallback = true;
shmi.visuals.session.GfxState.drawRequests = {};
shmi.visuals.session.GfxState.priorityRequests = {};
shmi.visuals.session.GfxState.drawId = 1;
shmi.visuals.session.GfxState.sysDrawId = 1;
shmi.visuals.session.GfxState.lastDrawTime = -1;

shmi.pkg("visuals.gfx");
/**
 * Used to queue execution of a function for application to the layout.
 *
 * This function should be used for all animation purposes and manipulation of layout.
 *
 * @param {Function} callfunc function to call when request is ready for execution
 * @param {Boolean} priority true if request should be considered for immediate execution
 * @returns {Number} ID of the request
 */
shmi.visuals.gfx.requestAnimFrame = function(callfunc, priority) {
    var state = shmi.visuals.session.GfxState;
    var id = state.drawId++;
    if (priority) {
        state.priorityRequests[id] = callfunc;
    } else {
        state.drawRequests[id] = callfunc;
    }
    shmi.visuals.gfx.cancelAnimFrameImpl(state.sysDrawId);
    state.sysDrawId = shmi.visuals.gfx.requestAnimFrameImpl(shmi.visuals.gfx.drawAnimFrames);
    return id;
};
/* create shortcut function*/
shmi.raf = shmi.visuals.gfx.requestAnimFrame;

/**
 * Cancels the execution request of the specified id.
 *
 * Should be used in conjunction with requestAnimFrame and the returned ID before each
 * new request to prevent request congestion.
 *
 * @param {Number} id ID returned by requestAnimFrame
 * @returns {undefined}
 */
shmi.visuals.gfx.cancelAnimFrame = function(id) {
    if (shmi.visuals.session.GfxState.drawRequests[id] !== undefined) {
        delete shmi.visuals.session.GfxState.drawRequests[id];
    }
};
/* create shortcut function */
shmi.caf = shmi.visuals.gfx.cancelAnimFrame;

shmi.visuals.gfx.drawAnimFrames = function(drawTime) {
    const state = shmi.visuals.session.GfxState,
        priorityCallbacks = Object.values(state.priorityRequests);

    if (priorityCallbacks.length) {
        state.priorityRequests = {};

        priorityCallbacks.forEach((callback) => {
            try {
                callback(drawTime);
            } catch (exc) {
                console.error("[Compatibility] PRIO - could not call animation frame request:", exc);
            }
        });

        state.sysDrawId = shmi.visuals.gfx.requestAnimFrameImpl(shmi.visuals.gfx.drawAnimFrames);
    } else {
        const callbacks = Object.values(state.drawRequests);
        state.drawRequests = {};

        callbacks.forEach((callback) => {
            try {
                callback(drawTime);
            } catch (exc) {
                console.error("[Compatibility] could not call animation frame request:", exc);
            }
        });
    }
};

//requestAnimationFrame with fallback
shmi.visuals.gfx.requestAnimFrameImpl = (function() {
    var func = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback) {
            ////console.shmi.log("using fallback mode for rendering.");
            if (shmi.visuals.session.GfxState.logAnimFallback) {
                shmi.visuals.session.GfxState.logAnimFallback = false;
                shmi.log('[Compatibility] -- requestAnimationFrame not available, using fallback --', 2);
            }
            var tid = setTimeout(function() {
                callback(Date.now() + shmi.c("RAF_FALLBACK_TIMEOUT")); //~= 30fps
            }, 1);
            return tid;
        };
    return func.bind(window);
})();

shmi.visuals.gfx.cancelAnimFrameImpl = (function() {
    var func = window.cancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        function(timeoutId) {
            clearTimeout(timeoutId);
        };
    return func.bind(window);
})();
//requestAnimationFrame with fallback - end

shmi.pkg("visuals.io");
/* global ActiveXObject */
/**
 * Cross-browser compatible ajax loader.
 *
 * Bypasses the cache of ResourceLoader.
 *
 * @example
var io = shmi.visuals.io;
io.loadResourceHttp(
"json/data.json", function(response, failed){
    if(failed){
        console.log("Request failed");
    } else {
        console.log("Request successful, response received:\n" +response);
    }
);
 *
 * @param {String} path
 * @param {shmi.visuals.io~resourceCallback} callback
 * @returns {undefined}
 */
shmi.visuals.io.loadResourceHttp = function(path, callback, binary, sync) {
    if (sync !== true) {
        sync = false;
    }

    const request = new XMLHttpRequest();

    try {
        if (window.location.protocol === "file:") {
            if (path.indexOf("./") === 0) {
                path = path.replace("./", "");
            }
            const loc = window.location.pathname,
                dir = loc.substring(0, loc.lastIndexOf('/'));

            path = "file://" + dir + "/" + path;
            if (shmi.visuals.session.config && shmi.visuals.session.config.debug) {
                console.debug("[Compatibility] open file-system path: " + path);
            }
        }
        request.open("GET", path, !sync);
        if (binary === true) {
            request.responseType = "arraybuffer";
        }
    } catch (exc) {
        shmi.log("[ResourceLoader] Exception during GET request.", 3);
    }

    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
            if (binary === true) {
                callback(request.response, false, path);
            } else {
                callback(request.responseText, false, path);
            }
        } else if (request.readyState === 4 && request.status === 0) {
            if (shmi.visuals.session.config && shmi.visuals.session.config.debug) {
                console.log("[ResourceLoader] local request '" + path + "' returned, Status: " + request.status);
            }
            if (binary === true) {
                callback(request.response, false, path);
            } else {
                callback(request.responseText, false, path);
            }
        } else if (request.readyState === 4) {
            if (shmi.visuals.session.config && shmi.visuals.session.config.debug) {
                console.log("[ResourceLoader] Request '" + path + "' failed, Status: " + request.status);
            }
            callback("", true, path);
        }
    };

    try {
        request.send();
    } catch (exc) {
        shmi.log("[ResourceLoader] exception during get request: " + exc, 2);
        callback("", true);
    }
};

/**
 * Callback function for resource requests
 *
 * @callback shmi.visuals.io~resourceCallback
 * @param {String} response data returned from the request
 * @param {Boolean} failed true if request failed, false else
 */

/* create session storage package */
shmi.pkg("visuals.session");

/* create storage object for parsing functionality */
(function() {
    var pState = shmi.pkg("visuals.session.ParserState");
    pState.controlTypes = [];
    /* stores data-ui attribute --> constructor mappings */
    pState.containerTypes = [];
    /* stores data-ui attributes of container controls */
}());

/* create storage object for message handlers */
shmi.visuals.session.msgHandlers = {};

/* create layout storage object to store references to active controls */
shmi.visuals.session.Layout = shmi.visuals.session.Layout || {};
/* create storage array for each control type */
(function() {
    for (var i = 0; i < shmi.visuals.session.ParserState.controlTypes.length; i++) {
        shmi.visuals.session.Layout[shmi.visuals.session.ParserState.controlTypes[i][0]] = new Array();
    }
})();

(function() {
    /* register controls included in library */
    for (var module in shmi.visuals.controls) {
        if (module.charAt(0) === module.charAt(0).toUpperCase()) {
            if (shmi.visuals.controls[module].prototype !== undefined) {
                shmi.log("[Parser] is control class: " + module, 1);
                if (shmi.visuals.controls[module].prototype.uiType !== undefined) {
                    var type = shmi.visuals.controls[module].prototype.uiType;
                    shmi.log("  ui-type: " + shmi.visuals.controls[module].prototype.uiType, 1);
                    var container = false;
                    if (shmi.visuals.controls[module].prototype.isContainer === true) {
                        container = true;
                        shmi.log("  is ui-container", 1);
                    }
                    shmi.registerControlType(type, shmi.visuals.controls[module], container);
                }
            }
        }
    }
}());

shmi.pkg("visuals.parser");

(function() {
    /**
     * getDefaultConfig - retrieve control default configuration
     *
     * @param  {string} uiType  control ui-type
     * @param  {string|null} variant control variant
     * @return {object} control config
     */
    function getDefaultConfig(uiType, variant) {
        var defaultConfigs = shmi.pkg("visuals.default.ControlConfig"),
            iter = shmi.requires("visuals.tools.iterate.iterateObject"),
            controlConfig = {};

        if (defaultConfigs[uiType]) {
            console.debug("[visuals.parser]", "applying default config", uiType, variant);
            iter(defaultConfigs[uiType].config, function(val, prop) {
                controlConfig[prop] = val;
            });
            if (defaultConfigs[uiType].variants && defaultConfigs[uiType].variants[variant]) {
                iter(defaultConfigs[uiType].variants[variant], function(val, prop) {
                    controlConfig[prop] = val;
                });
            }
        }

        return controlConfig;
    }

    shmi.visuals.parser.getDefaultConfig = getDefaultConfig;

    /**
     * testBase - test if element is direct child control of specified base element
     *
     * @param  {HTMLElement} checkElement element to test
     * @param  {HTMLElement} baseElement  base element
     * @return {boolean} `true` if child is direct child, `false` else
     */
    function testBase(checkElement, baseElement) {
        while (checkElement.parentNode && checkElement.parentNode !== baseElement && !checkElement.parentNode.getAttribute("data-ui")) {
            checkElement = checkElement.parentNode;
        }
        if (!checkElement.parentNode || checkElement.parentNode !== baseElement) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * Used to parse controls ascending the DOM from the specified baseElement.
     *
     * first and compareElement parameters should only be used during project startup,
     * container controls do not have to specify these.
     *
     * @param {HTMLElement} baseElement controls above this element will be parsed
     * @param {Boolean} first true during initial parsing in project startup
     * @param {HTMLElement} compareElement root element of parent container control if different from baseElement
     * @returns {Array} Array of Controls parsed
     */
    shmi.visuals.parser.parseControls = function(baseElement, first, compareElement) {
        if (!baseElement) {
            baseElement = document.body;
            shmi.log("[Parser] BASE DOCUMENT.BODY", 0);
        }

        const model = shmi.requires("visuals.model"),
            controlList = [],
            session = shmi.visuals.session,
            cTypes = session.ParserState.controlTypes,
            uiTypes = {};

        cTypes.forEach((typeDef) => {
            uiTypes[typeDef[0]] = typeDef[1];
        });

        const elements = [...baseElement.querySelectorAll("[data-ui]")];
        let elementInfos = [],
            parentContainer = null;

        elementInfos = elements.map((element) => ({
            element: element,
            ui: element.getAttribute("data-ui")
        }));
        elementInfos = elementInfos.filter((info) => (info.ui && uiTypes[info.ui]));
        elementInfos = elementInfos.filter((info) => testBase(info.element, baseElement));

        elementInfos.forEach((info) => {
            const nodeId = info.element.getAttribute("_nodeid");
            let controlInstance = null;

            if (nodeId) {
                const config = model.getConfig(nodeId);
                delete config["config-name"];
                controlInstance = new uiTypes[info.ui](info.element, Object.assign({}, getDefaultConfig(info.ui), config));
            } else {
                controlInstance = new uiTypes[info.ui](info.element, getDefaultConfig(info.ui));
            }

            if (parentContainer === null) {
                parentContainer = {
                    element: shmi.getParentContainerElement(info.element),
                    control: null
                };

                if (!first && parentContainer.element) {
                    parentContainer.control = shmi.getControlByElement(parentContainer.element);
                }
            }

            controlInstance.uiType = info.ui;
            controlInstance.parentContainer = parentContainer.control;
            session.Layout[info.ui].push(controlInstance);
            if (first) {
                session.Layout.topLevel = session.Layout.topLevel || [];
                session.Layout.topLevel.push(controlInstance);
            }
            controlInstance.fire("register", {});
            controlList.push(controlInstance);
        });

        if (first) {
            controlList.forEach((controlInstance) => {
                controlInstance.enable();
            });
        }

        return controlList;
    };
}());

/* define function shortcut */
shmi.parseControls = shmi.visuals.parser.parseControls;

shmi.visuals.parser.parseProject = function(viewpos) {
    /* Put Version String in Locale */
    shmi.visuals.session.locale['VisualsVersion'] = shmi.visuals.Version;

    /* Clear shmi.visuals.session.Layout */
    for (var type in shmi.visuals.session.Layout) {
        while (shmi.visuals.session.Layout[type].pop()) {
            shmi.log("Clear shmi.visuals.session.Layout", 1);
        }
    }

    return shmi.visuals.parser.parseControls(null, true, null);
};

/**
 * Layout model parsing and access
 *
 * @module visuals/model
 */
(function() {
    /** @lends module:visuals/model */
    const module = shmi.pkg("visuals.model");

    let nodeMap = {},
        modelData = null;

    /**
     * putResource - Puts data resource into storage.
     *
     * @param  {any} data data to put into storage
     * @param  {string} name optional resource URL
     * @return {string}      resource URL
     */
    function putResource(data, name) {
        const rl = shmi.requires("visuals.session.ResourceLoader");

        if (rl.resources[name] !== undefined) {
            rl.resources[name].data = data;
            rl.resources[name].failed = false;
            if (!Array.isArray(rl.resources[name].callbacks)) {
                rl.resources[name].callbacks = [];
            }
            rl.notifyCallbacks(name);
        } else {
            rl.resources[name] = { data: data, failed: false, callbacks: [] };
        }
    }

    /**
     * mapNode - map key-value pairs of specified node and its ancestors into existing map object
     *
     * @param {object} node node data
     */
    function mapNode(node) {
        if (typeof node.id === "string") {
            nodeMap[node.id] = node;
            if (Array.isArray(node.children)) {
                node.children.forEach(function(c) {
                    mapNode(c, nodeMap);
                });
            }
        }
    }

    /**
     * mapTemplate - map children (nodes) of templates into map object
     *
     * @param {object[]} template template data
     */
    function mapTemplate(template) {
        template.forEach(function(n) {
            mapNode(n);
        });
    }

    /**
     * parse JSON layout model
     *
     * @param {string} jsonText JSON input text
     * @return {object} parsed node map
     */
    module.parse = (jsonText) => {
        modelData = JSON.parse(jsonText);
        nodeMap = {};

        Object.keys(modelData.templates).forEach((templateName) => {
            mapTemplate(modelData.templates[templateName]);
            putResource(module.generateTemplate(modelData.templates[templateName]), `res://${templateName}/template`);
        });

        return nodeMap;
    };

    /**
     * get configuration for specified node id
     *
     * @param {string} nodeId node id
     * @returns {object} node configuration
     */
    module.getConfig = (nodeId) => {
        const node = nodeMap[nodeId];
        if (node) {
            if (node.parentGroupId) {
                return shmi.cloneObject(node.controlConfig);
            }
            return node.controlConfig;
        }
        return {};
    };

    /**
     * get loaded model data
     *
     * @returns {object} layout model data
     */
    module.getModelData = () => modelData;

    /**
     * get parsed node map
     *
     * @returns {object} parsed node map
     */
    module.getNodeMap = () => nodeMap;

    /**
     * get source of template for specified template name
     *
     * @param {string} templateName name of template
     * @returns {string} template source
     */
    module.getTemplate = (templateName) => {
        const rl = shmi.requires("visuals.session.ResourceLoader");

        if (rl.resources[`res://${templateName}/template`] !== undefined) {
            return rl.resources[`res://${templateName}/template`].data;
        } else {
            return null;
        }
    };

    /**
     * generateElement - generate HTMLElement from node data
     *
     * @param {object} nodeInfo node data
     * @returns {HTMLElement} generated element
     */
    function generateElement(nodeInfo) {
        const iter = shmi.requires("visuals.tools.iterate.iterateObject");
        let element = null;

        if (nodeInfo.type === Node.TEXT_NODE) {
            element = document.createTextNode(nodeInfo.value);
        } else if (nodeInfo.type === Node.COMMENT_NODE) {
            element = document.createComment(nodeInfo.value);
        } else if (nodeInfo.type === Node.ELEMENT_NODE) {
            element = document.createElement(nodeInfo.tagName);
            iter(nodeInfo.attributes, function(val, prop) {
                if (prop !== "data-config-name") {
                    element.setAttribute(prop, val);
                }
            });
            nodeInfo.children.forEach((cn) => {
                const childElement = generateElement(cn);
                if (childElement) {
                    element.appendChild(childElement);
                }
            });
        }

        return element;
    }

    /**
     * generate - Generate a WebIQ HTML template from a template structure object.
     *
     * @param {object|object[]} templateStructure template structure object
     *
     * @returns {string} template HTML source
     */
    module.generateTemplate = (templateStructure) => {
        const root = document.createElement("DIV");

        if (Array.isArray(templateStructure)) {
            templateStructure.forEach(function(ts) {
                const templateElement = generateElement(ts);
                root.appendChild(templateElement);
            });
        } else {
            root.appendChild(generateElement(templateStructure));
        }

        return root.innerHTML;
    };
}());
shmi.pkg("visuals.init");

/* initializes session after configuration and restore data have been loaded */

/**
 * initialize virtual items at application startup
 *
 * @param {object} virtualItemsConfiguration virtual item configuration data
 */
shmi.visuals.init.initVItems = function(virtualItemsConfiguration) {
    if (virtualItemsConfiguration && Array.isArray(virtualItemsConfiguration.items)) {
        virtualItemsConfiguration.items.forEach((itemConfig) => {
            itemConfig.name = `virtual:${itemConfig.name}`; //add virtual item prefix
            shmi.createVirtualItem(itemConfig);
        });
    }
};

shmi.visuals.defaultClient = {
    run: function(session) {
        var login = shmi.getUiElement("login");
        if (!login) {
            console.error("entrypoint contains no login control, aborting");
            return;
        }
        var systemControlConfig = shmi.requires("visuals.session.SysControlConfig");
        var login_ctrl = shmi.createControl(systemControlConfig.startupLogin.ui || 'login', login, systemControlConfig.startupLogin, 'DIV', 'from');
        login_ctrl.enable();
    }
};

shmi.visuals.init.onDgmReady = function(login) {
    var s = shmi.requires("visuals.session");
    if (s.config && s.config.debug) {
        console.log("=== DataGridManager initialized ===");
    }

    s.isReady = true;
    shmi.fire("visuals-session-ready", { config: s.config }, s);

    if (s.config['disable-app-layer'] !== true) {
        if (typeof s.config["session-client"] !== "string") {
            s.config["session-client"] = "visuals.defaultClient";
        }
        var appClientModule = s.config["session-client"];
        shmi.requires(appClientModule).run(s);
    }
};

(function() {
    function mergeAppConfig(refs) {
        var appConfig = {},
            iterObj = shmi.requires("visuals.tools.iterate.iterateObject");
        if (refs.appCfg) {
            var tmpCfg = JSON.parse(refs.appCfg);
            iterObj(tmpCfg, function(val, prop) {
                appConfig[prop] = val;
            });
        }
        return appConfig;
    }

    function registerControls() {
        var iterObj = shmi.requires("visuals.tools.iterate.iterateObject");

        iterObj(shmi.visuals.controls, function(contr, controlName) {
            if (!contr.prototype) {
                return; //skip control-resource packages
            }
            var isContainer = (contr.prototype && contr.prototype.isContainer);
            shmi.registerControlType(contr.prototype.uiType, shmi.visuals.controls[controlName], isContainer);
        });
    }

    function initSysData(sysData) {
        var systemControlConfig = shmi.pkg("visuals.session.SysControlConfig"),
            iterObj = shmi.requires("visuals.tools.iterate.iterateObject"),
            session = shmi.requires("visuals.session"),
            locale = shmi.requires("visuals.session.locale"),
            keyboards = shmi.requires("visuals.session.keyboards"),
            defaults = shmi.requires("visuals.init.defaults"),
            defaultHandlers = defaults.HANDLER_CONFIG,
            defaultControls = defaults.CONTROLS_CONFIG;

        /* use configuration from user supplied config */
        Object.assign(systemControlConfig, sysData.controls);

        /* use system defaults for unconfigured controls */
        iterObj(defaultControls, (config, name) => {
            if (!systemControlConfig[name]) {
                systemControlConfig[name] = config;
            }
        });

        session.handlers = [];

        defaultHandlers.forEach((moduleName) => {
            if (!Array.isArray(sysData.handlers.disabled) || sysData.handlers.disabled.indexOf(moduleName) === -1) {
                try {
                    shmi.requires(moduleName).register();
                    session.handlers.push(moduleName);
                } catch (exc) {
                    console.error(`Error registering system handler '${moduleName}': ${exc.toString()}`);
                }
            }
        });

        sysData.handlers.handlers = sysData.handlers.handlers.filter(
            (moduleName) => defaultHandlers.indexOf(moduleName) === -1
        ).filter(
            (moduleName) => {
                if (!Array.isArray(sysData.handlers.disabled)) {
                    return true;
                } else {
                    return sysData.handlers.disabled.indexOf(moduleName) === -1;
                }
            }
        );

        sysData.handlers.handlers.forEach((moduleName) => {
            try {
                shmi.requires(moduleName).register();
                session.handlers.push(moduleName);
            } catch (exc) {
                console.error(`Error registering custom handler '${moduleName}': ${exc.toString()}`);
            }
        });

        iterObj(sysData.locale, function(sysCfg, sysName) {
            locale[sysName] = sysCfg;
        });

        // copy keyboard layouts into visuals.session.keyboards
        iterObj(sysData.keyboards, function(keyboardCfg, keyboardName) {
            keyboards[keyboardName] = keyboardCfg;
        });
    }

    function getControlTemplates(sysCfg) {
        var preloadUrls = [],
            iterObj = shmi.requires("visuals.tools.iterate.iterateObject");
        iterObj(sysCfg, function(ctrlCfg, ctrlName) {
            if (ctrlCfg.template) {
                preloadUrls.push(
                    shmi.c("TEMPLATE_PATH") + ctrlCfg.template + shmi.c("TEMPLATE_EXT")
                );
            }
            if (ctrlCfg['content-template']) {
                preloadUrls.push(
                    shmi.c("TEMPLATE_PATH") + ctrlCfg['content-template'] + shmi.c("TEMPLATE_EXT")
                );
            }
        });
        return preloadUrls;
    }

    /**
     * Returns an object containing the URL parameters the application was
     * opened with.
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
     * Sets up the given ConnectSession to be used as primary connection.
     *
     * @param {*} session The session object.
     * @param {*} connectSession
     */
    function setupConnectSession(session, connectSession) {
        connectSession.socket.enableEvents();

        shmi.listen("session-data-update", function(evt) {
            if (evt.detail.error) {
                shmi.notify("Error requesting host information:" + evt.detail.error.message, "${V_ERROR}");
            } else {
                session.Host = evt.detail.Host || session.Host;
                session.observerAllowed = evt.detail.observerAllowed || session.observerAllowed;
                session.project = evt.detail.project;
            }
        }, { "source": connectSession.socket });

        shmi.listen("connection-state", function(evt) {
            Object.values(session.ItemManager.items).forEach((item) => {
                if (item.name.startsWith("virtual:")) {
                    item.writable = false;
                    item.notifyLockStatus();
                } else {
                    shmi.log("[SocketConnection] keeping local item '" + item.name + "' accessible", 0);
                }
            });
        }, { "detail.established": false, "detail.connecting": false, "source": connectSession.socket });
    }

    function initSession(appConfig) {
        //function(responseText, failed, url){
        shmi.requires("visuals.core.ItemManager");
        shmi.requires("visuals.core.UserManager");
        shmi.requires("visuals.core.QueryManager");
        shmi.requires("visuals.core.AlarmManager");
        shmi.requires("visuals.core.DataGridManager");
        shmi.requires("visuals.core.RecipeManager");
        shmi.requires("visuals.core.ConnectSession");
        shmi.requires("visuals.core.EnvironmentManager");
        shmi.requires("visuals.io.SocketConnection");

        var iterObj = shmi.requires("visuals.tools.iterate.iterateObject"),
            session = shmi.visuals.session;

        /* parse project configuration */
        session.config = session.config || {};
        iterObj(appConfig, function(val, prop) {
            session.config[prop] = val;
        });

        /* override keyboard config on mobile devices */
        if (session.config.keyboard && session.config.keyboard.enabled) {
            session.config.keyboard.enabled = ![/android/i, /ipad/i, /iphone/i].some((regex) => regex.test(navigator.userAgent));
        }

        /* set logging level to 2 if unconfigured */
        shmi.def(session.config, 'loglevel', 2);
        /* set alert level to 3 if unconfigured */
        shmi.def(session.config, 'alertlevel', 3);
        /* set default item-view if none was configured */
        //shmi.def(session.config, 'initial-view', shmi.c("DEFAULT_VIEW");

        // Set websocket URL if undefined
        if (session.config['ws-url'] === undefined) {
            var enable_ssl = (window.location.href.indexOf("https") === 0);
            var host = window.location.hostname;
            var port = parseInt(window.location.port);
            if ((window.location.port === undefined) || (window.location.port === "")) {
                port = (enable_ssl) ? 443 : 80;
            }
            var url = "ws";
            if (enable_ssl) {
                url += "s";
            }
            url += "://" + host + ":" + port + window.location.pathname;
            session.config['ws-url'] = url;
        } else if (window.location.href.indexOf("https") === 0) {
            session.config['ws-url'] = session.config['ws-url'].replace('ws://', 'wss://');
        }

        /* init host version info */
        session.Host = {
            version: {
                major: 1,
                minor: 0,
                patch: 0
            }
        };

        /* create websocket connection */
        session.ConnectSession = new shmi.visuals.core.ConnectSession(session.config['ws-url']);
        session.SocketConnection = session.ConnectSession.socket;
        setupConnectSession(session, session.ConnectSession);

        /* create shortcut reference for SocketConnection.sendMessage  */
        shmi.sendMessage = session.SocketConnection.sendMessage.bind(session.SocketConnection);
        shmi.registerMsgHandler = session.ConnectSession.registerMessageHandler.bind(session.ConnectSession);
        shmi.unregisterMsgHandler = session.ConnectSession.unregisterMessageHandler.bind(session.ConnectSession);

        /* read url parameters */
        session.URLParameters = getUrlParams();

        /* create subsystem managers */
        session.ItemManager = new shmi.visuals.core.ItemManager();
        session.UserManager = new shmi.visuals.core.UserManager();
        session.QueryManager = new shmi.visuals.core.QueryManager();
        session.TrendManager = new shmi.visuals.core.TrendManager();
        session.AlarmManager = new shmi.visuals.core.AlarmManager();
        session.DataGridManager = new shmi.visuals.core.DataGridManager();
        session.RecipeManager = new shmi.visuals.core.RecipeManager();
        session.FileManager = new shmi.visuals.core.FileManager();
        session.EnvironmentManager = new shmi.visuals.core.EnvironmentManager();

        /* init observer info */
        session.observerAllowed = false;

        /* reset focussed element */
        session.FocusElement = null;

        shmi.loadResource(shmi.c("VIRTUAL_ITEMS_CONFIG_PATH"), function(data, failed, resrcUrl) {
            if (!failed) {
                shmi.visuals.init.initVItems(JSON.parse(data));
            } else {
                console.error("failed to load virtual-item config", resrcUrl);
            }
            if (session.DataGridManager.initialized) {
                shmi.visuals.init.onDgmReady();
            } else {
                var dgmTok = shmi.listen("datagrid-manager", function(evt) {
                    dgmTok.unlisten();
                    shmi.visuals.init.onDgmReady();
                });
            }
        });
    }

    function startConfig(appConfig, localeIndex) {
        // Load the locale package
        shmi.pkg("visuals.session.locale");
        shmi.pkg("visuals.session.keyboards"); // create keyboards package

        if (typeof appConfig.title === "string") {
            document.title = shmi.localize(appConfig.title);
        }

        if (!localeIndex) {
            console.log("Locale index could not be loaded!");
            window.location.reload();
        } else {
            localeIndex = JSON.parse(localeIndex);
            shmi.visuals.session.localeInfo = localeIndex;
        }

        if (appConfig['disable-app-layer'] !== true) {
            //register control types
            registerControls();

            var sysConfigUrls = {
                controls: shmi.c("SYS_CONTROLS_CONFIG_PATH"),
                handlers: shmi.c("SYS_HANDLERS_CONFIG_PATH"),
                locale: shmi.evalString(shmi.c("LOCALE_PATH_PATTERN"), { index: localeIndex.default })
            };

            // configure all Keyboard layout paths
            if (localeIndex.keyboards) {
                Object.keys(localeIndex.keyboards).forEach(function(key) {
                    var dataKey = "keyboard_" + key;
                    sysConfigUrls[dataKey] = shmi.evalString(shmi.c("KEYBOARD_PATH_PATTERN"), { index: key });
                });
            }

            shmi.multiLoad(sysConfigUrls, function(sysData) {
                sysData.controls = JSON.parse(sysData.controls);
                sysData.handlers = JSON.parse(sysData.handlers);
                sysData.locale = JSON.parse(sysData.locale);
                sysData.keyboards = sysData.keyboards || {};

                // reduce keyboards to one object, to handle more easy
                if (localeIndex.keyboards) {
                    Object.keys(localeIndex.keyboards).forEach(function(key) {
                        var dataKey = "keyboard_" + key;
                        sysData.keyboards[key] = JSON.parse(sysData[dataKey]);
                        delete sysData[dataKey];
                    });
                }

                //set sys-controls config & register sys-handlers
                initSysData(sysData);

                //preload sys-control templates & init session
                var preloadUrls = getControlTemplates(sysData.controls);

                shmi.multiLoad(preloadUrls, function() {
                    initSession(appConfig);
                });
            });
        } else {
            initSession(appConfig);
        }
    }

    /**
     * loadUnitClassConfig - load config data for unit-classes
     *
     * @param {function} onDone callback to run on completion
     */
    function loadUnitClassConfig(onDone) {
        var uc = shmi.requires("visuals.tools.unitClasses"),
            configPath = shmi.c("UNITCLASS_CONFIG_PATH");

        shmi.loadResource(configPath, function(data, failed) {
            if (!failed) {
                uc.setUnitClassConfig(data);
            } else {
                console.error("[Init] failed to load unit-class configuration:", configPath);
            }
            onDone();
        });
    }

    shmi.visuals.init.startup = function() {
        var configUrls = {
                appCfg: shmi.c("APP_CONFIG_PATH"),
                localeIndex: shmi.c("LOCALE_INDEX_PATH"),
                groupConfig: shmi.c("GROUP_CONFIG_PATH")
            },
            appConfig = null,
            ses = shmi.requires("visuals.session"),
            rl = ses.ResourceLoader,
            iterObj = shmi.requires("visuals.tools.iterate.iterateObject");

        shmi.multiLoad(configUrls, function(cfgData) {
            let groupConfig = null;
            appConfig = mergeAppConfig(cfgData);
            try {
                groupConfig = JSON.parse(cfgData.groupConfig);
            } catch (exc) {
                console.error("failed to load groups config:", exc);
            }
            if (!groupConfig) {
                groupConfig = {};
            }
            ses.groupConfig = groupConfig;
            if (appConfig['app-data']) {
                shmi.loadResource(appConfig['app-data'], function(data, failed, url) {
                    if (failed) {
                        console.error("failed to load", url);
                        return;
                    }
                    var appData = JSON.parse(data);
                    iterObj(appData, function(cacheFile, resUrl) {
                        rl.resources[resUrl] = cacheFile;
                        rl.resources[resUrl].callbacks = [];
                    });
                    loadUnitClassConfig(startConfig.bind(null, appConfig, cfgData.localeIndex));
                });
            } else {
                loadUnitClassConfig(startConfig.bind(null, appConfig, cfgData.localeIndex));
            }
        });
    };
}());

/* create ResourceLoader for session */
shmi.visuals.session.ResourceLoader = new shmi.visuals.io.ResourceLoader();

/**
 * shortcut to session ResourceLoader {@link shmi.visuals.io.ResourceLoader#loadResource}
 *
 * @function
 * @param {String} url URL for resource request
 * @param {shmi.visuals.io~resourceCallback} callback callback function for resource request
 */
shmi.loadResource = shmi.visuals.session.ResourceLoader.loadResource.bind(
    shmi.visuals.session.ResourceLoader);

/* add startup callback to window load event */
window.addEventListener('load', shmi.visuals.init.startup);

/**
 * Module to define and apply system defaults for handler- and system control configuration
 *
 * @module visuals/init/defaults
 */
(function() {
    var MODULE_NAME = "visuals.init.defaults",

        // MODULE CODE - START
        /** @lends module:visuals/init/defaults */
        module = shmi.pkg(MODULE_NAME);

    const HANDLER_CONFIG = [
            "visuals.handler.default.optionDialog", /* listens to 'optionDialog' event to handle option selection dialogs created using `shmi.optionDialog` */
            "visuals.handler.default.cofirmation", /* listens to 'confirmation' event to handle confirmations created using `shmi.confirm` */
            "visuals.handler.default.notification", /* listens to 'notification' event to handle notifications sent using `shmi.notify` */
            "visuals.handler.default.passwordExpired", /* listens to 'password-expired' event to offer change of user password */
            "visuals.handler.default.connectionFailed", /* listens to 'connection-state' event to react to loss of websocket connection */
            "visuals.handler.default.keyboard", /* listens to 'keyboard-request' event to handle overlay keyboard */
            "visuals.handler.default.logout", /* listens to 'login-state' event to check 'loggedIn' state */
            "visuals.handler.default.numpad" /* listens to 'numpad-request' event to handle numeric input */
        ],
        CONTROLS_CONFIG = {
            "notificationDialog": { /* system notification dialog - `shmi.notify` */
                "name": "notification-dialog",
                "title": "${V_NOTIFICATION}",
                "template": "default/sys-dialog/dialog-notification"
            },
            "confirmDialog": { /* system confirmation dialog - `shmi.confirm` */
                "class-name": "dialog-box confirm",
                "title": "${V_CONFIRM_TITLE}",
                "name": "visuals-confirm-dialog",
                "template": "default/sys-dialog/dialog-confirm",
                "cover-background": true
            },
            "optionDialog": { /* system option selection dialog - `shmi.optionDialog` */
                "class-name": "dialog-box option",
                "title": "${V_OPTIONDIALOG_TITLE}",
                "name": "visuals-option-dialog",
                "template": "default/sys-dialog/dialog-option",
                "cover-background": true
            },
            "askSaveDialog": { /* system three-way save dialog - `shmi.askSave` */
                "class-name": "dialog-box ask-save",
                "title": "${V_ASK_SAVE_TITLE}",
                "name": "ask-save-dialog",
                "template": "default/sys-dialog/dialog-ask-save",
                "cover-background": true
            },
            "chooseFileDialog": { /* system file selection dialog - `shmi.chooseFile` */
                "template": "default/sys-dialog/dialog-file"
            },
            "passwordExpiredDialog": { /* system password change dialog (when expired) */
                "class-name": "dialog-box password-expired",
                "name": "password-expired-dialog",
                "template": "default/sys-dialog/dialog-password-expired",
                "title": "${V_PASSWORD_EXPIRED_TITLE}",
                "cover-background": true
            },
            "startupLogin": { /* system login configuration */
                "class-name": "login",
                "template": "default/login",
                "userEntry": "<div data-ui=\"user\" class=\"user\"><div class=\"userPic\"></div><div class=\"user_detail\"><h1 data-ui=\"user-name\"><%= USER %></h1></div></div>"
            },
            "loadingOverlay": { /* system loading overlay configuration */
                "tagName": "DIV",
                "class-name": "loading-box-overlay",
                "template": null
            }
        };

    /** Default event handler configuration
     * @constant
     */
    module.HANDLER_CONFIG = HANDLER_CONFIG;

    /** Default system control configuration
     * @constant
     */
    module.CONTROLS_CONFIG = CONTROLS_CONFIG;
}());

/**
 * Assertion helpers.
 *
 * @module visuals/tools/assert
 */
(function() {
    var MODULE_NAME = "visuals.tools.assert",

        // MODULE CODE - START
        /** @lends module:visuals/tools/assert */
        module = shmi.pkg(MODULE_NAME);

    /**
     * Helper function which constructs an error message for when `checkArgs`
     * fails.
     *
     * @private
     * @param {string|number} parameterNameOrNumber Name or index of the
     *  paramter with a mismatching type.
     * @param {string[]} expectedTypes List of expected types for the
     *  parameter.
     * @param {string} givenType Given type of the parameter.
     * @returns {string} Error message.
     */
    function makeErrorString(parameterNameOrNumber, expectedTypes, givenType) {
        var message;

        if (typeof (parameterNameOrNumber) === 'number') {
            message = "Invalid type for parameter #" + String(parameterNameOrNumber) + ". ";
        } else if (typeof (parameterNameOrNumber) === 'string') {
            message = "Invalid type for parameter \"" + parameterNameOrNumber + "\". ";
        }

        message += "Expected ";
        if (expectedTypes.length > 1) {
            message += "one of [" + expectedTypes.join(", ") + "]";
        } else {
            message += expectedTypes[0];
        }
        message += " but " + givenType + " given.";

        return message;
    }

    /**
     * Returns a class/function from the given name. The name may contain a
     * path (delimited by '.') which is traversed.
     *
     * @private
     * @param {string} typename Name of the class to get.
     * @returns {function}
     */
    function resolveClassType(typename) {
        var currentNode = window;

        var found = !typename.split('.').some(function(token) {
            if (shmi.objectHasOwnProperty(currentNode, token)) {
                currentNode = currentNode[token];
                return false;
            }

            return true;
        });

        if (found && (typeof (currentNode) === 'function')) {
            return currentNode;
        }

        return null;
    }

    /**
     * Checks whether the given value is an instance of one of the given object
     * names. Names that can't be resolved are ignored.
     *
     * @private
     * @param {*} value Value to check
     * @param {string[]} types Array of types
     * @returns {boolean}
     */
    function instanceOfHelper(value, types) {
        return types.some(function(typename) {
            var classType = resolveClassType(typename);

            return classType && (value instanceof classType);
        });
    }

    /**
     * Checks whether the given value is at least one of the given types. If
     * the given value is not one of the given types, a `TypeError` exception
     * with an appropriate error text is thrown.
     *
     * @param {string|number} parameterNameOrNumber Name of the parameter or
     *  index of the parameter in the function signature.
     * @param {*} value Value of the parameter.
     * @param {...string} types Valid typename to check the given value against.
     *
     * @throws {TypeError} If one of the given types is invalid.
     * @throws {TypeError} If `parameterNameOrNumber` is invalid.
     * @throws {TypeError} If the given value is not one of the given types.
     */
    module.checkArg = shmi.checkArg = function checkArg(parameterNameOrNumber, value, types) {
        var expectedTypes = [],
            givenType = typeof (value),
            i,
            constructorName;

        // Get the variadic arguments and put them in a proper array. Since
        // we're already looping over all types, also check if the types are
        // valid and throw an exception if they're not.
        for (i = 2; i < arguments.length; ++i) {
            switch (arguments[i]) {
            case 'Object':
            case 'Array':
            case 'String':
            case 'Number':
                // Some types exist as classes but they either don't
                // get instantiated to an object or it's just easier for us
                // to check them against their lowercase version.
                expectedTypes.push(arguments[i].toLowerCase());
                break;
            default:
                expectedTypes.push(arguments[i]);
            }
        }

        // Since this is a function which should be used to catch errors,
        // sanity check our parameter(s) as well.
        if (typeof (parameterNameOrNumber) !== 'number' && typeof (parameterNameOrNumber) !== 'string') {
            throw TypeError('Invalid parameter name or parameter index');
        }

        // typeof(...) === 'object' can mean a lot of different things...
        if (givenType === 'object') {
            if (value === null) {
                // Map null to the virtual type 'null'.
                givenType = 'null';
            } else if (!value.constructor) {
                // Looks like we can't get a proper constructor for the given
                // object so default to 'object'.
                givenType = 'object';
            } else {
                // Make sure we get the correct constructor. Note that
                // anonymous functions have a constructor with an empty name
                // so we just map that to 'object'.
                constructorName = Object.getPrototypeOf(value).constructor.name || 'object';
                switch (constructorName) {
                case 'Array':
                case 'Object':
                    // Some names should be lowercase.
                    givenType = constructorName.toLowerCase();
                    break;
                default:
                    givenType = constructorName;
                }
            }
        }

        if (expectedTypes.indexOf(givenType) === -1 && expectedTypes.indexOf(typeof (value)) === -1 && !instanceOfHelper(value, expectedTypes)) {
            throw new TypeError(makeErrorString(parameterNameOrNumber, expectedTypes, givenType));
        }
    };
}());

(function() {
    var MODULE_NAME = "visuals.tools.logging";

    // MODULE CODE - START
    var logging = shmi.pkg(MODULE_NAME),
        local_fLog = getFLog(MODULE_NAME),
        LOGGERS = {},
        MIN_LOG_INDENT = 20;

    function getFLog(module_name) {
        return function() {
            var MN = "[" + module_name + "]  ";
            while (MN.length < MIN_LOG_INDENT) {
                MN += " ";
            }
            var args = [MN];
            for (var i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            console.log.apply(console, args);
            if ((LOGGERS[module_name] !== undefined) && (LOGGERS[module_name].record === true)) {
                LOGGERS[module_name].recordLog(args);
            }
        };
    }

    function getErrorLog(module_name) {
        return function() {
            var MN = "[" + module_name + "]  ";
            while (MN.length < MIN_LOG_INDENT) {
                MN += " ";
            }
            var args = [MN];
            for (var i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            console.error.apply(console, args);
            if ((LOGGERS[module_name] !== undefined) && (LOGGERS[module_name].record === true)) {
                LOGGERS[module_name].recordLog(args);
            }
        };
    }

    function getWarnLog(module_name) {
        return function() {
            var MN = "[" + module_name + "]  ";
            while (MN.length < MIN_LOG_INDENT) {
                MN += " ";
            }
            var args = [MN];
            for (var i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            console.warn.apply(console, args);
            if ((LOGGERS[module_name] !== undefined) && (LOGGERS[module_name].record === true)) {
                LOGGERS[module_name].recordLog(args);
            }
        };
    }

    function getInfoLog(module_name) {
        return function() {
            var MN = "[" + module_name + "]  ";
            while (MN.length < MIN_LOG_INDENT) {
                MN += " ";
            }
            var args = [MN];
            for (var i = 0; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
            console.info.apply(console, args);
            if ((LOGGERS[module_name] !== undefined) && (LOGGERS[module_name].record === true)) {
                LOGGERS[module_name].recordLog(args);
            }
        };
    }

    function getLog(module_name, fLog) {
        return function() {
            if (LOGGERS[module_name].active === true) {
                fLog.apply(window, arguments);
            }
        };
    }

    logging.createLogger = function(module_name, enable_log, record_log) {
        if (shmi.objectHasOwnProperty(LOGGERS, module_name)) {
            return LOGGERS[module_name];
        }

        var recorded = null;
        if (record_log === true) {
            recorded = [];
        }
        var fLog_func = getFLog(module_name),
            log_func = getLog(module_name, fLog_func);
        LOGGERS[module_name] = {
            log: log_func,
            error: getErrorLog(MODULE_NAME),
            warn: getWarnLog(MODULE_NAME),
            info: getInfoLog(MODULE_NAME),
            fLog: fLog_func,
            active: (enable_log === true),
            record: (record_log === true),
            getLog: function() {
                return recorded;
            },
            recordLog: function() {
                recorded.push(arguments[0]);
            }
        };
        return LOGGERS[module_name];
    };

    logging.getLogger = function(module_name) {
        return LOGGERS[module_name];
    };

    logging.getAllLoggers = function() {
        var io = shmi.requires('visuals.tools.iterate.iterateObject');
        var all_loggers = [];
        io(LOGGERS, function(val, name) {
            all_loggers.push(name);
        });
        return all_loggers;
    };

    logging.getActiveLoggers = function() {
        var io = shmi.requires('visuals.tools.iterate.iterateObject'),
            active_loggers = [];
        io(LOGGERS, function(val, name) {
            if (val.active === true) {
                active_loggers.push(name);
            }
        });
        return active_loggers;
    };

    logging.getRecordingLoggers = function() {
        var io = shmi.requires('visuals.tools.iterate.iterateObject'),
            recording_loggers = [];
        io(LOGGERS, function(val, name) {
            if (val.record === true) {
                recording_loggers.push(name);
            }
        });
        return recording_loggers;
    };

    logging.enableLogger = function(module_name) {
        LOGGERS[module_name].active = true;
    };

    logging.disableLogger = function(module_name) {
        LOGGERS[module_name].active = false;
    };

    // MODULE CODE - END

    local_fLog("module loaded");
})();

(function() {
    'use strict';

    var MODULE_NAME = "visuals.tools.enum",
        ENABLE_LOGGING = false,
        RECORD_LOG = false,
        logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG),
        fLog = logger.fLog,
        log = logger.log,
        module = shmi.pkg(MODULE_NAME);

    // MODULE CODE - START
    module.createEnum = function(props) {
        if (!Array.isArray(props)) {
            throw new Error("argument has to be array of strings");
        }
        var enumeration = {};
        props.forEach(function(val, idx) {
            enumeration[val] = idx;
            enumeration[idx] = val;
        });
        return enumeration;
    };

    // MODULE CODE - END

    fLog("module loaded");
}());

(function() {
    var MODULE_NAME = "visuals.tools.global-events",
        ENABLE_LOGGING = false,
        RECORD_LOG = false,
        logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG),
        fLog = logger.fLog,
        log = logger.log;

    var module = shmi.pkg(MODULE_NAME),
        s = shmi.pkg("visuals.session");

    s.Events = s.Events || {};

    function initEvent(event_name) {
        if (!s.Events) {
            log("init session events");
            s.Events = {};
        }

        if (!s.Events[event_name]) {
            log("creating event type", event_name);
            s.Events[event_name] = {};
        }
    }

    function fireFunc(event_name, data, event_source, defer = false) {
        if (event_source === undefined) {
            event_source = null;
        }
        const { iterateObject: iter } = shmi.visuals.tools.iterate,
            event_data = {
                source: event_source,
                type: event_name,
                detail: data
            };

        initEvent(event_name);

        function fireAway() {
            let fired = 0;
            /* handle global listeners */
            iter(s.Events[event_name], function(event_function) {
                if (event_function(event_data)) {
                    fired++;
                }
            });

            return fired;
        }

        function logFired(firedEventsCount) {
            if (s.config.event_debug === true) {
                fLog("[session] event", event_data, "fired [", firedEventsCount, "listeners]");
            } else {
                log("[session] event", event_data, "fired [", firedEventsCount, "listeners]");
            }
        }

        // Defer event execution
        if (defer) {
            shmi.decouple(() => logFired(fireAway()));
            return 0;
        }

        const fired = fireAway();
        logFired(fired);

        return fired; // return number of event listeners handled
    }

    /**
     * Fires a global event.
     *
     * @function
     * @param {String} event_name event type
     * @param {object} data event detail-data
     * @param {*} event_source Reference to the source of the event. This
     *  is usually a widget.
     * @param {boolean} [defer] If set to `true`, the event is fired
     *  asynchronously.
     * @returns {number}
     */
    shmi.fire = fireFunc;

    module.fire = shmi.fire;
    module.listen = shmi.listen;

    shmi.onSessionReady = function onSessionReady(handler) {
        if (s.isReady) {
            handler({
                source: s,
                type: "visuals-session-ready",
                detail: { config: s.config }
            });
        } else {
            var tmp_lid = shmi.listen('visuals-session-ready', function(evt) {
                shmi.unlisten('visuals-session-ready', tmp_lid);
                handler(evt);
            });
        }
    };

    module.onSessionReady = shmi.onSessionReady;

    fLog("module loaded");
})();

/**
 * Module to iterate over non-array structured like object-properties or NodeLists.
 *
 * @module visuals/tools/iterate
 */
(function() {
    var MODULE_NAME = "visuals.tools.iterate";

    var ENABLE_LOGGING = false,
        RECORD_LOG = false,
        logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG),
        fLog = logger.fLog, log = logger.log;

    // MODULE CODE - START
    /** @lends module:visuals/tools/iterate */
    var iterate = shmi.pkg(MODULE_NAME);

    /**
     * Iterates over NodeList objects in the same manner as Array.forEach.
     *
     * @example Iterate over NodeList
     var iterNL = shmi.requires("visuals.tools.iterate.iterateNodeList");
     var nodeList = document.body.querySelectorAll("DIV");
     iterNL(nodeList, function(node, idx) {
        console.log("working on nodelist index:", idx);
        console.log("current node is:", node);
     });
     *
     * @param {NodeList} nodeList  DOM NodeList object
     * @param {function} iterFunc iterator function
     */
    iterate.iterateNodeList = function iterateNodeList(nodeList, iterFunc) {
        for (var i = 0; i < nodeList.length; i++) {
            iterFunc(nodeList[i], i, nodeList);
        }
    };

    /**
     * Iterates over objects in the same manner as Array.forEach. Object properties will replace
     * the array index in this context.
     *
     * @example Iterate over Object Properties
     var iterObj = shmi.requires("visuals.tools.iterate.iterateObject");
     var obj = {
        prop1: "hello",
        prop2: "world",
        bool: true
     };
     iterObj(obj, function(val, prop) {
        console.log("current property:", prop);
        console.log("current value:", val);
     });
     *
     * @param {object}   obj      object to iterate over
     * @param {function} iterFunc iterator function
     */
    iterate.iterateObject = function iterateObject(obj, iterFunc) {
        Object.keys(obj || {}).forEach((key) => {
            if (shmi.objectHasOwnProperty(obj, key)) {
                iterFunc(obj[key], key, obj);
            }
        });
    };
    // MODULE CODE - END

    fLog("module loaded");
})();

/**
 * Module to generate custom controls and register them with the visuals framework.
 *
 * @module visuals/tools/control-generator
 */
(function() {
    var MODULE_NAME = "visuals.tools.control-generator",
        ENABLE_LOGGING = false,
        RECORD_LOG = false,
        logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG),
        fLog = logger.fLog,
        log = logger.log;

    // MODULE CODE - START
    /** @lends module:visuals/tools/control-generator */
    var module = shmi.pkg(MODULE_NAME);

    /**
     * creates a constructor function based on the specified control definition.
     *
     * @param   {Object}   controlDefinition control definition object
     * @returns {Function} constructor function of new control
     */
    function makeConstructor(controlDefinition) {
        /**
         *   controlDefinition := {
         *       className: {String},
         *       uiType: {String},
         *       isContainer: {Boolean},
         *       configSchema: {SchemaURI},
         *       config: {Object},
         *       vars: {Object},
         *       imports: {Object},
         *       prototypeExtensions: {Object}
         *   }
         */
        var iterObj = shmi.requires("visuals.tools.iterate.iterateObject");
        return function(element, config) {
            var self = this;

            if (!(element instanceof HTMLElement)) {
                throw new Error("base element must be instance of HTMLElement");
            }

            self.element = element;
            self.config = config;

            //parse attributes from base element
            self.parseAttributes();

            self.imports = {};
            iterObj(controlDefinition.imports, function(val, prop, obj) {
                if (typeof val === "string") {
                    self.imports[prop] = shmi.requires(val);
                } else if (typeof val === "function") {
                    self.imports[prop] = val();
                } else {
                    throw new Error("import must either be a shmi-package name or a function returning a reference");
                }
            });

            //set default config where unset
            iterObj(shmi.cloneObject(controlDefinition.config), function(val, prop, obj) {
                shmi.def(self.config, prop, val);
            });

            if (controlDefinition.isContainer === true) {
                self.controls = [];
            }

            //set instance variables
            self.vars = shmi.cloneObject(controlDefinition.vars);
            /*
            iterObj(controlDefinition.vars, function (val, prop, obj) {
                if (prop in ["initialized", "active", "locked", "config", "element", "controls",
                             "events", "imports"]) {
                    throw new Error("reserved instance variable used: " + prop);
                }
                self.vars[prop] = val;
            });
            */

            self.startup();
        };
    }

    /**
     * creates a prototype object based on the specified control definition.
     *
     * @param   {Object}   controlDefinition control definition object
     * @returns {Function} prototype object of new control
     */
    function makePrototype(controlDefinition) {
        /**
         *   controlDefinition := {
         *       className: {String},
         *       uiType: {String},
         *       isContainer: {Boolean},
         *       configSchema: {SchemaURI},
         *       config: {Object},
         *       vars: {Object},
         *       imports: {Object},
         *       prototypeExtensions: {Object}
         *   }
         */
        var iterObj = shmi.requires("visuals.tools.iterate.iterateObject"),
            proto = Object.create(shmi.visuals.core.BaseControl.prototype);

        proto.uiType = controlDefinition.uiType;
        proto.isContainer = controlDefinition.isContainer;

        //set containerProperties if control is container
        if (proto.isContainer) {
            proto.containerProperties = controlDefinition.containerProperties;
        }

        proto.events = shmi.cloneObject(shmi.visuals.core.BaseControl.prototype.events);
        //extend special event types
        if (Array.isArray(controlDefinition.events)) {
            controlDefinition.events.forEach(function(val, idx) {
                if (!(val in proto.events)) {
                    proto.events.push(val);
                } else {
                    throw new Error("event type already defined: " + val);
                }
            });
        }

        proto.getClassName = function() {
            return controlDefinition.className;
        };

        iterObj(controlDefinition.prototypeExtensions, function(val, prop, obj) {
            proto[prop] = val;
        });

        return proto;
    }

    var controlsPackage = shmi.pkg("visuals.controls");

    /**
     * Generate control prototype from control-definition object.
     *
     * See visuals control template on how to use this to create a new control.
     *
     * @example <caption>control-definition object</caption>
     * controlDefinition := {
     *      className: {String},
     *      uiType: {String},
     *      isContainer: {Boolean},
     *      configSchema: {SchemaURI},
     *      config: {Object},
     *      vars: {Object},
     *      imports: {Object},
     *      prototypeExtensions: {Object}
     * }
     *
     * @param {object} controlDefinition control definition
     */
    module.generate = function(controlDefinition) {
        controlsPackage[controlDefinition.className] = makeConstructor(controlDefinition);
        controlsPackage[controlDefinition.className].prototype = makePrototype(controlDefinition);

        shmi.registerControlType(controlDefinition.uiType, controlsPackage[controlDefinition.className],
            controlDefinition.isContainer);
    };

    // MODULE CODE - END

    fLog("module loaded");
})();

/**
 * Module to list content of host filesystem.
 *
 * @module visuals/tools/lsdir
 *
 */
(function() {
    var MODULE_NAME = "visuals.tools.lsdir",
        ENABLE_LOGGING = false,
        RECORD_LOG = false,
        logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG),
        fLog = logger.fLog,
        log = logger.log;

    /** @lends module:visuals/tools/lsdir */
    var module = shmi.pkg(MODULE_NAME);

    /**
     * List content of host filesystem directory.
     *
     * @throws {Error} throws an error when user is not logged in
     * @param {string}   dir    path relative to PD directory
     * @param {function} dir_cb callback function for response
     */
    module.ls = function ls(dir, dir_cb) {
        var request = shmi.requires("visuals.tools.connect").request;
        request("fs.ls", [ dir ], function onRequest(response, err) {
            if (err || response[0].error) {
                dir_cb(err || response[0].error, null);
            } else {
                dir_cb(0, response[0].listing);
            }
        });
    };

    shmi.lsdir = module.ls;

    fLog("module-loaded");
})();

/**
 * Module to implement client-side item processing for dynamic unit-conversion
 * and general value processing on read and write operations to items.
 *
 *
 * @module visuals/tools/item-adapter
 */
(function() {
    // -------- MODULE PREAMBLE - START --------

    var MODULE_NAME = "visuals.tools.item-adapter",
        ENABLE_LOGGING = true,
        RECORD_LOG = false,
        logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG),
        fLog = logger.fLog,
        log = logger.log,
        /** @lends module:visuals/tools/item-adapter */
        module = shmi.pkg(MODULE_NAME);

    // -------- MODULE PREAMBLE - END --------

    // -------- MODULE CODE - START --------

    /* -------- implement module functions -------- */

    var ADAPTERS = {};
    /* adapter definition storage */

    /* check if adapter is compatible with an item */
    function isTypeCompatible(item, adapter) {
        var isCompatible = false;

        adapter.itemTypes.forEach(function(itemType) {
            if (item.type === shmi.c(itemType)) {
                isCompatible = true;
            }
        });

        return isCompatible;
    }

    /**
     * Defines an item-adapter to process input before writing to an item and
     * process the value of an item on read operations.
     *
     * @param {Object} customAdapter item-adapter definition
     * @param {string} customAdapter.name name of the item-adapter
     * @param {function} customAdapter.inFunction function to process input
     *                   before storing return value in variable
     * @param {function} customAdapter.outFunction function to process value of
     *                   variable before outputting return value
     * @param {string[]} customAdapter.itemTypes array of valid item types for
     *                   the adapter
     */
    module.createAdapter = function(customAdapter) {
        /* validate input argument */
        if (typeof customAdapter.name !== "string") {
            throw new Error("adapter name has to be of type string");
        }
        if (typeof customAdapter.inFunction !== "function") {
            throw new Error("adapter inFunction has to be of type function");
        }
        if (typeof customAdapter.outFunction !== "function") {
            throw new Error("adapter outFunction has to be of type function");
        }
        if (!Array.isArray(customAdapter.itemTypes)) {
            throw new Error("adapter itemTypes has to be an array");
        }

        /* set adapter mapping */
        ADAPTERS[customAdapter.name] = customAdapter;
    };

    /**
     * Activate an item-adapter for the specified item.
     *
     * @param {string} itemName    name of item
     * @param {string} adapterName name of item-adapter
     */
    module.setAdapter = function(itemName, adapterName) {
        var im = shmi.requires("visuals.session.ItemManager"),
            item = im.getItem(itemName),
            adapter = ADAPTERS[adapterName];

        if (!item) {
            throw new Error("item '" + itemName + "' does not exist");
        }
        if (!adapter) {
            throw new Error("adapter '" + adapterName + "' does not exist");
        }
        if (!isTypeCompatible(item, adapter)) {
            throw new Error("type of item '" + item.name + "' is not compatible with adapter '" + adapter.name + "'");
        }

        item.adapter = adapter; // randomize update value to force value update to subscribers
        item._updateValue = Math.random();
        item.notifyLockStatus();
        item.notifyUpdateTargets();
    };

    /**
     * Deactivate active item-adapter for the specified item.
     *
     * @param {string} itemName name of item
     */
    module.unsetAdapter = function(itemName) {
        var im = shmi.requires("visuals.session.ItemManager"),
            item = im.getItem(itemName);

        if (!item) {
            console.error("item '" + itemName + "' does not exist");
            return;
        }

        item.adapter = null;
        item._updateValue = Math.random(); // randomize update value to force value update to subscribers
        try {
            item.notifyLockStatus();
            item.notifyUpdateTargets();
        } catch (exc) {
            console.error("exception clearing adapter:", exc);
        }
    };

    /**
     * Retrieve item adapter of specified name.
     *
     * @param   {string} adapterName name of item adapter
     * @returns {object} item adapter
     */
    module.getAdapter = function(adapterName) {
        return (ADAPTERS[adapterName] ? ADAPTERS[adapterName] : null);
    };

    /**
     * Retrieve active item adapter of specified item.
     *
     * @param   {string} itemName item name
     * @returns {object} item adapter
     */
    module.getActiveAdapter = function(itemName) {
        var im = shmi.requires("visuals.session.ItemManager"),
            item = im.getItem(itemName),
            activeAdapter = null;

        if (item && item.adapter) {
            activeAdapter = item.adapter;
        }
        return activeAdapter;
    };

    /**
     * Log all active item adapters to the console.
     *
     */
    module.listAdapters = function() {
        fLog("loaded adapters:");
        var iterObj = shmi.requires("visuals.tools.iterate.iterateObject");
        iterObj(ADAPTERS, function(adObj, adName) {
            fLog(adName, adObj.itemTypes.toString());
        });
        fLog("--------");
    };

    // -------- MODULE CODE - END --------

    fLog("module loaded");
})();

/**
 * Module to implement selection and conversion between multiple units per item.
 *
 * This module creates one virtual item to retrieve the number of configured unit-classes ('virtual:num-unitclasses') and one
 * per configured unit-class to switch between the available adapters (`'virtual:unitclass-<%= UNITCLASS_ID %>-adapter'` where
 * `UNITCLASS_ID` is a number between 1 and the total number of configured unit-classes).
 *
 * Unit-classes can be configured in json/unit-classes.json
 *
 * Copyright © 2015-2016 Smart HMI GmbH
 *
 * @module visuals/tools/unitClasses
 */
(function() {
    // -------- MODULE PREAMBLE - START --------

    var MODULE_NAME = "visuals.tools.unitClasses",
        ENABLE_LOGGING = true,
        RECORD_LOG = false,
        logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG),
        fLog = logger.fLog,
        log = logger.log,
        /** @lends module:visuals/tools/unitClasses **/
        module = shmi.pkg(MODULE_NAME);

    // -------- MODULE PREAMBLE - END --------

    // -------- MODULE CODE - START --------

    var unitClassFilename = "json/unit-classes.json",
        unitClassData = null,
        unitClassConfigJson = null,
        unitClasses = {},
        numUnitClassesItem = "virtual:num-unitclasses",
        unitClassAdapterItem = "virtual:unitclass-<%= UNITCLASS_ID %>-adapter",
        ia = shmi.requires("visuals.tools.item-adapter"),
        iterObj = shmi.requires("visuals.tools.iterate.iterateObject"),
        numAdapters = 0;

    /* adapter c&p template

    var adapter_fahrenheit = {
        name: "celciusToFahrenheit",
        inFunction: function (value) {
            return parseFloat(((value - 32) / 1.8).toFixed(3));
        },
        outFunction: function (value) {
            return parseFloat(((value * 1.8) + 32).toFixed(3));
        },
        itemTypes: ["TYPE_FLOAT", "TYPE_INT", "TYPE_STRING"]
    };

    */

    function makeAdapter(unitClassDescription) {
        return {
            name: "item-adapter" + (numAdapters++),
            unitText: unitClassDescription.unitText,
            inFunction: function(value) {
                return parseFloat(((value - unitClassDescription.offset) / unitClassDescription.factor).toFixed(3));
            },
            outFunction: function(value) {
                return parseFloat(((value * unitClassDescription.factor) + unitClassDescription.offset).toFixed(3));
            },
            itemTypes: ["TYPE_FLOAT", "TYPE_INT", "TYPE_STRING"]
        };
    }

    /* callback for loading unit-class data from json file */
    function unitClassDataLoaded(jsonData, failed) {
        if (!failed) {
            unitClassData = JSON.parse(jsonData).unitClasses;
            console.debug("loaded unit-class data from", unitClassFilename);
            //reset variables
            unitClasses = {};
            numAdapters = 0;
            processUnitClassData();
        } else {
            console.error("failed to load unit-class data from", unitClassFilename);
        }
    }

    function getUnitClassSelectionCB(unitClassDescription) {
        return function(ucItemValue) {
            console.debug("set unitclass", unitClassDescription.unitClass, "adapter to", unitClassDescription.adapters[ucItemValue].name);
            const currentAdapter = module.getSelectedAdapter(unitClassDescription.unitClass);
            if (!currentAdapter || (unitClassDescription.adapters[ucItemValue] && (currentAdapter.name !== unitClassDescription.adapters[ucItemValue].name))) {
                setUnitClassAdapter(unitClassDescription.unitClass, unitClassDescription.adapters[ucItemValue].name);
            }
        };
    }

    function setUnitClassAdapter(unitClass, adapterName) {
        const im = shmi.visuals.session.ItemManager,
            uc = unitClasses[unitClass];
        if (uc === undefined) {
            console.error("unitclass", unitClass, "is not defined");
        } else {
            const selAdapter = ia.getAdapter(adapterName);
            if (!selAdapter) {
                console.error("adapter", adapterName, "is not defined");
            } else {
                uc.selectedAdapter = selAdapter;

                iterObj(im.items, function(itemObj, itemName) {
                    if (itemObj.unitClass === unitClass) {
                        console.debug("setting item-adapter of", itemName, "to", adapterName);
                        ia.setAdapter(itemName, adapterName);
                    }
                });

                const ucItemName = shmi.evalString(unitClassAdapterItem, {
                        UNITCLASS_ID: uc.unitClass
                    }),
                    ucItem = im.getItem(ucItemName);

                if (ucItem && ucItem.initialized) {
                    im.writeValue(ucItemName, uc.adapters.indexOf(uc.selectedAdapter));
                }
            }
        }
    }

    function processUnitClassData() {
        unitClassData.forEach(function(unitClassDescription, idx) {
            if (unitClasses[unitClassDescription.unitClass] === undefined) {
                unitClasses[unitClassDescription.unitClass] = {
                    name: unitClassDescription.name ? unitClassDescription.name : null,
                    unitClass: unitClassDescription.unitClass,
                    adapters: [],
                    selectedAdapter: null
                };
            }
            var tmpAdapter = makeAdapter(unitClassDescription);
            unitClasses[unitClassDescription.unitClass].adapters.push(tmpAdapter);
            ia.createAdapter(tmpAdapter);
        });

        log("created", numAdapters, "adapters");
    }

    function setupUnitClassItems() {
        var numUnitClasses = 0;

        iterObj(unitClasses, function(ucObj, ucName) {
            if (ucObj.adapters.length > 0) {
                if (ucObj.selectedAdapter === null) {
                    ucObj.selectedAdapter = ia.getAdapter(ucObj.adapters[0].name);
                }
                setUnitClassAdapter(ucObj.unitClass, ucObj.selectedAdapter.name);
                numUnitClasses++;
            }
        });

        iterObj(unitClasses, function(ucObj, ucName) {
            var ucItemName = shmi.evalString(unitClassAdapterItem, {
                    UNITCLASS_ID: ucObj.unitClass
                }),
                initialValue = ucObj.adapters.indexOf(ucObj.selectedAdapter),
                ucItem = null;

            if (typeof initialValue !== "number" || initialValue < 0) {
                initialValue = 0;
            }
            ucItem = shmi.createVirtualItem(ucItemName, shmi.c("TYPE_INT"), 0, ucObj.adapters.length - 1, initialValue, getUnitClassSelectionCB(ucObj));
            ucItem.labelToken = ucObj.name;
        });

        var nucItem = shmi.createVirtualItem(numUnitClassesItem, shmi.c("TYPE_INT"), Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, numUnitClasses, null);
        nucItem.writable = false;
        nucItem.notifyLockStatus();
    }

    /**
     * Retrieve registered unit-classes.
     *
     * @returns {object[]} unit-class references
     */
    module.getUnitClasses = function() {
        var retArr = [];
        iterObj(unitClasses, function(ucObj) {
            retArr.push(ucObj);
        });
        return retArr;
    };

    module.getUnitClassData = function() {
        return unitClassData;
    };

    /**
     * Retrieve array of item-adapters for the specified unit-class.
     *
     * @param   {string}   ucName name of unit-class
     * @returns {object[]|null} item-adapters of unit-class or null if specified unit-class does not exist
     */
    module.getUnitClassAdapters = function(ucName) {
        return (unitClasses[ucName] !== undefined) ? unitClasses[ucName].adapters : null;
    };

    module.getSelectedAdapter = function(unitClassId) {
        if (unitClasses[unitClassId] !== undefined) {
            return unitClasses[unitClassId].selectedAdapter;
        } else {
            return null;
        }
    };

    module.setUnitClassAdapter = setUnitClassAdapter;

    module.setUnitClassConfig = function setUnitClassConfig(jsonData) {
        unitClassConfigJson = jsonData;
    };

    /* wait for app to complete parsing and load unit-class data */
    shmi.listen("visuals-session-ready", function(evt) {
        if (unitClassConfigJson) {
            unitClassDataLoaded(unitClassConfigJson, false);
        } else {
            console.error(MODULE_NAME, "unit-class configuration not loaded!");
        }
    });

    /* setup items to interact with unit-classes when app starts */
    shmi.listen("parser-ready", setupUnitClassItems);

    // -------- MODULE CODE - END --------

    fLog("module loaded");
})();

/**
 * Module to format dates and times as text-output.
 *
 * @module visuals/tools/date
 */
(function() {
    /** replace package- & module-names **/
    var MODULE_NAME = "visuals.tools.date",
        ENABLE_LOGGING = false,
        RECORD_LOG = false,
        logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG),
        fLog = logger.fLog,
        log = logger.log,
        /** @lends module:visuals/tools/date */
        module = shmi.pkg(MODULE_NAME);

    // MODULE CODE - START

    /* private module variables */
    var dateLiterals = {
        dayShort: ['${V_SUN_SHORT}', '${V_MON_SHORT}', '${V_TUE_SHORT}', '${V_WED_SHORT}', '${V_THU_SHORT}', '${V_FRI_SHORT}', '${V_SAT_SHORT}'],
        dayLong: ['${V_SUN}', '${V_MON}', '${V_TUE}', '${V_WED}', '${V_THU}', '${V_FRI}', '${V_SAT}'],
        monthShort: ['${V_JAN}', '${V_FEB}', '${V_MAR}', '${V_APR}', '${V_MAY}', '${V_JUN}', '${V_JUL}', '${V_AUG}', '${V_SEP}', '${V_OCT}', '${V_NOV}', '${V_DEC}']
    };

    /**
     * Storage helper class holding parsed date/time components.
     */
    function DateTimeBuffer() {
        this.reset();
    }

    /**
     * Resets the state of the buffer.
     */
    DateTimeBuffer.prototype.reset = function reset() {
        this.millisecond = 0;
        this.second = 0;
        this.minute = 0;
        this.hour = 0;
        this.isPM = null;

        this.day = 1;
        this.month = 0;
        this.year = 0;

        this.timestamp = null;
        this.timezone = 0;
    };

    /**
     * Generates a `Date` object from the stored date/time components.
     * Will fail if mutually exclusive date/time components are set.
     *
     * @returns {?Date} The assembled `Date` object or `null` on error.
     */
    DateTimeBuffer.prototype.assemble = function assemble() {
        if (this.isPM !== null && this.hour > 12) {
            return null;
        }

        if (this.timestamp !== null) {
            return new Date(this.timestamp - this.timezone * 60000);
        }

        var hour = (this.isPM === true ? 12 : 0) + this.hour;
        var newdate = new Date(Date.UTC(this.year, this.month, this.day, hour, this.minute - this.timezone, this.second, this.millisecond));

        return newdate;
    };

    var dateTokens = {
        // 4 digit year
        'YYYY': {
            serializeUTC: Date.prototype.getUTCFullYear,
            serialize: Date.prototype.getFullYear,
            parse: function(dtBuffer, val) {
                dtBuffer.year = Number(val);
            },
            regex: /^(\d{4})/
        },
        // 2 digit year. Values < 68 are assumed to be afer Y2K and values
        // >= 68 are assumed to be 19xx.
        'YY': {
            serializeUTC: function() {
                return this.getUTCFullYear().subsctr(-2, 2);
            },
            serialize: function() {
                return this.getFullYear().substr(-2, 2);
            },
            parse: function(dtBuffer, val) {
                dtBuffer.year = (val < 68 ? 2000 : 1900) + Number(val);
            },
            regex: /^(\d{2})/
        },
        // Accepts up to 4 digit years. All values are treated as absolute
        // years.
        'Y': {
            serializeUTC: Date.prototype.getUTCFullYear,
            serialize: Date.prototype.getFullYear,
            parse: function(dtBuffer, val) {
                dtBuffer.year = Number(val);
            },
            regex: /^(-?\d{1,4})/
        },
        // Quarter of a year
        'Q': {
            serializeUTC: function() {
                return 1 + Math.floor(this.getUTCMonth() / 3);
            },
            serialize: function() {
                return 1 + Math.floor(this.getMonth() / 3);
            },
            parse: function(dtBuffer, val) {
                dtBuffer.month = (val - 1) * 3;
            },
            regex: /^([1-4])/
        },
        // Month
        'M': {
            serializeUTC: function() {
                return this.getUTCMonth() + 1;
            },
            serialize: function() {
                return this.getMonth() + 1;
            },
            parse: function(dtBuffer, val) {
                dtBuffer.month = Number(val) - 1;
            },
            regex: /^([1][0-2]|0?[1-9])/
        },
        'MM': '$M',
        // Day of the year
        'D': {
            serializeUTC: Date.prototype.getUTCDate,
            serialize: Date.prototype.getDate,
            parse: function(dtBuffer, val) {
                dtBuffer.day = Number(val);
            },
            regex: /^([12][0-9]|3[01]|0?[1-9])/
        },
        'DD': '$D',
        'DDD': {
            serializeUTC: function() {
                return (Date.UTC(this.getUTCFullYear(), this.getUTCMonth(), this.getUTCDate()) - Date.UTC(this.getUTCFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
            },
            serialize: function() {
                return (Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()) - Date.UTC(this.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
            },
            parse: function(dtBuffer, val) {
                dtBuffer.month = 0;
                dtBuffer.day = Number(val);
            },
            regex: /^(\d{1,3})/
        },
        'DDDD': '$DDD',
        // POSIX timestamp with milliseconds as fractions.
        'X': {
            serialize: function() {
                return Math.floor(this.getTime() / 1000);
            },
            parse: function(dtBuffer, val) {
                dtBuffer.reset();
                dtBuffer.timestamp = Number(val) * 1000;
            },
            regex: /^(-?\d+(\.\d+)?)/
        },
        // POSIX timestamp in milliseconds resolution.
        'x': {
            serialize: Date.prototype.getTime,
            parse: function(dtBuffer, val) {
                dtBuffer.reset();
                dtBuffer.timestamp = Number(val);
            },
            regex: /^(-?\d+)/
        },
        // Week of the year
        'w': {
            serializeUTC: function() {
                return 1 + Math.floor((Date.UTC(this.getUTCFullYear(), this.getUTCMonth(), this.getUTCDate()) - Date.UTC(this.getUTCFullYear(), 0, 0)) / 24 / 60 / 60 / 1000 / 7);
            },
            serialize: function() {
                return 1 + Math.floor((Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()) - Date.UTC(this.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000 / 7);
            },
            parse: function(dtBuffer, val) {
                dtBuffer.month = 0;
                dtBuffer.day = Number(val) * 7;
            },
            regex: /^(\d{1,2})/
        },
        'Ww': '$w',
        'W': '$ww',
        'WW': '$ww',
        // Day of the week (starting from 0).
        // Can not be parsed.
        'e': {
            serializeUTC: Date.prototype.getUTCDay,
            serialize: Date.prototype.getDay,
            regex: /^([0-6])/
        },
        // Day of the week (starting from 1).
        // Can not be parsed.
        'E': {
            serialize: function() {
                return (6 + this.getDay()) % 7 + 1;
            },
            regex: /^([1-7])/
        },
        // Hour in 24hrs format
        'H': {
            serializeUTC: Date.prototype.getUTCHours,
            serialize: Date.prototype.getHours,
            parse: function(dtBuffer, val) {
                dtBuffer.hour = Number(val);
            },
            regex: /^(2[0-3]|[01]?[0-9])/
        },
        'HH': '$H',
        // Hour in 12hrs format
        'h': {
            serializeUTC: function() {
                return this.getUTCHours() % 12;
            },
            serialize: function() {
                return this.getHours() % 12;
            },
            parse: function(dtBuffer, val) {
                dtBuffer.hour = Number(val);
            },
            regex: /^(1[0-2]|0?[0-9])/
        },
        'hh': '$h',
        // AM/PM (upper case)
        'A': {
            serializeUTC: function() {
                return this.getUTCHours() < 12 ? 'AM' : 'PM';
            },
            serialize: function() {
                return this.getHours() < 12 ? 'AM' : 'PM';
            },
            parse: function(dtBuffer, val) {
                dtBuffer.isPM = (val === 'P');
            },
            regex: /^([AP])M/
        },
        // am/pm (lower case)
        'a': {
            serializeUTC: function() {
                return this.getUTCHours() < 12 ? 'am' : 'pm';
            },
            serialize: function() {
                return this.getHours() < 12 ? 'am' : 'pm';
            },
            parse: function(dtBuffer, val) {
                dtBuffer.isPM = (val === 'p');
            },
            regex: /^([ap])m/
        },
        // Minute
        'm': {
            serializeUTC: Date.prototype.getUTCMinutes,
            serialize: Date.prototype.getMinutes,
            parse: function(dtBuffer, val) {
                dtBuffer.minute = Number(val);
            },
            regex: /^([0-5]?[0-9])/
        },
        'mm': '$m',
        // Second
        's': {
            serializeUTC: Date.prototype.getUTCSeconds,
            serialize: Date.prototype.getSeconds,
            parse: function(dtBuffer, val) {
                dtBuffer.second = Number(val);
            },
            regex: /^([0-5]?[0-9])/
        },
        'ss': '$s',
        // Millisecond (3 digits)
        'SSS': {
            serializeUTC: Date.prototype.getUTCMilliseconds,
            serialize: Date.prototype.getMilliseconds,
            parse: function(dtBuffer, val) {
                val = String(val);
                if (val.length < 3) {
                    val += '0'.repeat(3 - val.length);
                }
                dtBuffer.millisecond = Number(val);
            },
            regex: /^(\d{1,3})/,
            trailingZero: true
        },
        // Milliseconds (2 digits)
        'SS': {
            serializeUTC: function() {
                return Math.floor(this.getUTCMilliseconds() / 10 + 0.5);
            },
            serialize: function() {
                return Math.floor(this.getMilliseconds() / 10 + 0.5);
            },
            parse: function(dtBuffer, val) {
                val = String(val);
                if (val.length < 2) {
                    val += '0'.repeat(2 - val.length);
                }
                dtBuffer.millisecond = Number(val) * 10;
            },
            regex: /^(\d{1,2})/,
            trailingZero: true
        },
        // Milliseconds (1 digit)
        'S': {
            serializeUTC: function() {
                return Math.floor(this.getUTCMilliseconds() / 100 + 0.5);
            },
            serialize: function() {
                return Math.floor(this.getMilliseconds() / 100 + 0.5);
            },
            parse: function(dtBuffer, val) {
                dtBuffer.millisecond = Number(val) * 100;
            },
            regex: /^(\d)/
        },
        // Timezone identifier. Not separated by ':'
        // E.g.: +0100 for GMT+1
        'Z': {
            serializeUTC: function() {
                return '+0000';
            },
            serialize: function() {
                var tz_h = String(Math.floor(-this.getTimezoneOffset() / 60)),
                    tz_m = String(Math.floor(-this.getTimezoneOffset() % 60));

                if (tz_h.length < 2) {
                    tz_h = '0' + tz_h;
                }

                if (tz_m.length < 2) {
                    tz_m = '0' + tz_m;
                }

                return (this.getTimezoneOffset() >= 0 ? '-' : '+') + tz_h + tz_m;
            },
            parse: function(dtBuffer, sign, hours, minutes, offset) {
                if (typeof (hours) !== 'undefined' && typeof (minutes) !== 'undefined') {
                    offset = (sign === '+' ? 1 : -1) * (Number(hours) * 60 + Number(minutes));
                }

                dtBuffer.timezone = Number(offset);
            },
            regex: /^([+-])(\d{2})[:]?(\d{2})|([+-]\d{3})/
        },
        // Timezone identifier. Separated by ':'
        // E.g.: +01:00 for GMT+1
        'ZZ': {
            serializeUTC: function() {
                return '+00:00';
            },
            serialize: function() {
                var tz_h = String(Math.floor(-this.getTimezoneOffset() / 60)),
                    tz_m = String(Math.floor(-this.getTimezoneOffset() % 60));

                if (tz_h.length < 2) {
                    tz_h = '0' + tz_h;
                }

                if (tz_m.length < 2) {
                    tz_m = '0' + tz_m;
                }

                return (this.getTimezoneOffset() >= 0 ? '-' : '+') + tz_h + ':' + tz_m;
            },
            parse: function(dtBuffer, sign, hours, minutes, offset) {
                if (typeof (hours) !== 'undefined' && typeof (minutes) !== 'undefined') {
                    offset = (sign === '+' ? 1 : -1) * (Number(hours) * 60 + Number(minutes));
                }

                dtBuffer.timezone = Number(offset);
            },
            regex: /^([+-])(\d{2})[:]?(\d{2})|([+-]\d{3})/
        },
        // Date literals
        'DAYSHORT': {
            serializeUTC: function() {
                return shmi.localize(dateLiterals.dayShort[this.getUTCDay()]);
            },
            serialize: function() {
                return shmi.localize(dateLiterals.dayShort[this.getDay()]);
            },
            leadingZero: false
        },
        'DAY': {
            serializeUTC: function() {
                return shmi.localize(dateLiterals.dayLong[this.getUTCDay()]);
            },
            serialize: function() {
                return shmi.localize(dateLiterals.dayLong[this.getDay()]);
            }
        },
        'MONTH': {
            serializeUTC: function() {
                return shmi.localize(dateLiterals.monthShort[this.getUTCMonth()]);
            },
            serialize: function() {
                return shmi.localize(dateLiterals.monthShort[this.getMonth()]);
            },
            leadingZero: false
        }
    };

    /**
     * Presets for the `formatDuration` function.
     */
    var durationPresets = Object.freeze({
        /**
         * @private
         * @example
         * 1 Days 0m 1m 2s 0ms
         */
        'verbose': {
            components: {
                'w': {
                    label: ' ${V_WEEKS}',
                    hideOnZero: true,
                    separator: ' '
                },
                'd': {
                    label: ' ${V_DAYS}',
                    hideOnZero: true,
                    separator: ' '
                },
                'h': {
                    label: 'h',
                    hideOnZero: true,
                    separator: ' '
                },
                'm': {
                    label: 'm',
                    hideOnZero: true,
                    separator: ' '
                },
                's': {
                    label: 's',
                    hideOnZero: true,
                    separator: ' '
                },
                'ms': {
                    label: 'ms',
                    hideOnZero: true,
                    separator: ' '
                }
            },
            alwaysShowSuccessive: true
        },
        /**
         * @private
         * @example
         * 2h 30m
         */
        'compact': {
            components: {
                'w': {
                    label: 'w',
                    hideOnZero: true,
                    separator: ' '
                },
                'd': {
                    label: 'd',
                    hideOnZero: true,
                    separator: ' '
                },
                'h': {
                    label: 'h',
                    hideOnZero: true,
                    separator: ' '
                },
                'm': {
                    label: 'm',
                    hideOnZero: true,
                    separator: ' '
                },
                's': {
                    label: 's',
                    hideOnZero: true,
                    separator: ' '
                },
                'ms': {
                    label: 'ms',
                    hideOnZero: true,
                    separator: ' '
                }
            },
            alwaysShowSuccessive: false
        },
        /**
         * @private
         * @example
         * 69d 10:41:40
         */
        'minimal': {
            components: {
                'w': {
                    label: 'w',
                    hideOnZero: true,
                    separator: ' '
                },
                'd': {
                    label: 'd',
                    hideOnZero: true,
                    separator: ' '
                },
                'h': {
                    separator: ':',
                    padding: {
                        char: '0',
                        minLength: 2
                    }
                },
                'm': {
                    separator: ':',
                    padding: {
                        char: '0',
                        minLength: 2
                    }
                },
                's': {
                    separator: '.',
                    padding: {
                        char: '0',
                        minLength: 2
                    }
                },
                'ms': {
                    hideOnZero: true,
                    padding: {
                        char: '0',
                        minLength: 3
                    }
                }
            }
        }
    });

    /**
     * Returns a handler object for the given control sequence.
     *
     * @param {string} sequence The control sequence to get a handler for.
     * @returns {?object} The handler object or `null` if no handler for the
     *  given control sequence exists.
     */
    function getControlSequenceHandler(sequence) {
        return dateTokens[sequence] || null;
    }

    /**
     * Extracts a single control sequence from a token.
     *
     * Control sequences have one of the two formats: `$DAY` or `${DAY}`
     *
     * @param {string} token Token to get the sequence from.
     * @returns {?string} Substring of the token describing the control
     *  sequence or `null` if the token has an invalid format or the control
     *  sequence is unknown.
     */
    function getSequenceFromToken(token) {
        if (token.charAt(0) !== '$') {
            return null;
        }

        var sequence = token.substr(1);

        if (sequence.charAt(0) === '{' && sequence.charAt(sequence.length - 1) === '}') {
            sequence = sequence.substr(1, sequence.length - 1);
        }

        if (getControlSequenceHandler(sequence) === null) {
            return null;
        }

        return sequence;
    }

    /**
     * Outputs a formatted string for the given date and single control
     * sequence. If the control sequence does not exist, the sequence is
     * returned without modification.
     *
     * @throws {Error} The control sequence configuration contains an invalid
     *  element.
     *
     * @param {Date} time The date to use for formatting.
     * @param {string} sequence The control sequence.
     * @param {boolean} [utc] Whether or not to use UTC time for output.
     * @return {string}
     */
    function formatWithControlSequence(time, sequence, utc) {
        var handler = getControlSequenceHandler(sequence),
            trailingZero = false,
            leadingZero = true,
            out;

        if (handler === null) {
            return null;
        } else if (typeof (handler) === 'string') {
            if (sequence === handler) {
                throw new Error('Control sequence references to itself');
            }

            out = module.formatDateTime(time, { datestring: handler, utc: utc, localize: false });
        } else if (typeof (handler) === 'object') {
            out = String((utc ? handler.serializeUTC : handler.serialize).call(time));
            if (typeof handler.trailingZero !== 'undefined') {
                trailingZero = handler.trailingZero;
            }
            if (typeof handler.leadingZero !== 'undefined') {
                leadingZero = handler.leadingZero;
            }
        } else {
            throw new Error('Invalid handler for date format control sequence');
        }

        if (trailingZero && leadingZero) {
            throw new Error('Both leadingZero and trailingZero set - unsupported!');
        }

        if (sequence.length > out.length) {
            if (trailingZero) {
                out = out + '0'.repeat(sequence.length - out.length);
            } else if (leadingZero) {
                out = '0'.repeat(sequence.length - out.length) + out;
            }
        }

        return out;
    }

    /**
     * Parses a (sub-)string using a single control sequence. The parser
     * attempts to start from the beginning of the input string.
     *
     * @throws {Error} The control sequence configuration contains an invalid
     *  element.
     *
     * @param {DateTimeBuffer} dtBuffer Buffer to store parsed date/time
     *  components in.
     * @param {string} str The string to parse.
     * @param {string} sequence The control sequence.
     * @return {number} Number of characters consumed from the input string or
     *  -1 on error.
     */
    function parseControlSequence(dtBuffer, str, sequence) {
        var handler = getControlSequenceHandler(sequence),
            matches;

        if (handler === null) {
            return -1;
        } else if (typeof (handler) === 'string') {
            if (sequence === handler) {
                throw new Error('Control sequence references to itself');
            }

            return parseTimeHelper(dtBuffer, str, handler);
        } else if (typeof (handler) === 'object') {
            if (!handler.parse) {
                return -1;
            }
            matches = str.match(handler.regex);
            if (!matches) {
                return -1;
            }

            var args = matches.slice(1);
            args.unshift(dtBuffer);
            handler.parse.apply(null, args);
            return matches[0].length;
        } else {
            throw new Error('Invalid handler for date format control sequence');
        }
    }

    /**
     * Returns a formatted string for the given timestamp.
     *
     * @example <caption>Get a formatted string from unix-timestamp</caption>
var dt = shmi.requires("visuals.tools.date"),
    options = {
        utc: false,
        datestring: "$DAY $D. $MONTH $YYYY $HH:$mm:$ss"
    };
console.log("DATE:", dt.formatDateTime(Date.now()/1000, options));
     * @param {Date|number} time Date to format. May be a POSIX timestamp
     *  in seconds.
     * @param {module:visuals/tools/date~timeOption|module:visuals/tools/date~datetimeFormatString} options
     *  Formatting options. Alternatively, the format string can be provided.
     * @return {string} Formatted date.
     */
    module.formatDateTime = function formatDateTime(time, options) {
        var formatData,
            out;

        if (typeof (options) === 'string') {
            options = {
                datestring: options
            };
        } else if (typeof (options) === 'undefined') {
            options = {};
        } else if (typeof (options) !== 'object') {
            throw new TypeError('Invalid options provided');
        }

        if (!shmi.objectHasOwnProperty(options, "datestring")) {
            options.datestring = shmi.localize("${V_DATEFORMAT}");
        }

        if (!shmi.objectHasOwnProperty(options, "utc")) {
            options.utc = false;
        }

        if (!shmi.objectHasOwnProperty(options, "localize")) {
            options.localize = true;
        }

        if (typeof (time) === 'number') {
            time = new Date(time * 1000);
        }

        formatData = options.datestring.split(/(\$[a-zA-Z0-9]+|\${[a-zA-Z0-9]+})/);
        out = formatData.map(function handleFormatToken(token) {
            var sequence = getSequenceFromToken(token);
            if (sequence !== null) {
                return formatWithControlSequence(time, sequence, options.utc);
            }

            return token;
        }).join('');

        return options.localize ? shmi.localize(out) : out;
    };

    /**
     * Helper function containing most parsing logic. Is called recursively
     * via `parseControlSequence`.
     *
     * @param {DateTimeBuffer} dtBuffer Buffer where parsed date/time
     *  components are stored.
     * @param {string} str String to parse.
     * @param {module:visuals/tools/date~datetimeFormatString} formatStr
     *  Format string.
     * @return {number} Number of characters consumed from the input string or
     *  -1 on error.
     */
    function parseTimeHelper(dtBuffer, str, formatStr) {
        var formatData = formatStr.split(/(\$[a-zA-Z0-9]+|\${[a-zA-Z0-9]+})/),
            numParsed,
            numParsedTotal = 0,
            success;

        success = formatData.every(function handleFormatToken(token) {
            var sequence = getSequenceFromToken(token);
            if (sequence !== null) {
                numParsed = parseControlSequence(dtBuffer, str, sequence);
                if (numParsed > 0) {
                    str = str.substr(numParsed);
                    numParsedTotal += numParsed;

                    return true;
                }
            } else if (str.indexOf(token) === 0) {
                str = str.substr(token.length);
                numParsedTotal += token.length;

                return true;
            }

            return false;
        });

        return success ? numParsedTotal : -1;
    }

    /**
     * Parses a `Date` from a given string according to a format string.
     *
     * @param {string} str String to parse.
     * @param {module:visuals/tools/date~datetimeFormatString} formatStr
     *  Format string.
     * @returns {?Date} `Date` object representing the given string or `null`
     *  on error.
     */
    module.parseDateTime = function parseDateTime(str, formatStr) {
        var dtBuffer = new DateTimeBuffer,
            numParsed = parseTimeHelper(dtBuffer, str, formatStr);

        if (str.length !== numParsed) {
            return null;
        }

        return dtBuffer.assemble();
    };

    /**
     * Returns preset options for the `formatDuration` function registered
     * under the given name.
     *
     * @param {string} presetName Name of the preset
     * @returns {?object} Options for `formatDuration` or `null` if no preset
     *  with the given name exists.
     */
    module.getDurationPreset = function getDurationPreset(presetName) {
        return durationPresets[presetName] || null;
    };

    /**
     * Returns a formatted string for the given number of milliseconds.
     *
     * @example <caption>Get a formatted string from duration</caption>
var dt = shmi.requires("visuals.tools.date");
console.log("DURATION:", dt.formatDateTime(3661000, "compact")); // Output: 1h 1m 1s
     *
     * @param {number} duration Number of milliseconds representing the
     *  duration.
     * @param {module:visuals/tools/date~durationOption|string} [options]
     *  Options to use for formatting the duration. Can either be an object or
     *  a string. If a string is given, the function will attempt to find a
     *  preset with the corresponding name. If no such preset exists, it will
     *  be used as format string instead. In this case the call is equivalent
     *  to `formatTime(duration, options, true)`.
     * @returns {string} Formatted duration.
     */
    module.formatDuration = function formatDuration(duration, options) {
        // Make sure that our duration is positive and does not have any
        // decimals. This makes our life a LOT easier.
        duration = Math.floor(duration < 0 ? -duration : duration);

        // Components (days, hours, etc...) with their divisors. This is an
        // array because we need to preserve the order in which components are
        // serialized. Values are computed later so we can properly handle
        // cases where certain components are disabled by their configuration.
        // Example: no days.
        var components = [
            { type: 'w', div: 604800000 },
            { type: 'd', div: 86400000 },
            { type: 'h', div: 3600000 },
            { type: 'm', div: 60000 },
            { type: 's', div: 1000 },
            { type: 'ms', div: 1 }
        ];

        // If `options` is a string we treat it as either name of a preset
        // or as format string. Otherwise treat it as options object and fill
        // in the gaps.
        if (typeof (options) === 'string') {
            var opts = module.getDurationPreset(options);
            if (opts === null) {
                return module.formatDateTime(duration, options, true, true);
            }

            options = opts;
        } else {
            var defaultOpts = module.getDurationPreset('compact');
            options = options || {};
            Object.keys(defaultOpts).forEach(function(key) {
                if (typeof options[key] === "undefined") {
                    options[key] = defaultOpts[key];
                }
            });
        }

        var out = '';
        var nextSeparator = null;
        var foundNonZero = false;
        var localize = !shmi.objectHasOwnProperty(options, "localize") || options.localize;

        // Process each component
        components.forEach(function processComponent(compData) {
            // Skip components without configuration.
            if (!shmi.objectHasOwnProperty(options.components, compData.type)) {
                return;
            }

            var opt = options.components[compData.type],
                value = Math.floor(duration / compData.div),
                token = String(value);

            // Component has explicitly been disabled.
            if (!opt) {
                return;
            }

            duration -= value * compData.div;

            // Check if we have to skip serializing.
            var isHidden = value <= 0 && opt.hideOnZero;
            isHidden = isHidden && (!foundNonZero || !options.alwaysShowSuccessive);

            if (isHidden) {
                return;
            }

            // Pad the token if neccessary.
            if (opt.padding && token.length < opt.padding.minLength) {
                token = opt.padding.char.repeat(opt.padding.minLength - token.length) + token;
            }

            // If there's a separator, append it now.
            if (nextSeparator !== null) {
                out += nextSeparator;
            }

            // Append token and label.
            out += token;
            if (opt.label) {
                out += opt.label;
            }

            // Prepare for next iteration.
            nextSeparator = opt.separator || null;
            foundNonZero = foundNonZero || compData.value > 0;
        });

        // Done :)
        return localize ? shmi.localize(out) : out;
    };

    // MODULE CODE - END

    fLog("module loaded");
})();

/**
 * @typedef module:visuals/tools/date~durationOption.component
 * @type {object}
 * @property {?string} [label] Label appended to the components value. May be
 *  `null` or left out if no label is desired.
 * @property {boolean} [hideOnZero] Whether or not to output the components
 *  value if it is 0. Defaults to `false`.
 * @property {?string} [separator] What seperator to use between this component
 *  and the next one. Does not have any effect if this is the last component or
 *  all following components are hidden.
 * @property {object} [padding] What padding to use (if any).
 * @property {string} padding.char Padding character. Must be exactly one
 *  character.
 * @property {number} padding.minLength Minimum length the components string
 *  representation has to have. If the string is shorter than this value,
 *  padding characters are preprended until the minimum length is reached.
 */

/**
 * @typedef module:visuals/tools/date~durationOption
 * @type {object}
 * @property {Object.<string,module:visuals/tools/date~durationOption.component>} [components]
 *  Component configuration. Each key-, value-pair represents a components name
 *  (key: d, h, m, s, ms) and its configuration.
 * @property {boolean} [alwaysShowSuccessive] On `true`, overrides the
 *  `hideOnZero` option of components that follow any component with non-zero
 *  value.
 * @property {boolean} localize Whether or not to localize the output string.
 *  Defaults to `true`.
 */

/**
 * @typedef module:visuals/tools/date~timeOption
 * @type {object}
 * @property {module:visuals/tools/date~datetimeFormatString} [datestring]
 *  String used to format the given date. Defaults to the localized value of
 *  `${V_DATEFORMAT}`.
 * @property {boolean} [utc] Whether or not to use UTC time for output.
 * @property {boolean} [localize] Whether or not to localize the output string.
 */

/**
 * Can be any string. Each sequence starts with either a `$` or is inside of
 * `${...}`.
 * Example: `Welcome to the year ${YYYY}!`
 *
 * | sequence          | output                                                       | regex                                   | Example       | parsable |
 * |-------------------|--------------------------------------------------------------|-----------------------------------------|---------------|----------|
 * | `YYYY`            | 4 digit year                                                 | `[0-9]{4}`                              | 2019          | YES      |
 * | `YY`              | 2 digit year                                                 | `[0-9]{2}`                              | 19            | Values < 68 are assumed to be after Year 2000, Values >= 68 are assumed to be after 1900 |
 * | `Y`               | up to 4 digit year                                           | `-?[0-9]{1,4}`                          | 2019          | YES      |
 * | `Q`               | Quarter of a year                                            | `[1-4]`                                 | 2             | Month is set to the first month of the quarter |
 * | `M` `MM`          | Month                                                        | `[1][0-2]|0?[1-9]`                      | 3             | YES      |
 * | `D` `DD`          | Day of the month                                             | `[12][0-9]|3[01]|0?[1-9]`               | 29            | YES      |
 * | `DDD` `DDDD`      | Day of the year                                              | `[0-9]{1,3}`                            | 364           | YES      |
 * | `X`               | POSIX timestamp with milliseconds as decimals                | `-?[0-9]+(\.[0-9]+)?`                   | 1559139023    | YES      |
 * | `x`               | POSIX timestamp in milliseconds resolution                   | `-?[0-9]+`                              | 1559139023000 | YES      |
 * | `ww` `WW` `w` `W` | Week of the year                                             | `[0-9]{1,2}`                            | 2             | Day is set to first day of the week |
 * | `e`               | Day of the week from 0 to 6. 0 is sunday                     | `[0-6]`                                 | 1             | NO       |
 * | `E`               | Day of the week from 1 to 7. 1 is monday                     | `[1-7]`                                 | 1             | NO       |
 * | `H` `HH`          | Hour in 24hrs format                                         | `2[0-3]|[01]?[0-9]`                     | 23            | YES      |
 * | `h` `hh`          | Hour in 12hrs format. Use with `A` or `a`.                   | `1[0-2]|0?[0-9]`                        | 11            | YES      |
 * | `A`               | AM or PM                                                     | `[AP]M`                                 | PM            | YES if *not* used with `H` or `HH` |
 * | `a`               | am or pm                                                     | `[ap]m`                                 | pm            | YES if *not* used with `H` or `HH` |
 * | `m` `mm`          | Minute                                                       | `[0-5]?[0-9]`                           | 55            | YES      |
 * | `s` `ss`          | Second                                                       | `[0-5]?[0-9]`                           | 41            | YES      |
 * | `SSS`             | Milliseconds (3 digits)                                      | `[0-9]{1,3}`                            | 123           | YES      |
 * | `SS`              | Milliseconds (2 digits)                                      | `[0-9]{1,2}`                            | 12            | YES      |
 * | `S`               | Milliseconds (1 digit)                                       | `[0-9]`                                 | 1             | YES      |
 * | `Z`               | Timezone identifier                                          | `[+-][0-9]{2}[:]?[0-9]{2}|[+-][0-9]{3}` | +0200         | YES, also parses 3 digit representation |
 * | `ZZ`              | Timezone identifier with hours and minutes seperated by `:`. | `[+-][0-9]{2}[:]?[0-9]{2}|[+-][0-9]{3}` | +02:00        | YES, also parses 3 digit representation |
 *
 * @typedef module:visuals/tools/date~datetimeFormatString
 * @type {string}
 */

(function() {
    'use strict';

    /** replace package- & module-names **/
    var MODULE_NAME = "visuals.tools.numericValues",
        ENABLE_LOGGING = false,
        RECORD_LOG = false,
        logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG),
        fLog = logger.fLog,
        log = logger.log,
        module = shmi.pkg(MODULE_NAME);

    // MODULE CODE - START

    /* private module variables */

    /* private module functions */
    function applyMinMax(value, settings) {
        if (settings.min === 0 && settings.max === 0) {
            return value;
        }
        if (settings.max !== null && !isNaN(settings.max) && value > settings.max) {
            return settings.max;
        }
        if (settings.min !== null && !isNaN(settings.min) && value < settings.min) {
            return settings.min;
        }
        return value;
    }

    function applyStep(value, settings) {
        if (settings.step > 0) {
            value = Math.round(value / settings.step) * settings.step;
        }
        return value;
    }

    /* public module functions */

    module.applyInputSettings = function(inputValue, self) {
        var retValue = parseFloat(inputValue),
            activeSettings = (self.vars && self.vars.valueSettings) ? self.vars.valueSettings : self.config;

        if (activeSettings['decimal-delimiter']) {
            retValue = parseFloat(String(inputValue).replace(shmi.localize(activeSettings['decimal-delimiter']), "."));
        }

        if (!isNaN(retValue)) {
            retValue = applyMinMax(retValue, activeSettings);
            retValue = applyStep(retValue, activeSettings);
        } else {
            retValue = Number.NaN;
        }

        return retValue;
    };

    function isNumeric(type) {
        switch (parseInt(type)) {
        case shmi.c("TYPE_STRING"):
            return false;
        case shmi.c("TYPE_BOOL"):
        case shmi.c("TYPE_INT"):
        case shmi.c("TYPE_FLOAT"):
            return true;
        default:
            if (shmi.visuals.session.config.debug) {
                console.error("unknown type:", type);
            }
            break;
        }
        return false;
    }

    /**
     * Function to retrieve active text settings based on control configuration and dynamic
     * configuration information.
     *
     * @param   {object} controlConfig active control configuration
     * @param   {object} dynConfig     dynamic configuration information
     * @returns {object} active text settings
     */
    module.getTextSettings = function(controlConfig, dynConfig) {
        var label, unitText;

        label = controlConfig['auto-label'] ? dynConfig.label : controlConfig.label;
        unitText = controlConfig['auto-unit-text'] ? dynConfig['unit-text'] : controlConfig['unit-text'];

        return {
            label: label,
            unitText: unitText
        };
    };

    function isSet(value) {
        return ((value !== null) && (value !== undefined));
    }

    /**
     * Evaluates a `auto-*` value to a boolean value.
     *
     * Any value that evaluates to `true` and `undefined` is evaluated to
     * `true`. Any other value is evaluated to `false`. This is to avoid having
     * to set `auto-*` settings for widgets that don't need them except for
     * when using this utility.
     *
     * @param {any} value Value to evaluate.
     * @returns {boolean}
     */
    function isAutoEnabled(value) {
        return value === undefined || !!value;
    }

    /**
     * Function to retrieve active numeric value settings based on control configuration and dynamic
     * configuration information.
     *
     * @param   {object} controlConfig active control configuration
     * @param   {object} dynConfig     dynamic configuration information
     * @returns {object} active value settings
     */
    module.getValueSettings = function(controlConfig, dynConfig) {
        return {
            "min": (isAutoEnabled(controlConfig['auto-min']) && isSet(dynConfig.min)) ? dynConfig.min : controlConfig.min,
            "max": (isAutoEnabled(controlConfig['auto-max']) && isSet(dynConfig.max)) ? dynConfig.max : controlConfig.max,
            "step": (isAutoEnabled(controlConfig['auto-step']) && isSet(dynConfig.step)) ? dynConfig.step : controlConfig.step,
            "precision": (isAutoEnabled(controlConfig['auto-precision']) && isSet(dynConfig.precision)) ? dynConfig.precision : controlConfig.precision,
            "type": (isAutoEnabled(controlConfig['auto-type']) && isSet(dynConfig.type)) ? dynConfig.type : controlConfig.type,
            "decimal-delimiter": controlConfig['decimal-delimiter'] ? shmi.localize(controlConfig['decimal-delimiter']) : "."
        };
    };

    //onSetProperties : function (min, max, step, name, type, warnMin, warnMax, prewarnMin, prewarnMax, precision)

    module.setProperties = function(self, args) {
        self.vars = self.vars || {};
        self.vars.valueSettings = module.getValueSettings(self.config, {
            min: args[0],
            max: args[1],
            step: args[2],
            precision: args[9],
            type: args[4]
        });
    };

    module.initValueSettings = function(self) {
        self.vars = self.vars || {};
        self.vars.valueSettings = module.getValueSettings(self.config, {});
    };

    function isOptionSet(options, optionName) {
        return shmi.objectHasOwnProperty(options, optionName) && options[optionName] !== null && typeof options[optionName] !== "undefined";
    }

    /**
     * Treats the input value as numeric and formats it based on the given
     * configuration. If the input value is not numeric, it is returned as
     * is.
     *
     * @param {*} value Value to apply formatting to.
     * @param {object} options Formatting options.
     */
    module.formatNumber = function(value, options) {
        var uc = shmi.requires('visuals.tools.unitClasses'),
            ucAdapter,
            fValue = parseFloat(value);

        if (isNaN(fValue) || !options) {
            return value;
        }

        if (isOptionSet(options, 'unit')) {
            ucAdapter = uc.getSelectedAdapter(options.unit);
            if (ucAdapter) {
                fValue = ucAdapter.outFunction(fValue);
            }
        } else if (isOptionSet(options, 'unit-scale')) {
            fValue *= options['unit-scale'];
        }

        if (isOptionSet(options, 'precision') && options['precision'] >= 0) {
            fValue = fValue.toFixed(options['precision']);
        }

        if (isOptionSet(options, 'decimal-delimiter')) {
            fValue = String(fValue).split(".").join(shmi.localize(options['decimal-delimiter']));
        }

        if (isOptionSet(options, 'unit')) {
            if (ucAdapter) {
                if (isOptionSet(options, 'show-unit')) {
                    if (options['show-unit'] === true) {
                        fValue = String(fValue) + ' ' + ucAdapter.unitText;
                    } else {
                        fValue = String(fValue);
                    }
                } else {
                    fValue = String(fValue) + ' ' + ucAdapter.unitText;
                }
            } else if (typeof options.unit === 'string' && options.unit !== '') {
                if (isOptionSet(options, 'show-unit')) {
                    if (options['show-unit'] === true) {
                        fValue = String(fValue) + ' ' + options.unit;
                    } else {
                        fValue = String(fValue);
                    }
                } else {
                    fValue = String(fValue) + ' ' + options.unit;
                }
            }
        }

        return fValue;
    };

    /**
     * Function to format numeric values based on active configuration settings.
     *
     * @author Felix Walter <walter@smart-hmi.de>
     * @param   {number} value          input value
     * @param   {object} self reference to control instance
     * @returns {string} formatted output
     */
    module.formatOutput = function(value, self) {
        var activeSettings = (self.vars && self.vars.valueSettings) ? self.vars.valueSettings : self.config;

        if ((typeof activeSettings === 'object') && (activeSettings !== null) && isNumeric(activeSettings.type)) {
            return module.formatNumber(value, {
                'unit-scale': activeSettings['unit-scale'],
                'precision': activeSettings['precision'],
                'decimal-delimiter': activeSettings['decimal-delimiter']
            });
        }

        return value;
    };

    // MODULE CODE - END

    fLog("module loaded");
}());

(function() {
    var MODULE_NAME = "visuals.task";

    var ENABLE_LOGGING = false,
        RECORD_LOG = false,
        logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG),
        fLog = logger.fLog, log = logger.log;

    //// MODULE CODE
    /**
     * Module to work with asynchronous tasks and tasklists.
     *
     * @module visuals/task
     */

    /** @lends module:visuals/task */
    var module = shmi.pkg(MODULE_NAME);

    //tasks starten und status überwachen, bis diese abgeschlossen sind

    //define state constants
    module.TASK_READY = 0;
    module.TASK_RUNNING = 1;
    module.TASK_COMPLETE = 2;
    module.TASK_FAILED = 3;
    module.TASK_STATES = [module.TASK_READY, module.TASK_RUNNING, module.TASK_COMPLETE, module.TASK_FAILED];

    var TASKS = {},
        TASK_LISTS = {};

    shmi.onSessionReady(function() {
        if (shmi.visuals.session.config.debug) {
            log("debug functions registered");
            module.getTasks = function() {
                return TASKS;
            };
            module.getTasklists = function() {
                return TASK_LISTS;
            };
        }
    });

    var _str = shmi.evalString;

    function defaultRun() {
        throw new Error("run function was not set.");
    }

    function getDefaultOnComplete(task_list_id) {
        return function() {
            log(_str("Tasklist <%= TASKLIST_ID %> complete", { TASKLIST_ID: task_list_id }));
        };
    }

    function getCheckListComplete(tasklist_ref, t_evt, evt_lid) {
        var complete = 0;
        if (tasklist_ref.tasks.indexOf(t_evt.source) !== -1) {
            tasklist_ref.tasks.forEach(function(tsk) {
                if (tsk.isComplete()) {
                    complete++;
                }
            });
            tasklist_ref.completed = complete;
            if (t_evt.detail.state > module.TASK_RUNNING) {
                shmi.fire('tasklist-progress', {
                    completed: tasklist_ref.completed,
                    length: tasklist_ref.length,
                    task: t_evt.source,
                    id: tasklist_ref.id
                }, tasklist_ref);
            }
            if (complete === tasklist_ref.tasks.length) {
                log(_str("unlisten 'task-change' listener ID: <%= L_ID %>", { L_ID: evt_lid }));
                shmi.unlisten('task-change', evt_lid);

                tasklist_ref.onComplete(tasklist_ref);
                module.removeTaskList(tasklist_ref.id);
            }
        } else {
            log("TASK NOT IN ACTIVE TASKLIST", t_evt.source);
        }
    }

    /**
     * Create a runnable task object of the specified name.
     *
     * After creating a task, its run method has to be set before it can be run. The run
     * method has to call the tasks complete or fail functions on completion. A task may
     * perform asynchronous actions before calling either complete or fail.
     *
     * @example
     var taskModule = shmi.requires('visuals.task');
     var t = taskModule.createTask("test-task");
     t.run = function() {
            var failed = false;
            //do some synchronous or asynchronous work
            if(failed) {
                t.fail();
            } else {
                t.complete();
            }
        }

     * @param {String} name name of task
     * @returns {Task}
     */
    module.createTask = function(name) {
        var task_id = 0;
        while (TASKS[task_id] !== undefined) {
            task_id++;
        }
        var run_func = defaultRun,
            task_state = module.TASK_READY;
        var task_ref = {
            get state() {
                return task_state;
            },
            set state(val) {
                if (module.TASK_STATES.indexOf(val) === -1) {
                    throw new Error(_str("invalid state set: <%= TASK_STATE %>", { TASK_STATE: val }));
                }
                task_state = val;
                shmi.fire('task-change', {
                    id: task_ref.id,
                    state: task_state
                }, task_ref);
            },
            isRunning: function() {
                return (task_ref.state === module.TASK_RUNNING);
            },
            get run() {
                return function() {
                    if (task_ref.state > module.TASK_READY) {
                        throw new Error(_str("task <%= TASK_ID %> was already started.", { TASK_ID: task_ref.id }));
                    }
                    task_ref.state = module.TASK_RUNNING;
                    run_func();
                };
            },
            set run(val) {
                run_func = val;
            },
            complete: function() {
                task_ref.state = module.TASK_COMPLETE;
                module.removeTask(task_ref.id);
            },
            isComplete: function() {
                return (task_ref.state > module.TASK_RUNNING);
            },
            fail: function() {
                task_ref.state = module.TASK_FAILED;
                module.removeTask(task_ref.id);
            },
            isFailed: function() {
                return (task_ref.state > module.TASK_COMPLETE);
            },
            id: task_id,
            name: (name === undefined) ? null : name
        };
        TASKS[task_id] = task_ref;

        return task_ref;
    };

    module.removeTask = function(task_id) {
        if (TASKS[task_id] === undefined) {
            throw new Error(_str("task id '<%= TASK_ID %>' is undefined", { TASK_ID: task_id }));
        }
        delete TASKS[task_id];
    };

    /**
     * Create a tasklist object with the specified array of tasks.
     *
     * When creating a serialized tasklist, the execution of tasks is stopped when one
     * task fails.
     *
     * @example
     //this example loads an array of files, creating a task for each one
     var taskModule = shmi.requires("visuals.task");
     var tasks = [];
     var data = [];  //array to hold retrieved data
     var files = [ "json/locale_02.json", "json/locale_12.json", "json/locale_22.json" ];   //source files

     //create task for each file
     files.map(function(fname, idx) {
            var t = taskModule.createTask(fname);
            t.run = function() {
                shmi.loadResource(files[idx], function(fData, fFailed) {
                    if(fFailed) {
                        data.push("null");
                        t.fail();
                    } else {
                        data.push(fData);
                        t.complete();
                    }
                });
            }
            tasks.push(t);
        });

     //create serialized tasklist
     var taskList = taskModule.createTaskList(tasks, true);

     //set onComplete callback to run on completion
     taskList.onComplete = function(tl) {
            var failed = 0;
            tl.tasks.map(function(tsk){
                if(tsk.state === taskModule.TASK_FAILED) {
                    failed++;
                }
            });
            console.log(failed, "tasks failed");
            console.log("data loaded:\n", data.join("\n"));
        };
     taskList.run();

     * @param {Task[]} tasklist
     * @param {Boolean} [serialize] true when tasks should be serialized, false else (default: false)
     * @param {Integer} [numberOfConcurrentlyRunningTasks] number of concurrent tasks when not `serialized` (> 0).
     * @returns {TaskList}
     */
    module.createTaskList = function(tasklist, serialize, numberOfConcurrentlyRunningTasks) {
        var task_list_id = 0;
        while (TASK_LISTS[task_list_id] !== undefined) {
            task_list_id++;
        }

        tasklist = tasklist || [];
        var complete_func = getDefaultOnComplete(task_list_id);

        var tasklist_ref = {
            tasks: tasklist,
            serialize: (serialize === true),
            completed: 0,
            get length() {
                return tasklist.length;
            },
            id: task_list_id,
            run: function() {
                if (tasklist_ref.completed === tasklist_ref.length) {
                    throw new Error("nothing to do for tasklist");
                }
                shmi.fire('tasklist-run', {
                    id: tasklist_ref.id,
                    completed: tasklist_ref.completed,
                    length: tasklist_ref.length
                }, tasklist_ref);
                var task_lid = null;
                task_lid = shmi.listen('task-change', function(t_evt) {
                    getCheckListComplete(tasklist_ref, t_evt, task_lid);
                });
                if (tasklist_ref.serialize) {
                    var tl_idx = 0;
                    var prog_lid = shmi.listen('tasklist-progress', function(prog_evt) {
                        if (prog_evt.detail.task.state === module.TASK_COMPLETE) {
                            tl_idx++;
                            if (tl_idx < tasklist.length) {
                                tasklist[tl_idx].run();
                            } else {
                                shmi.unlisten('tasklist-progress', prog_lid);
                            }
                        } else {
                            shmi.unlisten('tasklist-progress', prog_lid);
                            tasklist.forEach(function(task_el) {
                                if (task_el.state < module.TASK_COMPLETE) {
                                    task_el.state = module.TASK_FAILED;
                                }
                            });
                        }
                    }, { "detail.id": tasklist_ref.id });
                    tasklist[tl_idx].run();
                } else if (!isNaN(numberOfConcurrentlyRunningTasks) && (numberOfConcurrentlyRunningTasks > 0)) {
                    numberOfConcurrentlyRunningTasks = parseInt(numberOfConcurrentlyRunningTasks);
                    if (numberOfConcurrentlyRunningTasks > tasklist.length) {
                        numberOfConcurrentlyRunningTasks = tasklist.length;
                    }
                    tl_idx = 0;
                    prog_lid = shmi.listen('tasklist-progress', function(prog_evt) {
                        if (prog_evt.detail.task.isComplete()) {
                            tl_idx += 1;
                            if (tl_idx < tasklist.length) {
                                tasklist[tl_idx].run();
                            } else {
                                prog_lid.unlisten();
                                prog_lid = null;
                            }
                        }
                    }, { "detail.id": tasklist_ref.id });
                    tl_idx = (numberOfConcurrentlyRunningTasks - 1);
                    for (var i = 0; i < numberOfConcurrentlyRunningTasks; i++) {
                        tasklist[i].run();
                    }
                } else {
                    tasklist.forEach(function(task_el) {
                        task_el.run();
                    });
                }
            },
            get onComplete() {
                return function() {
                    shmi.fire('tasklist-complete', {
                        id: tasklist_ref.id,
                        completed: tasklist_ref.completed,
                        length: tasklist_ref.length
                    }, tasklist_ref);
                    complete_func(tasklist_ref);
                };
            },
            set onComplete(val) {
                complete_func = val;
            }
        };

        TASK_LISTS[task_list_id] = tasklist_ref;
        return tasklist_ref;
    };

    module.getTaskList = function(task_list_id) {
        if (TASK_LISTS[task_list_id] === undefined) {
            throw new Error(_str("tasklist id '<%= LIST_ID %>' is undefined", { LIST_ID: task_list_id }));
        }
        return TASK_LISTS[task_list_id];
    };

    module.removeTaskList = function(task_list_id) {
        if (TASK_LISTS[task_list_id] === undefined) {
            throw new Error(_str("tasklist id '<%= LIST_ID %>' is undefined", { LIST_ID: task_list_id }));
        }
        delete TASK_LISTS[task_list_id];
    };

    var show_progress = function(tasklist, title) {
        var pd = shmi.createControl(document.body, {
            "ui": "dialog-box",
            "title": title || "progress",
            "template": "custom/loading-dialog/content",
            "name": "loading-box",
            "initial-state": "hidden",
            "class-name": "dialog-box designer-dialog-box"
        });
        shmi.addClass(pd.element, 'progress-info');
        var p_run_lid = shmi.listen('tasklist-run', function(tl_evt) {
            shmi.unlisten('tasklist-run', p_run_lid);
            pd.show();
            var pg = shmi.ctrl(".progress-bar", pd);
            pg.setProperties(0, tl_evt.detail.length, 1);
            var tc = shmi.ctrl(".current", pd);
            tc.setValue(tl_evt.detail.completed);
            var tt = shmi.ctrl(".total", pd);
            tt.setValue(tl_evt.detail.length);
        }, { "detail.id": tasklist.id });
        var p_prog_lid = shmi.listen('tasklist-progress', function(tl_evt) {
            var tc = shmi.ctrl(".current", pd);
            tc.setValue(tl_evt.detail.completed);
            var tt = shmi.ctrl(".total", pd);
            tt.setValue(tl_evt.detail.length);
            var pg = shmi.ctrl(".progress-bar", pd);
            pg.setValue(tl_evt.detail.completed);
            if (tl_evt.detail.task.name !== null) {
                var tn = shmi.ctrl(".task-name", pd);
                tn.setValue(tl_evt.detail.task.name);
            }
        }, { "detail.id": tasklist.id });
        var p_complete_lid = shmi.listen('tasklist-complete', function(tl_evt) {
            shmi.unlisten('tasklist-complete', p_complete_lid);
            shmi.unlisten('tasklist-progress', p_prog_lid);
            pd.hide();
            shmi.deleteControl(pd);
        }, { "detail.id": tasklist.id });

        return pd;
    };

    module.showProgress = show_progress;

    fLog("module loaded");
})();

/**
 * Connect API access module
 * --------------------------------
 *
 * This module allows to call Connect API commands in a generic way to be used across
 * the visuals library and controls.
 *
 *
 * @module visuals/tools/connect
 */
(function() {
    var MODULE_NAME = "visuals.tools.connect",
        /** @lends module:visuals/tools/connect */
        module = shmi.pkg(MODULE_NAME);

    /**
     * @constant
     * @type {number}
     * @default
     *
     */
    var REQUEST_TIMEOUT = 86400000;

    module.REQUEST_TIMEOUT = REQUEST_TIMEOUT;

    /**
     * request - send connect API request and return response via callback.
     *
     * @param  {string} apiCommand connect API command
     * @param  {object} options    parameter object
     * @param  {module:visuals/tools/connect~RequestCallback} callback   callback function to handle response
     * @param  {number} [customTimeout] optional custom timeout, default is `module.REQUEST_TIMEOUT`
     * @param  {string} [target] target app name
     * @return {undefined}
     */
    module.request = function request(apiCommand, options, callback, customTimeout, target) {
        return shmi.visuals.session.ConnectSession.request(apiCommand, options, callback, customTimeout, target);
    };

    /**
     * callMethod - Make a call to an ioHandler method.
     *
     * @example <caption>Call method `test-method` with parameters `a` and `b`</caption>
const { callMethod } = shmi.requires("visuals.tools.connect");
callMethod("test-method", {
    a: "parameter value #1",
    b: 2
}, function(status, response){
    if (status === 0) {
        console.log("Method call successful!");
    } else {
        console.error("Error during method call:", status);
    }
});
     *
     * @param {string} methodName name of method to call
     * @param {object} param      method parameter object
     * @param {methodCallCallback} callback   callback function to be run on call completion
     * @param {number} [customTimeout=REQUEST_TIMEOUT] custom timeout for method call in ms
     *
     * @returns {undefined}
     */
    module.callMethod = function callMethod(methodName, param, callback, customTimeout = REQUEST_TIMEOUT) {
        //check parameter types
        shmi.checkArg("methodName", methodName, "string");
        shmi.checkArg("param", param, "object");
        shmi.checkArg("callback", callback, "function");

        module.request("io.method", {
            name: methodName,
            params: param
        }, function(response, status) {
            callback(status, typeof response !== "undefined" ? response : null);
        }, customTimeout);
    };
}());

/**
 * Error information object returned by WebIQ Server in case an error
 * occurred during a request.
 *
 * @typedef {object} module:visuals/tools/connect~RequestError
 * @readonly
 *
 * @property {string} category Category of the error.
 * @property {number} errc Error code.
 * @property {string} [message] Error message.
 */

/**
 * @typedef {object} module:visuals/tools/connect~FilterParameters
 *
 * @property {?module:visuals/tools/connect~FilterParameters.filter} filter
 * @property {?(module:visuals/tools/connect~FilterParameters.sort[])} sort
 *  How to sort the resultset. If multiple sorting information are given,
 *  they are applied in-order for groups of same elements in respect to
 *  the previous field.
 * @property {?number} limit Max number of results included in the response.
 * @property {?number} offset Number of results to skip.
 */

/**
 * @typedef {object} module:visuals/tools/connect~FilterParameters.sort
 *
 * @property {string} column Name of the property to sort.
 * @property {string} order Sort order. Can either be "ASC" for ascending
 *  or "DESC" for descending order.
 */

/**
 * @typedef {object} module:visuals/tools/connect~FilterParameters.filter
 *
 * @property {string} mode Mode how the given clauses are connected. Can
 *  either be "AND" for conjuntion or "OR" for disjunction. If the property
 *  is not set, it will default to "AND".
 * @property {module:visuals/tools/connect~FilterParameters.filter.columnFilter[]} clauses
 */

/**
 * @typedef {object} module:visuals/tools/connect~FilterParameters.filter.columnFilter
 *
 * @property {string} column Name of the field to apply the filter to.
 * @property {string} mode Mode how the given clauses are connected. Can
 *  either be "AND" for conjuntion or "OR" for disjunction.
 * @property {module:visuals/tools/connect~FilterParameters.filter.columnFilter.clause[]} clauses
 * @property {?string} location
 */

/**
 * @typedef {object} module:visuals/tools/connect~FilterParameters.filter.columnFilter.clause
 *
 * @property {string} operator Operator to use. Can be "==", "<>", "<",
 *  ">", "<=", ">=", "like" or "is".
 * @property {*} value Value to compare the field against.
 * @property {?string} operand
 */

/**
 * Callback for WebIQ Server requests.
 *
 * @callback module:visuals/tools/connect~RequestCallback
 * @param {*} response Response data.
 * @param {?module:visuals/tools/connect~RequestError} err Error information.
 *  Is `null` in case no error occurred.
 */

/**
 * Method call callback function
 *
 * @callback methodCallCallback
 * @param {number|object} status response status: `0` for success, error info object else
 * @param {any} response response data
 */

/**
 * Module to limit tab navigation inside an HTML element
 *
 * @module visuals/tools/tabulator
 */
(function() {
    var MODULE_NAME = "visuals.tools.tabulator",
        /** @lends module:visuals/tools/tabulator */
        module = shmi.pkg(MODULE_NAME),
        ENABLE_LOGGING = false,
        RECORD_LOG = false,
        logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG),
        fLog = logger.fLog,
        log = logger.log,
        onFocusChange = {},
        onFocusLeave = {},
        tabElems = null,
        lastActiveElem = document.activeElement || null;

    log('Adding focus event listener');
    document.addEventListener('focus', function(event) {
        emitFocusChange(event);
        emitFocusLeave(event);
    }, true);

    /**
     * Module function to set an HTML DOM object as the parent of the current tab order
     *
     * @param tabParent {HTMLElement} Element to be set as a tab parent
     * @return {object} returns an Object with a function unset the tab parent
     */
    module.setTabParent = function(tabParent) {
        if (!tabParent) {
            console.error('[visuals.tools.tabulator] tabParent parameter not provided');
            return null;
        } else if (!(tabParent instanceof HTMLElement)) {
            console.error('[visuals.tools.tabulator] tabParent parameter must be an HMTLElement!');
            return null;
        }

        tabElems = Array.from(tabParent.querySelectorAll('[tabindex]:not([tabindex="-1"])'));
        tabElems = tabElems.filter(function(elem) {
            return isTabElementVisible(elem);
        });
        var focusIsChild = shmi.testParentChild(tabParent, document.activeElement);
        if (tabElems[0] && !focusIsChild) {
            tabElems[0].focus();
            log('Initial focus set on: ', tabElems[0]);
        }
        if (tabParent.getAttribute('tabindex') !== '-1') {
            tabElems.unshift(tabParent);
        }

        if (tabElems.length > 0) {
            tabParent.addEventListener('keydown', elementTabulator);
        } else {
            log('No elements with tabindex found inside the parent', tabParent);
        }

        return {
            /**
             * unsetTabParent - Function to unset the event listener for the tabulator
             *
             */
            unsetTabParent: function() {
                tabParent.removeEventListener('keyup', elementTabulator);
            }
        };
    };

    /**
     * Event listener for Tab key on the tab parent to manage first and last tab element
     *
     * @param event
     */
    function elementTabulator(event) {
        var key = event.key ? event.key : event.code;
        if (key === 'Tab') {
            if (tabElems.length === 1) {
                event.preventDefault();
                tabElems[0].focus();
            } else if (tabElems.length > 1) {
                if (event.shiftKey && tabElems[0] === document.activeElement) {
                    tabElems[tabElems.length - 1].focus();
                    event.preventDefault();
                } else if (!event.shiftKey && tabElems[tabElems.length - 1] === document.activeElement) {
                    tabElems[0].focus();
                    event.preventDefault();
                }
            }
        }
    }

    /**
     * emitFocusChange - gets trigged on every focus event inside the document and emits
     * callbacks for all registered focus change functions of this module
     *
     * @param event
     */
    function emitFocusChange(event) {
        if (document.activeElement !== lastActiveElem) {
            lastActiveElem = document.activeElement;
            Object.keys(onFocusChange).forEach(function(id) {
                if (onFocusChange[id]) {
                    onFocusChange[id](event);
                }
            });
        }
    }

    /**
     * emitFocusLeave - get triggered on every focus event inside the document and emits
     * callbacks for all registered focus leave functions of this module if the focus
     * is outside of a given parent element
     *
     * @param event
     */
    function emitFocusLeave(event) {
        Object.keys(onFocusLeave).forEach(function(id) {
            var item = onFocusLeave[id],
                isInside = shmi.testParentChild(item.leaveElem, document.activeElement),
                isParent = item.leaveElem === document.activeElement;
            if (!isInside && !isParent) {
                item.cb(event);
            }
        });
    }

    /**
     * isTabElementVisible - checks if an html element has a size in the current view
     *
     * @param elem {HTMLElement} Element to check
     * @return {boolean}
     */
    function isTabElementVisible(elem) {
        var rect = elem.getBoundingClientRect(),
            isSized = rect.top >= 0 && rect.left >= 0;
        isSized = isSized && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
        isSized = isSized && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
        return isSized;
    }

    /**
     * onFocusChange - registers a new callback for a focus change element
     *
     * @param cb {function} callback to register
     * @return {object} object container the unregister function for this callback
     */
    module.onFocusChange = function(cb) {
        var id = Math.random().toString(36).substr(2, 9);
        while (onFocusChange[id] !== undefined) {
            id = Math.random().toString(36).substr(2, 9);
        }
        onFocusChange[id] = cb;
        return {
            unsetFocusChange: function() {
                delete onFocusChange[id];
            }
        };
    };

    /**
     * onFocusLeave - registers a new callback that gets triggered if a given element is focused out
     *
     * @param leaveElem {HTMLElement} element to listen on focus leave
     * @param cb {function} callback to be triggered on focus leave
     * @return {object} object containing a function to unregister the focus leave callback
     */
    module.onFocusLeave = function(leaveElem, cb) {
        var id = Math.random().toString(36).substr(2, 9);
        while (onFocusChange[id] !== undefined) {
            id = Math.random().toString(36).substr(2, 9);
        }
        onFocusLeave[id] = {
            leaveElem: leaveElem,
            cb: cb
        };
        return {
            unsetFocusLeave: function() {
                delete onFocusLeave[id];
            }
        };
    };

    fLog("module loaded");
}());

/**
 * Module to create controller scripts to implement application logic with controls.
 *
 * Controllers can be used in two ways:
 * - *Global* - A single, globally available controller is created to work with controls in the application.
 * - *Control specific* - A controller is bound to a specific control instance, slot controls must be nested inside this control instance.
 *
 * Global controllers are meant to be used once per application and can be used with an existing layout. A global controller is created when the `parent` parameter is ommitted or set to 'null'.
 *
 * Control specific controllers may be used to create modular layout components that are meant to be used multiple times per application.
 * To create a control specific controller, the `parent` parameter has to be set to a valid control instance name. Control specific controllers may also be
 * used when using existing controls within a new control, e.g. to react to user input from buttons or other child controls.
 *
 * @example <caption>Global Controller</caption>
//Copy the following code inside the `run` method of a local-script for testing!
var controller = shmi.requires("visuals.tools.controller"),
    //assumes that a the parent of the local-script is a container control that supports the `addControl` method.
    baseContainer = self.getParent();

//create the global controller 'my-controller' - third parameter `name` is omitted -> controls from anywhere within the applications may register
controller.create("my-controller", {
    slots: {
        myButton: {
            ui: "button",
            events: ["click"]
        },
        otherButton: {
            ui: "button",
            events: ["click"],
            optional: true
        }
    },
    onChange: function(state, detail) {
        //...handle state change of optional controls
        if (detail.active) {
            console.log("optional slot became active:", detail.slot);
        } else {
            console.log("optional slot became inactive:", detail.slot);
        }
    },
    onEnable: function(state) {
        //...handle activation of all required controls
        console.log("required slots active!");
    },
    onDisable: function(state) {
        //...handle deactivation of required controls
        console.log("required slots inactive!");
    },
    onEvent: function(state, slot, type, event) {
        //...handle events generated by slot controls
        switch(slot) {
            case "myButton":
                shmi.notify("myButton clicked!");
                break;
            case "otherButton":
                shmi.notify("otherButton clicked!");
                break;
            default:
        }
    }
});

if (baseContainer) {
    //create some buttons to register with the controller...
    baseContainer.addControl([
        //required button for slot 'myButton'...
        {
            ui: "button",
            config: {
                //option '_controllers_' can be used on any control and is used to register
                //the control with a controller slot. each control may register with any
                //number of controller slots.
                _controllers_: [
                    {
                        name: "my-controller", //controller name
                        slot: "myButton" //controller slot
                    }
                ],
                label: "my button"
            }
        },
        //optional button for slot 'otherButton'...
        {
            ui: "button",
            config: {
                _controllers_: [
                    {
                        name: "my-controller",
                        slot: "otherButton"
                    }
                ],
                label: "other button"
            }
        }
    ], function(err, controls) {
        if (err) {
            console.error("Error creating controls:", err);
        } else {
            console.log("buttons initialized:", controls);
        }
    });
}

//cleanup controller when no longer required with `controller.remove("my-controller")`
 *
 *
 * @example <caption>Control Specific Controller</caption>
//Copy the following code inside the `run` method of a local-script for testing!
var controller = shmi.requires("visuals.tools.controller"),
    //assumes that a the parent of the local-script is a container control that supports the `addControl` method.
    baseContainer = self.getParent(),
    numContainers = 5, //number of containers to create
    containerConfigs = [];

for (var i = 0; i < numContainers; i++) {
    containerConfigs.push({
        ui: "container",
        config: {
            name: "generated-container-" + i
        }
    });
}

baseContainer.addControl(containerConfigs, function(err, controls) {
    if (!err) {
        controls.forEach(function(container, idx) {
            //create a separate controller specific to each generated container.
            //note: third parameter `name` is set to name of created container!
            controller.create("my-sub-controller", {
                slots: {
                    myButton: {
                        ui: "button",
                        events: ["click"]
                    }
                },
                onEnable: function(state) {
                    //...handle activation of all required controls
                    console.log("required slots active!");
                },
                onDisable: function(state) {
                    //...handle deactivation of required controls
                    console.log("required slots inactive!");
                },
                onEvent: function(state, slot, type, event) {
                    //...handle events generated by slot controls
                    switch(slot) {
                        case "myButton":
                            shmi.notify("myButton clicked!");
                            break;
                        default:
                    }
                }
            }, container.getName())
            //create nested button for each container
            //note: nested controls will automatically detect the correct instance of the controller
            container.addControl({
                ui: "button",
                config: {
                    _controllers_: [
                        {
                            name: "my-sub-controller",
                            slot: "myButton"
                        }
                    ],
                    label: "my button"
                }
            }, function(subErr, subControls) {
                if (!subErr) {
                    console.log("button generated");
                }
            });
        });
    }
});

//cleanup each controller when no longer required with `controller.remove("my-controller", container.getName())`
//note: control specific controllers are automatically removed when their parent control gets deleted.
 *
 *
 * @module visuals/tools/controller
 */
(function() {
    "use strict";
    var MODULE_NAME = "visuals.tools.controller";

    var ENABLE_LOGGING = false,
        RECORD_LOG = false,
        logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG),
        fLog = logger.fLog, log = logger.log, logError = logger.error, logWarn = logger.warn, logInfo = logger.info;

    // MODULE CODE - START
    /** @lends module:visuals/tools/controller */
    var module = shmi.pkg(MODULE_NAME),
        controllers = new Map(null), //eslint-disable-line no-undef
        controllerParents = {};

    /**
     * example controller options:
        {
            slots: {
                ok: {
                    ui: "button",
                    events: ["click"]
                },
                cancel: {
                    ui: "button",
                    events: ["click"]
                },
                infoText: {
                    ui: "text-display",
                    optional: true
                }
            },
            onChange: function(state, detail) {
                //...handle state change of optional controls
            },
            onEnable: function(state) {
                //...handle activation of all required controls
            },
            onDisable: function(state) {
                //...handle deactivation of required controls
            },
            onEvent: function(state, slot, type, event) {
                //...handle events generated by slot controls
            }
        }
     *
     */

    /**
     * getSlotInstance - get control instance associated with specified slot.
     *
     * @param {object} controller controller object
     * @param {string} name slot name
     *
     * @returns {object} control instance or `null`
     */
    function getSlotInstance(controller, name) {
        var slot = controller.slots[name];

        if (slot && slot.instance) {
            return slot.instance;
        }

        return null;
    }

    /**
     * getSlot - create slot information object to be returned as part of state
     * information
     *
     * @param {object} controller controller object
     * @param {string} name slot name
     *
     * @returns {object} slot information object
     */
    function getSlot(controller, name) {
        var slot = controller.slots[name],
            slotInfo = null;

        if (!slot) {
            return null;
        }

        slotInfo = {
            name: name,
            ui: slot.ui,
            optional: slot.optional || false
        };

        Object.defineProperty(slotInfo, "instance", {
            get: function() {
                return getSlotInstance(controller, name);
            },
            set: function() {
                throw new TypeError("Instance reference cannot be changed manually.");
            }
        });

        return slotInfo;
    }

    /**
     * getController - retrieve controller reference by specified name & parent combination
     *
     * @param {string} name controller name
     * @param {string} [parent] optional controller parent
     * @returns {object} controller reference or `null` if none was found
     */
    function getController(name, parent) {
        var info = {
            name: name,
            parent: parent || null
        };

        return controllers.get(JSON.stringify(info)) || null;
    }

    /**
     * setController - set controller reference
     *
     * @param {object} controller controller reference
     * @param {string} name controller name
     * @param {string} [parent] optional controller parent
     */
    function setController(controller, name, parent) {
        var info = {
                name: name,
                parent: parent || null
            },
            idx = -1;

        controllers.set(JSON.stringify(info), controller);
        if (!controllerParents[name]) {
            controllerParents[name] = [];
        }
        if (parent) {
            idx = controllerParents[name].indexOf(parent);
            if (idx === -1) {
                controllerParents[name].push(parent);
            }
        }
    }

    /**
     * addListener - add event listener for slot control
     *
     * @param {object} controller controller reference
     * @param {string} slot slot name of control
     * @param {string} type event type to listen to
     */
    function addListener(controller, slot, type) {
        var control = getSlotInstance(controller, slot),
            token = null;

        if (control && typeof controller.onEvent === "function") {
            token = control.listen(type, function(evt) {
                controller.onEvent(module.getState(controller.name, controller.parent), slot, type, evt);
            });
            controller.slots[slot].tokens.push(token);
        }
    }

    /**
     * removeListeners - remove slot control listeners
     *
     * @param {object} controller controller reference
     * @param {string} slot slot name
     */
    function removeListeners(controller, slot) {
        var slotInfo = controller.slots[slot];
        slotInfo.tokens.forEach(function(t) {
            t.unlisten();
        });
        slotInfo.tokens = [];
    }

    /**
     * updateState - update current state representation and notify changes.
     *
     * @param {string} name controller name
     * @param {string} [parent] optional parent control name
     * @param {object|null} [detail] slot state information when optional slot state changes
     * @param {string} detail.slot slot name that changed
     * @param {boolean} detail.active new active state of optional slot
     *
     * @returns {undefined}
     */
    function updateState(name, parent, detail) {
        var controller = getController(name, parent),
            iter = shmi.requires("visuals.tools.iterate").iterateObject,
            active = true;

        if (!controller) {
            logError("Unknown controller:", name);
            return;
        }

        iter(controller.slots, function(val, prop) {
            if (val.instance === null && !val.optional) {
                active = false;
            }
        });

        if (active !== controller.active) {
            controller.active = active;
            if (active) {
                controller.onEnable(module.getState(controller.name, controller.parent));
                iter(controller.slots, function(val, prop) {
                    if (Array.isArray(val.events)) {
                        val.events.forEach(function(eventType) {
                            addListener(controller, prop, eventType);
                        });
                    }
                });
            } else {
                iter(controller.slots, function(val, prop) {
                    removeListeners(controller, prop);
                });
                controller.onDisable(module.getState(controller.name, controller.parent));
            }
        } else if (active && (typeof controller.onChange === "function")) {
            if (detail && Array.isArray(controller.slots[detail.slot].events)) {
                if (detail.active) {
                    controller.slots[detail.slot].events.forEach(function(eventType) {
                        addListener(controller, detail.slot, eventType);
                    });
                } else {
                    removeListeners(controller, detail.slot);
                }
            }
            controller.onChange(module.getState(controller.name, controller.parent), detail);
        }
    }

    /**
     * create - create a new controller to implement application logic
     *
     * @param {string} name controller name
     * @param {module:visuals/tools/controller~ControllerOptions} options controller configuration
     * @param {string} [parent] optional name of controller parent
     */
    module.create = function create(name, options, parent) {
        var iter = shmi.requires("visuals.tools.iterate").iterateObject,
            hasOptionals = false,
            controller = getController(name, parent);

        if (controller) {
            logError("Controller '%s' already registered.", name);
            return;
        }

        controller = {
            name: name,
            slots: {},
            active: false,
            onChange: options.onChange || null,
            onEnable: options.onEnable,
            onDisable: options.onDisable,
            onEvent: options.onEvent || null,
            tokens: [],
            parent: parent || null
        };

        Object.defineProperty(controller, "data", {
            value: options.data || {},
            writable: false
        });

        iter(options.slots, function(val, prop) {
            controller.slots[prop] = {
                name: prop,
                ui: val.ui,
                optional: (val.optional === true),
                instance: null,
                tokens: [],
                events: Array.isArray(val.events) ? val.events : null
            };
            if (val.optional === true) {
                hasOptionals = true;
            }
        });

        setController(controller, controller.name, controller.parent);

        if (hasOptionals && (typeof options.onChange !== "function")) {
            logWarn("Optional slots exist for controller '%s', but no `onChange` callback function was provided. There will be no notifications on status changes.", name);
        }
    };

    /**
     * getState - get current controller state information
     *
     * @param {string} name controller name
     * @param {string} [parent] controller parent name
     * @returns {module:visuals/tools/controller~ControllerState} controller state information or `null` if no controller was found
     */
    module.getState = function getState(name, parent) {
        var controller = getController(name, parent),
            iter = shmi.requires("visuals.tools.iterate").iterateObject,
            controllerInfo = null;

        if (!controller) {
            return null;
        }

        controllerInfo = {
            name: controller.name,
            slots: {},
            getInstance: function(slotName) {
                return getSlotInstance(controller, slotName);
            },
            getParent: function() {
                var parentControl = null;

                if (controller.parent) {
                    parentControl = shmi.ctrl(controller.parent);
                }

                return parentControl;
            }
        };

        Object.defineProperty(controllerInfo, "active", {
            get: function() {
                return controller.active;
            },
            set: function() {
                throw new TypeError("Active state cannot be set manually.");
            }
        });

        Object.defineProperty(controllerInfo, "data", {
            value: controller.data,
            writable: false
        });

        iter(controller.slots, function(val, prop) {
            controllerInfo.slots[prop] = getSlot(controller, prop);
        });

        return controllerInfo;
    };

    /**
     * remove - remove active controller
     *
     * @param {string} name controller name
     * @param {string} [parent] controller parent name
     */
    module.remove = function remove(name, parent) {
        var controller = getController(name, parent),
            idx = -1;
        if (!controller) {
            logError("Unknown controller:", name);
        } else {
            if (controller.active) {
                controller.tokens.forEach(function(t) {
                    t.unlisten();
                });
                controller.tokens = [];
                controller.onDisable(module.getState(controller.name, controller.parent));
            }
            controllers.delete(JSON.stringify({
                name: name,
                parent: parent || null
            }));
            if (parent && controllerParents[name]) {
                idx = controllerParents[name].indexOf(parent);
                if (idx !== -1) {
                    controllerParents[name].splice(idx, 1);
                }
                if (controllerParents[name].length === null) {
                    delete controllerParents[name];
                }
            }
        }
    };

    /**
     * removeAll - remove all controllers bound to specified controller parent name
     *
     * @param {string} parent controller parent name
     */
    module.removeAll = function removeAll(parent) {
        var iter = shmi.requires("visuals.tools.iterate").iterateObject,
            removeList = [];

        iter(controllerParents, function(parentList, controllerName) {
            if (parentList.indexOf(parent) !== -1) {
                removeList.push({
                    name: controllerName,
                    parent: parent
                });
            }
        });

        removeList.forEach(function(remInfo) {
            module.remove(remInfo.name, remInfo.parent);
        });
    };

    /**
     * getParentName - get controller parent name for specified controller/control combination
     *
     * @param {string} name controller name
     * @param {object} control control instance reference
     * @returns {string} name of controller parent or `null` if none was found
     */
    function getParentName(name, control) {
        var controllerInfo = controllerParents[name],
            parentName = null,
            parentControl = null;

        if (Array.isArray(controllerInfo)) {
            parentControl = control;
            while (parentControl) {
                if (controllerInfo.indexOf(parentControl.getName()) !== -1) {
                    parentName = parentControl.getName();
                    parentControl = null;
                } else {
                    parentControl = parentControl.getParent();
                }
            }
        }

        return parentName;
    }

    /**
     * getControllerParent - get controller parent name for specified controller/control combination
     *
     * @param {string} name controller name
     * @param {object} control control instance reference
     * @returns {string} name of controller parent or `null` if none was found
     */
    module.getControllerParent = function getControllerParent(name, control) {
        return getParentName(name, control);
    };

    /**
     * registerSlot - register control instance with controller slot.
     *
     * Called automatically by BaseControl when control instance is enabled.
     *
     * @param {string} controllerName controller name
     * @param {string} slotName slot name
     * @param {object} controlInstance control instance reference
     */
    module.registerSlot = function registerSlot(controllerName, slotName, controlInstance) {
        var controller = getController(controllerName, getParentName(controllerName, controlInstance)),
            disableTok = null,
            slot = null,
            detail = null;

        if (controller !== null) {
            slot = controller.slots[slotName];
            if (slot) {
                if (slot.ui === controlInstance.uiType) {
                    if (slot.instance === null) {
                        slot.instance = controlInstance;
                        disableTok = controlInstance.listen("disable", function onDisable(evt) {
                            var tokIdx = -1;
                            if (disableTok) {
                                disableTok.unlisten();
                                tokIdx = controller.tokens.indexOf(disableTok);
                                if (tokIdx !== -1) {
                                    controller.tokens.splice(tokIdx, 1);
                                }
                                disableTok = null;
                                slot.instance = null;
                                if (slot.optional) {
                                    detail = {
                                        slot: slotName,
                                        active: false
                                    };
                                }
                                updateState(controller.name, controller.parent, detail);
                            }
                        });
                        controller.tokens.push(disableTok);
                        if (slot.optional) {
                            detail = {
                                slot: slotName,
                                active: true
                            };
                        }
                        updateState(controller.name, controller.parent, detail);
                    } else {
                        logError("Slot already occupied:", slotName + "@" + controllerName);
                    }
                } else {
                    logError("Mismatching slot ui-type:", controlInstance.uiType, ", required:", slot.ui, slotName + "@" + controllerName);
                }
            } else {
                logError("Unknown controller / slot combination:", slotName + "@" + controllerName);
            }
        } else {
            logError("Unknown controller:", controllerName);
        }
    };

    // MODULE CODE - END

    fLog("module loaded");
})();

/**
 * @typedef module:visuals/tools/controller~ControllerSlotOptions
 * @type {object}
 * @property {string} ui slot control ui-type
 * @property {string[]} [events] slot events to listen to
 * @property {boolean} [optional] `true` when slot control is not required
 */

/**
 * @typedef module:visuals/tools/controller~ControllerSlotInfo
 * @type {object}
 * @property {string} name slot name
 * @property {string} ui slot control ui-type
 * @property {boolean} optional `true` when slot control is not required, `false` else
 * @property {object|null} instance control instance reference, or `null` if none set
 */

/**
 * @typedef module:visuals/tools/controller~GetInstance
 * @type {function}
 * @param {string} slot slot name
 * @returns {object} control instance reference or `null` if none set
 */

/**
 * @typedef module:visuals/tools/controller~GetParent
 * @type {function}
 * @returns {object} control instance reference or `null` if none set
 */

/**
 * @typedef module:visuals/tools/controller~ControllerState
 * @type {object}
 * @property {string} name controller name
 * @property {object.<string, module:visuals/tools/controller~ControllerSlotInfo>} slots controller slot information
 * @property {module:visuals/tools/controller~GetInstance} getInstance function to access slot control instances
 * @property {module:visuals/tools/controller~GetParent} getParent function to access parent control associated with controller. returns `null` if no parent was set.
 * @property {boolean} active controller active state
 * @property {object} data optional controller data
 */

/**
 * @typedef module:visuals/tools/controller~StateHandler
 * @type {function}
 * @param {module:visuals/tools/controller~ControllerState} state controller state
 */

/**
 * @typedef module:visuals/tools/controller~ChangeHandler
 * @type {function}
 * @param {module:visuals/tools/controller~ControllerState} state controller state
 * @param {object} detail change details
 * @param {string} detail.slot name of slot that changed
 * @param {boolean} detail.active current active state of slot
 */

/**
 * @typedef module:visuals/tools/controller~EventHandler
 * @type {function}
 * @param {module:visuals/tools/controller~ControllerState} state controller state
 * @param {string} slot slot name
 * @param {string} type type of event
 * @param {object} event event object
 */

/**
 * @typedef module:visuals/tools/controller~ControllerOptions
 * @type {object}
 * @property {string} name controller name
 * @property {object.<string, module:visuals/tools/controller~ControllerSlotOptions>} slots slot definitions for controls
 * @property {object} [data={}] optional controller data stored in state
 * @property {module:visuals/tools/controller~StateHandler} onEnable handler function called when all required slots become ready
 * @property {module:visuals/tools/controller~StateHandler} onDisable handler function called when at least one required slot becomes not ready
 * @property {module:visuals/tools/controller~ChangeHandler} [onChange=null] handler function called when state of optional slot changes
 * @property {module:visuals/tools/controller~EventHandler} [onEvent=null] handler function called when slot event was fired
 */
/**
 * Module with helper functions for objects and arrays.
 *
 * @module visuals/tools/objectHelpers
 */
(function() {
    var MODULE_NAME = "visuals.tools.objectHelpers",
        ENABLE_LOGGING = true,
        RECORD_LOG = false,
        logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG),
        fLog = logger.fLog,
        log = logger.log,
        /** @lends module:visuals/tools/objectHelpers */
        module = shmi.pkg(MODULE_NAME);

    // MODULE CODE - START

    /* private variables */

    /* private functions */

    /* public functions */

    /**
     * Returns the value (if exists) of the object or array by path
     * Example:
     * var obj = {foo: [bar, {a: 1, b: 2}]}
     * getByPath("foo[1].a", obj) returns 1
     *
     * @param {string|Array} path e.g "a.b.c" or "a[b].c" or ["a","b","c"]
     * @param {object} obj e.g obj[a][b][c]
     * @param {*} def default value to return
     *
     * @return {*}
     */
    module.getByPath = function getByPath(path, obj, def) {
        var res = obj,
            index, key;
        if (typeof path === "string") {
            path = path.replace(/\[/g, ".");
            path = path.replace(/\]/g, "");
            path = path.split(".");
        }
        for (index = 0; index < path.length; index++) {
            key = path[index];
            if (res !== null && typeof res === "object" && key in res) {
                res = res[key];
                continue;
            }
            return def;
        }

        return res;
    };

    /**
     * Sets the value of the object's property or array by path. Also creates property if not exists.
     * "a.b[7].d" = "foo" --> {a: {b: [6 x undefined, {d: "foo"}]}}
     * @param {string|Array} path e.g "a.b[7].c"|["a","b[","7","c"]
     * @param {object} obj e.g obj.a.b.c
     * @param {*} value
     */
    module.setByPath = function setByPath(path, obj, value) {
        if (typeof path === "string") {
            // replace array brackets but keep one to differentiate between empty {} and []
            path = path.replace(/\[/g, "[.");
            path = path.replace(/\]/g, "");
            path = path.split(".");
        }
        if (path.length > 1) {
            var e = path.shift(),
                defaultEmpty = {};
            if (e.indexOf("[") !== -1) {
                e = e.replace("[", "");
                defaultEmpty = [];
            }
            if (((typeof obj[e] !== "object") || (obj[e] === null))) {
                obj[e] = defaultEmpty;
            }
            setByPath(path, obj[e], value);
        } else {
            obj[path[0]] = value;
        }
    };

    // MODULE CODE - END

    fLog("module loaded");
})();

/**
 * Condition tools.
 *
 * @module visuals/tools/conditions
 */
(function() {
    const MODULE_NAME = "visuals.tools.conditions",

        // MODULE CODE - START
        /** @lends module:visuals/tools/conditions */
        module = shmi.pkg(MODULE_NAME);

    /**
     * Operators for comparisons.
     */
    const OPERATORS = {
        /**
         * Operators for lhs = primitive and rhs = primitive
         */
        PRIMITIVE_PRIMITIVE: {
            eq: (lhs, rhs) => lhs === rhs,
            gt: (lhs, rhs) => lhs > rhs,
            lt: (lhs, rhs) => lhs < rhs,
            geq: (lhs, rhs) => lhs >= rhs,
            leq: (lhs, rhs) => lhs <= rhs,
            neq: (lhs, rhs) => lhs !== rhs,
            and: (lhs, rhs) => ((lhs & rhs) !== 0),
            or: (lhs, rhs) => ((lhs | rhs) !== 0),
            xor: (lhs, rhs) => ((lhs ^ rhs) !== 0),
            nand: (lhs, rhs) => ((lhs & rhs) === 0),
            nor: (lhs, rhs) => ((lhs | rhs) === 0)
        },
        /**
         * Operators for lhs = primitive and rhs = array
         */
        PRIMITIVE_ARRAY: {
            in: (lhs, rhs) => rhs.includes(lhs),
            nin: (lhs, rhs) => rhs.includes(lhs)
        },
        /**
         * Operators for lhs = array and rhs = primitive
         */
        ARRAY_PRIMITIVE: {
            anyof: (lhs, rhs) => lhs.includes(rhs),
            noneof: (lhs, rhs) => !lhs.includes(rhs)
        },
        /**
         * Operators for lhs = array and rhs = array
         */
        ARRAY_ARRAY: {
            anyin: (lhs, rhs) => lhs.some((value) => rhs.includes(value)),
            allin: (lhs, rhs) => lhs.every((value) => rhs.includes(value)),
            nonein: (lhs, rhs) => lhs.every((value) => !rhs.includes(value)),
            somenotin: (lhs, rhs) => lhs.some((value) => !rhs.includes(value))
        }
    };

    /**
     * getOperandValue - get value of comparison operand
     *
     * @param {ConditionEvaluator} self
     * @param {object} operand operand configuration
     * @returns {*} operand value or `null` if none found
     */
    function getOperandValue(self, operand) {
        if (operand.type === "item") {
            return self.getItemValue(operand.value);
        } else if (operand.type === "value") {
            return operand.value;
        } else if (operand.type === "environment") {
            return self.getEnvironmentVariableValue(operand.value);
        } else {
            return null;
        }
    }

    /**
     * resolveComparison - get comparison result
     *
     * @param {ConditionEvaluator} self
     * @param {object} comparison comparison configuration
     * @returns {boolean} comparison result
     */
    function resolveComparison(self, comparison) {
        const op1 = getOperandValue(self, comparison.operand1),
            op2 = getOperandValue(self, comparison.operand2),
            operator = comparison.operator;

        const comparator = (() => {
            if (Array.isArray(op1) && Array.isArray(op2)) {
                return OPERATORS.ARRAY_ARRAY[operator];
            } else if (Array.isArray(op2)) {
                return OPERATORS.PRIMITIVE_ARRAY[operator];
            } else if (Array.isArray(op1)) {
                return OPERATORS.ARRAY_PRIMITIVE[operator];
            } else {
                return OPERATORS.PRIMITIVE_PRIMITIVE[operator];
            }
        })();

        if (!comparator) {
            return false;
        }

        return comparator(op1, op2);
    }

    /**
     * resolveCondition - get condition active state
     *
     * @param {ConditionEvaluator} self
     * @param {object} condition (sub-)condition configuration
     * @returns {boolean} condition active state
     */
    function resolveCondition(self, condition) {
        let conditionValues = null;

        conditionValues = condition.elements.map((conditionElement) => {
            if (conditionElement.type === "comparison") {
                return resolveComparison(self, conditionElement);
            } else if (conditionElement.type === "condition") {
                return resolveCondition(self, conditionElement);
            } else {
                return false;
            }
        });
        if (condition.mode === "AND") {
            return conditionValues.every((conditionValue) => conditionValue === true);
        } else { //condition.mode := "OR"
            return conditionValues.some((conditionValue) => conditionValue === true);
        }
    }

    /**
     * checkItemsReady - check if all required items have received a value
     *
     * @param {ConditionEvaluator} self
     */
    function checkItemsReady(self) {
        let iter = shmi.requires("visuals.tools.iterate").iterateObject,
            ready = true;

        iter(self._items, (item, name) => {
            if (item.value === null) {
                ready = false;
            }
        });
        iter(self._env, (variable, name) => {
            if (variable.value === null) {
                ready = false;
            }
        });
        self._ready = ready;
    }

    /**
     * checkConditionState - check condition resolution state
     *
     * @param {ConditionEvaluator} self
     */
    function checkConditionState(self) {
        if (!self._ready) {
            return;
        }

        const result = resolveCondition(self, self._condition);
        if (result !== self._active) {
            self._active = result;
            self._observerFunc(result);
        }
    }

    /**
     * collectOperands - collect list of operand configurations
     *
     * @param {object} element condition element
     * @param {string} type Type of the operands to collect
     * @param {object[]} [out=[]] operands
     * @returns {object[]} collected operands
     */
    function collectOperands(element, type, out = []) {
        if (element.type === "comparison") {
            if (element.operand1.type === type) {
                out.push({
                    name: element.operand1.value,
                    value: null,
                    token: null
                });
            }
            if (element.operand2.type === type) {
                out.push({
                    name: element.operand2.value,
                    value: null,
                    token: null
                });
            }
        } else if (element.type === "condition") {
            element.elements.forEach((e) => {
                collectOperands(e, type, out);
            });
        }

        return out;
    }

    /**
     * subscribeItems - create subscriptions and handlers for all condition items
     *
     * @param {ConditionEvaluator} self
     * @param {object[]} conditionItems condition items
     * @param {object[]} tokens subscription tokens
     */
    function subscribeItems(self, conditionItems, tokens) {
        const im = shmi.requires("visuals.session.ItemManager");

        conditionItems.forEach((item) => {
            tokens.push(im.subscribeItem(item.name, {
                setValue: (value) => {
                    item.value = value;
                    if (!self.ready) {
                        checkItemsReady(self);
                    }
                    checkConditionState(self);
                }
            }));
        });
    }

    /**
     * subscribeEnvironmentVariables - create subscriptions and handlers for all condition environment variables
     *
     * @param {ConditionEvaluator} self
     * @param {object} condition condition configuration
     * @param {object[]} conditionVariables condition environment variables
     * @param {object[]} tokens subscription tokens
     */
    function subscribeEnvironmentVariables(self, conditionVariables, tokens) {
        const em = shmi.requires("visuals.session.EnvironmentManager");

        conditionVariables.forEach((variable) => {
            tokens.push(em.subscribe(variable.name, (value) => {
                variable.value = value;
                if (!self.ready) {
                    checkItemsReady(self);
                }
                checkConditionState(self);
            }));
        });
    }

    /**
     * getItemMap - create key value map for condition items
     *
     * @param {object[]} conditionItems list of item configs
     * @returns {object} key- value-map for condition items
     */
    function getItemMap(conditionItems) {
        const map = {};
        conditionItems.forEach((item) => {
            map[item.name] = item;
        });

        return map;
    }

    /**
     * getEnvironmentVariableMap - create key value map for condition environment variables
     *
     * @param {object[]} conditionVariables list of environment variable configs
     * @returns {object} key- value-map for condition environment variables
     */
    function getEnvironmentVariableMap(conditionVariables) {
        const map = {};
        conditionVariables.forEach((variable) => {
            map[variable.name] = variable;
        });

        return map;
    }

    /**
     * initItems - initialize items required for condition state resolution
     *
     * @param {ConditionEvaluator} self
     * @param {object[]} tokens subscription tokens
     */
    function initItems(self, tokens) {
        let items = collectOperands(self._condition, "item"),
            itemNames = [];

        //filter duplicate items
        items = items.filter((item) => {
            if (!itemNames.includes(item.name)) {
                itemNames.push(item.name);
                return true;
            }
            return false;
        });

        self._items = getItemMap(items);
        subscribeItems(self, items, tokens);
    }

    /**
     * initEnvironmentVariables - initialize environment variables required for condition state resolution
     *
     * @param {ConditionEvaluator} self
     * @param {object[]} tokens subscription tokens
     */
    function initEnvironmentVariables(self, tokens) {
        let environmentVariables = collectOperands(self._condition, "environment");

        //filter duplicates
        environmentVariables = environmentVariables.filter(
            (variable, idx) => environmentVariables.findIndex(({ name }) => name === variable.name) === idx
        );

        self._env = getEnvironmentVariableMap(environmentVariables);
        subscribeEnvironmentVariables(self, environmentVariables, tokens);
    }

    /**
     * Observes and evaluates conditions.
     *
     * @example
const cond = new ConditionObserver({
    type: "condition",
    mode: "AND",
    elements: [
        {
            type: "comparison",
            operator: "in",
            operand1: {
                type: "value"
                value: "admin"
            },
            operand2: {
                type: "environment",
                value: "user.groupList"
            }
        }
    ]
}, (state) => {
    console.log(`Is the current user in group "admin"? ${state ? "yes" : "no"}`);
});

// ... later ...
cond.unlisten();
     */
    module.ConditionObserver = class ConditionObserver {
        /**
         * Constructs and enables a ConditionObserver.
         *
         * @param {object} condition condition configuration
         * @param {function} observerFunc function to call when condition state changes
         */
        constructor(condition, observerFunc) {
            shmi.checkArg("conditions", condition, "object");
            shmi.checkArg("observerFunc", observerFunc, "function");

            this._condition = shmi.cloneObject(condition);
            this._tokens = [];
            this._items = {};
            this._env = {};
            this._active = null;
            this._ready = false;
            this._observerFunc = observerFunc;

            this.init();
        }

        /**
         * Sets up subscriptions and initializes the conditions state. Should
         * not be called manually unless `unlisten` was called before.
         */
        init() {
            initItems(this, this._tokens);
            initEnvironmentVariables(this, this._tokens);
            checkItemsReady(this);
            checkConditionState(this);
        }

        /**
         * Disables subscriptions and resets the internal state.
         */
        unlisten() {
            this._tokens.forEach((token) => token.unlisten());
            this._tokens = [];
            this._items = {};
            this._env = {};
            this._ready = false;
            this._active = null;
        }

        /**
         * Returns the current value of a subscribed item.
         *
         * @param {string} itemName Name of the item to get the value for.
         * @returns {*} Item value or `null` if the item was not found.
         */
        getItemValue(itemName) {
            const item = this._items[itemName];

            return item ? item.value : null;
        }

        /**
         * Returns the current value of a subscribed environment variable.
         *
         * @param {string} itemName Name of the environment variable to get the
         *  value for.
         * @returns {*} Value of the environment variable or `null` if the
         *  environment variable was not found.
         */
        getEnvironmentVariableValue(envName) {
            const env = this._env[envName];

            return env ? env.value : null;
        }

        /**
         * Returns whether or not the internal subscriptions are ready and the
         * ConditionEvaluator is operational.
         */
        get ready() {
            return this._ready;
        }

        /**
         * Returns whether or not the condition is currently active.
         */
        get active() {
            return this._active;
        }
    };
}());

/**
 * Module to use WebIQ Designer node-handles for element lookup.
 *
 * @module visuals/tools/nodes
 *
 */
(function() {
    const MODULE_NAME = "visuals.tools.nodes",
        ENABLE_LOGGING = false,
        RECORD_LOG = false,
        logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG),
        fLog = logger.fLog,
        log = logger.log;

    /** @lends module:visuals/tools/nodes */
    const module = shmi.pkg(MODULE_NAME);

    module.HANDLE_PREFIX = "node-handle:";

    /**
     * getNodeElement - get element corresponding to node handle
     *
     * @param {string} nodeHandle node handle
     * @return {HTMLElement|null} matching element or `null` if none found
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
     * getNodeHandle - get node handle of specified control base element / control instance
     *
     * @param {HTMLElement|object} param html base element or control instance
     * @return {string|null} node handle or `null` if none could be constructed
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

    fLog("module-loaded");
})();

/**
 * Module to implement recipe import/export functionality
 *
 * @module visuals/tools/recipes
 */
(function() {
    const MODULE_NAME = "visuals.tools.recipes",
        /** @lends module:visuals/tools/recipes */
        module = shmi.pkg(MODULE_NAME);

    /**
     * get current timestamp for export filename
     *
     * @return {string} current timestamp in ISO format
     */
    function getTimestamp() {
        return (new Date(Date.now())).toISOString().split(".")[0].replace(/:/g, "-").split("T").join("_");
    }

    /**
     * save export data
     *
     * @param {object[]} exportData recipe data to export
     */
    function saveExport(exportData) {
        const anchor = document.createElement("a");

        anchor.href = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 4))}`;
        anchor.download = `recipe-export_${getTimestamp()}.recipe`;
        anchor.click();
    }

    /**
     * retrieve recipe template data
     *
     * @param {number} templateId recipe template ID
     * @return {Promise<object>} promise resolving to recipe template data
     */
    function getRecipeTemplate(templateId) {
        return new Promise((resolve, reject) => {
            const rm = shmi.requires("visuals.session.RecipeManager");

            rm.getTemplate(templateId, function(response, err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(response);
                }
            });
        });
    }

    /**
     * exportRecipes - export single or all recipes of specified template.
     *
     * @param {stnumberring} templateId recipe template ID
     * @param {number|null} [recipeId=null] recipe ID or `null` to export all recipes of template
     */
    module.exportRecipes = (templateId, recipeId = null) => {
        const EXPORT_ALL = (recipeId === null);

        if (templateId !== null) {
            //list recipes of template ID...
            shmi.visuals.session.RecipeManager.listRecipes(templateId, { include_values: true }, (recResponse, recErr) => {
                if (recErr) {
                    console.error("Error retrieving recipe list: ", recErr);
                    shmi.notify("${ui-action.recipes.import-export.errorRecipeList}", "${V_ERROR}", { message: recErr.message });
                    return;
                }

                if (recResponse.recipes.length === 0) {
                    shmi.notify("${ui-action.recipes.import-export.noRecipesExist}", "${V_NOTIFICATION}");
                    return;
                }

                if (EXPORT_ALL) {
                    //save all recipes...
                    saveExport(recResponse.recipes);
                } else {
                    //find selected recipe...
                    const recipeData = recResponse.recipes.find(({ id }) => id === recipeId);

                    if (recipeData) {
                        //save selected recipe...
                        saveExport([recipeData]);
                    } else {
                        shmi.notify("${ui-action.recipes.import-export.recipeNotFound}", "${V_ERROR}");
                    }
                }
            });
        }
    };

    /**
     * import recipe data from loaded file
     *
     * @param {object} recipeTemplate recipe template data
     * @param {object[]} existingRecipes list of existing recipes
     * @param {object[]} importRecipes list of recipes to import
     * @return {*}
     */
    async function importRecipeData(recipeTemplate, existingRecipes, importRecipes) {
        const promises = [],
            { getDialog } = module.dialog;

        let createRecipes = 0,
            updateRecipes = 0,
            replaceAll = false;

        for (const recipe of importRecipes) {
            const existingRecipe = existingRecipes.find(({ name }) => name === recipe.name);

            if (existingRecipe) {
                let choice = null;
                if (!replaceAll) {
                    //disable check to allow continuous progress through list of recipes & skip following confirmations in case "replace all" is selected
                    // eslint-disable-next-line no-await-in-loop
                    choice = await getDialog(shmi.evalString(shmi.localize("${ui-action.recipes.import-export.dialogMessageReplace}"), { recipe_name: recipe.name }), "${V_CONFIRM_TITLE}", [
                        { name: "yes", label: "${ui-action.recipes.import-export.dialogOptionYes}" },
                        { name: "no", label: "${ui-action.recipes.import-export.dialogOptionNo}" },
                        { name: "all", label: "${ui-action.recipes.import-export.dialogOptionReplaceAll}" }
                    ]);

                    if (choice === "all") {
                        replaceAll = true;
                    }
                }

                if (replaceAll || choice === "yes") {
                    updateRecipes += 1;
                    promises.push(updateRecipe(existingRecipe, recipe));
                }
            } else {
                createRecipes += 1;
                promises.push(createRecipe(recipeTemplate, recipe));
            }
        }

        return Promise.all(promises).then(() => ({ created: createRecipes, updated: updateRecipes }));
    }

    function updateRecipe(existingRecipe, importRecipe) {
        return new Promise((resolve, reject) => {
            const importItems = Object.keys(importRecipe.values);

            existingRecipe.set(null, importRecipe.metadata, false, (err) => {
                if (err) {
                    reject(err);
                } else {
                    const values = {};
                    importItems.forEach((item) => {
                        values[item] = importRecipe.values[item].value;
                    });
                    existingRecipe.write(values, (writeErr) => {
                        if (writeErr) {
                            reject(writeErr);
                        } else {
                            resolve();
                        }
                    });
                }
            });
        });
    }

    /**
     * create new recipe
     *
     * @param {object} recipeTemplate recipe template data
     * @param {object} importRecipe recipe data
     * @return {*}
     */
    function createRecipe(recipeTemplate, importRecipe) {
        return new Promise((resolve, reject) => {
            recipeTemplate.createRecipe(importRecipe.name, importRecipe.metadata, function(createdRecipe, createErr) {
                if (createErr) {
                    reject(createErr);
                } else {
                    const values = {};
                    Object.keys(importRecipe.values).forEach((item) => {
                        values[item] = importRecipe.values[item].value;
                    });
                    createdRecipe.capture(null, (capErr) => {
                        if (capErr) {
                            reject(capErr);
                        } else {
                            createdRecipe.write(values, (writeErr) => {
                                if (writeErr) {
                                    reject(writeErr);
                                } else {
                                    resolve();
                                }
                            });
                        }
                    });
                }
            });
        });
    }

    /**
     * check if meta data type match recipe template
     *
     * @param {string} expectedType expected value type
     * @param {any} value imported value
     * @return {boolean} `true` if type is as expected, `false` else
     */
    function typeMatches(expectedType, value) {
        const type = typeof value;

        switch (expectedType) {
        case "bool":
            if (type !== "boolean") {
                return false;
            }
            break;
        case "int":
            if (type !== "number" || (value % 1 !== 0)) {
                return false;
            }
            break;
        case "double":
            if (type !== "number") {
                return false;
            }
            break;
        case "string":
            if (type !== "string") {
                return false;
            }
            break;
        default:
            return false;
        }

        return true;
    }

    /**
     * check if import data contains valid recipes
     *
     * @param {object[]} importRecipes recipes to import
     * @return {boolean} `true` if contains valid recipes, `false` else
     */
    function recipesValid(importRecipes) {
        if (!Array.isArray(importRecipes)) {
            return false;
        } else {
            const isValid = importRecipes.length && importRecipes.every((recipe) => recipe && typeof recipe === "object" && recipe.metadata && typeof recipe.metadata === "object" && typeof recipe.name === "string" && recipe.values && typeof recipe.values === "object");
            return isValid;
        }
    }

    /**
     * check and fix meta data of imported recipes
     *
     * @param {object} recipeTemplate recipe template
     * @param {object[]} importRecipes recipes to import
     * @return {boolean} `true` if meta data has changed & was fixed, `false` else
     */
    function checkAndFixMeta(recipeTemplate, importRecipes) {
        let fixed = false;

        importRecipes.forEach((recipe) => {
            //check template meta data for existing values...
            Object.entries(recipeTemplate.metadata).forEach(([name, value]) => {
                if (!typeMatches(value.value_type, recipe.metadata[name])) {
                    recipe.metadata[name] = value.default_value;
                    fixed = true;
                }
            });
            //check recipe meta data for additional values...
            Object.keys(recipe.metadata).forEach((name) => {
                if (typeof recipeTemplate.metadata[name] === "undefined") {
                    delete recipe.metadata[name];
                    fixed = true;
                }
            });
        });

        return fixed;
    }

    /**
     * check and fix list of items in imported recipes
     *
     * @param {object} recipeTemplate recipe template
     * @param {object[]} importRecipes recipes to import
     * @return {object} import info
     */
    function checkAndFixItems(recipeTemplate, importRecipes) {
        const missing = [],
            additional = [],
            common = [];

        if (importRecipes.length) {
            //count common & missing items...
            recipeTemplate.items.forEach((item) => {
                if (typeof importRecipes[0].values[item] !== "undefined") {
                    common.push(item);
                } else {
                    missing.push(item);
                }
            });

            //count items not included in current recipe template...
            Object.keys(importRecipes[0].values).forEach((item) => {
                if (!recipeTemplate.items.includes(item)) {
                    additional.push(item);
                }
            });

            //remove items not included in current configuration...
            if (additional.length) {
                importRecipes.forEach((recipe) => {
                    additional.forEach((item) => {
                        delete recipe.values[item];
                    });
                });
            }
        }

        return {
            missing,
            additional,
            common
        };
    }

    /**
     * select file and import contained recipes
     *
     * @param {number} templateId recipe template ID
     * @param {object} recipeTemplate recipe template
     * @param {object[]} existingRecipes list of existing recipes
     */
    function startRecipeImport(templateId, recipeTemplate, existingRecipes) {
        const input = document.createElement("INPUT"),
            { getDialog } = module.dialog;

        input.type = "file";
        input.accept = ".recipe";

        input.onchange = () => {
            if (input.files.length) {
                input.files[0].text().then(async (text) => {
                    try {
                        //parse imported recipe file...
                        const importRecipes = JSON.parse(text);
                        //check if import contains valid recipes...
                        if (!recipesValid(importRecipes)) {
                            shmi.notify("${ui-action.recipes.import-export.errorInvalidRecipes}", "${V_NOTIFICATION}");
                            return;
                        }

                        //check import meta data...
                        const metaFixed = checkAndFixMeta(recipeTemplate, importRecipes);
                        if (metaFixed) {
                            const metaChoice = await getDialog("${ui-action.recipes.import-export.messageMetaChanged}", "${V_CONFIRM_TITLE}", [
                                { name: "yes", label: "${ui-action.recipes.import-export.dialogOptionYes}" },
                                { name: "no", label: "${ui-action.recipes.import-export.dialogOptionNo}" }
                            ]);
                            if (metaChoice === "no") {
                                return;
                            }
                        }

                        //check import recipe items
                        const itemCheck = checkAndFixItems(recipeTemplate, importRecipes);
                        if (itemCheck.common.length === 0) {
                            shmi.notify("${ui-action.recpies.import-export.messageNoCommonItems}");
                            return;
                        }

                        //build message and let user decide how to proceed in case anything changed...
                        if (itemCheck.missing.length || itemCheck.additional.length) {
                            let message = "${ui-action.recipes.import-export.messageItemsChanged}";
                            let detail = "";
                            if (itemCheck.missing.length) {
                                detail += shmi.evalString(shmi.localize("${ui-action.recipes.import-export.messageItemsChangedMissing}"), {
                                    num_missing: itemCheck.missing.length,
                                    list_missing: itemCheck.missing.join(", ")
                                });
                            }
                            if (itemCheck.additional.length) {
                                detail += shmi.evalString(shmi.localize("${ui-action.recipes.import-export.messageItemsChangedAdditional}"), {
                                    num_additional: itemCheck.additional.length,
                                    list_additional: itemCheck.additional.join(", ")
                                });
                            }
                            const itemChoice = await getDialog(shmi.evalString(shmi.localize(message), {
                                message_detail: detail
                            }), "${V_CONFIRM_TITLE}", [
                                { name: "yes", label: "${ui-action.recipes.import-export.dialogOptionYes}" },
                                { name: "no", label: "${ui-action.recipes.import-export.dialogOptionNo}" }
                            ]);

                            if (itemChoice === "no") {
                                return;
                            }
                        }

                        //proceed to import recipe data...
                        importRecipeData(recipeTemplate, existingRecipes, importRecipes).then((info) => {
                            shmi.notify("${ui-action.recipes.import-export.importComplete}", "${V_NOTIFICATION}", info);
                            updateRecipeDataGrids(templateId);
                        }).catch((err) => {
                            shmi.notify("${ui-action.recipes.import-export.errorImport}", "${V_ERROR}", { message: err.message });
                        });
                    } catch (err) {
                        shmi.notify("${ui-action.recipes.import-export.errorImport}", "${V_ERROR}", { message: err.message });
                        console.error("Error importing recipe data:", err.message);
                    }
                });
            }
        };

        input.click();
    }

    /**
     * refresh recipe selection DataGrids after import to update iq-recipe-list / recipe-select widgets
     *
     * @param {number} templateId recipe template ID
     */
    function updateRecipeDataGrids(templateId) {
        const dgm = shmi.requires("visuals.session.DataGridManager");
        Object.keys(dgm.grids).forEach((gn) => {
            const grid = dgm.getGrid(gn);
            if (grid instanceof shmi.visuals.core.DataGridRecipe && grid.recipeTemplateId === templateId) {
                grid.refresh();
            }
        });
    }

    /**
     * refresh recipe selection DataGrids after import to update iq-recipe-list / recipe-select widgets
     *
     * @param {number} templateId recipe template ID
     */
    module.updateRecipeDataGrids = updateRecipeDataGrids;

    /**
     * list recipes of specified recipe template ID
     *
     * @param {number} templateId recipe template ID
     * @return {Promise<object>} promise resolving to recipe list information
     */
    function listRecipes(templateId) {
        const rm = shmi.requires("visuals.session.RecipeManager");
        return new Promise((resolve, reject) => {
            rm.listRecipes(templateId, { include_values: true }, (response, err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(response);
                }
            });
        });
    }

    /**
     * importRecipes - import recipe(s) from user selected file.
     *
     * @param {number} templateId recipe template ID
     */
    module.importRecipes = async (templateId) => {
        if (templateId !== null) {
            let recipeTemplate = null,
                recipeList = null;

            //retrieve recipe template...
            try {
                recipeTemplate = await getRecipeTemplate(templateId);
            } catch (err) {
                console.error("Error retrieving recipe template: " + err.message);
                shmi.notify("${ui-action.recipes.import-export.errorTemplateGet}", "${V_ERROR}", { message: err.message });
                return;
            }

            //list recipes of template ID...
            try {
                recipeList = await listRecipes(templateId);
            } catch (err) {
                console.error("Error retrieving recipe list: " + err.message);
                shmi.notify("${ui-action.recipes.import-export.errorRecipeList}", "${V_ERROR}", { message: err.message });
                return;
            }

            //prompt user for import file selection
            startRecipeImport(templateId, recipeTemplate, recipeList.recipes);
        }
    };
}());
/**
 * Module to implement dialog used for recipe import
 *
 * @module visuals/tools/recipes/dialog
 */
(function() {
    const MODULE_NAME = "visuals.tools.recipes.dialog",
        /** @lends module:visuals/tools/recipes/dialog */
        module = shmi.pkg(MODULE_NAME);

    const CONTROLLER_NAME = "recipe-import-export-dialog";

    const buttonTemplate = {
        "ui": "iq-button",
        "config": {
            "class-name": "iq-button iq-variant-01",
            "template": "default/iq-button.iq-variant-01",
            "action": null,
            "show-text": true,
            "disable-item-lock": false,
            "monoflop": false,
            "monoflop-value": 1,
            "monoflop-interval": 100,
            "name": "iq-button_1",
            "ui": "iq-button",
            "label": "Button 2",
            "item": null,
            "auto-label": true,
            "icon-src": null,
            "icon-title": null,
            "icon-class": null,
            "label-from-item": false,
            "write-bool": false,
            "action-release": null,
            "action-while-pressed": null,
            "interval-while-pressed": null,
            "action-press": null,
            "disable-alarms": false,
            "show-icon": false,
            "on-value": 1,
            "off-value": 0,
            "tooltip": null
        },
        "children": null
    };

    /**
     * build '_controllers_' option for widget configuration
     *
     * @param {string} slot slot name
     * @return {object[]} widget '_controller_' option value
     */
    function getControllerConfig(slot) {
        return [
            {
                name: CONTROLLER_NAME,
                slot: slot
            }
        ];
    }

    /**
     * build configuration for choice buttons
     *
     * @param {object[]} buttons button configuration for displayed choices
     * @param {string} buttons[].name name of choice, will be used as return value
     * @param {string} [buttons[].label] optional button label
     * @param {string} [buttons[].icon] optional display icon path
     * @return {object[]} iq-button configurations used for widget generation of choice buttons
     */
    function getButtonConfigs(buttons) {
        const buttonConfigs = [];
        let invalid = false;
        buttons.forEach((button) => {
            if (typeof button.name === "string" && button.name) {
                const buttonConfig = shmi.cloneObject(buttonTemplate);
                buttonConfig.config._controllers_ = getControllerConfig(`optionButton${button.name}`);
                if (typeof button.label === "string") {
                    buttonConfig.config.label = button.label;
                }
                if (typeof button.icon === "string") {
                    buttonConfig.config["icon-src"] = button.icon;
                    buttonConfig.config["show-icon"] = true;
                }
                buttonConfigs.push(buttonConfig);
            } else {
                invalid = true;
            }
        });

        return invalid ? null : buttonConfigs;
    }

    /**
     * get controller configuration for dialog logic controller
     *
     * @param {object[]} buttons iq-button configuration of choice buttons
     * @param {function} resolve function to resolve created promise for selection dialog
     * @return {object} dialog controller configuration
     */
    function getDialogController(buttons, resolve) {
        const buttonSlots = {};
        buttons.forEach((button) => {
            if (typeof button.name === "string") {
                buttonSlots[`optionButton${button.name}`] = {
                    ui: "iq-button",
                    events: ["click"],
                    optional: true
                };
            }
        });

        return {
            name: CONTROLLER_NAME,
            slots: Object.assign({
                dialog: {
                    ui: "dialog-box",
                    events: ["close"]
                },
                buttonContainer: {
                    ui: "container",
                    optional: true
                }
            }, buttonSlots),
            onChange: function(state, detail) {},
            onEnable: function(state) {

            },
            onDisable: function(state) {

            },
            onEvent: function(state, slot, type, event) {
                switch (slot) {
                case "dialog":
                    if (!state.data.resolved) {
                        state.data.resolved = true;
                        resolve(null);
                    }
                    shmi.deleteControl(state.getInstance("dialog"));
                    break;
                default:
                    if (!state.data.resolved) {
                        state.data.resolved = true;
                        resolve(slot.replace("optionButton", ""));
                        state.getInstance("dialog").hide();
                    }
                }
            },
            data: {
                resolved: false
            }
        };
    }

    /**
     * get configured ui layout for selection dialog
     *
     * @param {string} message dialog message text
     * @param {string} title dialog title text
     * @param {object[]} buttons choice button options
     * @param {function} resolve dialog resolve function
     * @param {function} reject dialog reject function
     * @param {boolean} [allowClose=false] optionally allow display of close button in dialog header
     * @return {object} ui layout for selection dialog
     */
    function getDialogLayout(message, title, buttons, resolve, reject, allowClose = false) {
        const buttonConfigs = getButtonConfigs(buttons);
        if (buttonConfigs === null) {
            reject(new Error("Invalid button configuration."));
            return null;
        }
        return {
            "ui": "dialog-box",
            "config": {
                "name": "messageDialog",
                "class-name": "dialog-box recipe-message-dialog" + (allowClose ? " allow-close" : ""),
                "template": "default/dialog-box",
                "initial-state": "hidden",
                "top-level": true,
                "title": title,
                "content-template": null,
                "tab-limit": true,
                "_controllers_": getControllerConfig("dialog")
            },
            "controller": getDialogController(buttons, resolve),
            "children": [
                {
                    "ui": "container",
                    "config": {
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
                    },
                    "children": [
                        {
                            "ui": "container",
                            "config": {
                                "class-name": "iq-container message-container",
                                "type": "iqflex",
                                "flex-orientation": "column",
                                "flex-none": true,
                                "flex-wrap": false,
                                "flex-primary-align": "start",
                                "flex-secondary-align": "stretch",
                                "flex-line-align": "start",
                                "name": "messageContainer",
                                "template": null
                            },
                            "children": [
                                {
                                    "ui": "iq-text",
                                    "config": {
                                        "class-name": "iq-text iq-variant-01 message-text",
                                        "template": "default/iq-text.iq-variant-01",
                                        "name": "messageText",
                                        "ui": "iq-text",
                                        "text": message,
                                        "items": []
                                    },
                                    "children": null
                                }
                            ]
                        },
                        {
                            "ui": "container",
                            "config": {
                                "class-name": "iq-container button-container",
                                "type": "iqflex",
                                "flex-orientation": "row",
                                "flex-none": true,
                                "flex-wrap": true,
                                "flex-primary-align": "end",
                                "flex-secondary-align": "stretch",
                                "flex-line-align": "start",
                                "name": "buttonContainer",
                                "template": null,
                                "_controllers_": getControllerConfig("buttonContainer")
                            },
                            "children": buttonConfigs
                        }
                    ]
                }
            ]
        };
    }

    /**
     * create configurable selection dialog
     *
     * @param {string} message dialog message text
     * @param {string} title dialog title text
     * @param {object[]} buttons choice button options
     * @param {string} buttons[].name name of choice, will be used as return value
     * @param {string} [buttons[].label] optional button label
     * @param {string} [buttons[].icon] optional display icon path
     * @param {boolean} [allowClose=false] optionally allow display of close button in dialog header
     * @return {Promise<string|null>} promise resolving to choice name or `null` if closed without selection
     */
    module.getDialog = (message, title, buttons, allowClose = false) => new Promise((resolve, reject) => {
        const baseElement = document.querySelector("[data-ui=container]"),
            baseContainer = baseElement ? shmi.getControlByElement(baseElement) : null;

        if (!baseContainer) {
            reject(new Error("Base container element not found."));
        } else {
            const dialogLayout = getDialogLayout(message, title, buttons, resolve, reject, allowClose);
            if (dialogLayout) {
                baseContainer.addControl(dialogLayout, (err, controls) => {
                    if (err) {
                        reject(err);
                    } else {
                        controls[0].show();
                    }
                });
            }
        }
    });
}());
(function() {
    /**
     * UI-Action `change-password` to display the change password dialog for the current user.
     *
     * @version 1.0
     */
    const MODULE_NAME = "visuals.ui-actions.change-password",
        ENABLE_LOGGING = true,
        RECORD_LOG = false,
        logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG),
        fLog = logger.fLog,
        log = logger.log,
        module = shmi.pkg(MODULE_NAME); //eslint-disable-line

    // MODULE CODE - START

    let tokens = [],
        dialog = null;

    function checkValid(refs) {
        var um = shmi.requires("visuals.session.UserManager"),
            currentPwd = null,
            newPwd = null;

        if (refs.newpw.getValue() !== refs.repeatpw.getValue()) {
            shmi.notify("${V_PASSWORD_REPEAT_NOT_EQUAL}");
            return;
        }

        if ((String(refs.newpw.getValue())).length < shmi.c("MIN_PASSWORD_LENGTH")) {
            shmi.notify("${V_PASSWORD_TOO_SHORT}");
            return;
        }
        refs.apply.lock();

        currentPwd = refs.curpw.getValue();
        newPwd = refs.newpw.getValue();
        um.changePassword(currentPwd, newPwd, function(response, status) {
            if (status === 0) {
                dialog.hide();
                deleteDialog();
            } else {
                refs.apply.unlock();
                shmi.addClass(refs.curpw.element, "error");
                shmi.notify("${V_INVALID_PASSWORD}");
            }
        });
    }

    function resetControls(refs) {
        shmi.removeClass(refs.curpw.element, "error");
    }

    function initControls(refs) {
        var ses = shmi.visuals.session,
            um = ses.UserManager;
        refs.username.setValue(um.currentUser.name);
        tokens.push(refs.cancel.listen("click", function() {
            dialog.hide();
            deleteDialog();
        }));
        tokens.push(refs.apply.listen("click", function() {
            resetControls(refs);
            checkValid(refs);
        }));
    }

    function createDialog() {
        if (dialog) {
            return;
        }

        var systemControlConfig = shmi.requires("visuals.session.SysControlConfig"),
            diaConfig = shmi.cloneObject(systemControlConfig.passwordExpiredDialog);
        diaConfig.title = shmi.localize("${V_PASSWORD_CHANGE_TITLE}");
        dialog = shmi.createControl("dialog-box", document.body, diaConfig, 'DIV');

        var enableTok = null;

        function onDialogEnable() {
            if (enableTok) {
                enableTok.unlisten();
                enableTok = null;
            }
            dialog.show();
            var ctrlNames = [
                ".current-user",
                ".current-pwd",
                ".new-pwd",
                ".repeat-pwd",
                ".apply-btn",
                ".cancel-btn"
            ];
            ctrlNames.forEach(function(cn, idx) {
                ctrlNames[idx] = dialog.getName() + " " + cn;
            });
            shmi.onEnable(ctrlNames, function(refs) {
                initControls({
                    username: refs[ctrlNames[0]],
                    curpw: refs[ctrlNames[1]],
                    newpw: refs[ctrlNames[2]],
                    repeatpw: refs[ctrlNames[3]],
                    apply: refs[ctrlNames[4]],
                    cancel: refs[ctrlNames[5]]
                });
            });
        }

        if (dialog.isActive()) {
            onDialogEnable();
        } else {
            enableTok = dialog.listen("enable", onDialogEnable);
        }

        dialog.enable();
    }

    function deleteDialog() {
        shmi.deleteControl(dialog);
        tokens.forEach(function(t) {
            t.unlisten();
        });
        tokens = [];
        dialog = null;
    }

    //get reference to sysActions object
    const ua = shmi.pkg("visuals.session.sysActions");
    //register function to ui-action property "change-password"
    ua["change-password"] = createDialog;

    // MODULE CODE - END

    fLog("module loaded");
})();

/**
 * UI-Action 'composite-placeholders'.
 *
 * Description:
 * UI-Action to dynamically change values of composite placeholders at runtime
 */
(function() {
    const actions = shmi.pkg("visuals.session.sysActions"), //get reference to userActions object
        UI_ACTION_NAME = "composite-placeholders"; //name of ui-action

    /**
     * getGroupMeta - get meta data for specified group ID
     *
     * @param {string} groupId group ID
     * @return {object} group meta data or `null` if not found
     */
    function getGroupMeta(groupId) {
        return shmi.visuals.session.groupConfig[groupId] || null;
    }

    /**
     * setPlaceholder - set placeholder value
     *
     * @param {object} replacers placeholder value map
     * @param {string} name placeholder name
     * @param {object} parameter placeholder modification paramter
     */
    function setPlaceholder(replacers, name, parameter) {
        if (parameter && typeof parameter === "object") {
            switch (parameter.type) {
            case "set":
                replacers[name] = parameter.value;
                break;
            case "inc":
                if (typeof replacers[name] === "undefined") {
                    replacers[name] = parameter.limit;
                } else if (typeof replacers[name] === "number") {
                    if (typeof parameter.limit === "number" && !((parameter.value > 0 && parameter.value + replacers[name] <= parameter.limit) || (parameter.value < 0 && parameter.value + replacers[name] >= parameter.limit))) {
                        return;
                    }
                    replacers[name] += parameter.value;
                } else {
                    console.warn(`[UiAction '${UI_ACTION_NAME}'] Cannot increment placeholder '${name}' of type '${typeof replacers[name]}' ('number' required).`);
                }
                break;
            case "toggle":
                if (typeof replacers[name] === "undefined") {
                    replacers[name] = true;
                } else if (typeof replacers[name] === "boolean") {
                    replacers[name] = !replacers[name];
                } else {
                    console.warn(`[UiAction '${UI_ACTION_NAME}'] Cannot toggle placeholder '${name}' of type '${typeof replacers[name]}' ('boolean' required).`);
                }
                break;
            default:
                console.warn(`[UiAction '${UI_ACTION_NAME}'] Invalid parameter type for placeholder '${name}':`, parameter.type);
            }
        }
    }

    /**
     * UI-Action 'composite-placeholders' implementation
     *
     * @params {any[]} parameters  configured ui-action parameters
     * @params {string} parameters[0] node handle for instance lookup
     * @params {object} parameters[1] value map of placeholders to set
     */
    actions[UI_ACTION_NAME] = function(parameters) {
        if (!(typeof parameters[0] === "string" && parameters[1] && typeof parameters[1] === "object")) {
            console.error("Invalid parameters, expected [{string}, {object}]");
            return;
        }

        const instance = shmi.ctrl(parameters[0]),
            replacerValues = parameters[1];

        if (instance) {
            const iter = shmi.requires("visuals.tools.iterate").iterateObject,
                config = instance.getConfig();

            if (!config.replacers) {
                config.replacers = {};
            }

            if (config.groupId) {
                //define unconfigured placeholders with group defaults
                const groupMeta = getGroupMeta(config.groupId);
                if (groupMeta && Array.isArray(groupMeta.replacers)) {
                    groupMeta.replacers.forEach((replacer) => {
                        if (typeof config.replacers[replacer.id] === "undefined") {
                            config.replacers[replacer.id] = replacer.default;
                        }
                    });
                }
            }

            iter(replacerValues, (val, prop) => {
                setPlaceholder(config.replacers, prop, val);
            });

            //delete old instance, keep base element
            shmi.deleteControl(instance, false);

            //cleanup base element
            instance.element.removeAttribute("data-config-name");
            instance.element.removeAttribute("data-name");
            instance.element.innerHTML = "";

            //create new instance from base element
            shmi.createControl("group", instance.element, config, "DIV", "from");
        } else {
            console.warn(`[UiAction '${UI_ACTION_NAME}'] composite instance not found:`, parameters[0]);
        }
    };
}());
(function() {
    /**
     * UI-Action `increment-item-value` for incrementing and decrementing an
     * item's value.
     *
     * @version 1.0
     */
    var MODULE_NAME = "visuals.ui-actions.inc-dec-item",
        fLog = console.error.bind(console, "[" + MODULE_NAME + "]"),
        log = console.log.bind(console, "[" + MODULE_NAME + "]"),
        module = shmi.pkg(MODULE_NAME); //eslint-disable-line

    // MODULE CODE - START

    /**
     * Map containing offsets of running operations. Used to aggregate multiple
     * uiAction calls.
     */
    const itemOffsets = {};

    /**
     * Starts the compare and exchange operation for the given item. May
     * retry incrementing the items value by the given offset.
     *
     * @private
     * @param {Item} item Reference to the parent item
     * @param {number} expected Value
     * @param {number} offset Offset added to the items value
     * @param {object} subState subscriber state reference object
     */
    function startCompareExchange(item, expected, offset, subState) {
        let desired;

        if (offset === 0) {
            // Nothing to do.
            stopSubscription(subState);
        } else if (expected === null || typeof expected === "undefined") {
            expected = item.readValue(true);
        }

        desired = expected + offset;

        if (item.virtual) {
            if (item.writable) {
                item.writeValue(desired, true);
            }
            stopSubscription(subState);
        } else {
            item.compareExchange(expected, desired, function cmpxchgCb(response, retry, err) {
                if (retry) {
                    // cmpxchg failed - retry. Also update the offset because
                    // it might've changed due to another ui action call.
                    startCompareExchange(item, response, itemOffsets[subState.itemAlias], subState);
                } else if (err) {
                    // We failed so abandon everything.
                    fLog("failed to increment item", err);
                    stopSubscription(subState);
                } else {
                    // We finished writing our previous value so update the
                    // offset and continue working in case we did not hit
                    // 0.
                    itemOffsets[subState.itemAlias] -= offset;
                    if (itemOffsets[subState.itemAlias] === 0) {
                        stopSubscription(subState);
                    } else {
                        // There's another offset to process.
                        startCompareExchange(item, desired, itemOffsets[subState.itemAlias], subState);
                    }
                }
            });
        }
    }

    /**
     * getCompleteCallback - create callback function to unsubscribe provided token when called
     *
     * @param {object} subState subscriber state reference object
     * @returns {undefined}
     */
    function stopSubscription(subState) {
        if (shmi.objectHasOwnProperty(itemOffsets, subState.itemAlias)) {
            delete itemOffsets[subState.itemAlias];
        }

        // decouple to make sure subState.token has been set
        shmi.decouple(function() {
            if (subState.token) {
                subState.token.unlisten();
                subState.token = null;
            }
        });
    }

    function doAtomicAdd(itemAlias, offset) {
        const im = shmi.requires("visuals.session.ItemManager"),
            subState = {
                itemAlias: itemAlias,
                token: null
            };

        if (shmi.objectHasOwnProperty(itemOffsets, itemAlias)) {
            itemOffsets[itemAlias] += offset;

            // We're done - the there is already an operation underway that
            // will pick up the new offset and do everything for us.
            return;
        } else {
            itemOffsets[itemAlias] = offset;
        }

        let propertiesSet = false,
            item = null,
            inProgress = false;

        subState.token = im.subscribeItem(itemAlias, {
            setProperties: function setProperties(min, max, step, name, type) {
                if (propertiesSet) {
                    return;
                } else if (typeof type !== "number") {
                    return;
                }

                const typeIsCompatible = type === shmi.c("TYPE_INT") || type === shmi.c("TYPE_FLOAT");

                if (typeIsCompatible) {
                    item = im.getItem(itemAlias);
                }
                propertiesSet = true;

                if (!item) {
                    if (!typeIsCompatible) {
                        fLog("Attempted to increment item value of non-numerical type:", itemAlias);
                    } else {
                        fLog("Attempted to increment non-existing item:", itemAlias);
                    }
                    stopSubscription(subState);
                }
            },
            setValue: function setValue(value) {
                if (propertiesSet && item && !inProgress) {
                    inProgress = true;
                    startCompareExchange(item, value, offset, subState);
                }
            }
        });
    }

    /**
     * Entrypoint of the `increment-item-value` uiAction.
     *
     * @param {any[]} parameters
     * @param {string} parameters[0] item alias
     * @param {number} parameters[1] increment value
     */
    function doIncrement(parameters) {
        if (!Array.isArray(parameters)) {
            fLog("This ui-actions' parameters must be given as an array.");
            return;
        } else if (parameters.length !== 2) {
            fLog("This ui-action requires exactly 2 parameters: item, offset.");
            return;
        } else if (typeof parameters[0] !== "string") {
            fLog("The first parameter (item) must be a string.");
            return;
        } else if (typeof parameters[1] !== "number") {
            fLog("The second parameter (offset) must be a number.");
            return;
        }

        doAtomicAdd(parameters[0], parameters[1]);
    }

    // get reference to sysActions object
    var ua = shmi.pkg("visuals.session.sysActions");
    // register function to ui-action property "increment-item-value" and
    // "decrement-item-value".
    ua["increment-item-value"] = doIncrement;

    // MODULE CODE - END

    log("module loaded");
})();

(function() {
    /**
     * UI-Action `recipe-add` to create new recipes from recipe template configured in recipe-select control.
     *
     * @version 1.0
     */
    const MODULE_NAME = "visuals.ui-actions.recipe-add",
        ENABLE_LOGGING = true,
        RECORD_LOG = false,
        logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG),
        fLog = logger.fLog,
        log = logger.log,
        module = shmi.pkg(MODULE_NAME); //eslint-disable-line

    // MODULE CODE - START

    /**
     * addRecipe - add new recipe
     *
     * @param  {array} parameters ui-action parameters
     * @return {undefined}
     */
    function addRecipe(parameters) {
        const rm = shmi.requires("visuals.session.RecipeManager");
        let recipeSelect = null;

        if (Array.isArray(parameters) && typeof parameters[0] === "string") {
            recipeSelect = shmi.ctrl(parameters[0]);
            if (recipeSelect) {
                const RECIPE_TEMPLATE = recipeSelect.getTemplate();
                if (typeof RECIPE_TEMPLATE === "number") {
                    rm.getTemplate(RECIPE_TEMPLATE, function(recipeTemplate, err) {
                        if (err) {
                            shmi.notify("${ui-action.recipe-add.error.fetchTemplate}", "${V_ERROR}", {
                                ERROR_CODE: err.errc,
                                ERROR_MSG: err.message,
                                ERROR_CAT: err.category
                            });
                        } else {
                            const editModule = shmi.requires("recipe-controller.ls.recipe-name");
                            editModule.getRecipeName(RECIPE_TEMPLATE, function(recipeName) {
                                if (recipeName !== null) {
                                    recipeTemplate.createRecipe(recipeName, {}, function(recipe, createErr) {
                                        if (createErr) {
                                            shmi.notify("${ui-action.recipe-add.error.createRecipe}", "${V_ERROR}", {
                                                ERROR_CODE: createErr.errc,
                                                ERROR_MSG: createErr.message,
                                                ERROR_CAT: createErr.category
                                            });
                                        } else {
                                            recipe.capture(null, function(captErr) {
                                                if (captErr) {
                                                    shmi.notify("${ui-action.recipe-add.error.createRecipe}", "${V_ERROR}", {
                                                        ERROR_CODE: err.errc,
                                                        ERROR_MSG: err.message,
                                                        ERROR_CAT: err.category
                                                    });
                                                } else {
                                                    shmi.requires("visuals.tools.recipes").updateRecipeDataGrids(RECIPE_TEMPLATE);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    shmi.notify("${ui-action.recipe-add.error.noTemplateConfigured}", "${V_ERROR}");
                }
            } else {
                shmi.notify("${ui-action.recipe-add.error.recipeSelectNotFound}", "${V_ERROR}", {
                    CONTROL_NAME: parameters[0]
                });
            }
        } else {
            console.error("ui-action 'recipe-add' first parameter must be of type 'string'");
        }
    }

    //get reference to sysActions object
    const ua = shmi.pkg("visuals.session.sysActions");
    //register function to ui-action property "recipe-add"
    ua["recipe-add"] = addRecipe;

    // MODULE CODE - END

    fLog("module loaded");
})();

(function() {
    /**
     * UI-Action `recipe-apply` to apply a recipe selected by recipe-select control.
     *
     * @version 1.0
     */
    var MODULE_NAME = "visuals.ui-actions.recipe-apply",
        ENABLE_LOGGING = true,
        RECORD_LOG = false,
        logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG),
        fLog = logger.fLog,
        log = logger.log,
        module = shmi.pkg(MODULE_NAME); //eslint-disable-line

    // MODULE CODE - START

    function doApply(recipe) {
        recipe.apply(function(response, applyErr) {
            if (applyErr) {
                shmi.notify("${ui-action.recipe-apply.error.applyRecipe}", "${V_ERROR}", {
                    ERROR_CODE: applyErr.errc,
                    ERROR_MSG: applyErr.message,
                    ERRROR_CAT: applyErr.category
                });
            }
        });
    }

    /**
     * applyRecipe - apply captured values from recipe to items
     *
     * @param  {array} parameters ui-action parameters
     * @return {undefined}
     */
    function applyRecipe(parameters) {
        var rm = shmi.requires("visuals.session.RecipeManager"),
            recipeSelect = null,
            selection = null;
        if (Array.isArray(parameters) && typeof parameters[0] === "string") {
            const [ctrlName, skipConfirm] = parameters;

            recipeSelect = shmi.ctrl(ctrlName);
            if (recipeSelect) {
                selection = recipeSelect.getValue();
                if (selection && typeof selection.recipe_id === "number") {
                    rm.getRecipe(selection.recipe_id, function(recipe, err) {
                        if (!err) {
                            if (skipConfirm) {
                                doApply(recipe);
                            } else {
                                shmi.confirm("${ui-action.recipe-add.confirm.applyRecipe}", function(confirmed) {
                                    if (confirmed) {
                                        doApply(recipe);
                                    }
                                });
                            }
                        } else {
                            shmi.notify("${ui-action.recipe-apply.error.fetchRecipe}", "${V_ERROR}", {
                                ERROR_CODE: err.errc,
                                ERROR_MSG: err.message,
                                ERRROR_CAT: err.category
                            });
                        }
                    });
                } else {
                    shmi.notify("${ui-action.recipe-apply.error.noRecipeSelected}", "${V_ERROR}");
                }
            } else {
                shmi.notify("${ui-action.recipe-apply.error.recipeSelectNotFound}", "${V_ERROR}", {
                    CONTROL_NAME: ctrlName
                });
            }
        } else {
            console.error("ui-action 'recipe-apply' first parameter must be of type 'string'");
        }
    }

    //get reference to sysActions object
    var ua = shmi.pkg("visuals.session.sysActions");
    //register function to ui-action property "recipe-apply"
    ua["recipe-apply"] = applyRecipe;

    // MODULE CODE - END

    fLog("module loaded");
})();

(function() {
    /**
     * UI-Action `recipe-capture` to capture item valutes to a recipe selected by recipe-select control.
     *
     * @version 1.0
     */
    var MODULE_NAME = "visuals.ui-actions.recipe-capture",
        ENABLE_LOGGING = true,
        RECORD_LOG = false,
        logger = shmi.requires("visuals.tools.logging").createLogger(MODULE_NAME, ENABLE_LOGGING, RECORD_LOG),
        fLog = logger.fLog,
        log = logger.log,
        module = shmi.pkg(MODULE_NAME); //eslint-disable-line

    // MODULE CODE - START

    /**
     * doCapture - capture to recipe & show error message when failed
     *
     * @param  {object} recipe recipe object
     * @return {undefined}
     */
    function doCapture(recipe) {
        recipe.capture(null, function(err) {
            if (err) {
                shmi.notify("${ui-action.recipe-capture.error.captureRecipe}", "${V_ERROR}", {
                    ERROR_CODE: err.errc,
                    ERROR_MSG: err.message,
                    ERROR_CAT: err.category
                });
            }
        });
    }

    /**
     * captureRecipe - capture item values to recipe
     *
     * @param  {array} parameters ui-action parameters
     * @return {undefined}
     */
    function captureRecipe(parameters) {
        var rm = shmi.requires("visuals.session.RecipeManager"),
            recipeSelect = null,
            selection = null;
        if (Array.isArray(parameters) && typeof parameters[0] === "string") {
            recipeSelect = shmi.ctrl(parameters[0]);
            if (recipeSelect) {
                selection = recipeSelect.getValue();
                if (selection) {
                    if (typeof selection.recipe_id === "number") {
                        rm.getRecipe(selection.recipe_id, function(recipe, err) {
                            if (!err) {
                                if (typeof recipe.versionId === "number") {
                                    shmi.confirm("${ui-action.recipe-capture.confirm.captureRecipe}", function(confirmed) {
                                        if (confirmed) {
                                            doCapture(recipe);
                                        }
                                    });
                                } else {
                                    doCapture(recipe);
                                }
                            } else {
                                shmi.notify("${ui-action.recipe-capture.error.fetchRecipe}", "${V_ERROR}", {
                                    ERROR_CODE: err.errc,
                                    ERROR_MSG: err.message,
                                    ERROR_CAT: err.category
                                });
                            }
                        });
                    }
                } else {
                    shmi.notify("${ui-action.recipe-apply.error.noRecipeSelected}", "${V_ERROR}", {
                        CONTROL_NAME: parameters[0]
                    });
                }
            } else {
                shmi.notify("${ui-action.recipe-capture.error.recipeSelectNotFound}", "${V_ERROR}", {
                    CONTROL_NAME: parameters[0]
                });
            }
        } else {
            console.error("ui-action 'recipe-capture' first parameter must be of type 'string'");
        }
    }

    //get reference to sysActions object
    var ua = shmi.pkg("visuals.session.sysActions");
    //register function to ui-action property "recipe-capture"
    ua["recipe-capture"] = captureRecipe;

    // MODULE CODE - END

    fLog("module loaded");
})();

/**
 * Custom UI-Action 'recipe-export'.
 *
 * Description:
 * Export recipe data to downloadable file
 */
(function() {
    /**
     * UI-Action 'recipe-export' implementation
     *
     * @params {any[]} parameters  configured ui-action parameters
     *
     */
    function exportRecipe(parameters) {
        const EXPORT_ALL = parameters[1],
            RECIPE_SELECTION_WIDGET = parameters[0],
            recipes = shmi.requires("visuals.tools.recipes");

        const rSelect = shmi.ctrl(RECIPE_SELECTION_WIDGET);

        if (!rSelect) {
            shmi.notify("${ui-action.recipes.import-export.widgetNotFound}", "${V_ERROR}");
            return;
        }

        const RECIPE_TEMPLATE = rSelect.getTemplate();
        if (typeof RECIPE_TEMPLATE !== "number") {
            shmi.notify("${ui-action.recipes.import-export.templateNotConfigured}", "${V_ERROR}");
            return;
        }

        if (!EXPORT_ALL) {
            const recipeId = rSelect.getValue() ? rSelect.getValue().recipe_id : null;
            if (recipeId === null) {
                shmi.notify("${ui-action.recipes.import-export.noRecipeSelected}", "${V_NOTIFICATION}");
                return;
            }

            recipes.exportRecipes(RECIPE_TEMPLATE, recipeId);
        } else {
            recipes.exportRecipes(RECIPE_TEMPLATE, null);
        }
    }

    shmi.pkg("visuals.session.sysActions")["recipe-export"] = exportRecipe;
}());
/**
 * Custom UI-Action 'recipe-import'.
 *
 * Description:
 * Import recipe data from file
 */
(function() {
    /**
     * UI-Action 'recipe-import' implementation
     *
     * @params {any[]} parameters  configured ui-action parameters
     *
     */
    function importRecipe(parameters) {
        const RECIPE_SELECTION_WIDGET = parameters[0],
            recipes = shmi.requires("visuals.tools.recipes");

        const rSelect = shmi.ctrl(RECIPE_SELECTION_WIDGET);
        if (!rSelect) {
            shmi.notify("${ui-action.recipes.import-export.widgetNotFound}", "${V_ERROR}");
            return;
        }

        const RECIPE_TEMPLATE = rSelect.getTemplate();
        if (typeof RECIPE_TEMPLATE !== "number") {
            shmi.notify("${ui-action.recipes.import-export.templateNotConfigured}", "${V_ERROR}");
            return;
        }

        recipes.importRecipes(RECIPE_TEMPLATE);
    }

    shmi.pkg("visuals.session.sysActions")["recipe-import"] = importRecipe;
}());
/**
 * UI-Action 'unitclass-adapter'.
 *
 * Description:
 * Switches all unitclasses to use the specified adapter index (if available).
 */
(function() {
    const storageIdentifier = "webiq-app-settings",
        unitClassSettingName = "unitclass-adapter-index";

    /**
     * update active unitclass adapter index for all unitclasses
     *
     * @param {number} adapterIndex unitclass adapter index
     */
    function updateAdapters(adapterIndex) {
        const uc = shmi.requires("visuals.tools.unitClasses"),
            unitClasses = uc.getUnitClasses();

        unitClasses.forEach((unitClass) => {
            const unitClassId = unitClass.unitClass,
                adapters = unitClass.adapters;

            if (adapters[adapterIndex]) {
                uc.setUnitClassAdapter(unitClassId, adapters[adapterIndex].name);
            }
        });
    }

    /**
     * retrieve app specific settings from local storage
     *
     * @param {string} appName app name
     * @return {object} app settings
     */
    function getAppSettings(appName) {
        const appSettingsData = localStorage.getItem(storageIdentifier);
        let globalAppSettings = {};
        if (appSettingsData !== null) {
            try {
                globalAppSettings = JSON.parse(appSettingsData);
            } catch (err) {
                console.error("Error parsing WebIQ app settings from local storage:", err);
            }
        }

        const appSettings = globalAppSettings[appName] || {};
        return appSettings;
    }

    /**
     * update app specific setting
     *
     * @param {string} appName app name
     * @param {string} settingName setting property name
     * @param {any} settingValue value of setting
     */
    function updateAppSetting(appName, settingName, settingValue) {
        const globalSettingsData = localStorage.getItem(storageIdentifier);
        let globalAppSettings = {};

        if (globalSettingsData !== null) {
            try {
                globalAppSettings = JSON.parse(globalSettingsData);
            } catch (err) {
                console.error("Error parsing WebIQ app settings from local storage:", err);
            }
        }

        const appSettings = globalAppSettings[appName] || {};

        appSettings[settingName] = settingValue;
        globalAppSettings[appName] = appSettings;

        localStorage.setItem(storageIdentifier, JSON.stringify(globalAppSettings, null, 4));
    }

    /**
     * UI-Action 'unitclass-adapter' implementation
     *
     * @params {any[]} parameters  configured ui-action parameters
     * @params {number} parameters[0] unitclass adapter index
     *
     */
    function unitclassAdapter(parameters) {
        const adapterIndex = parameters[0],
            appName = shmi.visuals.session.project || shmi.visuals.session.current_project; //fallback to current_project for designer

        if (typeof adapterIndex !== "number" || adapterIndex < 0 || adapterIndex % 1 !== 0) {
            console.error(`Invalid unitclass adapter index '${adapterIndex}' specified. Must be an integer value >= 0.`);
            return;
        }
        updateAdapters(adapterIndex);

        if (appName) {
            updateAppSetting(appName, unitClassSettingName, adapterIndex);
        }
    }

    //restore configured unitclass adapter index from localStorage
    shmi.listen("login-state", () => {
        const appName = shmi.visuals.session.project || shmi.visuals.session.current_project; //fallback to current_project for designer

        if (appName) {
            const appSettings = getAppSettings(appName),
                adapterIndex = typeof appSettings[unitClassSettingName] === "number" ? appSettings[unitClassSettingName] : null;

            if (adapterIndex !== null && adapterIndex >= 0) {
                updateAdapters(adapterIndex);
            }
        }
    }, { "detail.loggedIn": true });

    shmi.pkg("visuals.session.sysActions")["unitclass-adapter"] = unitclassAdapter;
}());
(function() {
    /**
     * UI-Action `write-item-bitmask` for setting and clearing bits in an items value using bitmasks.
     *
     * @version 1.0
     */
    var MODULE_NAME = "visuals.ui-actions.write-item-bitmask",
        fLog = console.error.bind(console, "[" + MODULE_NAME + "]"),
        log = console.log.bind(console, "[" + MODULE_NAME + "]"),
        module = shmi.pkg(MODULE_NAME); //eslint-disable-line

    // MODULE CODE - START

    /**
     * Starts the compare and exchange operation for the given bit item. May
     * automatically retry setting or clearing the items bits.
     *
     * @private
     * @param {Item} item Reference to the parent item
     * @param {*} expected Value
     * @param {string} op Type of operation to perform
     * @param {number} mask Bitmask to use with the given operation
     * @param {object} subState subscriber state reference object
     */
    function startBitwiseOperation(item, expected, op, mask, subState) {
        var desired;

        if (expected === null || typeof (expected) === "undefined") {
            expected = item.readValue(true);
        }

        switch (op) {
        case "set":
            desired = expected | mask;
            break;
        case "clear":
            desired = expected & (~mask);
            break;
        default:
            fLog("Invalid bitwise operation", op);
            return;
        }

        if (desired === expected) {
            // Nothing to do.
            return;
        }

        if (item.virtual) {
            if (item.writable) {
                item.writeValue(desired, true);
            }
            stopSubscription(subState);
        } else {
            item.compareExchange(expected, desired, function cmpxchgCb(response, retry, err) {
                if (retry) {
                    startBitwiseOperation(item, response, op, mask, subState);
                } else {
                    if (err) {
                        fLog("failed to apply bitmask", err);
                    }
                    stopSubscription(subState);
                }
            });
        }
    }

    /**
     * getCompleteCallback - create callback function to unsubscribe provided token when called
     *
     * @param {object} subState subscriber state reference object
     * @returns {undefined}
     */
    function stopSubscription(subState) {
        //decouple to make sure subState.token has been set
        shmi.decouple(function() {
            if (subState.token) {
                subState.token.unlisten();
                subState.token = null;
            }
        });
    }

    /**
     * Entrypoint for the `write-item-bitmask` ui-action.
     *
     * @param  {array} parameters ui-action parameters
     */
    function doItemBitOp(parameters) {
        if (!Array.isArray(parameters)) {
            fLog("This ui-actions' parameters must be given as an array.");
            return;
        } else if (parameters.length !== 3) {
            fLog("This ui-action requires exactly 3 parameters: item, operation, bitmask.");
            return;
        } else if (typeof parameters[0] !== "string") {
            fLog("The first parameter (item) must be a string.");
            return;
        } else if (parameters[1] !== "set" && parameters[1] !== "clear") {
            fLog("The second parameter (operation) must be either 'set' or 'clear'.");
            return;
        } else if (!Number.isInteger(parameters[2])) {
            fLog("The second parameter (bitmask) must be an integer.");
            return;
        }

        var im = shmi.requires("visuals.session.ItemManager");

        var item = null,
            op = parameters[1],
            mask = parseInt(parameters[2]),
            subState = {
                token: null
            },
            sub = im.getItemHandler(),
            itemExists = false,
            propertiesSet = false,
            inProgress = false;

        sub.setProperties = function setProperties(min, max, step, name, type) {
            if (propertiesSet) {
                return;
            }

            if (typeof type === "number") {
                if (type !== -1) {
                    item = im.getItem(parameters[0]);
                    if (item) {
                        itemExists = true;
                    }
                }
                propertiesSet = true;

                if (!itemExists) {
                    fLog("Attempted to use bit operation on non-existing item:", parameters[0]);
                    stopSubscription(subState);
                }
            }
        };
        sub.setValue = function setValue(value) {
            if (propertiesSet && itemExists && !inProgress) {
                inProgress = true;
                startBitwiseOperation(item, null, op, mask, subState);
            }
        };
        subState.token = im.subscribeItem(parameters[0], sub);
    }

    //get reference to sysActions object
    var ua = shmi.pkg("visuals.session.sysActions");
    //register function to ui-action property "write-item-bitmask"
    ua["write-item-bitmask"] = doItemBitOp;

    // MODULE CODE - END

    log("module loaded");
})();

/* default handler for notifications */
(function() {
    var notificationQueue = [],
        dialog = null,
        onKeyPress;

    function createDialog() {
        var msg,
            title,
            param,
            currentEvent = notificationQueue[0];
        msg = currentEvent.detail.message;
        title = currentEvent.detail.title;
        param = currentEvent.detail.param;
        var systemControlConfig = shmi.requires("visuals.session.SysControlConfig"),
            diaConfig = shmi.cloneObject(systemControlConfig.notificationDialog);
        diaConfig.title = title || diaConfig.title;
        diaConfig.title = shmi.evalString(shmi.localize(diaConfig.title), param);
        msg = shmi.evalString(shmi.localize(msg), param);
        dialog = shmi.createControl("dialog-box", document.body, diaConfig, 'DIV');
        var closeTok = dialog.listen("close", function(evt) {
            closeTok.unlisten();
            deleteDialog(evt);
            shmi.fire("notification-dismissed", { param: param, timestamp: Date.now() }, shmi.visuals.session);
        });
        var enableTok = null;

        // Closing notification on ESC
        onKeyPress = function(e) {
            if (e.code === "Escape") {
                closeTok.unlisten();
                deleteDialog(e);
                shmi.fire("notification-dismissed", { param: param, timestamp: Date.now() }, shmi.visuals.session);
            }
        };

        function onDialogEnable() {
            if (enableTok) {
                enableTok.unlisten();
                enableTok = null;
            }
            var notificationTextElement = shmi.getElementByName('notification-text', dialog.element);
            if (notificationTextElement) {
                notificationTextElement.textContent = msg;
            }

            dialog.listen('open', function() {
                var tabElem = dialog.element.querySelector('[data-ui=button]');
                if (tabElem) {
                    tabElem.focus();
                }
            });

            dialog.element.addEventListener('keyup', onKeyPress);

            dialog.show();
        }

        if (dialog.isActive()) {
            onDialogEnable();
        } else {
            enableTok = dialog.listen("enable", onDialogEnable);
        }

        dialog.enable();
    }

    function deleteDialog() {
        dialog.element.removeEventListener('keyup', onKeyPress);
        shmi.deleteControl(dialog);
        dialog = null;
        notificationQueue.shift(); //remove handle event
        shmi.decouple(function() {
            if (notificationQueue.length) {
                createDialog();
            }
        });
    }

    function defaultNotificationHandler(event) {
        try {
            shmi.requires("visuals.controls.Button");
            shmi.requires("visuals.controls.DialogBox");
        } catch (exc) {
            console.log("error trying to load controls: Button, DialogBox\n" + exc);
            return;
        }
        notificationQueue.push(event);
        if (notificationQueue.length === 1) {
            createDialog();
        }
    }

    var module = shmi.pkg("visuals.handler.default.notification"),
        notificationToken = null;

    module.register = function() {
        if (notificationToken) {
            console.debug("notification handler was active!");
            notificationToken.unlisten();
            notificationToken = null;
        }
        notificationToken = shmi.listen('notification', defaultNotificationHandler);
    };

    module.deregister = function() {
        if (!notificationToken) {
            console.debug("notification handler not active!");
        } else {
            notificationToken.unlisten();
            notificationToken = null;
        }
    };
}());

/* default handler for confirmations */
(function() {
    var confirmationQueue = [],
        dialog = null,
        callback = null,
        tokens = [];

    function getFuncBtn(controls, func) {
        var ret = null;
        if (Array.isArray(controls)) {
            for (var i = 0; i < controls.length; i++) {
                if (controls[i].element.getAttribute('data-function') === func) {
                    ret = controls[i];
                    break;
                } else if (Array.isArray(controls[i].controls)) {
                    ret = getFuncBtn(controls[i].controls, func);
                    if (ret) {
                        break;
                    }
                }
            }
        }
        return ret;
    }

    // close dialog as denied when pressing ESC
    function getOnKeyPress(state) {
        return function onKeypRess(e) {
            if (e.code === "Escape" && callback) {
                state.cbExecuted = true;
                runCallbackDelayed(callback, false);

                dialog.hide();
                deleteDialog(state);
            }
        };
    }

    function runCallbackDelayed(cb, vars) {
        shmi.decouple(function() {
            try {
                cb(vars);
            } catch (exc) {
                console.error("exception running shmi.confirm callback:", exc);
            }
        });
    }

    function createDialog() {
        var msg,
            title,
            param,
            currentEvent = confirmationQueue[0];
        msg = currentEvent.detail.message;
        title = currentEvent.detail.title;
        param = currentEvent.detail.param;
        callback = currentEvent.detail.callback;

        var systemControlConfig = shmi.requires("visuals.session.SysControlConfig"),
            diaConfig = shmi.cloneObject(systemControlConfig.confirmDialog);
        diaConfig.title = title || diaConfig.title;
        diaConfig.title = shmi.evalString(shmi.localize(diaConfig.title), param);
        msg = shmi.evalString(shmi.localize(msg), param);
        dialog = shmi.createControl("dialog-box", document.body, diaConfig, 'DIV');

        var enableTok = null,
            confirmBtn = null,
            denyBtn = null;

        function onDialogEnable() {
            let state = {
                cbExecuted: false,
                keyHandler: null
            };

            if (enableTok) {
                enableTok.unlisten();
                enableTok = null;
            }
            var confirmationTextElement = shmi.getElementByName('confirm-text', dialog.element);
            if (confirmationTextElement) {
                confirmationTextElement.textContent = msg;
            }

            confirmBtn = getFuncBtn(dialog.controls, "confirm");
            if (!confirmBtn) {
                console.error("confirm button missing in confirmation-dialog");
                callback(false);
                deleteDialog(state);

                return;
            }

            denyBtn = getFuncBtn(dialog.controls, "deny");
            if (!denyBtn) {
                console.error("deny button missing in confirmation-dialog");
                callback(false);
                deleteDialog(state);

                return;
            }

            confirmBtn.listen("click", function() {
                state.cbExecuted = true;
                runCallbackDelayed(callback, true);

                dialog.hide();
                deleteDialog(state);
            });

            denyBtn.listen("click", function() {
                state.cbExecuted = true;
                runCallbackDelayed(callback, false);

                dialog.hide();
                deleteDialog(state);
            });

            dialog.listen('open', function() {
                var tabElem = dialog.element.querySelector('[data-ui=button]');
                if (tabElem) {
                    tabElem.focus();
                }
            });

            dialog.listen('close', function() {
                if (!state.cbExecuted) {
                    state.cbExecuted = true;
                    runCallbackDelayed(callback, false);
                    deleteDialog(state);
                }
            });

            state.keyHandler = getOnKeyPress(state);

            dialog.element.addEventListener('keyup', state.keyHandler);

            dialog.show();
        }

        if (dialog.isActive()) {
            onDialogEnable();
        } else {
            enableTok = dialog.listen("enable", onDialogEnable);
        }

        dialog.enable();
    }

    function deleteDialog(state) {
        dialog.element.removeEventListener('keyup', state.keyHandler);
        shmi.deleteControl(dialog);
        dialog = null;
        confirmationQueue.shift(); //remove handle event
        tokens.forEach(function(t) {
            t.unlisten();
        });
        tokens = [];
        shmi.decouple(function() {
            if (confirmationQueue.length) {
                createDialog();
            }
        });
    }

    function defaultConfirmationHandler(event) {
        try {
            shmi.requires("visuals.controls.Button");
            shmi.requires("visuals.controls.DialogBox");
        } catch (exc) {
            console.log("error trying to load controls: Button, DialogBox\n" + exc);
            return;
        }
        confirmationQueue.push(event);
        if (confirmationQueue.length === 1) {
            createDialog();
        }
    }

    var module = shmi.pkg("visuals.handler.default.cofirmation"),
        confirmationToken = null;

    module.register = function() {
        if (confirmationToken) {
            console.debug("confirmation handler was active!");
            confirmationToken.unlisten();
            confirmationToken = null;
        }
        confirmationToken = shmi.listen('confirmation', defaultConfirmationHandler);
    };

    module.deregister = function() {
        if (!confirmationToken) {
            console.debug("confirmation handler not active!");
        } else {
            confirmationToken.unlisten();
            confirmationToken = null;
        }
    };
}());

(function() {
    var tokens = [],
        dialog = null,
        parserReady = false,
        initialLoginExpired = function() {
        };

    function checkValid(refs) {
        var um = shmi.requires("visuals.session.UserManager"),
            currentPwd = null,
            newPwd = null;

        if (refs.newpw.getValue() !== refs.repeatpw.getValue()) {
            shmi.notify("${V_PASSWORD_REPEAT_NOT_EQUAL}");
            return;
        }

        if ((String(refs.newpw.getValue())).length < shmi.c("MIN_PASSWORD_LENGTH")) {
            shmi.notify("${V_PASSWORD_TOO_SHORT}");
            return;
        }
        refs.apply.lock();

        currentPwd = refs.curpw.getValue();
        newPwd = refs.newpw.getValue();
        um.changePassword(currentPwd, newPwd, function(response, status) {
            if (status === 0) {
                dialog.hide();
                deleteDialog();
            } else {
                refs.apply.unlock();
                shmi.addClass(refs.curpw.element, "error");
                shmi.notify("${V_INVALID_PASSWORD}");
            }
        });
    }

    function resetControls(refs) {
        shmi.removeClass(refs.curpw.element, "error");
    }

    function initControls(refs) {
        var ses = shmi.visuals.session,
            um = ses.UserManager;
        refs.username.setValue(um.currentUser.name);
        tokens.push(refs.cancel.listen("click", function() {
            dialog.hide();
            deleteDialog();
        }));
        tokens.push(refs.apply.listen("click", function() {
            resetControls(refs);
            checkValid(refs);
        }));
    }

    function createDialog() {
        if (!parserReady) {
            initialLoginExpired = function() {
                createDialog();
            };
            return;
        }

        var systemControlConfig = shmi.requires("visuals.session.SysControlConfig"),
            diaConfig = shmi.cloneObject(systemControlConfig.passwordExpiredDialog);
        diaConfig.title = diaConfig.title || "${V_PASSWORD_EXPIRED_TITLE}";
        diaConfig.title = shmi.localize(diaConfig.title);
        dialog = shmi.createControl("dialog-box", document.body, diaConfig, 'DIV');

        var enableTok = null;

        function onDialogEnable() {
            if (enableTok) {
                enableTok.unlisten();
                enableTok = null;
            }
            dialog.show();
            var ctrlNames = [
                ".current-user",
                ".current-pwd",
                ".new-pwd",
                ".repeat-pwd",
                ".apply-btn",
                ".cancel-btn"
            ];
            ctrlNames.forEach(function(cn, idx) {
                ctrlNames[idx] = dialog.getName() + " " + cn;
            });
            shmi.onEnable(ctrlNames, function(refs) {
                initControls({
                    username: refs[ctrlNames[0]],
                    curpw: refs[ctrlNames[1]],
                    newpw: refs[ctrlNames[2]],
                    repeatpw: refs[ctrlNames[3]],
                    apply: refs[ctrlNames[4]],
                    cancel: refs[ctrlNames[5]]
                });
            });
        }

        if (dialog.isActive()) {
            onDialogEnable();
        } else {
            enableTok = dialog.listen("enable", onDialogEnable);
        }

        dialog.enable();
    }

    function deleteDialog() {
        shmi.deleteControl(dialog);
        tokens.forEach(function(t) {
            t.unlisten();
        });
        tokens = [];
        dialog = null;
    }

    //////////////////////////////////////////////

    function defaultPasswordExpiredHandler(event) {
        try {
            shmi.requires("visuals.controls.Button");
            shmi.requires("visuals.controls.DialogBox");
        } catch (exc) {
            console.log("error trying to load controls: Button, DialogBox\n" + exc);
            return;
        }

        if (dialog === null) {
            createDialog();
        }
    }

    var module = shmi.pkg("visuals.handler.default.passwordExpired"),
        expiredToken = null;
    var parserToken = shmi.listen("parser-ready", function() {
        parserToken.unlisten();
        parserReady = true;

        shmi.decouple(initialLoginExpired);
    });

    module.register = function() {
        if (expiredToken) {
            console.debug("password-expired handler was active!");
            expiredToken.unlisten();
            expiredToken = null;
        }
        expiredToken = shmi.listen("password-expired", defaultPasswordExpiredHandler);
    };

    module.deregister = function() {
        if (!expiredToken) {
            console.debug("password-expired handler not active!");
        } else {
            expiredToken.unlisten();
            expiredToken = null;
        }
    };
}());

(function() {
    var activeId = null;

    function defaultConnectionFailed(event) {
        activeId = Date.now();
        var dismisToken = shmi.listen("notification-dismissed", function(evt) {
            dismisToken.unlisten();
            window.location.reload();
        }, { "detail.param.id": activeId });
        shmi.notify("${CONNECTION_RESET}", "${V_NOTIFICATION}", { id: activeId });
    }

    var module = shmi.pkg("visuals.handler.default.connectionFailed"),
        failedToken = null;

    module.register = function() {
        if (failedToken) {
            console.debug("connection-failed handler was active!");
            failedToken.unlisten();
            failedToken = null;
        }
        failedToken = shmi.listen("connection-failed", defaultConnectionFailed);
    };

    module.deregister = function() {
        if (!failedToken) {
            console.debug("connection-failed handler not active!");
        } else {
            failedToken.unlisten();
            failedToken = null;
        }
    };
}());

/* default handler for dialogs */
(function() {
    var optionDialogQueue = [],
        optButtonTokens = [],
        dialog = null,
        cancelBtn,
        onKeyPress;

    function defaultOptionDialogHandler(event) {
        try {
            shmi.requires("visuals.controls.Button");
            shmi.requires("visuals.controls.DialogBox");
        } catch (exc) {
            console.log("error trying to load controls: Button, DialogBox\n" + exc);
            return;
        }

        optionDialogQueue.push(event);
        if (optionDialogQueue.length === 1) {
            createDialog();
        }
    }

    function createDialog() {
        var enableTok = null,
            buttonElements = {},
            currentEvent = optionDialogQueue[0],
            dialogSettings = currentEvent.detail;

        if (!dialogSettings.buttons || !Array.isArray(dialogSettings.buttons) || typeof dialogSettings.buttons[0] !== 'object') {
            shmi.log('[shmi.optionDialog] Invalid options provided ', 3);
            return;
        }

        var systemControlConfig = shmi.requires("visuals.session.SysControlConfig"),
            diaConfig = shmi.cloneObject(systemControlConfig.optionDialog);

        diaConfig.title = dialogSettings.title || diaConfig.title;
        diaConfig.title = shmi.evalString(shmi.localize(diaConfig.title), dialogSettings.titleParams);
        dialog = shmi.createControl("dialog-box", document.body, diaConfig, 'DIV');

        onKeyPress = function(e) {
            if (e.code === "Escape" && cancelBtn.callback) {
                cancelBtn.callback(cancelBtn.name, e);
                dialog.hide();
                deleteDialog();
            }
        };

        function onDialogEnable() {
            if (enableTok) {
                enableTok.unlisten();
                enableTok = null;
            }
            if (optButtonTokens.length) {
                optButtonTokens.forEach(function(token) {
                    if (token && token.unlisten) {
                        token.unlisten();
                    }
                });
                optButtonTokens = [];
            }

            var optionDialogTextElement = dialog.element.querySelector('[data-name=option-text]');
            if (optionDialogTextElement) {
                var msgParams = dialogSettings.messageParams || {};
                dialogSettings.message = shmi.evalString(shmi.localize(dialogSettings.message), msgParams);
                optionDialogTextElement.textContent = dialogSettings.message;
            }

            var dialogOptionsContainer = dialog.element.querySelector('[data-name=dialog-options]'),
                dialogControlsContainer = dialog.element.querySelector('[data-name=dialog-ctrls]');

            dialogSettings.buttons.forEach(function(btnConfig) {
                const btnName = btnConfig.config.name,
                    btnCb = btnConfig.callback;
                let insertNode = null;

                switch (btnConfig.type) {
                case 'warning':
                case 'success':
                case 'option':
                    if (dialogSettings.buttonLayout === 'vertical') {
                        if (dialogOptionsContainer) {
                            insertNode = dialogOptionsContainer;
                        } else {
                            shmi.log('[shmi.optionDialog] HTML Element not found: data-name="dialog-options"', 3);
                            return;
                        }
                    } else if (dialogSettings.buttonLayout === 'horizontal') {
                        if (dialogControlsContainer) {
                            insertNode = dialogControlsContainer;
                        } else {
                            shmi.log('[shmi.optionDialog] HTML Element not found: data-name="dialog-ctrls"', 3);
                            return;
                        }
                    }
                    break;
                case 'cancel':
                    if (!dialogControlsContainer) {
                        shmi.log('[shmi.optionDialog] HTML Element not found: data-name="dialog-ctrls"', 3);
                        return;
                    } else {
                        insertNode = dialogControlsContainer;
                    }
                    break;
                default:
                    return;
                }

                if (insertNode) {
                    btnConfig.config['class-name'] = btnConfig.config['class-name'] ? btnConfig.config['class-name'] + ' ' + btnConfig.type : btnConfig.type;
                    buttonElements[btnName] = shmi.createControl("button", insertNode, btnConfig.config, 'DIV', "before");
                    optButtonTokens.push(buttonElements[btnName].listen("click", function(event) {
                        dialog.hide();
                        deleteDialog();
                        try {
                            btnCb(btnName, event);
                        } catch (exc) {
                            console.error("exception running shmi.optionDialog callback:", exc);
                        }
                    }));
                }
            });

            dialog.listen('open', function() {
                var tabElem = dialog.element.querySelector('[data-ui=button]');
                if (tabElem) {
                    tabElem.focus();
                }
            });

            cancelBtn = dialogSettings.buttons.find(function(btn) {
                return btn.type === 'cancel';
            });

            if (cancelBtn) {
                // If cancel button exists, call cancel callback on pressing ESC
                dialog.element.addEventListener('keyup', onKeyPress);
            }

            dialog.show();
        }

        if (dialog.isActive()) {
            onDialogEnable();
        } else {
            enableTok = dialog.listen("enable", onDialogEnable);
        }

        dialog.enable();
    }

    function deleteDialog() {
        dialog.element.removeEventListener('keyup', onKeyPress);
        shmi.deleteControl(dialog);
        dialog = null;
        optionDialogQueue.shift(); //remove handle event
        optButtonTokens.forEach(function(token) {
            if (token && token.unlisten) {
                token.unlisten();
            }
        });
        optButtonTokens = [];
        shmi.decouple(function() {
            if (optionDialogQueue.length) {
                createDialog();
            }
        });
    }

    var module = shmi.pkg("visuals.handler.default.optionDialog"),
        optionDialogToken = null;

    module.register = function() {
        if (optionDialogToken) {
            console.debug("confirmation handler was active!");
            optionDialogToken.unlisten();
            optionDialogToken = null;
        }
        optionDialogToken = shmi.listen('optionDialog', defaultOptionDialogHandler);
    };

    module.deregister = function() {
        if (!optionDialogToken) {
            console.debug("confirmation handler not active!");
        } else {
            optionDialogToken.unlisten();
            optionDialogToken = null;
        }
    };
}());

/**
 * Module to handle logout of user at application runtime
 *
 * @module visuals/handler/default/logout
 */
(function() {
    /** @lends module:visuals/handler/default/logout */
    const module = shmi.pkg("visuals.handler.default.logout");

    let loginToken = null,
        wasLoggedIn = false;

    /**
     * register - register handler module
     *
     */
    module.register = function() {
        if (!loginToken) {
            loginToken = shmi.listen("login-state", (evt) => {
                const reload = wasLoggedIn && evt.detail.loggedIn === false;

                wasLoggedIn = evt.detail.loggedIn; //update last login state before reload, in case reloading is canceled
                if (reload) {
                    window.location.reload();
                }
            });
        }
    };

    /**
     * deregister - de-register handler module
     *
     */
    module.deregister = function() {
        if (loginToken) {
            loginToken.unlisten();
            loginToken = null;
            wasLoggedIn = false;
        }
    };
}());

/**
 * Default handler for 'numpad-request' events.
 *
 * @module visuals/handler/default/numpad
 */
(function() {
    /** @lends module:visuals/handler/default/numpad */
    const module = shmi.pkg("visuals.handler.default.numpad");
    let numpad = null,
        numpadToken = null,
        tokens = [];

    /**
     * getOnClose - get callback to run when numpad dialog is closed
     *
     * @param {object} currentEvent current request event
     * @returns {function} close callback
     */
    function getOnClose(currentEvent) {
        return () => {
            tokens.forEach((t) => {
                t.unlisten();
            });
            tokens = [];
            deleteNumpad();
        };
    }

    /**
     * createNumpad - creates numpad to handle request
     *
     */
    function createNumpad(event) {
        const numConfig = {},
            iter = shmi.requires("visuals.tools.iterate.iterateObject");

        iter(event.detail, function(val, key) {
            numConfig[key] = event.detail[key];
        });
        if (numConfig.label) {
            numConfig.label = shmi.evalString(shmi.localize(numConfig.label), event.detail.param);
        }

        numpad = shmi.createControl("numpad", document.body, numConfig, 'DIV', null, true);

        const onClose = getOnClose(event);

        tokens.push(numpad.listen("close", onClose));
        tokens.push(numpad.listen("close", onClose));

        shmi.onActive([numpad], () => {
            numpad.show();
        });
    }

    /**
     * deleteNumpad - delete created numpad instance
     *
     */
    function deleteNumpad() {
        shmi.deleteControl(numpad);
        numpad = null;
    }

    /**
     * numpadRequestHandle - handle incoming request events
     *
     * @param {object} event numpad request event
     */
    function numpadRequestHandler(event) {
        if (numpad === null) {
            createNumpad(event);
        }
    }

    /**
     * register - register 'numpad-request' event handler
     *
     */
    module.register = function() {
        if (numpadToken) {
            console.debug("numpad handler was active!");
            numpadToken.unlisten();
            numpadToken = null;
        }
        numpadToken = shmi.listen('numpad-request', numpadRequestHandler);
    };

    /**
     * deregister - deregister 'numpad-request' event handler
     *
     */
    module.deregister = function() {
        if (!numpadToken) {
            console.debug("numpad handler not active!");
        } else {
            numpadToken.unlisten();
            numpadToken = null;
        }
    };
}());

(function() {
    var media_queries = {
            "type": 1,
            "queries": [
                {
                    "name": "mobile",
                    "threshold": null,
                    "layoutWidth": "318px",
                    "editorWidth": "320px",
                    "icon": "icon mq-mobile",
                    "enabled": true
                },
                {
                    "name": "wide-mobile",
                    "threshold": "478px",
                    "layoutWidth": "478px",
                    "editorWidth": "480px",
                    "icon": "icon mq-wide-mobile",
                    "enabled": true
                },
                {
                    "name": "tablet-portrait",
                    "threshold": "758px",
                    "layoutWidth": "758px",
                    "editorWidth": "768px",
                    "icon": "icon mq-tablet-portrait",
                    "enabled": true
                },
                {
                    "name": "tablet-landscape",
                    "threshold": "1018px",
                    "layoutWidth": "1018px",
                    "editorWidth": "1024px",
                    "icon": "icon mq-tablet-landscape",
                    "enabled": true
                },
                {
                    "name": "wide",
                    "threshold": "1278px",
                    "layoutWidth": "1278px",
                    "editorWidth": "1280px",
                    "icon": "icon mq-wide",
                    "enabled": true
                },
                {
                    "name": "extra-wide",
                    "threshold": "1918px",
                    "layoutWidth": "1918px",
                    "editorWidth": "1920px",
                    "icon": "icon mq-extra-wide",
                    "enabled": true
                }
            ]
        },
        mobileFirstPattern = "(min-width: <%= threshold %>)",
        desktopFirstPattern = "(max-width: <%= threshold %>)",
        TYPE_MOBILE_FIRST = 1,
        TYPE_DESKTOP_FIRST = 2,
        mq_map = {},
        current_layout = null;

    shmi.loadResource(shmi.c("MEDIA_QUERIES_CONFIG_PATH"), function(data, failed, url) {
        if (failed) {
            console.error("failed to load media-query configuration: " + url);
        }

        var mediaQueryConfig;
        try {
            mediaQueryConfig = JSON.parse(data);
        } catch (exc) {
            console.error("failed to parse media-query configuration: " + url, exc);
        }

        if ((typeof mediaQueryConfig === "object") && Array.isArray(mediaQueryConfig.queries) && mediaQueryConfig.queries.length) {
            media_queries = mediaQueryConfig;
            console.log("[visuals.media-queries] using json defined media-queries: ", url);
        } else {
            console.log("[visuals.media-queries] using built-in media-queries: ", media_queries);
        }

        for (var i = 0; i < media_queries.queries.length; i++) {
            mq_map[media_queries.queries[i].name] = media_queries.queries[i];
        }

        /* initial layout test */
        shmi.onSessionReady(function() {
            testLayout();
            /* resize event re-runs layout test */
            window.addEventListener('resize', testLayout, false);
        });
    });

    shmi.getCurrentLayout = function() {
        return current_layout;
    };

    /* returns the last matched media query */
    shmi.getCurrentMediaQuery = function() {
        return mq_map[current_layout];
    };

    /* returns all currently matched media queries in order of definition */
    shmi.getActiveMediaQueries = function() {
        var matched = [],
            query = null,
            queryText = "";

        for (var i = 0; i < media_queries.queries.length; i++) {
            query = media_queries.queries[i];
            queryText = "";

            if ((query.threshold === null) && query.enabled) {
                matched.push(query.name);
            } else if (query.enabled) {
                if (media_queries.type === TYPE_MOBILE_FIRST) {
                    queryText = shmi.evalString(mobileFirstPattern, query);
                } else if (media_queries.type === TYPE_DESKTOP_FIRST) {
                    queryText = shmi.evalString(desktopFirstPattern, query);
                }

                if (queryText) {
                    if (window.matchMedia(queryText).matches) {
                        matched.push(query.name);
                    }
                }
            }
        }
        return matched;
    };

    shmi.getMediaQueries = function() {
        return media_queries;
    };

    function testLayout() {
        var index = 0,
            queryText = "";
        for (var i = 0; i < media_queries.queries.length; i++) {
            if (!media_queries.queries[i].enabled) {
                continue;
            }
            if (media_queries.type === TYPE_MOBILE_FIRST) {
                queryText = shmi.evalString(mobileFirstPattern, media_queries.queries[i]);
            } else if (media_queries.type === TYPE_DESKTOP_FIRST) {
                queryText = shmi.evalString(desktopFirstPattern, media_queries.queries[i]);
            }
            if (window.matchMedia(queryText).matches) {
                index = i;
            }
        }
        var old_layout = current_layout;
        current_layout = media_queries.queries[index].name;
        if (old_layout !== current_layout) {
            setActiveLayoutClass(index);
            if (old_layout !== null) {
                var evt = document.createEvent("Event");
                evt.initEvent("visuals-layout-change", true, true);
                window.dispatchEvent(evt);
                if (shmi.visuals.session.config && shmi.visuals.session.config.debug) {
                    console.log("LAYOUT CHANGE [" + old_layout + " => " + current_layout + "]");
                }
                shmi.fire('layout-change', { oldLayout: old_layout, layout: current_layout }, shmi.visuals.session);
            }
        }
    }

    function setActiveLayoutClass(index) {
        for (var i = 0; i < media_queries.queries.length; i++) {
            shmi.removeClass(document.documentElement, media_queries.queries[i].name);
        }
        shmi.addClass(document.documentElement, media_queries.queries[index].name);
        if (shmi.visuals.session.config && shmi.visuals.session.config.debug) {
            console.log("set layout cssClass: " + media_queries.queries[index].name + " " + media_queries.queries[index].threshold);
        }
    }
})();
