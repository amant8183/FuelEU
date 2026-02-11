/**
 * FuelEU Maritime — ComplianceCalculator
 *
 * Pure domain service for computing Compliance Balance.
 *
 * Formula (from assignment & EU 2023/1805 Annex IV):
 *   energy = fuelConsumption × ENERGY_FACTOR (41,000 MJ/t)
 *   CB     = (TARGET_INTENSITY − actualGhgIntensity) × energy
 *
 * Result:
 *   CB > 0 → Surplus
 *   CB < 0 → Deficit
 */

import { TARGET_INTENSITY, ENERGY_FACTOR } from '../../../shared/constants';

/**
 * Compute the energy in scope (MJ) from fuel consumption (tonnes).
 */
export function computeEnergy(fuelConsumptionTonnes: number): number {
    return fuelConsumptionTonnes * ENERGY_FACTOR;
}

/**
 * Compute the Compliance Balance (gCO₂eq).
 *
 * @param actualGhgIntensity - Actual GHG intensity in gCO₂e/MJ
 * @param fuelConsumptionTonnes - Fuel consumption in tonnes
 * @returns CB value in gCO₂eq (positive = surplus, negative = deficit)
 */
export function computeComplianceBalance(
    actualGhgIntensity: number,
    fuelConsumptionTonnes: number,
): number {
    const energy = computeEnergy(fuelConsumptionTonnes);
    return (TARGET_INTENSITY - actualGhgIntensity) * energy;
}
