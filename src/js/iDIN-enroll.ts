import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { newPopup } from '@privacybydesign/yivi-frontend';
import { setup, showError, showWarning, clearAlerts, clearFormErrors } from './common';

interface Credential {
    credential: string;
    attributes: Record<string, string | null>;
}

interface IssuanceJwt {
    iprequest: {
        request: {
            credentials: Credential[];
        };
    };
}

const { conf, strings, irma_server_conf } = await setup();
const doneURL = 'done.html';

function addTableLine(table: HTMLTableElement | null, head: string, data: string | null): void {
    if (data === null || !table) return;
    const tbody = table.tBodies[0] ?? table;
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.scope = 'row';
    th.textContent = head;
    const td = document.createElement('td');
    td.textContent = data;
    tr.appendChild(th);
    tr.appendChild(td);
    tbody.appendChild(tr);
}

function attributeLabel(key: string): string {
    const lookup = `attribute_${key}`;
    return Object.prototype.hasOwnProperty.call(strings, lookup) ? strings[lookup] : key;
}

function displayAttributes(creds: Credential[]): void {
    const ageTable = document.getElementById('ageTable') as HTMLTableElement | null;
    const idinTable = document.getElementById('idinTable') as HTMLTableElement | null;
    const twoCredentialsWarning = document.getElementById('twoCredentialsWarning');
    for (const cred of creds) {
        if (cred.credential === conf.idin_credential_id) {
            for (const [key, value] of Object.entries(cred.attributes)) {
                const label = attributeLabel(key);
                if (key.includes('over')) {
                    addTableLine(ageTable, label, value);
                } else {
                    addTableLine(idinTable, label, value);
                }
            }
        } else if (twoCredentialsWarning) {
            twoCredentialsWarning.style.display = '';
        }
    }
}

function irmaSessionFailed(msg: unknown): void {
    const enrollPage = document.getElementById('enroll-page');
    if (enrollPage) enrollPage.style.display = '';
    const enrollBtn = document.getElementById('enroll') as HTMLButtonElement | null;
    if (enrollBtn) enrollBtn.disabled = false;
    const text = typeof msg === 'string' ? msg : String(msg);
    if (text === 'Aborted') {
        showWarning(text);
    } else {
        showError(text);
    }
}

function startEnroll(enrollBtn: HTMLButtonElement | null): void {
    clearFormErrors();
    clearAlerts();
    if (enrollBtn) enrollBtn.disabled = true;

    newPopup({
        language: irma_server_conf.language as 'en' | 'nl',
        session: {
            url: irma_server_conf.server,
            start: {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: Cookies.get('jwt'),
            },
            result: false,
        },
    })
        .start()
        .then(() => {
            window.location.replace(doneURL);
        }, irmaSessionFailed);
}

const enrollButton = document.getElementById('enroll') as HTMLButtonElement | null;
enrollButton?.addEventListener('click', () => startEnroll(enrollButton));

const jwt = Cookies.get('jwt');
if (jwt) {
    const decoded = jwtDecode<IssuanceJwt>(jwt);
    displayAttributes(decoded.iprequest.request.credentials);
}

enrollButton?.click();
