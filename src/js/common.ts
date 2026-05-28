import 'bootstrap/dist/css/bootstrap.min.css';

export interface Conf {
    idin_server_url: string;
    irma_server_url: string;
    language: string;
    idin_credential_id: string;
}

export type LanguageStrings = Record<string, string>;

export interface SetupResult {
    conf: Conf;
    strings: LanguageStrings;
    server: string;
    irma_server_conf: {
        language: string;
        server: string;
    };
}

async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    }
    return (await res.json()) as T;
}

export async function setup(): Promise<SetupResult> {
    console.log('Running setup');
    const conf = await fetchJson<Conf>('conf.json');
    console.log('Configuration:', conf);
    const strings = await fetchJson<LanguageStrings>(`languages/${conf.language}.json`);
    console.log('Loaded language strings');
    return {
        conf,
        strings,
        server: `${conf.idin_server_url}/api/v1/idin`,
        irma_server_conf: {
            language: conf.language,
            server: conf.irma_server_url,
        },
    };
}

function setAlert(node: HTMLElement): void {
    const box = document.getElementById('alert_box');
    if (!box) return;
    box.replaceChildren(node);
}

function makeAlert(variant: 'danger' | 'warning' | 'success', children: Node[]): HTMLDivElement {
    const div = document.createElement('div');
    div.className = `alert alert-${variant}`;
    div.setAttribute('role', 'alert');
    for (const child of children) div.appendChild(child);
    return div;
}

export function showError(message: string): void {
    const strong = document.createElement('strong');
    strong.textContent = message;
    setAlert(makeAlert('danger', [strong]));
}

export function showWarning(msg: string): void {
    const strong = document.createElement('strong');
    strong.textContent = 'Warning:';
    setAlert(makeAlert('warning', [strong, document.createTextNode(` ${msg}`)]));
}

export function showSuccess(msg: string): void {
    setAlert(makeAlert('success', [document.createTextNode(msg)]));
}

export function clearAlerts(): void {
    const box = document.getElementById('alert_box');
    if (box) box.replaceChildren();
}

export function clearFormErrors(): void {
    document.querySelectorAll('.form-group').forEach((el) => el.classList.remove('has-error'));
}
