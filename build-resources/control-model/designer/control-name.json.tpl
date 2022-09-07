{
    "uiType": "<%= control_ui_type %>",
    "version": "<%= control_version %>",
    "variant": null,
    "options": [],
    "designer": {
        "info": {
            "category": "<%= designer_category %>",
            "label": "<%= control_label %>",
            "icon-src": "pics/custom/icons/ico_trend_display2.svg",
            "icon-class": null,
            "nolist": false
        },
        "categories": [
            {
                "name": "Referential",
                "label": "${ReferentialAttributes}",
                "toggleModule": null,
                "patterns": [
                    {
                        "name": "INPUT_STRING",
                        "slots": ["name"],
                        "options": {
                            "label" : "${designer.control.control-name}",
                            "validator": "validators.general.controlName"
                        }
                    },
                    {
                        "name": "INPUT_FILE_REFERENCE",
                        "slots": ["template"],
                        "options": {
                            "label": "${designer.control.functionalTemplate}",
                            "base-path": "templates/",
                            "extensions": ["html"],
                            "omit-extension": true,
                            "omit-base-path": true
                        }
                    },
                    {
                        "name": "INPUT_CLASSLIST_STRING",
                        "slots": ["class-name"],
                        "options": {
                            "label" : "${designer.control.class-name}",
                            "validator": "validators.general.classList"
                        }
                    }
                ]
            },
            {
                "name": "Data",
                "label": "${DataAttributes}",
                "toggleModule": null,
                "patterns": []
            }
        ],
        "defaultConfig": {
            "class-name": "<%= control_class_name %>",
            "template": "<%= control_default_template %>",
            "name": "<%= control_default_name %>"
        }
    },
    "locale": {
        "designer": {},
        "app": {}
    },
    "examples": [],
    "links": []
}
