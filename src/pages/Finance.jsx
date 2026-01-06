import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, ArrowDownLeft, ArrowUpRight, RefreshCw, Search } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { cn } from '../utils/cn';

const ACCOUNTS = ['Idle', 'Stocks', 'Mutual Funds', 'Business', 'Intraday', 'Others', 'External', 'Personal'];

const Finance = () => {
    const { transactions, addTransaction } = useFinance();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        type: 'Expense',
        category: '',
        amount: '',
        fromAccount: 'Idle',
        toAccount: 'External',
        notes: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.category) return;

        await addTransaction({
            ...formData,
            amount: parseFloat(formData.amount)
        });
        setIsModalOpen(false);
        // Reset form mostly
        setFormData(prev => ({ ...prev, amount: '', notes: '', category: '' }));
    };

    const handleTypeChange = (type) => {
        // Smart Defaults
        let from = 'Idle';
        let to = 'External';

        if (type === 'Income') {
            from = 'External';
            to = 'Idle';
        } else if (type === 'Transfer') {
            from = 'Idle';
            to = 'Stocks';
        }

        setFormData(prev => ({ ...prev, type, fromAccount: from, toAccount: to }));
    };

    const filteredTxns = transactions
        .filter(t => t.category.toLowerCase().includes(filter.toLowerCase()) || t.notes?.toLowerCase().includes(filter.toLowerCase()))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Transactions
                    </h2>
                    <p className="text-gray-400">Manage your income and expenses.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="premium-button"
                >
                    <Plus size={18} /> Add New
                </button>
            </div>

            {/* Filter / Search */}
            <div className="relative">
                <Search className="absolute left-4 top-3.5 text-gray-500" size={18} />
                <input
                    type="text"
                    placeholder="Search transactions..."
                    className="premium-input pl-12"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="space-y-3">
                {filteredTxns.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">No transactions found.</div>
                ) : (
                    filteredTxns.map((t) => (
                        <div key={t.id} className="glass-panel p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center",
                                    t.type === 'Income' ? "bg-green-500/20 text-green-400" :
                                        t.type === 'Expense' ? "bg-red-500/20 text-red-400" :
                                            "bg-blue-500/20 text-blue-400"
                                )}>
                                    {t.type === 'Income' ? <ArrowDownLeft size={20} /> :
                                        t.type === 'Expense' ? <ArrowUpRight size={20} /> :
                                            <RefreshCw size={20} />}
                                </div>
                                <div>
                                    <h4 className="font-medium text-white">{t.category}</h4>
                                    <p className="text-xs text-gray-500">{t.date} • {t.fromAccount} → {t.toAccount}</p>
                                </div>
                            </div>
                            <div className={cn(
                                "font-mono font-bold text-lg",
                                t.type === 'Income' ? "text-green-400" :
                                    t.type === 'Expense' ? "text-red-400" :
                                        "text-blue-400"
                            )}>
                                {t.type === 'Expense' ? '-' : '+'}₹{t.amount.toLocaleString()}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Transaction Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add Transaction"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs text-gray-400 uppercase font-semibold mb-1 block">Type</label>
                            <div className="flex bg-black/20 p-1 rounded-xl">
                                {['Income', 'Expense', 'Transfer'].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => handleTypeChange(type)}
                                        className={cn(
                                            "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                                            formData.type === type
                                                ? "bg-white/10 text-white shadow-sm"
                                                : "text-gray-500 hover:text-gray-300"
                                        )}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 uppercase font-semibold mb-1 block">Date</label>
                            <input
                                type="date"
                                required
                                className="premium-input"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 uppercase font-semibold mb-1 block">Amount</label>
                            <input
                                type="number"
                                required
                                placeholder="0.00"
                                className="premium-input font-mono"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="text-xs text-gray-400 uppercase font-semibold mb-1 block">Category</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Salary, Food, Utilities"
                                className="premium-input"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 uppercase font-semibold mb-1 block">From Account</label>
                            <select
                                className="premium-input appearance-none bg-[#1e2028]"
                                value={formData.fromAccount}
                                onChange={e => setFormData({ ...formData, fromAccount: e.target.value })}
                            >
                                {ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 uppercase font-semibold mb-1 block">To Account</label>
                            <select
                                className="premium-input appearance-none bg-[#1e2028]"
                                value={formData.toAccount}
                                onChange={e => setFormData({ ...formData, toAccount: e.target.value })}
                            >
                                {ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="text-xs text-gray-400 uppercase font-semibold mb-1 block">Notes (Optional)</label>
                            <textarea
                                className="premium-input min-h-[80px]"
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="premium-button bg-white text-black hover:bg-gray-200"
                        >
                            Save Transaction
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Finance;
