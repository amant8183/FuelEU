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
                    <h2 className="section-title">Compliance Balance</h2>
                    <p className="section-subtitle">
                        Compute and inspect GHG compliance per vessel
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCompute}
                        disabled={loading}
                        className="btn btn-primary"
                    >
                        {loading && viewMode === 'raw' ? 'Computing...' : '⚡ Compute CB'}
                    </button>
                    {computed && (
                        <button
                            onClick={handleFetchAdjusted}
                            disabled={loading}
                            className="btn btn-secondary"
                        >
                            {loading && viewMode === 'adjusted' ? 'Loading...' : '🏦 Adjusted View'}
                        </button>
                    )}
                </div>
            </div>

            {/* ─── Error ───────────────────────────────────────── */}
            {error && (
                <div className="flex items-center gap-2 bg-error-50 border border-error-500/20 text-error-700 px-4 py-3 rounded-lg text-sm">
                    <span>⚠</span>
                    <span>{error}</span>
                </div>
            )}

            {/* ─── KPI Cards ──────────────────────────────────── */}
            {activeRecords.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <KpiCard label="Total Ships" value={activeRecords.length.toString()} icon="🚢" accent="primary" />
                    <KpiCard
                        label="Surplus"
                        value={surplusCount.toString()}
                        icon="✅"
                        accent="success"
                    />
                    <KpiCard
                        label="Deficit"
                        value={deficitCount.toString()}
                        icon="⚠️"
                        accent="error"
                    />
                    <KpiCard
                        label="View Mode"
                        value={viewMode === 'raw' ? 'Raw CB' : 'Adjusted'}
                        icon={viewMode === 'raw' ? '📊' : '🏦'}
                        accent="accent"
                    />
                </div>
            )}

            {/* ─── View Toggle ────────────────────────────────── */}
            {computed && (
                <div className="toggle-group">
                    <button
                        onClick={() => setViewMode('raw')}
                        className={`toggle-btn ${viewMode === 'raw' ? 'toggle-btn--active' : ''}`}
                    >
                        Raw CB
                    </button>
                    <button
                        onClick={() => {
                            setViewMode('adjusted');
                            if (adjustedRecords.length === 0) handleFetchAdjusted();
                        }}
                        className={`toggle-btn ${viewMode === 'adjusted' ? 'toggle-btn--active' : ''}`}
                    >
                        With Banking
                    </button>
                </div>
            )}

            {/* ─── Empty State ────────────────────────────────── */}
            {!computed && !loading && (
                <div className="card p-12 text-center">
                    <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📊</span>
                    </div>
                    <h3 className="text-base font-semibold text-surface-700 mb-1">
                        No Compliance Data Yet
                    </h3>
                    <p className="text-sm text-surface-400 max-w-sm mx-auto">
                        Click "Compute CB" to analyze GHG compliance balance for all routes.
                    </p>
                </div>
            )}

            {/* ─── Table ───────────────────────────────────────── */}
            {activeRecords.length > 0 && (
                <div className="card overflow-hidden">
                    {/* Ship count summary */}
                    <div className="px-5 py-3 border-b border-surface-100 flex items-center justify-between">
                        <span className="text-xs font-medium text-surface-500">
                            {activeRecords.length} vessel{activeRecords.length !== 1 ? 's' : ''} analyzed
                        </span>
                        <span className="badge badge-neutral text-xs">
                            {viewMode === 'raw' ? 'Raw' : 'Adjusted'}
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-surface-50/80 border-b border-surface-200">
                                    <th className="text-left px-5 py-3.5 font-semibold text-surface-500 text-xs uppercase tracking-wider">Ship</th>
                                    <th className="text-right px-5 py-3.5 font-semibold text-surface-500 text-xs uppercase tracking-wider">Year</th>
                                    {viewMode === 'adjusted' && (
                                        <>
                                            <th className="text-right px-5 py-3.5 font-semibold text-surface-500 text-xs uppercase tracking-wider">
                                                Raw CB (gCO₂eq)
                                            </th>
                                            <th className="text-right px-5 py-3.5 font-semibold text-surface-500 text-xs uppercase tracking-wider">
                                                Banked
                                            </th>
                                        </>
                                    )}
                                    <th className="text-right px-5 py-3.5 font-semibold text-surface-500 text-xs uppercase tracking-wider">
                                        {viewMode === 'adjusted' ? 'Adjusted CB' : 'CB (gCO₂eq)'}
                                    </th>
                                    <th className="text-center px-5 py-3.5 font-semibold text-surface-500 text-xs uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100">
                                {activeRecords.map((rec, idx) => (
                                    <tr
                                        key={`${rec.shipId}-${rec.year}`}
                                        className={`table-row-hover transition-colors ${idx % 2 === 1 ? 'bg-surface-50/50' : ''}`}
                                        style={{
                                            borderLeftColor: rec.status === 'surplus'
                                                ? 'var(--color-success-400)'
                                                : rec.status === 'deficit'
                                                    ? 'var(--color-error-400)'
                                                    : undefined
                                        }}
                                    >
                                        <td className="px-5 py-3.5 font-mono font-semibold text-surface-900">
                                            {rec.shipId}
                                        </td>
                                        <td className="px-5 py-3.5 text-right text-surface-600 tabular-nums">{rec.year}</td>
                                        {viewMode === 'adjusted' && 'rawCbGco2eq' in rec && (
                                            <>
                                                <td className="px-5 py-3.5 text-right font-mono text-surface-600 tabular-nums">
                                                    {(rec as AdjustedComplianceBalance).rawCbGco2eq.toLocaleString()}
                                                </td>
                                                <td className="px-5 py-3.5 text-right font-mono text-accent-600 tabular-nums">
                                                    {(rec as AdjustedComplianceBalance).bankedSurplus.toLocaleString()}
                                                </td>
                                            </>
                                        )}
                                        <td className="px-5 py-3.5 text-right font-mono font-bold text-surface-900 tabular-nums">
                                            {rec.cbGco2eq.toLocaleString()}
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
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

/* ─── Sub-components ──────────────────────────────────────────── */

function StatusBadge({ status }: { status: string }) {
    const cls =
        status === 'surplus'
            ? 'badge badge-surplus'
            : status === 'deficit'
                ? 'badge badge-deficit'
                : 'badge badge-neutral';

    return (
        <span className={cls}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'surplus' ? 'bg-success-600' : status === 'deficit' ? 'bg-error-600' : 'bg-surface-400'
                }`} />
            {status === 'surplus' ? 'Surplus' : status === 'deficit' ? 'Deficit' : 'Neutral'}
        </span>
    );
}

function KpiCard({
    label,
    value,
    icon,
    accent,
}: {
    label: string;
    value: string;
    icon: string;
    accent?: 'primary' | 'success' | 'error' | 'accent';
}) {
    const accentCls =
        accent === 'success'
            ? 'card-kpi--success'
            : accent === 'error'
                ? 'card-kpi--error'
                : accent === 'accent'
                    ? 'card-kpi--accent'
                    : 'card-kpi--primary';

    return (
        <div className={`card-kpi ${accentCls} p-4`}>
            <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{icon}</span>
                <span className="text-xs font-medium text-surface-500">{label}</span>
            </div>
            <p className="text-2xl font-bold text-surface-900">{value}</p>
        </div>
    );
}
