import $ from 'jquery';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import * as yivi from '@privacybydesign/yivi-frontend';
import { setup, showError, showWarning } from './common.js';

const { conf, strings, irma_server_conf } = await setup();
const doneURL = 'done.html';

function addTableLine(table, head, data) {
    if (data !== null) {
        table.append($('<tr>')
            .append($('<th>').text(head).attr('scope', 'row'))
            .append($('<td>').text(data)));
    }
}

function displayAttributes(creds) {
    $.each(creds, function (i, cred) {
        if (cred.credential === conf.idin_credential_id) {
            $.each(cred.attributes, function (key, value) {
                if (key.includes('over')) {
                    addTableLine($('#ageTable'), strings.hasOwnProperty('attribute_' + key) ? strings['attribute_' + key] : key, value);
                } else {
                    addTableLine($('#idinTable'), strings.hasOwnProperty('attribute_' + key) ? strings['attribute_' + key] : key, value);
                }
            });
        } else {
            $('#twoCredentialsWarning').show();
        }
    });
}

function irma_session_failed(msg) {
    $('#enroll-page').show();
    $('#enroll').prop('disabled', false);
    if (msg === 'Aborted') {
        showWarning(msg);
    } else {
        showError(msg);
    }
}

$(function () {
    const enrollButton = $('#enroll');
    enrollButton.on('click', function () {
        $('.form-group').removeClass('has-error');
        $('#alert_box').empty();
        $('#enroll').prop('disabled', true);

        yivi.newPopup({
            language: irma_server_conf.language,
            session: {
                url: irma_server_conf.server,
                start: {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain',
                    },
                    body: Cookies.get('jwt'),
                },
                result: false,
            },
        })
            .start()
            .then(() => {
                window.location.replace(doneURL);
            }, irma_session_failed);
    });

    //decode the issuing JWT and show the values in a table
    const decoded = jwtDecode(Cookies.get('jwt'));
    displayAttributes(decoded.iprequest.request.credentials);

    enrollButton.trigger('click');
});
