/**
 * RoutesTab — Displays route data in a styled table.
 *
 * Features:
 * - Year, vesselType, and fuelType filter dropdowns
 * - Set Baseline button per row
 * - Distance displayed in km
 * - Skeleton loading, empty state, striped rows, hover highlights
 */

import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Star, Ship, ChevronDown } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import type { Route } from '../../../core/domain/types';

export function RoutesTab() {
    const api = useApi();
    const [routes, setRoutes] = useState<Route[]>([]);
    const [allYears, setAllYears] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [yearFilter, setYearFilter] = useState<number | undefined>(undefined);
    const [vesselFilter, setVesselFilter] = useState<string>('');
    const [fuelFilter, setFuelFilter] = useState<string>('');
    const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
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
            setFilteredRoutes(data);
        } catch {
            setError('Failed to load routes');
        } finally {
            setLoading(false);
        }
    }, [api, yearFilter]);

    useEffect(() => {
        fetchRoutes();
    }, [fetchRoutes]);

    // Apply client-side filters
    useEffect(() => {
        let result = routes;
        if (vesselFilter) {
            result = result.filter(r => r.vesselType === vesselFilter);
        }
        if (fuelFilter) {
            result = result.filter(r => r.fuelType === fuelFilter);
        }
        setFilteredRoutes(result);
    }, [routes, vesselFilter, fuelFilter]);

    const handleSetBaseline = async (routeId: string) => {
        try {
            await api.setBaseline(routeId);
            await fetchRoutes();
        } catch {
            setError('Failed to set baseline');
        }
    };

    return (
        <div className="space-y-6">
            {/* ─── Header + Filter ─────────────────────────────── */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="section-title">Routes &amp; Voyage Data</h2>
                        <p className="section-subtitle">
                            Manage routes, set baselines, and analyze GHG intensity
                        </p>
                    </div>
                    <span className="badge badge-neutral">
                        {filteredRoutes.length} route{filteredRoutes.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Filters Toolbar */}
                <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-lg border border-surface-200 shadow-sm">
                    {/* Year Filter */}
                    <div className="relative">
                        <select
                            aria-label="Filter by year"
                            value={yearFilter ?? ''}
                            onChange={(e) =>
                                setYearFilter(e.target.value ? Number(e.target.value) : undefined)
                            }
                            className="input appearance-none pr-8 w-auto min-w-[120px] cursor-pointer text-sm py-1.5"
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

                    {/* Vessel Type Filter */}
                    <div className="relative">
                        <select
                            aria-label="Filter by vessel type"
                            value={vesselFilter}
                            onChange={(e) => setVesselFilter(e.target.value)}
                            className="input appearance-none pr-8 w-auto min-w-[140px] cursor-pointer text-sm py-1.5"
                        >
                            <option value="">All Vessels</option>
                            <option value="Container">Container</option>
                            <option value="BulkCarrier">Bulk Carrier</option>
                            <option value="Tanker">Tanker</option>
                            <option value="RoRo">RoPax / RoRo</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
                    </div>

                    {/* Fuel Type Filter */}
                    <div className="relative">
                        <select
                            aria-label="Filter by fuel type"
                            value={fuelFilter}
                            onChange={(e) => setFuelFilter(e.target.value)}
                            className="input appearance-none pr-8 w-auto min-w-[120px] cursor-pointer text-sm py-1.5"
                        >
                            <option value="">All Fuels</option>
                            <option value="HFO">HFO</option>
                            <option value="MGO">MGO</option>
                            <option value="VLSFO">VLSFO</option>
                            <option value="LNG">LNG</option>
                            <option value="Methanol">Methanol</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
                    </div>
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
                ) : filteredRoutes.length === 0 ? (
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
                                    <th className="text-right px-5 py-3.5 font-semibold text-surface-500 text-xs uppercase tracking-wider">Distance (km)</th>
                                    <th className="text-right px-5 py-3.5 font-semibold text-surface-500 text-xs uppercase tracking-wider">Emissions (t)</th>
                                    <th className="text-center px-5 py-3.5 font-semibold text-surface-500 text-xs uppercase tracking-wider w-[180px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100">
                                {filteredRoutes.map((route, idx) => (
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
                                                    <button
                                                        onClick={() => handleSetBaseline(route.routeId)}
                                                        className="btn btn-secondary btn-sm"
                                                    >
                                                        Set Baseline
                                                    </button>
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


        </div >
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


