/**
 * FuelEU Maritime — ComplianceBalance Entity
 *
 * Snapshot of a ship's computed compliance balance for a given year.
 * Positive CB = Surplus, Negative CB = Deficit.
 *
 * Formula:
 *   energy   = fuelConsumption × 41,000 MJ/t
 *   CB       = (TARGET_INTENSITY − actualGhgIntensity) × energy
 */

export interface ComplianceBalance {
    /** Database primary key (UUID) */
    id: string;

    /** Ship/route identifier (maps to routeId) */
    shipId: string;

    /** Reporting year */
    year: number;

    /** Compliance balance in gCO₂eq — positive = surplus, negative = deficit */
    cbGco2eq: number;
}
