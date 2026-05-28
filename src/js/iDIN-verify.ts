import { jwtDecode } from 'jwt-decode';
import { newPopup } from '@privacybydesign/yivi-frontend';
import { setup, showError } from './common';

interface AttributeJwt {
    attributes: Record<string, string | undefined>;
}

const { conf, strings, server, irma_server_conf } = await setup();

function setText(id: string, text: string): void {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function renderBirthdate(birthdate: string): void {
    const tokenContent = document.getElementById('token-content');
    if (!tokenContent) return;
    const b = document.createElement('b');
    b.textContent = strings.verify_birthdate;
    tokenContent.replaceChildren(b, document.createTextNode(` ${birthdate}`));
}

function onSuccess(data: unknown): void {
    if (typeof data !== 'string') {
        console.log('Unexpected verify response:', data);
        return;
    }
    const decoded = jwtDecode<AttributeJwt>(data);
    const birthdate = decoded.attributes[`${conf.idin_credential_id}.dateofbirth`];
    if (!birthdate) {
        onError(`Missing ${conf.idin_credential_id}.dateofbirth attribute in proof`);
        return;
    }
    setText('result_status', strings.verify_success);
    setText('result_header', strings.verify_result);
    renderBirthdate(birthdate);
}

function onCancel(): void {
    setText('result_header', strings.verify_result);
    setText('result_status', strings.verify_cancelled);
}

function onError(data: unknown): void {
    console.log('Verification failed!');
    console.log('Error data:', data);
    setText('result_header', strings.verify_result);
    setText('result_status', strings.verify_failed);
}

function irmaSessionFailed(msg: unknown): void {
    if (msg === 'Aborted') {
        onCancel();
    } else {
        onError(msg);
    }
}

const verifyBtn = document.getElementById('verify_idin_bd_btn');
verifyBtn?.addEventListener('click', async () => {
    setText('result_header', '');
    setText('result_status', '');
    setText('token-content', '');

    try {
        const res = await fetch(`${server}/verify`, { method: 'GET' });
        if (!res.ok) throw new Error(res.statusText || `HTTP ${res.status}`);
        const sessionRequest = await res.text();

        newPopup({
            language: irma_server_conf.language as 'en' | 'nl',
            session: {
                url: irma_server_conf.server,
                start: {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: sessionRequest,
                },
                result: {
                    url: (o, { sessionToken }) => `${o.url}/session/${sessionToken}/getproof`,
                    parseResponse: (r) => r.text(),
                },
            },
        })
            .start()
            .then(onSuccess, irmaSessionFailed);
    } catch (err) {
        showError(err instanceof Error ? err.message : String(err));
    }
});
