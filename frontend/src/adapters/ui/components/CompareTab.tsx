/**
 * CompareTab — Visualize compliance comparison.
 *
 * Features:
 * - Table comparing all routes against the baseline
 * - Recharts BarChart visualizing GHG intensity vs Target
 * - KPI cards for key metrics
 */

import { useState, useEffect } from 'react';
import { GitCompareArrows, AlertTriangle, CheckCircle, BarChart3, Ship } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import type { Comparison } from '../../../core/domain/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

export function CompareTab() {
    const api = useApi();
    const [comparisons, setComparisons] = useState<Comparison[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [baselineId, setBaselineId] = useState<string | null>(null);

    useEffect(() => {
        fetchComparisons();
    }, []);

    const fetchComparisons = async () => {
        setLoading(true);
        try {
            // 1. Fetch all routes to find baseline
            const allRoutes = await api.getRoutes();
            const baseline = allRoutes.find(r => r.isBaseline);

            if (!baseline) {
                setBaselineId(null);
                setComparisons([]);
                setLoading(false);
                return;
            }

            setBaselineId(baseline.routeId);

            // 2. Compare each non-baseline route against baseline
            const others = allRoutes.filter(r => !r.isBaseline);
            const results = await Promise.all(
                others.map(route => api.compareRoutes(route.routeId))
            );

            setComparisons(results);
        } catch (err) {
            setError('Failed to load comparison data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <CompareSkeleton />;
    if (error) return <div className="p-8 text-center text-error-600"><AlertTriangle className="mx-auto mb-2" />{error}</div>;
    if (!baselineId) return <EmptyState />;

    // Prepare chart data
    const chartData = comparisons.map(c => ({
        name: c.alternativeRouteId,
        ghg: c.alternativeGhgIntensity,
        baseline: c.baselineGhgIntensity,
        compliant: c.compliant
    }));

    // Add baseline to chart
    if (comparisons.length > 0) {
        chartData.unshift({
            name: 'Baseline',
            ghg: comparisons[0].baselineGhgIntensity,
            baseline: comparisons[0].baselineGhgIntensity,
            compliant: comparisons[0].baselineGhgIntensity <= 89.3368
        });
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-surface-900 flex items-center gap-2">
                        <GitCompareArrows className="text-primary-500" />
                        Compliance Comparison
                    </h2>
                    <p className="text-sm text-surface-500">
                        Comparing routes against baseline <span className="font-mono font-bold text-primary-600">{baselineId}</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <span className="badge badge-neutral flex items-center gap-1">
                        Target: <span className="font-mono font-bold">89.34</span> gCO₂/MJ
                    </span>
                </div>
            </div>

            {/* Chart Section */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold text-surface-800 mb-6 flex items-center gap-2">
                    <BarChart3 size={20} className="text-surface-400" />
                    GHG Intensity Visualization
                </h3>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} label={{ value: 'gCO₂e/MJ', angle: -90, position: 'insideLeft', fill: '#9ca3af', fontSize: 12 }} />
                            <Tooltip
                                cursor={{ fill: 'var(--color-surface-50)' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <ReferenceLine y={89.3368} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Target (89.34)', fill: '#ef4444', fontSize: 12 }} />
                            <Bar dataKey="ghg" name="GHG Intensity" radius={[6, 6, 0, 0]} maxBarSize={60}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.compliant ? 'var(--color-success-500)' : 'var(--color-error-500)'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Table Section */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-surface-50 border-b border-surface-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-surface-600">Route ID</th>
                                <th className="px-6 py-4 font-semibold text-right text-surface-600">GHG Intensity</th>
                                <th className="px-6 py-4 font-semibold text-right text-surface-600">% Diff vs Baseline</th>
                                <th className="px-6 py-4 font-semibold text-right text-surface-600">Savings</th>
                                <th className="px-6 py-4 font-semibold text-center text-surface-600">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-100 bg-white">
                            {comparisons.map((comp) => (
                                <tr key={comp.alternativeRouteId} className="hover:bg-surface-50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-medium text-surface-900">
                                        {comp.alternativeRouteId}
                                    </td>
                                    <td className="px-6 py-4 text-right tabular-nums text-surface-700">
                                        {comp.alternativeGhgIntensity.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-right tabular-nums">
                                        <span className={comp.percentDiff > 0 ? 'text-error-600 font-medium' : 'text-success-600 font-medium'}>
                                            {comp.percentDiff > 0 ? '+' : ''}{comp.percentDiff.toFixed(2)}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right tabular-nums text-surface-600">
                                        {comp.percentageSavings.toFixed(2)}%
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {comp.compliant ? (
                                            <span className="badge badge-success inline-flex items-center gap-1">
                                                <CheckCircle size={12} /> Compliant
                                            </span>
                                        ) : (
                                            <span className="badge badge-error inline-flex items-center gap-1">
                                                <AlertTriangle size={12} /> Non-Compliant
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function CompareSkeleton() {
    return (
        <div className="space-y-6">
            <div className="h-10 w-1/3 bg-surface-200 rounded animate-pulse" />
            <div className="h-[400px] w-full bg-surface-100 rounded-xl animate-pulse" />
            <div className="h-64 w-full bg-surface-100 rounded-xl animate-pulse" />
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mb-4 text-surface-400">
                <Ship size={32} />
            </div>
            <h3 className="text-lg font-semibold text-surface-900 mb-2">No Baseline Set</h3>
            <p className="text-surface-500 max-w-sm">
                Go to the <strong>Routes</strong> tab and set a baseline route to start comparing compliance data.
            </p>
        </div>
    );
}
