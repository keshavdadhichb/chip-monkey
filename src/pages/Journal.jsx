import React, { useState, useEffect, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { ContributionGraph } from '../components/journal/ContributionGraph';
import { Calendar, ChevronLeft, ChevronRight, Save, Flame, Sparkles, Shuffle, Trophy, Lock } from 'lucide-react';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const HABITS = [
    { id: 'diet', label: 'Diet' },
    { id: 'fitness', label: 'Fitness' },
    { id: 'productive', label: 'Productive' },
    { id: 'business', label: 'Business' },
    { id: 'stockMarket', label: 'Stock Market' },
    { id: 'tech', label: 'Tech' },
    { id: 'md', label: 'Md' },
    { id: 'mood', label: 'Mood' },
    { id: 'social', label: 'Social' },
];

const PROMPTS = [
    "What gave you energy today?",
    "What is one thing you learned?",
    "Who are you grateful for today?",
    "What was the highlight of your day?",
    "How did you move closer to your goals?",
    "What is one thing you could have done better?",
    "What are you excited about for tomorrow?",
    "Did you step out of your comfort zone?",
];

/**
 * Rating System: -2 to +3
 */
const getRatingColor = (rating) => {
    switch (rating) {
        case -2: return 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.6)] border-red-500';
        case -1: return 'bg-red-900/60 border-red-900';
        case 0: return 'bg-white/5 border-white/10';
        case 1: return 'bg-green-900/60 border-green-900';
        case 2: return 'bg-green-600 shadow-[0_0_20px_rgba(22,163,74,0.6)] border-green-500';
        case 3: return 'bg-green-400 shadow-[0_0_30px_rgba(74,222,128,0.8)] border-green-400 text-black';
        default: return 'bg-white/5 border-white/10';
    }
};

const getRatingLabel = (rating) => {
    if (rating > 0) return `+${rating}`;
    return `${rating}`;
};

const Journal = () => {
    const { journal, updateJournalEntry } = useFinance();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [entry, setEntry] = useState({
        text: '',
        habits: HABITS.reduce((acc, h) => ({ ...acc, [h.id]: 0 }), {})
    });
    const [showGraphs, setShowGraphs] = useState(false);

    // Locking Logic
    const todayStr = new Date().toISOString().split('T')[0];
    const isLocked = selectedDate !== todayStr;

    // Load entry
    useEffect(() => {
        if (!journal) return;
        const existing = journal.find(j => j.date === selectedDate);
        if (existing) {
            setEntry({
                text: existing.text || '',
                habits: { ...HABITS.reduce((acc, h) => ({ ...acc, [h.id]: 0 }), {}), ...(existing.habits || {}) }
            });
        } else {
            setEntry({
                text: '',
                habits: HABITS.reduce((acc, h) => ({ ...acc, [h.id]: 0 }), {})
            });
        }
    }, [selectedDate, journal]);

    // Calculate Streaks
    const streaks = useMemo(() => {
        if (!journal) return {};
        const res = {};
        const journalMap = new Map(journal.map(j => [j.date, j]));

        HABITS.forEach(h => {
            let streak = 0;
            let d = new Date();
            for (let i = 0; i < 365; i++) {
                const dateStr = d.toISOString().split('T')[0];
                const entry = journalMap.get(dateStr);
                const val = entry?.habits?.[h.id] || 0;

                if (val > 0) streak++;
                else if (i === 0 && val === 0) { /* continue */ }
                else break;
                d.setDate(d.getDate() - 1);
            }
            res[h.id] = streak;
        });
        return res;
    }, [journal]);

    // Calculate Daily Score
    const flowScore = useMemo(() => {
        let score = 0;
        Object.values(entry.habits).forEach(v => score += v);
        // Boost for completion (if all habits are non-zero)
        const nonZeroCount = Object.values(entry.habits).filter(v => v !== 0).length;
        if (nonZeroCount === HABITS.length) score += 5; // Completion bonus
        return score;
    }, [entry.habits]);

    const handleHabitClick = (id) => {
        if (isLocked) return; // Prevent editing if locked

        setEntry(prev => {
            const current = prev.habits[id] || 0;
            // Cycle: 0 -> 1 -> 2 -> 3 -> -2 -> -1 -> 0
            let next = 0;
            if (current === 0) next = 1;
            else if (current === 1) next = 2;
            else if (current === 2) next = 3;
            else if (current === 3) next = -2;
            else if (current === -2) next = -1;
            else if (current === -1) next = 0;

            return {
                ...prev,
                habits: { ...prev.habits, [id]: next }
            };
        });
    };

    const handleSave = async () => {
        await updateJournalEntry({
            date: selectedDate,
            ...entry
        });
        // Confetti if good score!
        if (flowScore > 5) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    };

    const insertPrompt = () => {
        const randomPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
        setEntry(prev => ({
            ...prev,
            text: (prev.text ? prev.text + '\n\n' : '') + `**${randomPrompt}**\n`
        }));
    };

    const shiftDate = (days) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + days);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 font-heading">
                        Journal
                    </h2>
                    <p className="text-gray-400">Track your flow.</p>
                </div>

                <div className="flex items-center gap-4 bg-black/20 p-2 rounded-xl border border-white/5 backdrop-blur-md">
                    <button onClick={() => shiftDate(-1)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"><ChevronLeft size={20} /></button>
                    <div className="flex items-center gap-2 font-mono text-lg font-medium min-w-[140px] justify-center text-purple-200">
                        {isLocked ? <Lock size={16} className="text-gray-500" /> : <Calendar size={18} className="text-purple-500" />}
                        <span className={isLocked ? "text-gray-500" : ""}>{selectedDate}</span>
                    </div>
                    <button onClick={() => shiftDate(1)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"><ChevronRight size={20} /></button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">

                    {/* DAILY SCORE CARD */}
                    <div className="glass-panel p-6 flex items-center justify-between bg-gradient-to-r from-purple-900/20 to-blue-900/20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                                <Trophy size={24} />
                            </div>
                            <div>
                                <h4 className="text-gray-400 text-xs uppercase font-bold tracking-wider">Flow Score</h4>
                                <div className="text-2xl font-bold font-mono text-white">{flowScore > 0 ? `+${flowScore}` : flowScore}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-500">{flowScore > 10 ? 'Excellent Flow' : flowScore > 5 ? 'Good Flow' : 'Keep Going'}</div>
                        </div>
                    </div>

                    {/* Habits Grid */}
                    <div className="glass-panel p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-300 font-heading">Daily Habits</h3>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                {isLocked ? (
                                    <span className="text-gray-500 flex items-center gap-1"><Lock size={10} /> Read Only</span>
                                ) : (
                                    <>
                                        <Sparkles size={12} className="text-yellow-500" />
                                        <span>Tap to cycle</span>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {HABITS.map(h => {
                                const level = entry.habits[h.id] || 0;
                                const streak = streaks[h.id] || 0;

                                return (
                                    <motion.button
                                        key={h.id}
                                        layout
                                        whileTap={!isLocked ? { scale: 0.95 } : {}}
                                        onClick={() => handleHabitClick(h.id)}
                                        className={cn(
                                            "relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 min-h-[110px] overflow-hidden",
                                            getRatingColor(level),
                                            level !== 0 && "text-white",
                                            isLocked && "cursor-not-allowed opacity-80"
                                        )}
                                    >
                                        {/* Background Blur Effect for "Glow" */}
                                        {level > 1 && (
                                            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-150 animate-pulse pointer-events-none" />
                                        )}

                                        <div className="relative z-10 flex flex-col items-center">
                                            <span className="text-[10px] font-bold uppercase tracking-widest mb-2 opacity-80">{h.label}</span>
                                            <span className="text-2xl font-bold font-mono">{level === 0 ? '·' : getRatingLabel(level)}</span>

                                            {/* Streak Badge */}
                                            {streak > 0 && (
                                                <motion.div
                                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                                    className="absolute top-1 right-1 flex items-center gap-0.5 bg-black/40 px-1.5 py-0.5 rounded-full backdrop-blur-md"
                                                >
                                                    <Flame size={10} className={cn("fill-current", streak > 3 ? "text-orange-500" : "text-gray-400")} />
                                                    <span className={cn("text-[8px] font-mono", streak > 3 ? "text-orange-200" : "text-gray-400")}>{streak}</span>
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="glass-panel p-6 flex flex-col h-[300px] relative overflow-hidden group">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-medium text-gray-300 font-heading">Reflections</h3>
                                {isLocked && (
                                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-400 font-mono flex items-center gap-1">
                                        🔒 Locked
                                    </span>
                                )}
                            </div>
                            {!isLocked && (
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 180 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={insertPrompt}
                                    className="p-2 text-purple-400 hover:text-white transition-colors"
                                >
                                    <Shuffle size={18} />
                                </motion.button>
                            )}
                        </div>
                        <textarea
                            className={cn(
                                "flex-1 bg-transparent border-none outline-none resize-none text-lg leading-relaxed text-gray-200 placeholder-gray-600 custom-scrollbar z-10",
                                isLocked && "opacity-70 cursor-not-allowed text-gray-400"
                            )}
                            readOnly={isLocked}
                            placeholder={isLocked ? "Entry locked." : "How was your flow today?"}
                            value={entry.text}
                            onChange={(e) => setEntry(prev => ({ ...prev, text: e.target.value }))}
                        />
                        {/* Ambient Background for Text Area */}
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/10 transition-colors duration-500" />

                        {!isLocked && (
                            <div className="flex justify-end pt-4 border-t border-white/5 z-10">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSave}
                                    className="premium-button"
                                >
                                    <Save size={18} /> Save Entry
                                </motion.button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-300 font-heading">Consistency</h3>
                            <button
                                onClick={() => setShowGraphs(!showGraphs)}
                                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                            >
                                {showGraphs ? 'Collapse' : 'Show All'}
                            </button>
                        </div>

                        <div className="space-y-6 overflow-y-auto max-h-[600px] custom-scrollbar pr-2">
                            {(showGraphs ? HABITS : HABITS.slice(0, 3)).map(habit => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={habit.id}
                                >
                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                        <span className="uppercase font-semibold tracking-wider">{habit.label}</span>
                                        <span className="font-mono text-gray-600">
                                            {streaks[habit.id] > 0 ? `${streaks[habit.id]} day streak` : ''}
                                        </span>
                                    </div>
                                    <ContributionGraph
                                        data={journal || []}
                                        year={new Date().getFullYear()}
                                        getValue={(row) => row.habits?.[habit.id] || 0}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Journal;
