/**
 * PoolingTab — Article 21 pooling operations.
 *
 * Features:
 * - Create pool form (ship IDs + year)
 * - Pool list with net CB summary
 * - Expandable pool details showing member allocations
 */

import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../hooks/useApi';
import type { Pool } from '../../../core/domain/types';

export function PoolingTab() {
    const api = useApi();

    // Create form
    const [shipIds, setShipIds] = useState('');
    const [poolYear, setPoolYear] = useState('2024');

    // Pool list
    const [pools, setPools] = useState<Pool[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [expandedPool, setExpandedPool] = useState<string | null>(null);

    // Feedback
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchPools = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getPools();
            setPools(data);
        } catch {
            // silently fail on initial load
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        fetchPools();
    }, [fetchPools]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(null);
        setError(null);
        setCreating(true);
        try {
            const ids = shipIds
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            if (ids.length < 2) {
                setError('Enter at least 2 ship IDs (comma-separated)');
                setCreating(false);
                return;
            }
            const pool = await api.createPool({ shipIds: ids, year: Number(poolYear) });
            setSuccess(`Pool "${pool.poolId}" created with ${pool.members.length} members`);
            setShipIds('');
            await fetchPools();
            setExpandedPool(pool.poolId);
        } catch {
            setError('Pool creation failed — ensure ships have compliance records and net CB ≥ 0');
        } finally {
            setCreating(false);
        }
    };

    const totalShips = pools.reduce((sum, p) => sum + p.members.length, 0);
    const avgNetCb = pools.length > 0
        ? (pools.reduce((sum, p) => sum + p.netCb, 0) / pools.length).toFixed(0)
        : '—';

    return (
        <div className="space-y-6">
            {/* ─── Header ─────────────────────────────────────── */}
            <div>
                <h2 className="section-title">Article 21 — Pooling</h2>
                <p className="section-subtitle">
                    Group ships into compliance pools to redistribute surplus &amp; deficit
                </p>
            </div>

            {/* ─── KPI Cards ──────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="card-kpi card-kpi--primary p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">🤝</span>
                        <span className="text-xs font-medium text-surface-500">Total Pools</span>
                    </div>
                    <p className="text-2xl font-bold text-surface-900 tabular-nums">{pools.length}</p>
                </div>
                <div className="card-kpi card-kpi--success p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">🚢</span>
                        <span className="text-xs font-medium text-surface-500">Ships Pooled</span>
                    </div>
                    <p className="text-2xl font-bold text-surface-900 tabular-nums">{totalShips}</p>
                </div>
                <div className="card-kpi card-kpi--accent p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">📊</span>
                        <span className="text-xs font-medium text-surface-500">Avg Net CB</span>
                    </div>
                    <p className="text-2xl font-bold text-surface-900 tabular-nums">{avgNetCb}</p>
                    {pools.length > 0 && <p className="text-xs text-surface-400 mt-0.5">gCO₂eq</p>}
                </div>
            </div>

            {/* ─── Feedback ───────────────────────────────────── */}
            {error && (
                <div className="flex items-center gap-2 bg-error-50 border border-error-500/20 text-error-700 px-4 py-3 rounded-lg text-sm">
                    <span>⚠</span>
                    <span>{error}</span>
                </div>
            )}
            {success && (
                <div className="flex items-center gap-2 bg-success-50 border border-success-500/20 text-success-700 px-4 py-3 rounded-lg text-sm">
                    <span>✓</span>
                    <span>{success}</span>
                </div>
            )}

            {/* ─── Create Pool Form ───────────────────────────── */}
            <div className="card p-6">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center">
                        <span className="text-xl">➕</span>
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-surface-900">Create Pool</h3>
                        <p className="text-xs text-surface-400">
                            Group ships to redistribute compliance balance
                        </p>
                    </div>
                </div>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label htmlFor="pool-ships" className="block text-xs font-medium text-surface-600 mb-1">
                            Ship IDs (comma-separated)
                        </label>
                        <input
                            id="pool-ships"
                            type="text"
                            value={shipIds}
                            onChange={(e) => setShipIds(e.target.value)}
                            placeholder="e.g. SHIP-001, SHIP-002, SHIP-003"
                            required
                            className="input w-full"
                        />
                    </div>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label htmlFor="pool-year" className="block text-xs font-medium text-surface-600 mb-1">Year</label>
                            <input
                                id="pool-year"
                                type="number"
                                value={poolYear}
                                onChange={(e) => setPoolYear(e.target.value)}
                                required
                                className="input w-full"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={creating}
                            className="btn btn-primary"
                        >
                            {creating ? 'Creating...' : '🤝 Create Pool'}
                        </button>
                    </div>
                </form>
            </div>

            {/* ─── Pool List ──────────────────────────────────── */}
            {loading ? (
                <PoolListSkeleton />
            ) : pools.length === 0 ? (
                <div className="card p-12 text-center">
                    <div className="w-14 h-14 bg-accent-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🤝</span>
                    </div>
                    <h3 className="text-base font-semibold text-surface-700 mb-1">No Pools Yet</h3>
                    <p className="text-sm text-surface-400">Create a pool above to get started.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {pools.map((pool) => (
                        <div
                            key={pool.poolId}
                            className="card overflow-hidden"
                        >
                            {/* Pool Header */}
                            <button
                                onClick={() =>
                                    setExpandedPool(expandedPool === pool.poolId ? null : pool.poolId)
                                }
                                className="w-full px-5 py-4 flex items-center justify-between hover:bg-surface-50/50
                           transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center">
                                        <span className="text-lg">🤝</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-mono font-semibold text-surface-900">{pool.poolId}</p>
                                        <p className="text-xs text-surface-400">
                                            {pool.members.length} member{pool.members.length !== 1 ? 's' : ''} · Year {pool.year}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-xs text-surface-400 uppercase tracking-wider">Net CB</p>
                                        <p
                                            className={`font-mono font-bold tabular-nums ${pool.netCb >= 0 ? 'text-success-600' : 'text-error-600'
                                                }`}
                                        >
                                            {pool.netCb.toLocaleString()}
                                            <span className="text-xs font-normal text-surface-400 ml-1">gCO₂eq</span>
                                        </p>
                                    </div>
                                    <span
                                        className={`text-surface-400 transition-transform duration-200 ${expandedPool === pool.poolId ? 'rotate-180' : ''
                                            }`}
                                    >
                                        ▼
                                    </span>
                                </div>
                            </button>

                            {/* Expanded Members */}
                            {expandedPool === pool.poolId && (
                                <div className="border-t border-surface-200 px-5 py-4">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-surface-100">
                                                <th className="text-left py-2.5 pr-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                                                    Ship
                                                </th>
                                                <th className="text-right py-2.5 px-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                                                    CB Before
                                                </th>
                                                <th className="text-right py-2.5 px-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                                                    CB After
                                                </th>
                                                <th className="text-right py-2.5 pl-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                                                    Change
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-surface-50">
                                            {pool.members.map((m, idx) => {
                                                const change = m.cbAfter - m.cbBefore;
                                                return (
                                                    <tr
                                                        key={m.shipId}
                                                        className={idx % 2 === 1 ? 'bg-surface-50/50' : ''}
                                                    >
                                                        <td className="py-2.5 pr-4 font-mono font-medium text-surface-900">
                                                            {m.shipId}
                                                        </td>
                                                        <td className="py-2.5 px-4 text-right font-mono text-surface-600 tabular-nums">
                                                            {m.cbBefore.toLocaleString()}
                                                        </td>
                                                        <td className="py-2.5 px-4 text-right font-mono text-surface-900 font-semibold tabular-nums">
                                                            {m.cbAfter.toLocaleString()}
                                                        </td>
                                                        <td
                                                            className={`py-2.5 pl-4 text-right font-mono font-medium tabular-nums ${change > 0
                                                                ? 'text-success-600'
                                                                : change < 0
                                                                    ? 'text-error-600'
                                                                    : 'text-surface-400'
                                                                }`}
                                                        >
                                                            {change > 0 ? '+' : ''}
                                                            {change.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── Sub-components ──────────────────────────────────────────── */

function PoolListSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2].map((i) => (
                <div key={i} className="card p-5">
                    <div className="flex items-center gap-4">
                        <div className="skeleton w-10 h-10 rounded-xl" />
                        <div className="flex-1 space-y-2">
                            <div className="skeleton h-4 w-32 rounded" />
                            <div className="skeleton h-3 w-48 rounded" />
                        </div>
                        <div className="skeleton h-6 w-24 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}
