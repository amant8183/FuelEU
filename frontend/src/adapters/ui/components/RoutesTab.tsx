/**
 * RoutesTab — Displays route data in a styled table.
 *
 * Features:
 * - Year filter dropdown
 * - Set Baseline button per row
 * - Compare button for non-baseline routes
 * - Skeleton loading, empty state, striped rows, hover highlights
 */

import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Star, Ship, ChevronDown, ArrowLeftRight } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import type { Route, Comparison } from '../../../core/domain/types';

export function RoutesTab() {
    const api = useApi();
    const [routes, setRoutes] = useState<Route[]>([]);
    const [allYears, setAllYears] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [yearFilter, setYearFilter] = useState<number | undefined>(undefined);
    const [comparison, setComparison] = useState<Comparison | null>(null);
    const [comparingId, setComparingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch all years once on mount (unfiltered) so the dropdown always shows every option
    useEffect(() => {
        api.getRoutes(undefined).then((data) => {
            const yrs = [...new Set(data.map((r) => r.year))].sort();
            setAllYears(yrs);
        }).catch(() => { /* silently ignore — main fetch will surface errors */ });
    }, [api]);

    const fetchRoutes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.getRoutes(yearFilter);
            setRoutes(data);
        } catch {
            setError('Failed to load routes');
        } finally {
            setLoading(false);
        }
    }, [api, yearFilter]);

    useEffect(() => {
        fetchRoutes();
    }, [fetchRoutes]);

    const handleSetBaseline = async (routeId: string) => {
        try {
            await api.setBaseline(routeId);
            await fetchRoutes();
            setComparison(null);
        } catch {
            setError('Failed to set baseline');
        }
    };

    const handleCompare = async (routeId: string) => {
        setComparingId(routeId);
        setError(null);
        try {
            const result = await api.compareRoutes(routeId);
            setComparison(result);
        } catch {
            setError('No baseline set. Please set a baseline route first.');
            setComparison(null);
        } finally {
            setComparingId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* ─── Header + Filter ─────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="section-title">Routes &amp; Voyage Data</h2>
                    <p className="section-subtitle">
                        Manage routes, set baselines, and compare GHG intensity
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            value={yearFilter ?? ''}
                            onChange={(e) =>
                                setYearFilter(e.target.value ? Number(e.target.value) : undefined)
                            }
                            className="input appearance-none pr-8 w-auto! min-w-[120px] cursor-pointer"
                        >
                            <option value="">All Years</option>
                            {allYears.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
                    </div>
                    <span className="badge badge-neutral">
                        {routes.length} route{routes.length !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {/* ─── Error ───────────────────────────────────────── */}
            {error && (
                <div className="fade-in flex items-center gap-2 bg-error-50 border border-error-500/20 text-error-700 px-4 py-3 rounded-lg text-sm">
                    <AlertTriangle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {/* ─── Table ───────────────────────────────────────── */}
            <div className="card overflow-hidden">
                {loading ? (
                    <TableSkeleton />
                ) : routes.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="table-scroll">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-surface-50/80 border-b border-surface-200">
                                    <th className="text-left px-5 py-3.5 font-semibold text-surface-500 text-xs uppercase tracking-wider">Route</th>
                                    <th className="text-left px-5 py-3.5 font-semibold text-surface-500 text-xs uppercase tracking-wider">Vessel</th>
                                    <th className="text-left px-5 py-3.5 font-semibold text-surface-500 text-xs uppercase tracking-wider">Fuel</th>
                                    <th className="text-right px-5 py-3.5 font-semibold text-surface-500 text-xs uppercase tracking-wider">Year</th>
                                    <th className="text-right px-5 py-3.5 font-semibold text-surface-500 text-xs uppercase tracking-wider">GHG Intensity</th>
                                    <th className="text-right px-5 py-3.5 font-semibold text-surface-500 text-xs uppercase tracking-wider">Fuel (t)</th>
                                    <th className="text-right px-5 py-3.5 font-semibold text-surface-500 text-xs uppercase tracking-wider">Distance (nm)</th>
                                    <th className="text-right px-5 py-3.5 font-semibold text-surface-500 text-xs uppercase tracking-wider">Emissions (t)</th>
                                    <th className="text-center px-5 py-3.5 font-semibold text-surface-500 text-xs uppercase tracking-wider w-[180px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100">
                                {routes.map((route, idx) => (
                                    <tr
                                        key={route.id}
                                        className={`
                                            table-row-hover transition-colors
                                            ${route.isBaseline ? 'bg-primary-50/30' : idx % 2 === 1 ? 'bg-surface-50/50' : ''}
                                        `}
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <span className="font-mono font-semibold text-surface-900">
                                                    {route.routeId}
                                                </span>
                                                {route.isBaseline && (
                                                    <span className="badge badge-info">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                                        Baseline
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-surface-600">{route.vesselType}</td>
                                        <td className="px-5 py-3.5">
                                            <span className="badge badge-neutral">
                                                {route.fuelType}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right text-surface-600 tabular-nums">{route.year}</td>
                                        <td className="px-5 py-3.5 text-right font-mono font-semibold text-surface-900 tabular-nums">
                                            {route.ghgIntensity.toFixed(1)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right text-surface-600 tabular-nums">
                                            {route.fuelConsumption.toLocaleString()}
                                        </td>
                                        <td className="px-5 py-3.5 text-right text-surface-600 tabular-nums">
                                            {route.distance.toLocaleString()}
                                        </td>
                                        <td className="px-5 py-3.5 text-right text-surface-600 tabular-nums">
                                            {route.totalEmissions.toLocaleString()}
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {!route.isBaseline && (
                                                    <>
                                                        <button
                                                            onClick={() => handleSetBaseline(route.routeId)}
                                                            className="btn btn-secondary btn-sm"
                                                        >
                                                            Set Baseline
                                                        </button>
                                                        <button
                                                            onClick={() => handleCompare(route.routeId)}
                                                            disabled={comparingId === route.routeId}
                                                            className="btn btn-sm"
                                                            style={{ backgroundColor: 'var(--color-accent-50)', color: 'var(--color-accent-700)', borderColor: 'var(--color-accent-200)' }}
                                                        >
                                                            {comparingId === route.routeId ? '...' : 'Compare'}
                                                        </button>
                                                    </>
                                                )}
                                                {route.isBaseline && (
                                                    <span className="text-xs text-primary-600 font-semibold flex items-center gap-1">
                                                        <Star size={12} className="text-primary-400 fill-primary-400" /> Active
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ─── Comparison Result ──────────────────────────── */}
            {comparison && (
                <div className="card p-6">
                    <h3 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
                        <ArrowLeftRight size={18} className="text-primary-500" />
                        Comparison: {comparison.baselineRouteId} vs {comparison.alternativeRouteId}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ComparisonCard
                            label="Baseline GHG"
                            value={comparison.baselineGhgIntensity.toFixed(1)}
                            unit="gCO₂eq/MJ"
                        />
                        <ComparisonCard
                            label="Alternative GHG"
                            value={comparison.alternativeGhgIntensity.toFixed(1)}
                            unit="gCO₂eq/MJ"
                        />
                        <ComparisonCard
                            label="Delta GHG"
                            value={comparison.deltaGhgIntensity.toFixed(2)}
                            unit="gCO₂eq/MJ"
                            highlight={comparison.deltaGhgIntensity > 0 ? 'positive' : 'negative'}
                        />
                        <ComparisonCard
                            label="Savings"
                            value={`${comparison.percentageSavings.toFixed(2)}%`}
                            highlight={comparison.percentageSavings > 0 ? 'positive' : 'negative'}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── Sub-components ──────────────────────────────────────────── */

function TableSkeleton() {
    return (
        <div className="p-5 space-y-3">
            {/* Header skeleton */}
            <div className="flex gap-4 mb-4">
                {[80, 60, 40, 40, 70, 50, 60, 60, 80].map((w, i) => (
                    <div key={i} className="skeleton h-4" style={{ width: `${w}px` }} />
                ))}
            </div>
            {/* Row skeletons */}
            {[...Array(5)].map((_, row) => (
                <div key={row} className="flex gap-4 py-1">
                    {[80, 60, 40, 40, 70, 50, 60, 60, 80].map((w, i) => (
                        <div key={i} className="skeleton h-5 rounded" style={{ width: `${w}px` }} />
                    ))}
                </div>
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-14 h-14 bg-surface-100 rounded-xl flex items-center justify-center mb-4">
                <Ship size={28} className="text-surface-400" />
            </div>
            <h3 className="text-base font-semibold text-surface-700 mb-1">No Routes Found</h3>
            <p className="text-sm text-surface-400 text-center max-w-sm">
                No route data is available for the selected filter. Try changing the year filter or check your data source.
            </p>
        </div>
    );
}

function ComparisonCard({
    label,
    value,
    unit,
    highlight,
}: {
    label: string;
    value: string;
    unit?: string;
    highlight?: 'positive' | 'negative';
}) {
    const accent =
        highlight === 'positive'
            ? 'card-kpi--success'
            : highlight === 'negative'
                ? 'card-kpi--error'
                : 'card-kpi--primary';

    return (
        <div className={`card-kpi ${accent} p-4`}>
            <p className="text-xs font-medium text-surface-500 mb-1">{label}</p>
            <p className="text-xl font-bold text-surface-900">{value}</p>
            {unit && <p className="text-xs text-surface-400 mt-0.5">{unit}</p>}
        </div>
    );
}
