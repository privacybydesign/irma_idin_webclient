import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';

export function setup() {
    console.log('Running setup');
    return new Promise((resolve, reject) => {
        $.getJSON('conf.json', function (conf) {
            console.log('Configuration:', conf);
            $.getJSON('languages/' + conf.language + '.json', function (strings) {
                console.log('Loaded language strings');
                resolve({
                    conf,
                    strings,
                    server: `${conf.idin_server_url}/api/v1/idin`,
                    irma_server_conf: {
                        language: conf.language,
                        server: conf.irma_server_url,
                    },
                });
            }).fail(reject);
        }).fail(reject);
    });
}

export function showError(message) {
    $('#alert_box').html('<div class="alert alert-danger" role="alert">'
        + '<strong>' + message + '</strong></div>');
}

export function showWarning(msg) {
    $('#alert_box').html('<div class="alert alert-warning" role="alert">'
        + '<strong>Warning:</strong> ' + msg + '</div>');
}

export function showSuccess(msg) {
    $('#alert_box').html('<div class="alert alert-success" role="alert">'
        + msg + '</div>');
}
