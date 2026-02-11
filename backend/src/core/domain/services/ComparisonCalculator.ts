/**
 * FuelEU Maritime — ComparisonCalculator
 *
 * Pure domain service for comparing two routes (baseline vs alternative).
 * Computes delta GHG intensity, delta CB, and percentage savings.
 */

import { Route } from '../entities/Route';
import { computeComplianceBalance } from './ComplianceCalculator';

/** Result of comparing a baseline route against an alternative route */
export interface ComparisonResult {
    /** Baseline route identifier */
    baselineRouteId: string;

    /** Alternative route identifier */
    alternativeRouteId: string;

    /** Baseline GHG intensity (gCO₂e/MJ) */
    baselineGhgIntensity: number;

    /** Alternative GHG intensity (gCO₂e/MJ) */
    alternativeGhgIntensity: number;

    /** Delta = baseline − alternative (positive = alternative is better) */
    deltaGhgIntensity: number;

    /** Baseline CB (gCO₂eq) */
    baselineCb: number;

    /** Alternative CB (gCO₂eq) */
    alternativeCb: number;

    /** Delta CB = alternative − baseline (positive = alternative is better) */
    deltaCb: number;

    /** Percentage reduction in GHG intensity (positive = improvement) */
    percentageSavings: number;
}

/**
 * Compare two routes and compute delta metrics.
 *
 * @param baseline - The reference route
 * @param alternative - The route to compare against
 * @returns Comparison result with deltas and percentage savings
 */
export function compareRoutes(baseline: Route, alternative: Route): ComparisonResult {
    const baselineCb = computeComplianceBalance(baseline.ghgIntensity, baseline.fuelConsumption);
    const alternativeCb = computeComplianceBalance(
        alternative.ghgIntensity,
        alternative.fuelConsumption,
    );

    const deltaGhgIntensity = baseline.ghgIntensity - alternative.ghgIntensity;
    const deltaCb = alternativeCb - baselineCb;

    const percentageSavings =
        baseline.ghgIntensity === 0 ? 0 : (deltaGhgIntensity / baseline.ghgIntensity) * 100;

    return {
        baselineRouteId: baseline.routeId,
        alternativeRouteId: alternative.routeId,
        baselineGhgIntensity: baseline.ghgIntensity,
        alternativeGhgIntensity: alternative.ghgIntensity,
        deltaGhgIntensity,
        baselineCb,
        alternativeCb,
        deltaCb,
        percentageSavings,
    };
}
