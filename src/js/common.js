var conf, strings, server;

function getSetupFromJson() {
    console.log("Running getSetupFromJson");

    $.getJSON("conf.json", function(json) {
        conf = json;
        console.log("Configuration:", conf);

        $.getJSON("languages/" + conf.language + ".json", function(text) {
            strings = text;
            console.log("Loaded language strings");
        });
    });
}

function showError(message) {
    $("#alert_box").html("<div class=\"alert alert-danger\" role=\"alert\">"
        + "<strong>" + message + "</strong></div>");
}

var showWarning = function(msg) {
    $("#alert_box").html("<div class=\"alert alert-warning\" role=\"alert\">"
        + "<strong>Warning:</strong> " + msg + "</div>");
};

var showSuccess = function(msg) {
    $("#alert_box").html("<div class=\"alert alert-success\" role=\"alert\">"
        + msg + "</div>");
};

$(function() {
    getSetupFromJson();
})
