/**
 * AppShell — Main layout with header container and tab content area.
 */

import type { ReactNode } from 'react';
import { Ship, Wifi } from 'lucide-react';

interface AppShellProps {
    activeTab: string;
    tabs: { key: string; label: string; icon: ReactNode }[];
    onTabChange: (key: string) => void;
    children: ReactNode;
}

export function AppShell({ activeTab, tabs, onTabChange, children }: AppShellProps) {
    return (
        <div className="min-h-screen bg-surface-50 flex flex-col">
            {/* Skip to main content link for keyboard users */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2
                           focus:z-100 focus:bg-primary-600 focus:text-white focus:px-4 focus:py-2
                           focus:rounded-lg focus:text-sm focus:font-medium"
            >
                Skip to main content
            </a>
            {/* ─── Header ─────────────────────────────────────────── */}
            <header className="bg-[#fefdfb]/80 backdrop-blur-md border-b border-surface-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-linear-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-sm" aria-hidden="true">
                                <Ship size={20} className="text-white" />
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
                            <Wifi size={12} className="text-accent-500 animate-pulse" aria-hidden="true" />
                            <span className="text-xs font-medium text-accent-700" role="status">API Connected</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* ─── Tab Navigation ────────────────────────────────── */}
            <nav className="bg-[#fefdfb] border-b border-surface-200" aria-label="Main navigation">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex gap-1 overflow-x-auto scrollbar-hide -mb-px" role="tablist" aria-label="Dashboard sections">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => onTabChange(tab.key)}
                                role="tab"
                                aria-selected={activeTab === tab.key}
                                aria-controls={`tabpanel-${tab.key}`}
                                id={`tab-${tab.key}`}
                                className={`
                                    flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2
                                    transition-all duration-200 whitespace-nowrap cursor-pointer
                                    ${activeTab === tab.key
                                        ? 'border-primary-500 text-primary-700 bg-primary-50/50'
                                        : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-300'
                                    }
                                `}
                            >
                                <span aria-hidden="true">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* ─── Main content ──────────────────────────────────── */}
            <main
                id="main-content"
                role="tabpanel"
                aria-labelledby={`tab-${activeTab}`}
                className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6"
            >
                {children}
            </main>

            {/* ─── Footer ────────────────────────────────────────── */}
            <footer className="bg-[#fefdfb] border-t border-surface-200 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-1">
                    <p className="text-xs text-surface-400">
                        © 2024 FuelEU Maritime — EU Regulation 2025/1221
                    </p>
                    <p className="text-xs text-surface-400 hidden sm:block">
                        Hexagonal Architecture · React · Express
                    </p>
                </div>
            </footer>
        </div>
    );
}
