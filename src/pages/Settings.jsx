import React, { useState } from 'react';
import { api } from '../services/api';

const Settings = () => {
    // Basic settings management
    const [url, setUrl] = useState(localStorage.getItem('GOOGLE_APPS_SCRIPT_URL') || '');

    const [status, setStatus] = useState(null);

    const handleSave = () => {
        localStorage.setItem('GOOGLE_APPS_SCRIPT_URL', url);
        alert('URL Saved. Please refresh the page.');
    };

    const testConnection = async () => {
        setStatus('Testing...');
        try {
            // Retrieve latest URL even if not saved to state yet, or use state
            const target = url || (import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL);
            if (!target) {
                setStatus('Error: No URL provided');
                return;
            }
            const res = await fetch(`${target}?op=get_all`);
            const json = await res.json();
            if (json.status === 'success') {
                setStatus('Success! Connected to Sheet.');
            } else {
                setStatus('Error: ' + JSON.stringify(json));
            }
        } catch (e) {
            setStatus('Error: ' + e.message);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    Settings
                </h2>
                <p className="text-gray-400">Configure your connection.</p>
            </div>

            <div className="glass-panel p-6 space-y-4">
                <h3 className="text-lg font-medium text-white">Data Connection</h3>
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Google Apps Script Web App URL</label>
                    <input
                        type="text"
                        placeholder="https://script.google.com/macros/s/..."
                        className="premium-input"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <button className="premium-button" onClick={handleSave}>Save Configuration</button>
                    <button
                        className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-white"
                        onClick={testConnection}
                    >
                        Test Connection
                    </button>
                </div>
                {status && (
                    <div className={`p-4 rounded-xl border ${status.includes('Success') ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        {status}
                    </div>
                )}
            </div>

            <div className="glass-panel p-6">
                <h3 className="text-lg font-medium text-white">About</h3>
                <p className="text-gray-400">FlowState v1.0.0</p>
            </div>
        </div>
    );
};

export default Settings;
