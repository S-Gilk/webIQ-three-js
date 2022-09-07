shmi.pkg("visuals.session");

/* user defined ui-actions can be added as a property */
shmi.visuals.session.userActions = shmi.visuals.session.userActions || {};

/**
 * Example Ui-Action
 *
 * Logs provided arguments to the console.
 *
 * @param {array} static_params static ui-action argumnets
 * @param {array} dyn_params dynamic ui-action argumnets passed via .execute(...) function
 * @returns {undefined}
 */
shmi.visuals.session.userActions['test-action'] = function(static_params, dyn_params) {
    console.log("UiAction: test-action", static_params, dyn_params);
};
