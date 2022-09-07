module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('grunt-prompt');

    const compileLib = require('./build-resources/js/lib/compile.lib.js')(grunt),
        supportedBrowsers = ["chrome 78","firefox 72","not dead","not ie 11"];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        unzip: {
            'less/': '.webiq/less-sources.zip'
        }
    });

    grunt.registerTask('extract-less', 'extract less sources if necessary', function() {
        if (!grunt.file.isDir('less/')) {
            grunt.task.run(["unzip"]);
        }
    });

    grunt.registerTask('compile-less', "compiles less sources", function() {
        const done = this.async();
        const buildRunner = require("./build-resources/less-builder/build-runner");
        buildRunner.buildLess(".").then(() => {
            done(null);
        }).catch((err) => {
            done(err);
        });
    });

    grunt.registerTask('build-less', [
        'extract-less',
        'compile-less'
    ]);

    grunt.registerTask('control', 'Task to create or package a control', compileLib.createControlLib.controlTask);

    // Create a new control
    grunt.registerTask('control-config', 'task to initialize the new controls configuration', compileLib.createControlLib.controlConfig);
    grunt.registerTask('control-verification', 'task to verify the configuration', compileLib.createControlLib.verifyControlFiles);
    grunt.registerTask('create-control', 'task to write the new controls files', compileLib.createControlLib.createControl);

    // Create a package from a control
    grunt.registerTask('control-package-config', 'task to initialize the new control package configuration', compileLib.createControlLib.controlPackageConfig);
    grunt.registerTask('create-control-package', 'task to create the new control package', compileLib.createControlLib.exportControlPackage);
    grunt.registerTask('export-control-delete', 'task to delete the exported control from the app', compileLib.createControlLib.removeExportedControl);
    grunt.registerTask('create-control-log', 'task to output information about the created control files', compileLib.createControlLib.createControlLog);
    grunt.registerTask('export-control-log', 'task to output information about the exported control files', compileLib.createControlLib.exportControlLog);
};
