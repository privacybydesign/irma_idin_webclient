$(function() {
    var success_fun = function(data) {
        $("#result_status").html("Succes!");
        $("#result_header").html("Resultaat");
        var bd = jwt_decode(data).attributes["pbdf.pbdf.idinData.dateOfBirth"];
        $("#token-content").html("<b>Uw geboortedatum is:</b> " + bd);
        //TODO: check voor verjaardag
    }

    var cancel_fun = function(data) {
        $("#result_header").html("Resultaat");
        $("#result_status").html("Geannuleerd!");
    }

    var error_fun = function(data) {
        console.log("De verificatie is niet gelukt!");
        console.log("Error data:", data);
        $("#result_header").html("Resultaat");
        $("#result_status").html("Mislukt!");
    }

    $("#verify_idin_bd_btn").on("click", function() {
        $("#result_header").text("");
        $("#result_status").text("");
        $("#token-content").text("");
        $.ajax({
            type: "GET",
            url: server + "/verify",
            success: function(data) {
                IRMA.verify(data, success_fun, cancel_fun, error_fun);
            },
            error: showError,
        });

        IRMA.verify(jwt, success_fun, error_fun);
    });

});