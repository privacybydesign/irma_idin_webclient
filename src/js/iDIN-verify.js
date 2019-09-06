getSetupFromJson(function() {
    var success_fun = function(data) {
        $("#result_status").html(strings.verify_success);
        $("#result_header").html(strings.verify_result);
        var bd = jwt_decode(data).attributes["pbdf.pbdf.idin.dateofbirth"];
        $("#token-content").html("<b>" + strings.verify_birthdate + "</b> " + bd);
        //TODO: check for birthdate
    }

    var cancel_fun = function(data) {
        $("#result_header").html(strings.verify_result);
        $("#result_status").html(strings.verify_cancelled);
    }

    var error_fun = function(data) {
        console.log("Verification failed!");
        console.log("Error data:", data);
        $("#result_header").html(strings.verify_result);
        $("#result_status").html(strings.verify_failed);
    }

    function irma_session_failed (msg) {
        if(msg === 'CANCELLED') {
            cancel_fun(msg);
        } else {
            error_fun(msg);
        }
    }

    $("#verify_idin_bd_btn").on("click", function() {
        $("#result_header").text("");
        $("#result_status").text("");
        $("#token-content").text("");
        $.ajax({
            type: "GET",
            url: server + "/verify",
            success: function(data) {
                irma.startSession(conf.irma_server_url, data, "publickey")
                    .then(({sessionPtr, token}) => irma.handleSession(sessionPtr, {...irma_server_conf, token}))
                    .then(success_fun, irma_session_failed);
            },
            error: showError,
        });
    });

});
