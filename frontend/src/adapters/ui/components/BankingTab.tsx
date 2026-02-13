/**
 * BankingTab — Article 20 banking operations.
 *
 * Features:
 * - Deposit surplus form (shipId, amount, year)
 * - Apply banked surplus form (shipId, amount)
 * - Success/error feedback
 * - Last operation result card
 */

import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import type { BankEntry } from '../../../core/domain/types';

export function BankingTab() {
    const api = useApi();

    // Deposit form state
    const [depositShipId, setDepositShipId] = useState('');
    const [depositAmount, setDepositAmount] = useState('');
    const [depositYear, setDepositYear] = useState('2024');

    // Apply form state
    const [applyShipId, setApplyShipId] = useState('');
    const [applyAmount, setApplyAmount] = useState('');

    // KPI tracking
    const [totalDeposited, setTotalDeposited] = useState(0);
    const [totalApplied, setTotalApplied] = useState(0);
    const [depositCount, setDepositCount] = useState(0);
    const [applyCount, setApplyCount] = useState(0);

    // Feedback
    const [lastEntry, setLastEntry] = useState<BankEntry | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const clearFeedback = () => {
        setSuccess(null);
        setError(null);
    };

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearFeedback();
        setLoading(true);
        try {
            const entry = await api.bankDeposit({
                shipId: depositShipId,
                amountGco2eq: Number(depositAmount),
                year: Number(depositYear),
            });
            setLastEntry(entry);
            setTotalDeposited((prev) => prev + Number(depositAmount));
            setDepositCount((prev) => prev + 1);
            setSuccess(`Deposited ${Number(depositAmount).toLocaleString()} gCO₂eq for ${depositShipId}`);
            setDepositShipId('');
            setDepositAmount('');
        } catch {
            setError('Deposit failed — ensure the ship has a positive compliance balance.');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        clearFeedback();
        setLoading(true);
        try {
            await api.bankApply({
                shipId: applyShipId,
                amountGco2eq: Number(applyAmount),
            });
            setTotalApplied((prev) => prev + Number(applyAmount));
            setApplyCount((prev) => prev + 1);
            setSuccess(`Applied ${Number(applyAmount).toLocaleString()} gCO₂eq banked surplus for ${applyShipId}`);
            setLastEntry(null);
            setApplyShipId('');
            setApplyAmount('');
        } catch {
            setError('Apply failed — insufficient banked surplus or invalid ship.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* ─── Header ─────────────────────────────────────── */}
            <div>
                <h2 className="text-2xl font-bold text-surface-900">Article 20 — Banking</h2>
                <p className="text-sm text-surface-500 mt-1">
                    Bank surplus compliance balance or apply banked surplus to offset deficits
                </p>
            </div>

            {/* ─── KPI Cards ─────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-surface-200 p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">📥</span>
                        <span className="text-xs font-medium text-surface-500">Deposits</span>
                    </div>
                    <p className="text-2xl font-bold text-surface-900">{depositCount}</p>
                </div>
                <div className="bg-primary-50 rounded-xl border border-primary-200 p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">💰</span>
                        <span className="text-xs font-medium text-primary-500">Total Banked</span>
                    </div>
                    <p className="text-2xl font-bold text-primary-700">{totalDeposited.toLocaleString()}</p>
                    <p className="text-xs text-primary-400 mt-0.5">gCO₂eq</p>
                </div>
                <div className="bg-white rounded-xl border border-surface-200 p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">📤</span>
                        <span className="text-xs font-medium text-surface-500">Applies</span>
                    </div>
                    <p className="text-2xl font-bold text-surface-900">{applyCount}</p>
                </div>
                <div className="bg-accent-50 rounded-xl border border-accent-200 p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">🔄</span>
                        <span className="text-xs font-medium text-accent-500">Total Applied</span>
                    </div>
                    <p className="text-2xl font-bold text-accent-700">{totalApplied.toLocaleString()}</p>
                    <p className="text-xs text-accent-400 mt-0.5">gCO₂eq</p>
                </div>
            </div>

            {/* ─── Feedback ───────────────────────────────────── */}
            {error && (
                <div className="bg-error-50 border border-error-500/20 text-error-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-success-50 border border-success-500/20 text-success-700 px-4 py-3 rounded-xl text-sm">
                    {success}
                </div>
            )}

            {/* ─── Forms Grid ─────────────────────────────────── */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Deposit Card */}
                <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                            <span className="text-xl">📥</span>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-surface-900">Deposit Surplus</h3>
                            <p className="text-xs text-surface-400">Bank positive CB for future use</p>
                        </div>
                    </div>
                    <form onSubmit={handleDeposit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-surface-600 mb-1">Ship ID</label>
                            <input
                                type="text"
                                value={depositShipId}
                                onChange={(e) => setDepositShipId(e.target.value)}
                                placeholder="e.g. SHIP-001"
                                required
                                className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white
                           text-surface-800 placeholder:text-surface-400
                           focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400
                           transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-surface-600 mb-1">
                                Amount (gCO₂eq)
                            </label>
                            <input
                                type="number"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                placeholder="e.g. 5000"
                                required
                                min="1"
                                className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white
                           text-surface-800 placeholder:text-surface-400
                           focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400
                           transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-surface-600 mb-1">Year</label>
                            <input
                                type="number"
                                value={depositYear}
                                onChange={(e) => setDepositYear(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white
                           text-surface-800
                           focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400
                           transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg
                         hover:bg-primary-700 transition-colors disabled:opacity-50 cursor-pointer
                         shadow-sm"
                        >
                            {loading ? 'Processing...' : '📥 Deposit Surplus'}
                        </button>
                    </form>
                </div>

                {/* Apply Card */}
                <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center">
                            <span className="text-xl">📤</span>
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-surface-900">Apply Banked</h3>
                            <p className="text-xs text-surface-400">Use banked surplus to offset deficit</p>
                        </div>
                    </div>
                    <form onSubmit={handleApply} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-surface-600 mb-1">Ship ID</label>
                            <input
                                type="text"
                                value={applyShipId}
                                onChange={(e) => setApplyShipId(e.target.value)}
                                placeholder="e.g. SHIP-001"
                                required
                                className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white
                           text-surface-800 placeholder:text-surface-400
                           focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-400
                           transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-surface-600 mb-1">
                                Amount (gCO₂eq)
                            </label>
                            <input
                                type="number"
                                value={applyAmount}
                                onChange={(e) => setApplyAmount(e.target.value)}
                                placeholder="e.g. 3000"
                                required
                                min="1"
                                className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white
                           text-surface-800 placeholder:text-surface-400
                           focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-400
                           transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-2.5 bg-accent-600 text-white text-sm font-medium rounded-lg
                         hover:bg-accent-700 transition-colors disabled:opacity-50 cursor-pointer
                         shadow-sm mt-auto"
                        >
                            {loading ? 'Processing...' : '📤 Apply Surplus'}
                        </button>
                    </form>
                </div>
            </div>

            {/* ─── Last Deposit Result ────────────────────────── */}
            {lastEntry && (
                <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6">
                    <h3 className="text-sm font-semibold text-surface-600 mb-3">Last Deposit</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-surface-50 rounded-xl p-3">
                            <p className="text-xs text-surface-400 mb-0.5">Entry ID</p>
                            <p className="text-sm font-mono font-semibold text-surface-800">{lastEntry.id}</p>
                        </div>
                        <div className="bg-surface-50 rounded-xl p-3">
                            <p className="text-xs text-surface-400 mb-0.5">Ship</p>
                            <p className="text-sm font-mono font-semibold text-surface-800">{lastEntry.shipId}</p>
                        </div>
                        <div className="bg-surface-50 rounded-xl p-3">
                            <p className="text-xs text-surface-400 mb-0.5">Year</p>
                            <p className="text-sm font-semibold text-surface-800">{lastEntry.year}</p>
                        </div>
                        <div className="bg-primary-50 rounded-xl p-3 border border-primary-200">
                            <p className="text-xs text-primary-500 mb-0.5">Amount</p>
                            <p className="text-sm font-mono font-bold text-primary-700">
                                {lastEntry.amountGco2eq.toLocaleString()} gCO₂eq
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
