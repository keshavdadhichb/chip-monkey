import React, { useState, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { motion } from 'framer-motion';

export const LockScreen = ({ onUnlock }) => {
    const [pin, setPin] = useState(['', '', '', '']);
    const [storedPin, setStoredPin] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        const p = localStorage.getItem('APP_PIN');
        if (p) {
            setStoredPin(p);
        } else {
            // No PIN set, auto-unlock
            onUnlock();
        }
    }, [onUnlock]);

    // Focus management
    useEffect(() => {
        const firstInput = document.getElementById('pin-0');
        if (firstInput) firstInput.focus();
    }, []);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);

        if (value && index < 3) {
            const next = document.getElementById(`pin-${index + 1}`);
            if (next) next.focus();
        }

        // Check completion
        if (newPin.every(d => d !== '')) {
            const entered = newPin.join('');
            if (entered === storedPin) {
                onUnlock();
            } else {
                setError(true);
                setTimeout(() => {
                    setPin(['', '', '', '']);
                    setError(false);
                    document.getElementById('pin-0').focus();
                }, 500);
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            const prev = document.getElementById(`pin-${index - 1}`);
            if (prev) prev.focus();
        }
    };

    if (!storedPin) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-[#0f1115] flex flex-col items-center justify-center animate-in fade-in duration-300">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-8"
            >
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-600/20 rounded-3xl flex items-center justify-center mb-4 border border-white/5 shadow-2xl shadow-purple-900/20">
                    <Lock size={40} className="text-white" />
                </div>

                <h2 className="text-2xl font-bold text-white tracking-widest uppercase">FlowState Locked</h2>

                <div className="flex gap-4">
                    {pin.map((digit, i) => (
                        <input
                            key={i}
                            id={`pin-${i}`}
                            type="password"
                            maxLength={1}
                            className={`w-14 h-16 rounded-2xl bg-white/5 border-2 text-center text-3xl font-mono text-white outline-none transition-all duration-200 focus:bg-white/10 ${error ? 'border-red-500 animate-shake' : 'focus:border-purple-500 border-white/10'}`}
                            value={digit}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                        />
                    ))}
                </div>

                {error && <p className="text-red-500 font-medium">Incorrect PIN</p>}
            </motion.div>
        </div>
    );
};
