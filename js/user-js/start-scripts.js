/* Startup Scripts - called after successful login */
shmi.pkg("visuals.session");

/* functions attached as a property will be executed on project initialization */
shmi.visuals.session.startScripts = shmi.visuals.session.startScripts || {};
