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

    return (
        <div className="space-y-6">
            {/* ─── Header ─────────────────────────────────────── */}
            <div>
                <h2 className="text-2xl font-bold text-surface-900">Article 21 — Pooling</h2>
                <p className="text-sm text-surface-500 mt-1">
                    Group ships into compliance pools to redistribute surplus &amp; deficit
                </p>
            </div>

            {/* ─── KPI Cards ──────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-surface-200 p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">🤝</span>
                        <span className="text-xs font-medium text-surface-500">Total Pools</span>
                    </div>
                    <p className="text-2xl font-bold text-surface-900">{pools.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-surface-200 p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">🚢</span>
                        <span className="text-xs font-medium text-surface-500">Ships Pooled</span>
                    </div>
                    <p className="text-2xl font-bold text-surface-900">
                        {pools.reduce((sum, p) => sum + p.members.length, 0)}
                    </p>
                </div>
                <div className="bg-accent-50 rounded-xl border border-accent-200 p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">📊</span>
                        <span className="text-xs font-medium text-accent-500">Avg Net CB</span>
                    </div>
                    <p className="text-2xl font-bold text-accent-700">
                        {pools.length > 0
                            ? (pools.reduce((sum, p) => sum + p.netCb, 0) / pools.length).toFixed(0)
                            : '—'}
                    </p>
                    {pools.length > 0 && <p className="text-xs text-accent-400 mt-0.5">gCO₂eq</p>}
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

            {/* ─── Create Pool Form ───────────────────────────── */}
            <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6">
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
                        <label className="block text-xs font-medium text-surface-600 mb-1">
                            Ship IDs (comma-separated)
                        </label>
                        <input
                            type="text"
                            value={shipIds}
                            onChange={(e) => setShipIds(e.target.value)}
                            placeholder="e.g. SHIP-001, SHIP-002, SHIP-003"
                            required
                            className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white
                         text-surface-800 placeholder:text-surface-400
                         focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-400
                         transition-all"
                        />
                    </div>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-surface-600 mb-1">Year</label>
                            <input
                                type="number"
                                value={poolYear}
                                onChange={(e) => setPoolYear(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white
                           text-surface-800
                           focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-400
                           transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={creating}
                            className="px-6 py-2 bg-accent-600 text-white text-sm font-medium rounded-lg
                         hover:bg-accent-700 transition-colors disabled:opacity-50 cursor-pointer
                         shadow-sm"
                        >
                            {creating ? 'Creating...' : '🤝 Create Pool'}
                        </button>
                    </div>
                </form>
            </div>

            {/* ─── Pool List ──────────────────────────────────── */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : pools.length === 0 ? (
                <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-12 text-center">
                    <div className="w-16 h-16 bg-accent-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🤝</span>
                    </div>
                    <h3 className="text-lg font-semibold text-surface-700 mb-2">No Pools Yet</h3>
                    <p className="text-sm text-surface-400">Create a pool above to get started.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {pools.map((pool) => (
                        <div
                            key={pool.poolId}
                            className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden"
                        >
                            {/* Pool Header */}
                            <button
                                onClick={() =>
                                    setExpandedPool(expandedPool === pool.poolId ? null : pool.poolId)
                                }
                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-surface-50
                           transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center">
                                        <span className="text-lg">🤝</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-mono font-semibold text-surface-800">{pool.poolId}</p>
                                        <p className="text-xs text-surface-400">
                                            {pool.members.length} members · Year {pool.year}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-xs text-surface-400">Net CB</p>
                                        <p
                                            className={`font-mono font-bold ${pool.netCb >= 0 ? 'text-success-600' : 'text-error-600'
                                                }`}
                                        >
                                            {pool.netCb.toLocaleString()} gCO₂eq
                                        </p>
                                    </div>
                                    <span
                                        className={`text-surface-400 transition-transform ${expandedPool === pool.poolId ? 'rotate-180' : ''
                                            }`}
                                    >
                                        ▼
                                    </span>
                                </div>
                            </button>

                            {/* Expanded Members */}
                            {expandedPool === pool.poolId && (
                                <div className="border-t border-surface-200 px-6 py-4">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-surface-100">
                                                <th className="text-left py-2 text-xs font-semibold text-surface-500">
                                                    Ship
                                                </th>
                                                <th className="text-right py-2 text-xs font-semibold text-surface-500">
                                                    CB Before
                                                </th>
                                                <th className="text-right py-2 text-xs font-semibold text-surface-500">
                                                    CB After
                                                </th>
                                                <th className="text-right py-2 text-xs font-semibold text-surface-500">
                                                    Change
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pool.members.map((m) => {
                                                const change = m.cbAfter - m.cbBefore;
                                                return (
                                                    <tr
                                                        key={m.shipId}
                                                        className="border-b border-surface-50 last:border-0"
                                                    >
                                                        <td className="py-2 font-mono font-medium text-surface-800">
                                                            {m.shipId}
                                                        </td>
                                                        <td className="py-2 text-right font-mono text-surface-600">
                                                            {m.cbBefore.toLocaleString()}
                                                        </td>
                                                        <td className="py-2 text-right font-mono text-surface-800 font-semibold">
                                                            {m.cbAfter.toLocaleString()}
                                                        </td>
                                                        <td
                                                            className={`py-2 text-right font-mono font-medium ${change > 0
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
