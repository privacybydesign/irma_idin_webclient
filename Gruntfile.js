module.exports = function (grunt) {
    // Setup urls for the keyshare server, api server, and irma_js
    // these are used to configure the webclient
    if ( (typeof(grunt.option("irma_server_url")) === "undefined") ) {
        console.log("INFO: don't forget setting irma_server_url in conf.json or specify as grunt parameter");
    }
    if ( (typeof(grunt.option("idin_server_url")) === "undefined") ) {
        console.log("INFO: don't forget setting idin_server_url in conf.json or specify as grunt parameter");
    }
    if ( (typeof(grunt.option("language")) === "undefined") ) {
        console.log("INFO: No language chosen, assuming nl");
    }

    var conf = {
        idin_server_url: grunt.option("idin_server_url") || "<IDIN_SERVER_URL>",
        irma_server_url: grunt.option("irma_server_url") || "<IRMA_SERVER_URL>",
        language: grunt.option("language") || "nl",
    };
    conf.irma_server_url += "/api/v2";

    console.log("Configuration:", conf);

    grunt.initConfig({
        copy: {
            node_modules: {
                cwd: "node_modules",
                src: [
                    "@privacybydesign/irmajs/dist/irma.js",
                    "bootstrap/dist/**",
                    "jquery/dist/jquery.min.js",
                    "js-cookie/src/js.cookie.js",
                    "jwt-decode/build/jwt-decode.js"
                ],
                dest: "build/node_modules",
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
    grunt.loadNpmTasks("grunt-multi-lang-site-generator");
    grunt.loadNpmTasks("grunt-json-generator");

    grunt.registerTask("default", [
        "copy:non_html",
        "json_generator",
        "copy:node_modules",
        "multi_lang_site_generator",
        "copy:translated",
        "watch",
    ]);
    grunt.registerTask("build", [
        "copy:non_html",
        "json_generator",
        "copy:node_modules",
        "multi_lang_site_generator",
        "copy:translated",
    ]);
    grunt.registerTask("translate", [
        "multi_lang_site_generator",
        "copy:translated",
    ]);
};
