import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';

const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider = ({ children }) => {
    const [transactions, setTransactions] = useState([]);
    const [journal, setJournal] = useState([]);
    const [loading, setLoading] = useState(true);

    // Calculate Balances Derived from Transactions
    const { balances, netWealth, wealthHistory } = useMemo(() => {
        const bals = {
            'Idle': 0,
            'Stocks': 0,
            'Mutual Funds': 0,
            'Business': 0,
            'Intraday': 0,
            'Others': 0
        };

        // Process Chronologically
        const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
        const history = [];

        sorted.forEach(txn => {
            const amount = parseFloat(txn.amount);
            if (!amount) return;

            // Logic:
            // Income: External -> Account (+Account)
            // Expense: Account -> External (-Account)
            // Transfer: From -> To (-From, +To)

            if (txn.type === 'Income') {
                if (bals[txn.toAccount] !== undefined) bals[txn.toAccount] += amount;
            } else if (txn.type === 'Expense') {
                if (bals[txn.fromAccount] !== undefined) bals[txn.fromAccount] -= amount;
            } else if (txn.type === 'Transfer') {
                if (bals[txn.fromAccount] !== undefined) bals[txn.fromAccount] -= amount;
                if (bals[txn.toAccount] !== undefined) bals[txn.toAccount] += amount;
            }

            // Snapshot for Graph
            const total = Object.values(bals).reduce((a, b) => a + b, 0);
            history.push({ date: txn.date, wealth: total });
        });

        const total = Object.values(bals).reduce((a, b) => a + b, 0);
        return { balances: bals, netWealth: total, wealthHistory: history };
    }, [transactions]);

    const loadData = async () => {
        setLoading(true);
        const res = await api.fetchData();
        if (res.status === 'success') {
            setTransactions(res.data.transactions || []);
            setJournal(res.data.journal || []);
        }
        setLoading(false);
    };

    const addTransaction = async (txn) => {
        // Optimistic Update
        const tempId = Date.now();
        const newTxn = { ...txn, id: tempId };
        setTransactions(prev => [...prev, newTxn]);

        await api.addTransaction(txn);
        // Ideally we re-fetch to get the real ID, but for now this is fine
    };

    const updateJournalEntry = async (entry) => {
        // Optimistic Update
        setJournal(prev => {
            const idx = prev.findIndex(j => j.date === entry.date);
            if (idx >= 0) {
                const newArr = [...prev];
                newArr[idx] = entry;
                return newArr;
            }
            return [...prev, entry];
        });

        await api.updateJournal(entry);
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <FinanceContext.Provider value={{
            transactions,
            balances,
            netWealth,
            wealthHistory,
            journal,
            loading,
            addTransaction,
            updateJournalEntry
        }}>
            {children}
        </FinanceContext.Provider>
    );
};
