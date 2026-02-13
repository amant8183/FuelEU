/**
 * RoutesTab — Displays route data in a styled table.
 *
 * Features:
 * - Year filter dropdown
 * - Set Baseline button per row
 * - Compare button for non-baseline routes
 * - Visual indicators for baseline, surplus/deficit
 */

import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../hooks/useApi';
import type { Route, Comparison } from '../../../core/domain/types';

export function RoutesTab() {
    const api = useApi();
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);
    const [yearFilter, setYearFilter] = useState<number | undefined>(undefined);
    const [comparison, setComparison] = useState<Comparison | null>(null);
    const [comparingId, setComparingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

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

    const years = [...new Set(routes.map((r) => r.year))].sort();

    return (
        <div className="space-y-6">
            {/* ─── Header + Filter ─────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-surface-900">Routes & Voyage Data</h2>
                    <p className="text-sm text-surface-500 mt-1">
                        Manage routes, set baselines, and compare GHG intensity
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={yearFilter ?? ''}
                        onChange={(e) =>
                            setYearFilter(e.target.value ? Number(e.target.value) : undefined)
                        }
                        className="px-3 py-2 border border-surface-200 rounded-lg text-sm bg-white text-surface-700
                       focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400
                       transition-all"
                    >
                        <option value="">All Years</option>
                        {years.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                    <span className="text-xs text-surface-400 bg-surface-100 px-2.5 py-1 rounded-full">
                        {routes.length} routes
                    </span>
                </div>
            </div>

            {/* ─── Error ───────────────────────────────────────── */}
            {error && (
                <div className="bg-error-50 border border-error-500/20 text-error-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {/* ─── Table ───────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-surface-50 border-b border-surface-200">
                                    <th className="text-left px-4 py-3 font-semibold text-surface-600">Route</th>
                                    <th className="text-left px-4 py-3 font-semibold text-surface-600">Vessel</th>
                                    <th className="text-left px-4 py-3 font-semibold text-surface-600">Fuel</th>
                                    <th className="text-right px-4 py-3 font-semibold text-surface-600">Year</th>
                                    <th className="text-right px-4 py-3 font-semibold text-surface-600">GHG Intensity</th>
                                    <th className="text-right px-4 py-3 font-semibold text-surface-600">Fuel (t)</th>
                                    <th className="text-right px-4 py-3 font-semibold text-surface-600">Distance (nm)</th>
                                    <th className="text-right px-4 py-3 font-semibold text-surface-600">Emissions (t)</th>
                                    <th className="text-center px-4 py-3 font-semibold text-surface-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {routes.map((route) => (
                                    <tr
                                        key={route.id}
                                        className={`
                      border-b border-surface-100 transition-colors
                      ${route.isBaseline ? 'bg-primary-50/40' : 'hover:bg-surface-50'}
                    `}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-semibold text-surface-800">
                                                    {route.routeId}
                                                </span>
                                                {route.isBaseline && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-primary-500 text-white px-1.5 py-0.5 rounded">
                                                        Baseline
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-surface-600">{route.vesselType}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-0.5 bg-surface-100 text-surface-600 rounded text-xs font-medium">
                                                {route.fuelType}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-surface-600">{route.year}</td>
                                        <td className="px-4 py-3 text-right font-mono font-semibold text-surface-800">
                                            {route.ghgIntensity.toFixed(1)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-surface-600">
                                            {route.fuelConsumption.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right text-surface-600">
                                            {route.distance.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right text-surface-600">
                                            {route.totalEmissions.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {!route.isBaseline && (
                                                    <>
                                                        <button
                                                            onClick={() => handleSetBaseline(route.routeId)}
                                                            className="px-2.5 py-1 text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100
                                         rounded-lg transition-colors cursor-pointer"
                                                        >
                                                            Set Baseline
                                                        </button>
                                                        <button
                                                            onClick={() => handleCompare(route.routeId)}
                                                            disabled={comparingId === route.routeId}
                                                            className="px-2.5 py-1 text-xs font-medium text-accent-600 bg-accent-50 hover:bg-accent-100
                                         rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                                                        >
                                                            {comparingId === route.routeId ? '...' : 'Compare'}
                                                        </button>
                                                    </>
                                                )}
                                                {route.isBaseline && (
                                                    <span className="text-xs text-primary-500 font-medium">★ Active</span>
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
                <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-surface-900 mb-4">
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
    const color =
        highlight === 'positive'
            ? 'text-success-600 bg-success-50 border-success-200'
            : highlight === 'negative'
                ? 'text-error-600 bg-error-50 border-error-200'
                : 'text-surface-800 bg-surface-50 border-surface-200';

    return (
        <div className={`rounded-xl border p-4 ${color}`}>
            <p className="text-xs font-medium opacity-70 mb-1">{label}</p>
            <p className="text-xl font-bold">{value}</p>
            {unit && <p className="text-xs opacity-50 mt-0.5">{unit}</p>}
        </div>
    );
}
