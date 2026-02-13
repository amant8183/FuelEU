/**
 * ComplianceTab — Displays compliance balance data.
 *
 * Features:
 * - Compute CB button (triggers analysis)
 * - Toggle between raw CB and adjusted (with banking)
 * - Surplus/deficit status badges with color coding
 * - KPI summary cards at top
 */

import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import type { ComplianceBalance, AdjustedComplianceBalance } from '../../../core/domain/types';

type ViewMode = 'raw' | 'adjusted';

export function ComplianceTab() {
    const api = useApi();
    const [records, setRecords] = useState<ComplianceBalance[]>([]);
    const [adjustedRecords, setAdjustedRecords] = useState<AdjustedComplianceBalance[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('raw');
    const [loading, setLoading] = useState(false);
    const [computed, setComputed] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCompute = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.computeComplianceBalance();
            setRecords(data);
            setComputed(true);
        } catch {
            setError('Failed to compute compliance balance');
        } finally {
            setLoading(false);
        }
    };

    const handleFetchAdjusted = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getAdjustedComplianceBalance();
            setAdjustedRecords(data);
            setViewMode('adjusted');
        } catch {
            setError('Failed to fetch adjusted compliance. Run "Compute CB" first.');
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch adjusted when switching to that view
    useEffect(() => {
        if (viewMode === 'adjusted' && adjustedRecords.length === 0 && computed) {
            handleFetchAdjusted();
        }
    }, [viewMode]);

    const activeRecords = viewMode === 'raw' ? records : adjustedRecords;
    const surplusCount = activeRecords.filter((r) => r.status === 'surplus').length;
    const deficitCount = activeRecords.filter((r) => r.status === 'deficit').length;

    return (
        <div className="space-y-6">
            {/* ─── Header ─────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-surface-900">Compliance Balance</h2>
                    <p className="text-sm text-surface-500 mt-1">
                        Compute and inspect GHG compliance per vessel
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCompute}
                        disabled={loading}
                        className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg
                       hover:bg-primary-700 transition-colors disabled:opacity-50 cursor-pointer
                       shadow-sm"
                    >
                        {loading && viewMode === 'raw' ? 'Computing...' : '⚡ Compute CB'}
                    </button>
                    {computed && (
                        <button
                            onClick={handleFetchAdjusted}
                            disabled={loading}
                            className="px-4 py-2 bg-accent-600 text-white text-sm font-medium rounded-lg
                         hover:bg-accent-700 transition-colors disabled:opacity-50 cursor-pointer
                         shadow-sm"
                        >
                            {loading && viewMode === 'adjusted' ? 'Loading...' : '🏦 Adjusted View'}
                        </button>
                    )}
                </div>
            </div>

            {/* ─── Error ───────────────────────────────────────── */}
            {error && (
                <div className="bg-error-50 border border-error-500/20 text-error-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* ─── KPI Cards ──────────────────────────────────── */}
            {activeRecords.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KpiCard label="Total Ships" value={activeRecords.length.toString()} icon="🚢" />
                    <KpiCard
                        label="Surplus"
                        value={surplusCount.toString()}
                        icon="✅"
                        color="success"
                    />
                    <KpiCard
                        label="Deficit"
                        value={deficitCount.toString()}
                        icon="⚠️"
                        color="error"
                    />
                    <KpiCard
                        label="View Mode"
                        value={viewMode === 'raw' ? 'Raw CB' : 'Adjusted'}
                        icon={viewMode === 'raw' ? '📊' : '🏦'}
                        color="info"
                    />
                </div>
            )}

            {/* ─── View Toggle ────────────────────────────────── */}
            {computed && (
                <div className="flex gap-1 bg-surface-100 rounded-lg p-1 w-fit">
                    <button
                        onClick={() => setViewMode('raw')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${viewMode === 'raw'
                                ? 'bg-white text-surface-800 shadow-sm'
                                : 'text-surface-500 hover:text-surface-700'
                            }`}
                    >
                        Raw CB
                    </button>
                    <button
                        onClick={() => {
                            setViewMode('adjusted');
                            if (adjustedRecords.length === 0) handleFetchAdjusted();
                        }}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${viewMode === 'adjusted'
                                ? 'bg-white text-surface-800 shadow-sm'
                                : 'text-surface-500 hover:text-surface-700'
                            }`}
                    >
                        With Banking
                    </button>
                </div>
            )}

            {/* ─── Empty State ────────────────────────────────── */}
            {!computed && !loading && (
                <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-12 text-center">
                    <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📊</span>
                    </div>
                    <h3 className="text-lg font-semibold text-surface-700 mb-2">
                        No Compliance Data Yet
                    </h3>
                    <p className="text-sm text-surface-400 max-w-md mx-auto mb-4">
                        Click "Compute CB" to analyze GHG compliance balance for all routes.
                    </p>
                </div>
            )}

            {/* ─── Table ───────────────────────────────────────── */}
            {activeRecords.length > 0 && (
                <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-surface-50 border-b border-surface-200">
                                    <th className="text-left px-4 py-3 font-semibold text-surface-600">Ship</th>
                                    <th className="text-right px-4 py-3 font-semibold text-surface-600">Year</th>
                                    {viewMode === 'adjusted' && (
                                        <>
                                            <th className="text-right px-4 py-3 font-semibold text-surface-600">
                                                Raw CB (gCO₂eq)
                                            </th>
                                            <th className="text-right px-4 py-3 font-semibold text-surface-600">
                                                Banked
                                            </th>
                                        </>
                                    )}
                                    <th className="text-right px-4 py-3 font-semibold text-surface-600">
                                        {viewMode === 'adjusted' ? 'Adjusted CB' : 'CB (gCO₂eq)'}
                                    </th>
                                    <th className="text-center px-4 py-3 font-semibold text-surface-600">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeRecords.map((rec) => (
                                    <tr
                                        key={`${rec.shipId}-${rec.year}`}
                                        className="border-b border-surface-100 hover:bg-surface-50 transition-colors"
                                    >
                                        <td className="px-4 py-3 font-mono font-semibold text-surface-800">
                                            {rec.shipId}
                                        </td>
                                        <td className="px-4 py-3 text-right text-surface-600">{rec.year}</td>
                                        {viewMode === 'adjusted' && 'rawCbGco2eq' in rec && (
                                            <>
                                                <td className="px-4 py-3 text-right font-mono text-surface-600">
                                                    {(rec as AdjustedComplianceBalance).rawCbGco2eq.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-accent-600">
                                                    {(rec as AdjustedComplianceBalance).bankedSurplus.toLocaleString()}
                                                </td>
                                            </>
                                        )}
                                        <td className="px-4 py-3 text-right font-mono font-semibold text-surface-800">
                                            {rec.cbGco2eq.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <StatusBadge status={rec.status} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        surplus: 'bg-success-50 text-success-700 border-success-200',
        deficit: 'bg-error-50 text-error-700 border-error-200',
        neutral: 'bg-surface-100 text-surface-600 border-surface-200',
    };

    return (
        <span
            className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border ${styles[status] ?? styles.neutral
                }`}
        >
            {status === 'surplus' ? '✓ Surplus' : status === 'deficit' ? '✗ Deficit' : '— Neutral'}
        </span>
    );
}

function KpiCard({
    label,
    value,
    icon,
    color,
}: {
    label: string;
    value: string;
    icon: string;
    color?: 'success' | 'error' | 'info';
}) {
    const bg =
        color === 'success'
            ? 'bg-success-50 border-success-200'
            : color === 'error'
                ? 'bg-error-50 border-error-200'
                : color === 'info'
                    ? 'bg-info-50 border-info-200'
                    : 'bg-white border-surface-200';

    return (
        <div className={`rounded-xl border p-4 ${bg}`}>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{icon}</span>
                <span className="text-xs font-medium text-surface-500">{label}</span>
            </div>
            <p className="text-2xl font-bold text-surface-900">{value}</p>
        </div>
    );
}
