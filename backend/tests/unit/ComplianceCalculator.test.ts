import {
    computeComplianceBalance,
    computeEnergy,
} from '../../src/core/domain/services/ComplianceCalculator';
import { TARGET_INTENSITY, ENERGY_FACTOR } from '../../src/shared/constants';

describe('ComplianceCalculator', () => {
    describe('computeEnergy', () => {
        it('should compute energy as fuelConsumption × 41,000', () => {
            expect(computeEnergy(5000)).toBe(5000 * ENERGY_FACTOR); // 205,000,000
            expect(computeEnergy(4800)).toBe(4800 * ENERGY_FACTOR); // 196,800,000
            expect(computeEnergy(0)).toBe(0);
        });
    });

    describe('computeComplianceBalance', () => {
        it('R001 (HFO, 91.0) → deficit', () => {
            // CB = (89.3368 − 91.0) × 5000 × 41000 = −1.6632 × 205,000,000 = −340,956,000
            const cb = computeComplianceBalance(91.0, 5000);
            expect(cb).toBeCloseTo((TARGET_INTENSITY - 91.0) * 5000 * ENERGY_FACTOR, 2);
            expect(cb).toBeLessThan(0); // Deficit
        });

        it('R002 (LNG, 88.0) → surplus', () => {
            // CB = (89.3368 − 88.0) × 4800 × 41000 = 1.3368 × 196,800,000 = 263,082,240
            const cb = computeComplianceBalance(88.0, 4800);
            expect(cb).toBeCloseTo((TARGET_INTENSITY - 88.0) * 4800 * ENERGY_FACTOR, 2);
            expect(cb).toBeGreaterThan(0); // Surplus
        });

        it('R003 (MGO, 93.5) → deficit', () => {
            const cb = computeComplianceBalance(93.5, 5100);
            expect(cb).toBeCloseTo((TARGET_INTENSITY - 93.5) * 5100 * ENERGY_FACTOR, 2);
            expect(cb).toBeLessThan(0);
        });

        it('R004 (HFO, 89.2) → near target, slight surplus', () => {
            // 89.3368 − 89.2 = 0.1368 → small positive CB
            const cb = computeComplianceBalance(89.2, 4900);
            expect(cb).toBeCloseTo((TARGET_INTENSITY - 89.2) * 4900 * ENERGY_FACTOR, 2);
            expect(cb).toBeGreaterThan(0);
        });

        it('R005 (LNG, 90.5) → deficit', () => {
            const cb = computeComplianceBalance(90.5, 4950);
            expect(cb).toBeCloseTo((TARGET_INTENSITY - 90.5) * 4950 * ENERGY_FACTOR, 2);
            expect(cb).toBeLessThan(0);
        });

        it('exactly at target → CB = 0', () => {
            const cb = computeComplianceBalance(TARGET_INTENSITY, 5000);
            expect(cb).toBe(0);
        });

        it('zero fuel consumption → CB = 0', () => {
            const cb = computeComplianceBalance(91.0, 0);
            expect(cb).toBeCloseTo(0, 10);
        });
    });
});
