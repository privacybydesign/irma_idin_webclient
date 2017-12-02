$(function() {
    var doneURL = "done.html";

    function addTableLine(table, head, data){
        if (data !== null) {
            //$('#attributeTable')
            table.append($('<tr>')
                    .append($('<th>').text(head).attr("scope", "row"))
                    .append($('<td>').text(data)
                    )
                );
        }
    }


    function displayAttributes (creds) {
        $.each(creds, function(i, cred) {
            if (cred.credential === "pbdf.pbdf.idin"){
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

    //set issuing functionality to button
    $("#enroll").on("click", function() {
        // Clear errors
        $(".form-group").removeClass("has-error");
        $("#alert_box").empty();
        //disable enroll button
        $("#enroll").prop('disabled', true);
        IRMA.issue(Cookies.get("jwt"),
            function() {
                window.location.replace(doneURL);
            },
            function(msg) {
                $("#enroll").prop('disabled', false);
                showWarning(msg);
            },
            function(msg) {
                $("#enroll").prop('disabled', false);
                showError(msg);
            });
    });

    //decode the issuing JWT and show the values in a table
    var decoded = jwt_decode(Cookies.get("jwt"));
    displayAttributes(decoded.iprequest.request.credentials)

});
