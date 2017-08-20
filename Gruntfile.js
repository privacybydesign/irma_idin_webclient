module.exports = function (grunt) {
    // Setup urls for the keyshare server, api server, and irma_js
    // these are used to configure the webclient
    if ( (typeof(grunt.option("api_server_url")) === "undefined") ) {
        console.log("INFO: set api_server_url (possibly also irma_js_url) to enable issuing");
    }
    if ( (typeof(grunt.option("idin_server_url")) === "undefined") ) {
        console.log("INFO: set idin_server_url to enable app");
    }
    if ( (typeof(grunt.option("language")) === "undefined") ) {
        console.log("INFO: No language chosen, assuming nl");
    }

    var conf = {
        idin_server_url: grunt.option("idin_server_url"),
        api_server_url: grunt.option("api_server_url") + "/api/v2/",
        api_web_url: grunt.option("api_web_url") || grunt.option("api_server_url"),
        irma_js_url: grunt.option("irma_js_url") || grunt.option("api_server_url"),
        language: grunt.option("language") || "nl",
    }
    conf.api_web_url += "/server/";
    conf.irma_js_url += "/client/";

    console.log("Configuration:", conf);

    grunt.initConfig({
        copy: {
            // Copying the bower bundles is a bit of a hack
            bower_bundle: {
                cwd: "bower_components",
                src: ["**/*"],
                dest: "build/bower_components",
                expand: "true",
            },
            non_html: {
                cwd: "src",
                src: ["**/*", "!**/*.html"],
                dest: "build/",
                expand: "true",
            },
            translated: {
                cwd: "translated/" + conf.language,
                src: ["**/*.html"],
                dest: "build/",
                expand: "true",
            },
        },
        "string-replace": {
            examples: {
                files: [{
                    cwd: "./src",
                    src: ["**/*.html"],
                    dest: "translated/",
                    expand: "true",
                }],
                options: {
                    replacements: [{
                        pattern: /\[API_SERVER_URL\]/g,
                        replacement: conf.api_server_url,
                    }, {
                        pattern: /\[API_WEB_URL\]/g,
                        replacement: conf.api_web_url,
                    }, {
                        pattern: /\[IRMA_JS_URL\]/g,
                        replacement: conf.irma_js_url,
                    }, {
                        pattern: /\[IDIN_SERVER_URL\]/g,
                        replacement: conf.idin_server_url,
                    }, {
                        pattern: /\[LANGUAGE\]/g,
                        replacement: conf.language,
                    }],
                },
            },
        },
        watch: {
            webfiles: {
                files: [
                    "./src/**/*",
                    "!./src/**/*.html",
                ],
                tasks: ["copy:non_html"],
            },
            htmlfiles: {
                files: [
                    "./src/**/*.html",
                ],
                tasks: ["translate"],
            },
            translationfiles: {
                files: [
                    "./src/languages/*",
                ],
                tasks: ["translate"],
            },
        },
        multi_lang_site_generator: {
            default: {
                options: {
                    vocabs: ["en", "nl"],
                    vocab_directory: "src/languages",
                    output_directory: "translated",
                },
                files: {
                    "index.html": ["translated/index.html"],
                    "done.html": ["translated/done.html"],
                    "error.html": ["translated/error.html"],
                    "enroll.html": ["translated/enroll.html"],
                },
            },
        },
        json_generator: {
            configuration: {
                dest: "build/conf.json",
                options: conf,
            },
        }
    });

    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-string-replace");
    grunt.loadNpmTasks("grunt-multi-lang-site-generator");
    grunt.loadNpmTasks("grunt-json-generator");

    grunt.registerTask("default", [
        "copy:non_html",
        "json_generator",
        "copy:bower_bundle",
        "string-replace",
        "multi_lang_site_generator",
        "copy:translated",
        "watch",
    ]);
    grunt.registerTask("build", [
        "copy:non_html",
        "json_generator",
        "copy:bower_bundle",
        "string-replace",
        "multi_lang_site_generator",
        "copy:translated",
    ]);
    grunt.registerTask("translate", [
        "string-replace",
        "multi_lang_site_generator",
        "copy:translated",
    ]);
};
