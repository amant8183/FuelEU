/**
 * DTOs for Comparison operations
 */

/** Input DTO — compare request */
export interface CompareInput {
    alternativeRouteId: string;
}

/** Output DTO — comparison result returned to the client */
export interface ComparisonDto {
    baselineRouteId: string;
    alternativeRouteId: string;
    baselineGhgIntensity: number;
    alternativeGhgIntensity: number;
    deltaGhgIntensity: number;
    baselineCb: number;
    alternativeCb: number;
    deltaCb: number;
    percentageSavings: number;
    percentDiff: number;
    compliant: boolean;
}
