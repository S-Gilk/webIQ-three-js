module.exports = function(grunt, processSettings) {
    var dynamicEvaluations,
        createControlValidationMsg = [],
        controlPackageValidationMsg = [],
        controlNameRegExpression = /^[a-z0-9]+([-]?[a-z0-9]+)*$/;

    /**
     * Returns a boolean indicating whether the object has the specified
     * property as its own property (as opposed to inheriting it).
     *
     * @param {Object} obj Object to check the existance of the property on.
     * @param {string|symbol} prop Name of the property to test
     * @returns {boolean} A Boolean indicating whether or not the object has
     *  the specified property as own property.
     */
    const objectHasOwnProperty = Object.prototype.hasOwnProperty.call.bind(Object.prototype.hasOwnProperty);

    /**
     * objMerge - merges two objects to one by overwriting previous keys with newer ones.
     *
     * @param  {object} Merge  Object where values get merge into
     * @param  {object} Assign Object of which values are getting assigned to the Merge obj.
     * @return {object} returning the merged object.
     */
    function objMerge(Merge, Assign) {
        if (!Merge || !Assign) {
            return false;
        }

        Object.entries(Assign).forEach(([key, value]) => {
            Merge[key] = typeof Merge[key] === 'object' && typeof value === 'object' ? objMerge(Merge[key], value) : value;
        });

        return Merge;
    }

    /**
     * jsonMerge - reads an array of json file paths and merges these to a single obj.
     *
     * @param  {array} arrFiles array of file paths
     * @return {object} an object containing the merged content of the json files
     */
    function jsonMerge(arrFiles) {
        if (typeof arrFiles === 'string') {
            arrFiles = [arrFiles];
        }
        if (!Array.isArray(arrFiles) || arrFiles.length === 0) {
            return {};
        }
        var merge = {};
        arrFiles.forEach(function(file) {
            try {
                merge = objMerge(merge, JSON.parse(grunt.file.read(file))); // successfully assigned file arrFiles[i]
            } catch (err) {
                console.error(`Could not parse file "${file}"\n\n${err.message}`, true);
            }
        });
        return merge;
    }

    /**
     * controlConfig - reads the given attributes of the executed control command and validates its input.
     * if a required attribute is not given, it runs the command prompt to ask for the required input.
     *
     */
    function controlConfig() {
        var promptConfig = {},
            configQuestions = [
                {
                    type: 'input',
                    config: 'createControl.controlName',
                    message: 'Please enter a name for the new control:',
                    validate: controlConfigControlNameValidate,
                    when: controlConfigControlNameWhen
                },
                {
                    type: 'list',
                    config: 'createControl.controlType',
                    message: 'Do you want to create a \'system\' or a \'custom\' control?',
                    default: 'custom',
                    choices: ['system', 'custom'],
                    when: controlConfigControlTypeWhen
                },
                {
                    type: 'checkbox',
                    config: 'createControl.controlDirectories',
                    message: 'Which folders shall be created for this new control?',
                    choices: controlConfigControlDirectoriesChoices,
                    filter: controlConfigControlDirectoriesFilter,
                    when: controlConfigControlDirectoriesWhen,
                    validate: function(value) {
                        // do not allow empty selections
                        return (value && value.length > 0) ? true : 'Please choose at least one directory!';
                    }
                }
            ];

        promptConfig.createControlConfig = { options: { questions: configQuestions } };

        // set prompt config and run prompt task
        grunt.config('prompt', promptConfig);
        grunt.task.run('prompt:createControlConfig');
    }

    /**
     *
     * @param name
     * @returns {*}
     */
    function controlConfigControlNameValidate(name) {
        // testing for right format of the control name
        if (name.length > 0 && controlNameRegExpression.test(name)) {
            // check if this control already exists by checking the compile-settings.
            var compileSettings = jsonMerge([processSettings.compileSettings]);
            if (compileSettings.controls[name]) {
                return 'A control with the same name is already registered to the less compile-settings';
            }
            grunt.log.writeln('\nValid control name: '['green'] + name);
            return true;
        }
        return 'Please do not use special characters and use dashes instead of spaces!';
    }

    /**
     *
     * @returns {boolean}
     */
    function controlConfigControlNameWhen() {
        var isDev = grunt.option('dev') || false,
            controlName = grunt.option('name') || false;
        if (controlName && controlName.length > 0) {
            if (controlNameRegExpression.test(controlName)) {
                // if the given control name is valid, do not ask for control name input (return false)
                grunt.config('createControl.controlName', controlName);
                return false;
            } else if (isDev) {
                // if control name is not valid and --dev is given, pass error msg instead of asking for input
                createControlValidationMsg.push(('Invalid control name - please do not use special characters and use' +
                                                 ' dashes instead of spaces')['red']);
                return false;
            } else {
                // if control name is not valid and --dev is not given, ask for input
                grunt.log.writeln('Please do not use special characters and use dashes instead of spaces'['red']);
                return true;
            }
        } else if (isDev && controlName) {
            // if control name is empty and --dev is given, output error message
            createControlValidationMsg.push('Control name not given. User ' + '--name="my-control"'['yellow'] +
                                            ' to continue');
            return false;
        }
        return true;
    }

    /**
     *
     * @returns {*}
     */
    function controlConfigControlTypeWhen() {
        // can only create custom control package
        if (grunt.option('package')) {
            grunt.config('createControl.controlType', 'custom');
            return false;
        }
        var isDev = grunt.option('dev') || false,
            controlType = grunt.option('system') ? 'system' : false;
        controlType = grunt.option('custom') ? 'custom' : controlType;

        if (isDev && controlType) {
            // if --dev is given and control type is valid, save control type config
            grunt.config('createControl.controlType', controlType);
        }
        grunt.config('createControl.controlType', 'custom');
        // allow selecting system control type when control type is not given and --dev is given
        return isDev && !controlType;
    }

    function controlConfigControlDirectoriesChoices() {
        var directories = [],
            filesToTransfer = processSettings.createControl.files;
        // get choices from file types defines in process settings
        for (var fileType in filesToTransfer) {
            if (objectHasOwnProperty(filesToTransfer, fileType)) {
                var required = false,
                    onCreate = true,
                    onExport = true;
                if ('required' in filesToTransfer[fileType]) {
                    required = filesToTransfer[fileType].required;
                }
                if ('onCreate' in filesToTransfer[fileType]) {
                    onCreate = filesToTransfer[fileType].onCreate;
                }
                if ('onExport' in filesToTransfer[fileType]) {
                    onExport = filesToTransfer[fileType].onExport;
                }
                // only let user de/select if control is not required and supposed to get created on create
                var create = (grunt.option('create') && onCreate),
                    ctrlPackage = (grunt.option('package') && (onExport || onCreate));
                if ((!required && create) || ctrlPackage) {
                    directories.push({
                        name: fileType,
                        checked: filesToTransfer[fileType].includedByDefault || false
                    });
                }
            }
        }
        return directories;
    }

    /**
     *
     * @param choices
     * @returns {*}
     */
    function controlConfigControlDirectoriesFilter(choices) {
        var filesToTransfer = processSettings.createControl.files;
        // add required file types to selection
        Object.entries(filesToTransfer).forEach(([fileType, fileConfig]) => {
            const required = objectHasOwnProperty(fileConfig, 'required') ? fileConfig.required : false,
                onCreate = objectHasOwnProperty(fileConfig, 'onCreate') ? fileConfig.onCreate : true;

            if (required && onCreate) {
                choices.push(fileType);
            }
        });

        return choices;
    }

    /**
     *
     * @returns {boolean}
     */
    function controlConfigControlDirectoriesWhen() {
        var isDev = grunt.option('dev') || false,
            validDirectories = Object.keys(processSettings.createControl.files),
            controlDirectories = grunt.option('directories') ? grunt.option('directories').replace(/ /g, '').split(',') : false;
        // if --dev is given use default for control directories by checking 'includedByDefault'
        if (isDev) {
            const filesToTransfer = processSettings.createControl.files,
                dirs = Object.entries(filesToTransfer).
                    filter(([fileType, fileConfig]) => {
                        const required = fileConfig.required,
                            onCreate = fileConfig.onCreate,
                            includedByDefault = fileConfig.includedByDefault;

                        return onCreate && (required || includedByDefault);
                    }).
                    map(([fileType, fileConfig]) => fileType);

            grunt.config('createControl.controlDirectories', dirs);
        }
        // if controlDirectories attribute has a value, parse it to create the directory selection
        if (controlDirectories) {
            if (typeof controlDirectories === 'string') {
                controlDirectories = [controlDirectories];
            } else if (!Array.isArray(controlDirectories)) {
                if (isDev) {
                    createControlValidationMsg.push('Please choose at least one directory!'['red']);
                    return false;
                }
            }
            for (var i = 0; i < controlDirectories.length; i++) {
                if (!validDirectories.includes(controlDirectories[i].trim())) {
                    if (isDev) {
                        // add error message if passed control directories are not valid
                        createControlValidationMsg.push((controlDirectories[i] + ' is not a valid control directory name')['red']);
                        return false;
                    } else {
                        // output error message and let the user select again
                        grunt.log.writeln((controlDirectories[i] + ' is not a valid control directory' +
                                           ' name')['red']);
                        return true;
                    }
                }
            }
            // set control directory config and do not show selection of directories
            grunt.config('createControl.controlDirectories', controlDirectories);
            return false;
        }
        // show selection in cli
        return true;
    }

    /**
     * verifyControlFiles - Check if some of the files, that are supposed to be created do already exist
     *
     */
    function verifyControlFiles() {
        var controlName = grunt.config('createControl.controlName'),
            controlType = grunt.config('createControl.controlType'),
            controlDirectories = grunt.config('createControl.controlDirectories'),
            controlModelTransfer = {},
            pathsExisting = [],
            pathsIgnored = [];

        // if the validation already failed during the prompt config - output the error messages and abort the process
        if (Array.isArray(createControlValidationMsg) && createControlValidationMsg.length > 0) {
            createControlValidationMsg.forEach(function(msg) {
                grunt.log.writeln(msg);
            });
            return false;
        } else if (!controlName) {
            return false;
        }

        // Create template path depending on the control type
        var tplPath = 'templates/' + controlType !== 'system' ? 'custom/controls/' : 'default/',
            requiredVersion = JSON.parse(grunt.file.read('webiq.json'));
        tplPath += controlName;
        if (requiredVersion && requiredVersion.requires && requiredVersion.requires.visuals) {
            requiredVersion = requiredVersion.requires.visuals || '2.2.0';
        } else {
            requiredVersion = '2.2.0';
        }

        console.log('requiredVersion');
        console.log(requiredVersion);
        dynamicEvaluations = {
            data: {
                control_name: controlName,
                control_class_name: controlName,
                control_ui_type: controlName,
                control_version: '1.0.0',
                control_label: capitalize(controlName.replace(/-/g, ' ')),
                control_default_class_name: controlName,
                control_default_template: tplPath,
                control_default_name: toCamelCase(controlName),
                designer_category: 'Custom',
                visuals_version_required: requiredVersion
            }
        };

        processSettingsFileLoop(dynamicEvaluations, function(loopParams) {
            var destDir,
                writePath,
                readPath;
            if (controlDirectories.includes(loopParams.typeName)) {
                destDir = controlType === 'custom' ? loopParams.customDestinationPath : loopParams.systemDestinationPath;
                if (loopParams.isDirectory) {
                    if (grunt.option('package')) {
                        destDir = '.packages/' + controlName + '/' + destDir;
                    }
                    controlModelTransfer[loopParams.sourcePath] = destDir;
                    return;
                }

                readPath = loopParams.sourcePath + loopParams.sourceFileName;
                writePath = destDir + '/' + loopParams.destinationFileName;
                writePath = cleanPath(writePath);
                if (grunt.option('package')) {
                    writePath = '.packages/' + controlName + '/' + writePath;
                }
                if (!loopParams.onCreate && grunt.option('create')) {
                    pathsIgnored.push(readPath);
                } else if (grunt.file.exists(writePath)) {
                    pathsExisting.push(writePath);
                } else {
                    // add src and destination path to object
                    controlModelTransfer[readPath] = writePath;
                }
            }
        });

        // Output errors and abort if some files to write do already exist
        if (pathsExisting.length > 0) {
            pathsExisting.forEach(function(exist) {
                grunt.log.writeln('>> ' + exist + ' already exists'['red']);
            });
            return false;
        }

        grunt.config('controlFilesToCreate', controlModelTransfer);
        return true;
    }

    /**
     * createControl - Create the control files according to the control configuration given
     *
     * @returns {boolean}
     */
    function createControl() {
        var pathsWritten = [],
            controlModelTransfer = grunt.config('controlFilesToCreate');
        if (controlModelTransfer) {
            for (var read in controlModelTransfer) {
                if (objectHasOwnProperty(controlModelTransfer, read)) {
                    // process the template if tpl extension exists
                    var write = controlModelTransfer[read];
                    if (write[write.length - 1] === '/' && read[read.length - 1] === '/') {
                        grunt.file.mkdir(write.slice(0, -1));
                        pathsWritten.push('created directory: ' + write);
                        continue;
                    } else if (write.indexOf('.tpl') === (write.length - 4)) {
                        write = write.replace('.tpl', '');
                    }

                    var newFile = grunt.file.read(read);
                    if (read.indexOf('.tpl') === (read.length - 4)) {
                        newFile = grunt.template.process(newFile, dynamicEvaluations);
                    }

                    grunt.file.write(write, newFile);
                    pathsWritten.push('written: ' + write);
                }
            }

            grunt.config('controlPathsWritten', pathsWritten);

            return true;
        }
        grunt.log.writeln('Error - control files to create are not set'['red']);
        return false;
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    /**
     * controlPackageConfig - create the configuration of the cli prompt to let the user configure the
     * output of a control package
     *
     */
    function controlPackageConfig() {
        var promptConfig = {},
            configQuestions = [
                {
                    type: 'input',
                    config: 'controlPackage.controlName',
                    message: 'Please enter the name of the control:',
                    validate: validateControlPackageName,
                    when: packageConfigControlNameWhen
                },
                {
                    type: 'checkbox',
                    config: 'controlPackage.controlFiles',
                    message: 'Please select all files you want to include into this package:',
                    default: false,
                    validate: function(choices) {
                        // do not allow empty selection
                        return choices && choices.length > 0 ? true : 'Please choose at least one file!';
                    },
                    filter: packageConfigControlFilesFilter,
                    choices: packageConfigControlFilesChoices,
                    when: packageConfigControlFilesWhen
                },
                {
                    type: 'confirm',
                    config: 'controlPackage.removeOldConfirm',
                    message: 'Do you want to remove this control from the application?',
                    default: false,
                    when: packageConfigControlFilesDeleteOld
                }
            ];

        promptConfig.controlPackageConfig = {
            options: {
                questions: configQuestions
            }
        };

        grunt.config('prompt', promptConfig);

        grunt.task.run('prompt:controlPackageConfig');
    }

    /**
     *
     * @returns {boolean}
     */
    function packageConfigControlNameWhen() {
        var isDev = grunt.option('dev') || false,
            controlName = grunt.option('name') || false;
        if (controlName && controlName.length > 0) {
            if (controlNameRegExpression.test(controlName)) {
                // if a controlName for the package is given and valid, save the name and
                // do NOT ask for the name with the cli input
                grunt.config('controlPackage.controlName', controlName);
                var nameValidation = validateControlPackageName(controlName);
                if (nameValidation !== true) {
                    controlPackageValidationMsg.push(nameValidation['red']);
                }
                return false;
            } else if (isDev) {
                // if --dev is given and the control name is not valid add an error message
                controlPackageValidationMsg.push(('Invalid control name - Please do not use special ' +
                                                  'characters and use dashes instead of spaces')['red']);
                return false;
            } else {
                // if --dev is not given and control name is invalid output an error message
                grunt.log.writeln('Please do not use special characters and use dashes instead of spaces'['red']);
                return true;
            }
        } else if (controlName) {
            grunt.log.writeln('Please do not use special characters and use dashes instead of spaces!'['red']);
        }
        return true;
    }

    /**
     *
     * @param selection
     */
    function packageConfigControlFilesFilter(selection) {
        var packageFiles = grunt.config('controlPackage.packageFiles'),
            choices = {};
        // return object with src and target instead of target array only
        selection.forEach(function(selected) {
            Object.keys(packageFiles).find(function(path) {
                if (cleanPath(packageFiles[path]) === selected) {
                    choices[path] = selected;
                    return true;
                }
                return false;
            });
        });
        return choices;
    }

    /**
     *
     * @returns {Array}
     */
    function packageConfigControlFilesChoices() {
        const packageFiles = grunt.config('controlPackage.packageFiles');

        // define choices as array of target files that are to create
        return Object.values(packageFiles).map((path) => ({
            name: cleanPath(path),
            checked: true
        }));
    }

    /**
     *
     * @returns {boolean}
     */
    function packageConfigControlFilesWhen() {
        var isDev = grunt.option('dev') || false;
        if (grunt.option('all')) {
            // if --all is set and files are given, do not ask for the files to get created
            var packageFiles = grunt.config('controlPackage.packageFiles');
            if (packageFiles) {
                grunt.config('controlPackage.controlFiles', packageFiles);
            } else if (isDev) {
                controlPackageValidationMsg.push('There were no files found for this control'['red']);
            } else {
                grunt.log.writeln('There were no files found for this control'['red']);
                return true;
            }
            return false;
        }
        return true;
    }

    function packageConfigControlFilesDeleteOld() {
        // do not ask whether the old control shell be removed from the application if delete-old is set
        if (grunt.option('delete-old')) {
            grunt.config('controlPackage.removeOldConfirm', true);
            return false;
        }
        return true;
    }

    /**
     *
     * Creates a package of a control by its name. before, the configuration info of the package must have been set
     *
     * @returns {boolean}
     */
    function exportControlPackage() {
        if (controlPackageValidationMsg.length > 0) {
            controlPackageValidationMsg.forEach(function(msg) {
                grunt.log.writeln(msg);
            });

            return false;
        }

        var files = grunt.config('controlPackage.controlFiles'),
            controlName = grunt.config('controlPackage.controlName');

        if (controlName && Object.keys(files).length > 0) {
            const existingPaths = Object.values(files).
                map((path) => `.export/${controlName}/${path}`).
                filter((toPath) => grunt.file.exists(toPath));

            existingPaths.forEach((toPath) => {
                grunt.log.writeln('>> '['red'] + toPath + ' -> already exists'['red']);
            });

            // if any file does already exist, abort the process
            if (existingPaths.length > 0) {
                return false;
            }

            var evalData = grunt.config('controlPackage.dynamicEvaluations'),
                pathsWritten = [];
            console.log();
            grunt.log.writeln('Writing Package');
            var textExts = ['html', 'js', 'json', 'less', 'css', 'xml', 'svg', 'tpl'];

            const existingFiles = Object.entries(files).filter(([file, mappedFile]) => {
                if (!grunt.file.exists(file)) {
                    grunt.log.writeln(('>>' + file + ' does not exist!')['red']);
                    return false;
                }

                return true;
            });

            // Process text files first.
            existingFiles.
                filter(([file, mappedFile]) => {
                    const fileNameSplit = file.split('.');
                    return textExts.includes(fileNameSplit[fileNameSplit.length - 1]);
                }).
                forEach(([file, mappedFile]) => {
                    const filePath = cleanPath(`.export/${controlName}/${mappedFile}`);
                    let fileContents = grunt.file.read(file);

                    if (file.indexOf('.tpl') === (file.length - 4)) {
                        fileContents = grunt.template.process(fileContents, evalData);
                    }
                    grunt.file.write(filePath, fileContents);
                    pathsWritten.push(('written: ' + filePath));
                });

            // Queue copying of binary files next.
            const binaryFilesToCopy = existingFiles.
                filter(([file, mappedFile]) => {
                    const fileNameSplit = file.split('.');
                    return !textExts.includes(fileNameSplit[fileNameSplit.length - 1]);
                }).
                map(([file, mappedFile]) => {
                    const filePath = cleanPath(`.export/${controlName}/${mappedFile}`),
                        destBinaryDir = filePath.split('/'),
                        fileName = destBinaryDir.pop(),
                        srcBinaryDir = cleanPath(mappedFile).split('/');

                    srcBinaryDir.pop();
                    return {
                        expand: true,
                        cwd: srcBinaryDir.join('/'),
                        src: fileName,
                        dest: destBinaryDir.join('/')
                    };
                });

            // binaryFilesToCopy: Array !
            if (binaryFilesToCopy.length > 0) {
                var copyConfig = grunt.config('copy') || {};
                copyConfig = Object.assign(copyConfig, {
                    exportCopyBinary: {
                        files: binaryFilesToCopy
                    }
                });

                grunt.config('copy', copyConfig);
                grunt.task.run('copy:exportCopyBinary');

                binaryFilesToCopy.forEach(function(el) {
                    pathsWritten.push(('written (binary): ' + el.dest));
                });
            }

            grunt.config('controlExportWritten', pathsWritten);
            if (grunt.config('controlPackage.removeOldConfirm')) {
                grunt.task.run('export-control-delete');
                grunt.task.run('build-less');
            }
            return true;
        }
        console.log('Creation of new control failed');
        return false;
    }

    function removeExportedControl() {
        console.log();
        grunt.log.writeln('Deleting Control');

        var evalData = grunt.config('controlPackage.dynamicEvaluations'),
            controlName = grunt.config('controlPackage.controlName'),
            pathsDeleted = [];

        var compileSettings = jsonMerge([processSettings.compileSettings]);
        delete compileSettings.controls[controlName];
        grunt.file.write(processSettings.compileSettings, JSON.stringify(compileSettings, null, 4));
        pathsDeleted.push('removed control ' + controlName + ' from less compile settings');

        processSettingsFileLoop(evalData, function(loopParams) {
            var customDestDir = loopParams.customDestinationPath;
            evalData.data.inherit_filename = loopParams.sourceFileName;
            var fileDest = customDestDir + '/' + loopParams.destinationFileName;
            // if file gets written on create, use destination path of it to delete the file
            if (loopParams.onCreate && grunt.file.exists(fileDest)) {
                grunt.file.delete(fileDest);
                pathsDeleted.push(('deleted: ' + cleanPath(fileDest))['green']);
            }
            if (grunt.file.exists(customDestDir)) {
                var empty = true;
                grunt.file.recurse(customDestDir, function() {
                    empty = false;
                });
                // delete empty folders
                if (empty) {
                    var dirPath = customDestDir.substr(0, customDestDir.length - 1);
                    if (grunt.file.exists(dirPath)) {
                        grunt.file.delete(dirPath);
                        pathsDeleted.push(('deleted: ' + dirPath + '/')['green']);
                        if (dirPath.indexOf(controlName) === (dirPath.length - controlName.length)) {
                            var dirPath2 = dirPath.substr(0, (dirPath.length - (controlName.length + 1)));
                            if (grunt.file.exists(dirPath2)) {
                                empty = true;
                                grunt.file.recurse(dirPath2, function() {
                                    empty = false;
                                });
                                if (empty) {
                                    grunt.file.delete(dirPath2);
                                    pathsDeleted.push(('deleted: ' + dirPath2 + '/')['green']);
                                }
                            }
                        }
                    }
                }
            }
        });
        grunt.config('controlExportDeleted', pathsDeleted);
        console.log();
        grunt.log.writeln(('Control ' + controlName + ' has been removed successfully')['green']);
    }

    /**
     *
     * Validates the name of a control to create a package from, by checking if the files exist
     *
     * @param name
     * @returns {*}
     */
    function validateControlPackageName(name) {
        var pathsToExport = {},
            notExistingFilePaths = [],
            controlType = grunt.config('controlPackage.controlType');
        if (name.length > 0 && controlNameRegExpression.test(name)) {
            var tplPath = 'templates/' + controlType !== 'system' ? 'custom/controls/' : 'default/',
                requiredVersion = JSON.parse(grunt.file.read('webiq.json'));
            tplPath += name;
            if (requiredVersion && requiredVersion.requires && requiredVersion.requires.visuals) {
                requiredVersion = requiredVersion.requires.visuals || '2.2.0';
            } else {
                requiredVersion = '2.2.0';
            }
            dynamicEvaluations = {
                data: {
                    control_name: name,
                    control_class_name: name,
                    control_ui_type: name,
                    control_version: '1.0.0',
                    control_label: capitalize(name.replace(/-/g, ' ')),
                    control_default_class_name: toCamelCase(name),
                    control_default_template: tplPath,
                    control_default_name: name,
                    designer_category: 'Custom',
                    visuals_version_required: requiredVersion
                }
            };
            grunt.config('controlPackage.dynamicEvaluations', dynamicEvaluations);

            processSettingsFileLoop(dynamicEvaluations, function(loopParams) {
                if (loopParams.destinationFileName && loopParams.sourceFileName) {
                    var filePath = loopParams.customDestinationPath + loopParams.destinationFileName;
                    if (grunt.file.exists(filePath) && loopParams.onCreate) {
                        pathsToExport[filePath] = filePath;
                    } else if (!loopParams.onCreate && loopParams.onExport) {
                        pathsToExport[loopParams.sourcePath + loopParams.sourceFileName] = filePath;
                    } else {
                        notExistingFilePaths.push(filePath);
                    }
                } else if (loopParams.isDirectory) {
                    var cDirPath = loopParams.customDestinationPath;
                    if (grunt.file.exists(cDirPath)) {
                        grunt.file.recurse(cDirPath, function(absPath, rootPath, dirPath, fileName) {
                            pathsToExport[absPath] = absPath;
                        });
                    }
                }
            });

            if (notExistingFilePaths.length > 0) {
                console.log();
                console.log('Files not found:');
                notExistingFilePaths.forEach(function(path) {
                    grunt.log.writeln(cleanPath(String(path))['red']);
                });
            }
            if (Object.keys(pathsToExport).length > 0) {
                console.log();
                console.log('Files to export:');
                Object.keys(pathsToExport).forEach((path) => {
                    grunt.log.writeln(cleanPath(String(path))['green']);
                });
                console.log();
            }

            if (Object.keys(pathsToExport).length === 0) {
                return 'No files were found for this custom control name. Please check it and try again';
            } else {
                grunt.config('controlPackage.packageFiles', pathsToExport);
                return true;
            }
        } else {
            return 'Specified name too short or contains invalid characters.';
        }
    }

    /**
     * Creates a capitalized string
     *
     * @param str
     * @returns {string}
     */
    function capitalize(str) {
        var splitStr = str.toLowerCase().split('-');
        for (var i = 0; i < splitStr.length; i++) {
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        }
        return splitStr.join('');
    }

    /**
     * removes './' and '../' from a path string
     *
     * @param path {string} plath where './' and '../' will get removed
     * @returns {string}
     */
    function cleanPath(path) {
        if (typeof path === 'string') {
            var arrPath = path.split('/'),
                newPath = [];
            for (var i = 0; i < arrPath.length; i++) {
                if (arrPath[i] === '..') {
                    if (newPath.length > 0) {
                        newPath.pop();
                    }
                } else if (arrPath[i] !== '.' && arrPath[i] !== '') {
                    newPath.push(arrPath[i]);
                }
            }
            return newPath.join('/');
        }
        return false;
    }

    function processSettingsFileLoop(params, callback) {
        var createControlFiles = processSettings.createControl.files,
            modelDir = processSettings.createControl.modelDir,
            cDstnPath,
            sDstnPath;

        for (var fileType in createControlFiles) {
            if (objectHasOwnProperty(createControlFiles, fileType)) {
                var required = false,
                    onCreate = true,
                    onExport = true;
                if ('required' in createControlFiles[fileType]) {
                    required = createControlFiles[fileType].required;
                }
                if ('onCreate' in createControlFiles[fileType]) {
                    onCreate = createControlFiles[fileType].onCreate;
                }
                if ('onExport' in createControlFiles[fileType]) {
                    onExport = createControlFiles[fileType].onExport;
                }
                // only let user de/select if control is not required and supposed to get created on create
                for (var f = 0; f < createControlFiles[fileType].paths.length; f++) {
                    var src = createControlFiles[fileType].paths[f];

                    if (typeof src.path === 'object') {
                        var srcPath = Object.keys(src.path)[0];
                        if (!src.path[srcPath]) {
                            continue;
                        }

                        if (!src.fileNames) {
                            cDstnPath = cleanPath(grunt.template.process(src.path[srcPath].custom, params));
                            sDstnPath = cleanPath(grunt.template.process(src.path[srcPath].system, params));

                            callback({
                                typeName: fileType,
                                isDirectory: true,
                                sourcePath: srcPath,
                                customDestinationPath: cDstnPath + '/',
                                systemDestinationPath: sDstnPath + '/',
                                onCreate: onCreate,
                                onExport: onExport,
                                required: required
                            });
                        } else {
                            for (var fileName in src.fileNames) {
                                if (objectHasOwnProperty(src.fileNames, fileName)) {
                                    params.data.inherit_filename = fileName;
                                    cDstnPath = grunt.template.process(src.path[srcPath].custom, params);
                                    sDstnPath = grunt.template.process(src.path[srcPath].system, params);

                                    // process template and build paths
                                    callback({
                                        typeName: fileType,
                                        isDirectory: false,
                                        sourcePath: modelDir + srcPath,
                                        sourceFileName: fileName,
                                        customDestinationPath: cDstnPath,
                                        systemDestinationPath: sDstnPath,
                                        destinationFileName: grunt.template.process(src.fileNames[fileName], params),
                                        onCreate: onCreate,
                                        onExport: onExport,
                                        required: required
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     *
     */
    function controlTask() {
        if (grunt.option('create') || grunt.option('package')) {
            grunt.task.run('extract-less');
            grunt.task.run('control-config');
            grunt.task.run('control-verification');
            grunt.task.run('create-control');
            if (grunt.option('create')) {
                grunt.task.run('build-less');
            }
            grunt.task.run('create-control-log');
        } else if (grunt.option('export')) {
            grunt.task.run('extract-less');
            grunt.task.run('control-package-config');
            grunt.task.run('create-control-package');
            grunt.task.run('export-control-log');
        } else {
            grunt.log.writeln('Visuals Control Tool - 1.0.0');
            grunt.log.writeln('');
            grunt.log.writeln('--create                             Create a new control:'['green']);
            grunt.log.writeln('    --name="my-new-control"          <- Name of the new control');
            grunt.log.writeln('    --directories="less,templates"   <- Directories to be created for the new control');
            grunt.log.writeln('');
            grunt.log.writeln('    --dev                            <- ' + ('Enables the developer mode which allows' +
                              ' more options for creating a control (command prompt disabled)')['yellow']);
            grunt.log.writeln('    --system                         <- If developer mode is active, allows to create' +
                              ' a system control');
            grunt.log.writeln('    --custom                         <- If developer mode is active, creates a custom' +
                              ' control');
            grunt.log.writeln('                                     Notice: System Control can not get exported as' +
                              ' packages');
            grunt.log.writeln('');
            grunt.log.writeln('--package                            Create a new control package:'['green']);
            grunt.log.writeln('    --name="my-new-control"          <- Name of the new control');
            grunt.log.writeln('    --directories="less,templates"   <- Directories to be created for the new control');
            grunt.log.writeln('');
            grunt.log.writeln('    --dev                            command prompt disabled');
            grunt.log.writeln('                                     Notice: System Control can not get created as' +
                              ' a package');
            grunt.log.writeln('');
            grunt.log.writeln('--export                             Export a control from app as a package:'['green']);
            grunt.log.writeln('    --name="my-new-control"          <- name of the control to export');
            grunt.log.writeln('    --directories="less,templates"   <- directories of the control to export');
            grunt.log.writeln('    --all                            <- Export all directories of the control');
            grunt.log.writeln('    --delete-old                     <- Removes the control from this application if' +
                              ' export succeeded');
            grunt.log.writeln(('                                     Attention: The deletion of the control can not be' +
                               ' undone!')['yellow']);
            grunt.log.writeln('');
            grunt.log.writeln('    --dev                            <- command prompt disabled');
        }
    }

    /**
     *
     */
    function createControlLog() {
        var controlPathsWritten = grunt.config('controlPathsWritten');
        if (Array.isArray(controlPathsWritten)) {
            controlPathsWritten.forEach(function(path) {
                grunt.log.writeln(path['green']);
            });
        }
    }

    /**
     *
     */
    function exportControlLog() {
        var controlPathsWritten = grunt.config('controlExportWritten');
        if (Array.isArray(controlPathsWritten)) {
            controlPathsWritten.forEach(function(path) {
                grunt.log.writeln(path['green']);
            });
        }
    }

    /**
     * toCamelCase (https://stackoverflow.com/a/2970667)
     *
     * @param str
     * @returns {string}
     */
    function toCamelCase(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
            return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
        }).replace(/\s+/g, '').replace(/-/g, '');
    }

    return {
        controlConfig: controlConfig,
        verifyControlFiles: verifyControlFiles,
        createControl: createControl,
        controlPackageConfig: controlPackageConfig,
        exportControlPackage: exportControlPackage,
        removeExportedControl: removeExportedControl,
        controlTask: controlTask,
        exportControlLog: exportControlLog,
        createControlLog: createControlLog
    };
};
