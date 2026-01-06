import React, { useState, useEffect } from 'react';
import { X, Check, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { cn } from '../../utils/cn';

const CATEGORIES = ['Food', 'Transport', 'Salary', 'Business', 'Invest', 'Fun', 'Bills', 'Other'];
const ACCOUNTS = ['Idle', 'Stocks', 'Business', 'External'];

export const QuickAddSheet = ({ isOpen, onClose }) => {
    const { addTransaction } = useFinance();
    const [step, setStep] = useState(1); // 1: Amount/Type, 2: Details

    const [formData, setFormData] = useState({
        amount: '',
        type: 'Expense',
        category: '',
        fromAccount: 'Idle',
        toAccount: 'External',
        date: new Date().toISOString().split('T')[0]
    });

    // Reset when opened
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setFormData(prev => ({ ...prev, amount: '', category: '' }));
        }
    }, [isOpen]);

    const handleType = (type) => {
        let from = 'Idle';
        let to = 'External';
        if (type === 'Income') { from = 'External'; to = 'Idle'; }
        if (type === 'Transfer') { from = 'Idle'; to = 'Stocks'; }
        setFormData(prev => ({ ...prev, type, fromAccount: from, toAccount: to }));
    };

    const handleSave = async () => {
        if (!formData.amount || !formData.category) return;
        await addTransaction({ ...formData, amount: parseFloat(formData.amount) });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#181a20] rounded-t-3xl border-t border-white/10 p-6 z-50 animate-in slide-in-from-bottom duration-300 shadow-2xl safe-area-pb">
                {/* Header handle */}
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />

                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold font-heading">New Transaction</h3>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10"><X size={20} /></button>
                </div>

                {/* Type Selector */}
                <div className="flex gap-2 mb-6 bg-black/20 p-1 rounded-xl">
                    {[
                        { id: 'Expense', icon: ArrowUpRight, color: 'text-red-400' },
                        { id: 'Income', icon: ArrowDownLeft, color: 'text-green-400' },
                        { id: 'Transfer', icon: RefreshCw, color: 'text-blue-400' }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => handleType(t.id)}
                            className={cn(
                                "flex-1 py-3 px-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all",
                                formData.type === t.id ? "bg-white/10 shadow-sm text-white" : "text-gray-500 hover:text-white"
                            )}
                        >
                            <t.icon size={16} className={formData.type === t.id ? t.color : "text-current"} />
                            {t.id}
                        </button>
                    ))}
                </div>

                {/* Amount Input */}
                <div className="mb-6 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-500 font-mono">₹</span>
                    <input
                        type="number"
                        autoFocus
                        placeholder="0"
                        className="w-full bg-transparent border-none text-5xl font-bold font-mono text-white placeholder-gray-700 focus:ring-0 pl-10 py-2"
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    />
                </div>

                {/* Category Chips */}
                <div className="mb-6 overflow-x-auto flex gap-2 pb-2 custom-scrollbar">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFormData({ ...formData, category: cat })}
                            className={cn(
                                "whitespace-nowrap px-4 py-2 rounded-full border text-sm font-medium transition-colors",
                                formData.category === cat
                                    ? "bg-white text-black border-white"
                                    : "bg-transparent text-gray-400 border-white/10 hover:border-white/30"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Details (From/To) Compact */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 p-3 rounded-xl">
                        <label className="text-xs text-gray-500 block mb-1">From</label>
                        <select
                            className="bg-transparent w-full text-sm font-medium outline-none"
                            value={formData.fromAccount}
                            onChange={e => setFormData({ ...formData, fromAccount: e.target.value })}
                        >
                            {ACCOUNTS.map(a => <option key={a} value={a} className="bg-gray-900">{a}</option>)}
                        </select>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl">
                        <label className="text-xs text-gray-500 block mb-1">To</label>
                        <select
                            className="bg-transparent w-full text-sm font-medium outline-none"
                            value={formData.toAccount}
                            onChange={e => setFormData({ ...formData, toAccount: e.target.value })}
                        >
                            {ACCOUNTS.map(a => <option key={a} value={a} className="bg-gray-900">{a}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex flex-col gap-3 mt-4">
                    <input
                        type="text"
                        placeholder="Add a note (optional)..."
                        className="w-full bg-white/5 rounded-xl px-4 py-3 outline-none text-sm"
                        value={formData.notes || ''}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    />
                    <button
                        onClick={handleSave}
                        disabled={!formData.amount || !formData.category}
                        className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl font-bold text-lg text-white shadow-lg disabled:opacity-50 disabled:grayscale active:scale-95 transition-transform"
                    >
                        Done
                    </button>
                </div>
            </div>
        </>
    );
};
