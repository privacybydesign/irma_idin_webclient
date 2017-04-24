$(function() {
    var translTable = {
        "zipcode": "Postcode",
        "address": "Adres",
        "city": "Stad",
        "initials": "Initialen",
        "familyname": "Achternaam",
        "gender": "Geslacht",
        "dateofbirth": "Geboortedatum",
        "country": "Land",
        "telephone": "Telefoonnummer",
        "email": "E-mailadres",
        "over12": "Over 12",
        "over16": "Over 16",
        "over18": "Over 18",
        "over21": "Over 21",
        "over65": "Over 65"
    };

    var doneURL = "done.html";

    function addTableLine(head, data){
        if (data !== null) {
            $('#attributeTable')
                .append($('<tr>')
                    .append($('<th>').text(head).attr("scope", "row"))
                    .append($('<td>').text(data)
                    )
                );
        }
    }

    function displayAttributes (creds, translator) {
        $.each(creds, function(i, cred) {
            $.each(cred.attributes, function(key, value) {
                addTableLine(translator.hasOwnProperty(key) ? translator[key] : key, value);
            });
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
    displayAttributes(decoded.iprequest.request.credentials, translTable)

});
