/**
 * BankingTab — Article 20 banking operations.
 *
 * Features:
 * - Deposit surplus form (shipId, amount, year)
 * - Apply banked surplus form (shipId, amount)
 * - Success/error feedback
 * - Last operation result card
 */

import { useState, useEffect } from 'react';
import { ArrowDownToLine, Wallet, ArrowUpFromLine, RefreshCw, AlertTriangle, CheckCircle, Ship } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import type { BankEntry, ComplianceBalance } from '../../../core/domain/types';

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

    // Compliance Balances
    const [complianceBalances, setComplianceBalances] = useState<ComplianceBalance[]>([]);

    useEffect(() => {
        const fetchCb = async () => {
            try {
                const data = await api.computeComplianceBalance(Number(depositYear));
                setComplianceBalances(data);
            } catch (err) {
                console.error('Failed to fetch CB', err);
            }
        };
        fetchCb();
    }, [api, depositYear, lastEntry]); // Refetch when year changes or a deposit is made

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
                <h2 className="section-title">Article 20 — Banking</h2>
                <p className="section-subtitle">
                    Bank surplus compliance balance or apply banked surplus to offset deficits
                </p>
            </div>

            {/* ─── Compliance Overview ────────────────────────── */}
            <div className="card p-6 border-l-4 border-l-primary-500">
                <h3 className="text-base font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <Ship size={18} className="text-primary-500" />
                    Compliance Balances ({depositYear})
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-surface-50 text-surface-500 font-medium">
                            <tr>
                                <th className="px-4 py-2">Ship ID</th>
                                <th className="px-4 py-2 text-right">Balance (gCO₂eq)</th>
                                <th className="px-4 py-2 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-100">
                            {complianceBalances.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-4 py-4 text-center text-surface-500 italic">
                                        No data for this year
                                    </td>
                                </tr>
                            ) : (
                                complianceBalances.map((cb) => (
                                    <tr key={cb.shipId} className="hover:bg-surface-50">
                                        <td className="px-4 py-2 font-mono text-surface-700">{cb.shipId}</td>
                                        <td className="px-4 py-2 text-right tabular-nums font-medium">
                                            {cb.cbGco2eq > 0 ? '+' : ''}{cb.cbGco2eq.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <span className={`badge ${cb.status === 'surplus' ? 'badge-success' : cb.status === 'deficit' ? 'badge-error' : 'badge-neutral'}`}>
                                                {cb.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ─── KPI Cards ─────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card-kpi card-kpi--primary p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <ArrowDownToLine size={16} className="text-primary-500" />
                        <span className="text-xs font-medium text-surface-500">Deposits</span>
                    </div>
                    <p className="text-2xl font-bold text-surface-900 tabular-nums">{depositCount}</p>
                </div>
                <div className="card-kpi card-kpi--success p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Wallet size={16} className="text-success-500" />
                        <span className="text-xs font-medium text-surface-500">Total Banked</span>
                    </div>
                    <p className="text-2xl font-bold text-surface-900 tabular-nums">{totalDeposited.toLocaleString()}</p>
                    <p className="text-xs text-surface-400 mt-0.5">gCO₂eq</p>
                </div>
                <div className="card-kpi card-kpi--accent p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <ArrowUpFromLine size={16} className="text-accent-500" />
                        <span className="text-xs font-medium text-surface-500">Applies</span>
                    </div>
                    <p className="text-2xl font-bold text-surface-900 tabular-nums">{applyCount}</p>
                </div>
                <div className="card-kpi card-kpi--error p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <RefreshCw size={16} className="text-error-500" />
                        <span className="text-xs font-medium text-surface-500">Total Applied</span>
                    </div>
                    <p className="text-2xl font-bold text-surface-900 tabular-nums">{totalApplied.toLocaleString()}</p>
                    <p className="text-xs text-surface-400 mt-0.5">gCO₂eq</p>
                </div>
            </div>

            {/* ─── Feedback ───────────────────────────────────── */}
            {error && (
                <div className="fade-in flex items-center gap-2 bg-error-50 border border-error-500/20 text-error-700 px-4 py-3 rounded-lg text-sm">
                    <AlertTriangle size={16} />
                    <span>{error}</span>
                </div>
            )}
            {success && (
                <div className="fade-in flex items-center gap-2 bg-success-50 border border-success-500/20 text-success-700 px-4 py-3 rounded-lg text-sm">
                    <CheckCircle size={16} />
                    <span>{success}</span>
                </div>
            )}

            {/* ─── Forms Grid ─────────────────────────────────── */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Deposit Card */}
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                            <ArrowDownToLine size={22} className="text-primary-400" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-surface-900">Deposit Surplus</h3>
                            <p className="text-xs text-surface-400">Bank positive CB for future use</p>
                        </div>
                    </div>
                    <form onSubmit={handleDeposit} className="space-y-4">
                        <div>
                            <label htmlFor="deposit-ship" className="block text-xs font-medium text-surface-600 mb-1">Ship ID</label>
                            <input
                                id="deposit-ship"
                                type="text"
                                value={depositShipId}
                                onChange={(e) => setDepositShipId(e.target.value)}
                                placeholder="e.g. SHIP-001"
                                required
                                className="input w-full"
                            />
                        </div>
                        <div>
                            <label htmlFor="deposit-amount" className="block text-xs font-medium text-surface-600 mb-1">
                                Amount (gCO₂eq)
                            </label>
                            <input
                                id="deposit-amount"
                                type="number"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                placeholder="e.g. 5000"
                                required
                                min="1"
                                className="input w-full"
                            />
                        </div>
                        <div>
                            <label htmlFor="deposit-year" className="block text-xs font-medium text-surface-600 mb-1">Year</label>
                            <input
                                id="deposit-year"
                                type="number"
                                value={depositYear}
                                onChange={(e) => setDepositYear(e.target.value)}
                                required
                                className="input w-full"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full"
                        >
                            {loading ? 'Processing...' : <><ArrowDownToLine size={14} /> Deposit Surplus</>}
                        </button>
                    </form>
                </div>

                {/* Apply Card */}
                <div className="card p-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center">
                            <ArrowUpFromLine size={22} className="text-accent-400" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-surface-900">Apply Banked</h3>
                            <p className="text-xs text-surface-400">Use banked surplus to offset deficit</p>
                        </div>
                    </div>
                    <form onSubmit={handleApply} className="space-y-4">
                        <div>
                            <label htmlFor="apply-ship" className="block text-xs font-medium text-surface-600 mb-1">Ship ID</label>
                            <input
                                id="apply-ship"
                                type="text"
                                value={applyShipId}
                                onChange={(e) => setApplyShipId(e.target.value)}
                                placeholder="e.g. SHIP-001"
                                required
                                className="input w-full"
                            />
                        </div>
                        <div>
                            <label htmlFor="apply-amount" className="block text-xs font-medium text-surface-600 mb-1">
                                Amount (gCO₂eq)
                            </label>
                            <input
                                id="apply-amount"
                                type="number"
                                value={applyAmount}
                                onChange={(e) => setApplyAmount(e.target.value)}
                                placeholder="e.g. 3000"
                                required
                                min="1"
                                className="input w-full"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-secondary w-full"
                        >
                            {loading ? 'Processing...' : <><ArrowUpFromLine size={14} /> Apply Surplus</>}
                        </button>
                    </form>
                </div>
            </div>

            {/* ─── Last Deposit Result ────────────────────────── */}
            {lastEntry && (
                <div className="card p-6">
                    <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-4">Last Deposit</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-surface-50 rounded-lg p-3">
                            <p className="text-xs text-surface-400 mb-0.5">Entry ID</p>
                            <p className="text-sm font-mono font-semibold text-surface-800">{lastEntry.id}</p>
                        </div>
                        <div className="bg-surface-50 rounded-lg p-3">
                            <p className="text-xs text-surface-400 mb-0.5">Ship</p>
                            <p className="text-sm font-mono font-semibold text-surface-800">{lastEntry.shipId}</p>
                        </div>
                        <div className="bg-surface-50 rounded-lg p-3">
                            <p className="text-xs text-surface-400 mb-0.5">Year</p>
                            <p className="text-sm font-semibold text-surface-800 tabular-nums">{lastEntry.year}</p>
                        </div>
                        <div className="card-kpi card-kpi--success p-3">
                            <p className="text-xs text-surface-500 mb-0.5">Amount</p>
                            <p className="text-sm font-mono font-bold text-surface-900 tabular-nums">
                                {lastEntry.amountGco2eq.toLocaleString()} gCO₂eq
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
