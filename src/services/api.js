export const API_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || localStorage.getItem('GOOGLE_APPS_SCRIPT_URL');

export const api = {
    async fetchData() {
        if (!API_URL) {
            console.error("No API URL configured. Please set VITE_GOOGLE_APPS_SCRIPT_URL in .env");
            return { status: 'error', message: 'No API URL configured' };
        }

        try {
            const res = await fetch(`${API_URL}?op=get_all`);
            const json = await res.json();
            return json;
        } catch (e) {
            console.error("API Error", e);
            return { status: 'error', message: e.message };
        }
    },

    async addTransaction(txn) {
        if (!API_URL) return { status: 'error', message: 'No API URL' };

        const res = await fetch(API_URL, {
            method: 'POST',
            // Apps Script Web App can't handle OPTIONS preflight for application/json.
            // Using text/plain (default) avoids preflight.
            body: JSON.stringify({ op: 'add_transaction', transaction: txn })
        });
        return await res.json();
    },

    async updateJournal(entry) {
        if (!API_URL) return { status: 'error', message: 'No API URL' };

        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ op: 'update_journal', entry })
        });
        return await res.json();
    }
};
