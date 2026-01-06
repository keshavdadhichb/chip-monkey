import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Book, Settings, Wallet, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useFinance } from '../../context/FinanceContext';
import { QuickAddSheet } from '../finance/QuickAddSheet';

const NavItem = ({ to, icon: Icon, label, mobile = false }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            cn(
                "flex items-center gap-3 transition-all duration-200 group relative",
                mobile
                    ? "flex-col justify-center p-2 rounded-xl"
                    : "px-4 py-3 rounded-xl",
                isActive
                    ? mobile ? "text-white" : "bg-white/10 text-white shadow-lg backdrop-blur-sm border border-white/10"
                    : "text-gray-500 hover:text-white hover:bg-white/5"
            )
        }
    >
        <Icon size={mobile ? 24 : 20} className={cn("transition-transform", !mobile && "group-hover:scale-110", mobile && "mb-1")} />
        {mobile && <span className="text-[10px] font-medium">{label}</span>}
        {!mobile && <span className="font-medium">{label}</span>}
    </NavLink>
);

export const AppLayout = ({ children }) => {
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-[#0f1115] text-white font-sans">
            <QuickAddSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} />

            {/* Desktop Sidebar (Hidden on Mobile) */}
            <aside className="hidden md:flex w-64 h-full glass-panel m-4 mr-0 flex-col p-6 fixed left-0 top-0 bottom-0 z-50">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <span className="font-bold text-white">F</span>
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 font-heading">
                        FlowState
                    </h1>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem to="/finance" icon={Wallet} label="Finance" />
                    <NavItem to="/journal" icon={Book} label="Journal" />
                    <NavItem to="/settings" icon={Settings} label="Settings" />
                </nav>

                <div className="mt-auto pt-6 border-t border-white/5">
                    <button
                        onClick={() => setIsSheetOpen(true)}
                        className="premium-button w-full justify-center shadow-lg shadow-purple-500/20"
                    >
                        <Plus size={18} /> Quick Add
                    </button>
                    <p className="text-xs text-center text-gray-500 mt-4">
                        v1.1.0 • Mobile First
                    </p>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 h-full overflow-auto md:ml-[18rem]">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between p-4 bg-[#0f1115]/80 backdrop-blur-md sticky top-0 z-40 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            <span className="font-bold text-white text-xs">F</span>
                        </div>
                        <h1 className="text-lg font-bold font-heading">FlowState</h1>
                    </div>
                </header>

                <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Nav (Hidden on Desktop) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#15171c]/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-2 z-50 pb-2 safe-area-pb">
                <NavItem to="/" icon={LayoutDashboard} label="Home" mobile />
                <NavItem to="/finance" icon={Wallet} label="Finance" mobile />

                {/* FAB */}
                <div className="relative -top-5">
                    <button
                        onClick={() => setIsSheetOpen(true)}
                        className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 border-4 border-[#0f1115] active:scale-95 transition-transform"
                    >
                        <Plus size={28} strokeWidth={2.5} />
                    </button>
                </div>

                <NavItem to="/journal" icon={Book} label="Journal" mobile />
                <NavItem to="/settings" icon={Settings} label="Settings" mobile />
            </nav>
        </div>
    );
};
