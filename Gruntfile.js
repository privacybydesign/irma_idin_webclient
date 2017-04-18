module.exports = function (grunt) {
    // Setup urls for the keyshare server, api server, and irma_js
    // these are used to configure the webclient
    var api_server_url, api_web_url, irma_js_url;
    if ( (typeof(grunt.option("api_server_url")) === "undefined") ) {
        console.log("INFO: set api_server_url (possibly also irma_js_url) to enable email issuing");
    }

    api_server_url = grunt.option("api_server_url") + "/api/v2/";
    api_web_url = grunt.option("api_web_url") || grunt.option("api_server_url");
    api_web_url += "/server/";
    irma_js_url = grunt.option("irma_js_url") || grunt.option("api_server_url");
    irma_js_url += "/client/";

    console.log("api_server_url:", api_server_url);
    console.log("api_web_url:", api_web_url);
    console.log("irma_js_url:", irma_js_url);

    grunt.initConfig({
        copy: {
            // Copying the bower bundles is a bit of a hack
            bower_bundle: {
                cwd: "bower_components",
                src: ["**/*"],
                dest: "build/bower_components",
                expand: "true",
            },
            examples: {
                cwd: "src",
                src: ["**/*", "!**/*.html"],
                dest: "build/",
                expand: "true",
            },
        },
        "string-replace": {
            examples: {
                files: [{
                    cwd: "./src",
                    src: ["**/*.html"],
                    dest: "build/",
                    expand: "true",
                }],
                options: {
                    replacements: [{
                        pattern: /\[API_SERVER_URL\]/g,
                        replacement: api_server_url,
                    }, {
                        pattern: /\[API_WEB_URL\]/g,
                        replacement: api_web_url,
                    }, {
                        pattern: /\[IRMA_JS_URL\]/g,
                        replacement: irma_js_url,
                    },
                  ],
                },
            },
        },
        watch: {
            webfiles: {
                files: [
                    "./src/**/*",
                    "!./src/**/*.html",
                ],
                tasks: ["copy"],
            },
            htmlfiles: {
                files: [
                    "./src/**/*.html",
                ],
                tasks: ["string-replace"],
            },
        },
    });

    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-string-replace");

    grunt.registerTask("default", ["copy", "string-replace", "watch"]);
    grunt.registerTask("build", ["copy", "string-replace"]);
};
