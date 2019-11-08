getSetupFromJson(function() {
    var doneURL = "done.html";

    function addTableLine(table, head, data){
        if (data !== null) {
            //$('#attributeTable')
            table.append($('<tr>')
                    .append($('<th>').text(head).attr("scope", "row"))
                    .append($('<td>').text(data)
                    )
                );
            table.parent().show();
        }
    }


    function displayAttributes (creds) {
        $.each(creds, function(i, cred) {
            if (cred.credential === conf.idin_credential_id){
                $.each(cred.attributes, function(key, value) {
                    addTableLine($('#idinTable'), strings.hasOwnProperty("attribute_" + key) ? strings["attribute_" + key] : key, value);
                });
            } else {
                $.each(cred.attributes, function(key, value) {
                    addTableLine($('#ageTable'), strings.hasOwnProperty("attribute_" + key) ? strings["attribute_" + key] : key, value);
                });
            }
        });
    }

    function irma_session_failed (msg) {
        $("#enroll").prop('disabled', false);
        if(msg === 'CANCELLED') {
            showWarning(msg);
        } else {
            showError(msg);
        }
    }

    //set issuing functionality to button
    $("#enroll").on("click", function() {
        // Clear errors
        $(".form-group").removeClass("has-error");
        $("#alert_box").empty();
        //disable enroll button
        $("#enroll").prop('disabled', true);

        irma.startSession(conf.irma_server_url, Cookies.get("jwt"), "publickey")
            .then(({sessionPtr, token}) => irma.handleSession(sessionPtr, {...irma_server_conf, token}))
            .then(() => {
                window.location.replace(doneURL);
            }, irma_session_failed);
    });

    //decode the issuing JWT and show the values in a table
    var decoded = jwt_decode(Cookies.get("jwt"));
    displayAttributes(decoded.iprequest.request.credentials)

});
