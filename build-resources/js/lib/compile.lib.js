module.exports = function(grunt) {
    var processSettings = JSON.parse(grunt.file.read('build-resources/json/process-settings.json')),
        createControlLib = require('./controls/create.control.lib.js')(grunt, processSettings);

    return {
        createControlLib: createControlLib
    };
};
