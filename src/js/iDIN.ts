import { setup, showError, clearAlerts, clearFormErrors } from './common';

interface Issuer {
    issuerName: string;
    issuerID: string;
}

type BankData = Record<string, Issuer[]>;

const { server } = await setup();

const bankSelect = document.getElementById('bank-select') as HTMLSelectElement | null;
const continueBtn = document.getElementById('continue') as HTMLInputElement | HTMLButtonElement | null;
const form = document.getElementById('form') as HTMLFormElement | null;

function populateBankSelect(data: BankData): void {
    if (!bankSelect) return;
    for (const [countryName, issuers] of Object.entries(data)) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = countryName;
        for (const issuer of issuers) {
            const option = document.createElement('option');
            option.value = issuer.issuerID;
            option.textContent = issuer.issuerName;
            optgroup.appendChild(option);
        }
        bankSelect.appendChild(optgroup);
    }
}

async function getBanks(): Promise<void> {
    try {
        const res = await fetch(`${server}/banks`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
        });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = (await res.json()) as BankData;
        populateBankSelect(data);
    } catch (err) {
        console.log(err);
    }
}

getBanks();

bankSelect?.addEventListener('change', () => {
    if (continueBtn) continueBtn.disabled = bankSelect.value === 'default';
});

form?.addEventListener('submit', async (event) => {
    console.log('submit pressed');
    event.preventDefault();

    clearFormErrors();
    clearAlerts();

    const issuerID = bankSelect?.value ?? '';

    try {
        const res = await fetch(`${server}/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
            body: issuerID,
        });
        if (!res.ok) {
            let description = res.statusText;
            try {
                const errBody = (await res.json()) as { description?: string };
                if (typeof errBody.description === 'string') description = errBody.description;
            } catch {
                // response was not JSON; keep statusText
            }
            throw new Error(description);
        }
        const url = await res.text();
        console.log(`redirect to: ${url}`);
        window.location.replace(url);
    } catch (err) {
        console.log(err);
        showError(err instanceof Error ? err.message : String(err));
    }
});
