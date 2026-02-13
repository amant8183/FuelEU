/**
 * AppShell — Main layout with header container and tab content area.
 */

import type { ReactNode } from 'react';

interface AppShellProps {
    activeTab: string;
    tabs: { key: string; label: string; icon: string }[];
    onTabChange: (key: string) => void;
    children: ReactNode;
}

export function AppShell({ activeTab, tabs, onTabChange, children }: AppShellProps) {
    return (
        <div className="min-h-screen bg-surface-50 flex flex-col">
            {/* ─── Header ─────────────────────────────────────────── */}
            <header className="bg-white/80 backdrop-blur-md border-b border-surface-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-white text-lg">⛴</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-surface-900 leading-tight">
                                    FuelEU Maritime
                                </h1>
                                <p className="text-xs text-surface-500 leading-none">
                                    Compliance Dashboard
                                </p>
                            </div>
                        </div>

                        {/* Status badge */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-accent-50 border border-accent-200 rounded-full">
                            <span className="w-2 h-2 bg-accent-500 rounded-full animate-pulse" />
                            <span className="text-xs font-medium text-accent-700">API Connected</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* ─── Tab Navigation ────────────────────────────────── */}
            <nav className="bg-white border-b border-surface-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => onTabChange(tab.key)}
                                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2
                  transition-all duration-200 whitespace-nowrap cursor-pointer
                  ${activeTab === tab.key
                                        ? 'border-primary-500 text-primary-700 bg-primary-50/50'
                                        : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300'
                                    }
                `}
                            >
                                <span className="text-base">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* ─── Main content ──────────────────────────────────── */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>

            {/* ─── Footer ────────────────────────────────────────── */}
            <footer className="bg-white border-t border-surface-200 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <p className="text-xs text-surface-400">
                        © 2024 FuelEU Maritime — EU Regulation 2025/1221
                    </p>
                    <p className="text-xs text-surface-400">
                        Hexagonal Architecture · React · Express
                    </p>
                </div>
            </footer>
        </div>
    );
}
