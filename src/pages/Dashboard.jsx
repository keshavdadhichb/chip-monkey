import React from 'react';
import { useFinance } from '../context/FinanceContext';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const COLORS = ['#eab308', '#3b82f6', '#8b5cf6', '#ec4899', '#22c55e', '#64748b'];

const Card = ({ title, value, icon: Icon, color }) => (
    <div className="glass-panel p-6 flex flex-col justify-between relative overflow-hidden group">
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
            <Icon size={64} />
        </div>
        <div className="z-10">
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
            <p className="text-3xl font-bold mt-2 font-mono">
                ₹{value.toLocaleString()}
            </p>
        </div>
    </div>
);

const Dashboard = () => {
    const { netWealth, balances, wealthHistory, loading } = useFinance();

    if (loading) return <div className="p-10 text-center animate-pulse">Loading financial data...</div>;

    const pieData = Object.entries(balances)
        .filter(([_, val]) => val > 0)
        .map(([name, value]) => ({ name, value }));

    return (
        <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Overview
                    </h2>
                    <p className="text-gray-400">Your financial snapshot today.</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500 uppercase tracking-widest">Net Wealth</p>
                    <p className="text-4xl font-bold text-white font-mono tracking-tight">
                        ₹{netWealth.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Snapshot Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Liquid / Idle" value={balances['Idle']} icon={Wallet} color="text-yellow-400" />
                <Card title="Investments" value={balances['Stocks'] + balances['Mutual Funds']} icon={TrendingUp} color="text-blue-400" />
                <Card title="Business" value={balances['Business']} icon={ArrowUpRight} color="text-purple-400" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-80">

                {/* Wealth Trend */}
                <div className="glass-panel p-6 lg:col-span-2 flex flex-col h-80">
                    <h3 className="text-lg font-medium mb-4">Wealth Trend</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={wealthHistory}>
                                <defs>
                                    <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#181a20', borderColor: '#333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="wealth"
                                    stroke="#8b5cf6"
                                    fillOpacity={1}
                                    fill="url(#colorWealth)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Asset Allocation */}
                <div className="glass-panel p-6 flex flex-col h-80">
                    <h3 className="text-lg font-medium mb-4">Allocation</h3>
                    <div className="flex-1 w-full min-h-0 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#181a20', borderColor: '#333', borderRadius: '8px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-xs text-gray-500">ASSETS</span>
                        </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-400">
                        {pieData.map((d, i) => (
                            <div key={d.name} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                <span>{d.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
