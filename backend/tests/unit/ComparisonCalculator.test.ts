import { compareRoutes } from '../../src/core/domain/services/ComparisonCalculator';
import { Route, VesselType, FuelType } from '../../src/core/domain/entities/Route';

/** Helper to build a Route with sensible defaults */
function makeRoute(overrides: Partial<Route> & Pick<Route, 'routeId' | 'ghgIntensity' | 'fuelConsumption'>): Route {
    return {
        id: `id-${overrides.routeId}`,
        vesselType: VesselType.Container,
        fuelType: FuelType.HFO,
        year: 2025,
        distance: 1000,
        totalEmissions: 0,
        isBaseline: false,
        ...overrides,
    };
}

describe('ComparisonCalculator', () => {
    const r001 = makeRoute({ routeId: 'R001', ghgIntensity: 91.0, fuelConsumption: 5000, fuelType: FuelType.HFO });
    const r002 = makeRoute({ routeId: 'R002', ghgIntensity: 88.0, fuelConsumption: 4800, fuelType: FuelType.LNG });
    const r003 = makeRoute({ routeId: 'R003', ghgIntensity: 93.5, fuelConsumption: 5100, fuelType: FuelType.MGO });
    const r004 = makeRoute({ routeId: 'R004', ghgIntensity: 89.2, fuelConsumption: 4900, fuelType: FuelType.HFO });
    const r005 = makeRoute({ routeId: 'R005', ghgIntensity: 90.5, fuelConsumption: 4950, fuelType: FuelType.LNG });

    describe('baseline R001 vs alternatives', () => {
        it('R001 vs R002 → positive delta (R002 is better)', () => {
            const result = compareRoutes(r001, r002);
            expect(result.baselineRouteId).toBe('R001');
            expect(result.alternativeRouteId).toBe('R002');
            expect(result.deltaGhgIntensity).toBeCloseTo(3.0, 5);      // 91.0 − 88.0
            expect(result.deltaCb).toBeGreaterThan(0);                   // R002 CB > R001 CB
            expect(result.percentageSavings).toBeCloseTo((3.0 / 91.0) * 100, 2);
        });

        it('R001 vs R003 → negative delta (R003 is worse)', () => {
            const result = compareRoutes(r001, r003);
            expect(result.deltaGhgIntensity).toBeCloseTo(-2.5, 5);      // 91.0 − 93.5
            expect(result.deltaCb).toBeLessThan(0);
            expect(result.percentageSavings).toBeLessThan(0);
        });

        it('R001 vs R004 → positive delta (R004 is slightly better)', () => {
            const result = compareRoutes(r001, r004);
            expect(result.deltaGhgIntensity).toBeCloseTo(1.8, 5);       // 91.0 − 89.2
            expect(result.deltaCb).toBeGreaterThan(0);
            expect(result.percentageSavings).toBeGreaterThan(0);
        });

        it('R001 vs R005 → positive delta (R005 is slightly better)', () => {
            const result = compareRoutes(r001, r005);
            expect(result.deltaGhgIntensity).toBeCloseTo(0.5, 5);       // 91.0 − 90.5
            expect(result.deltaCb).toBeGreaterThan(0);
            expect(result.percentageSavings).toBeGreaterThan(0);
        });
    });

    describe('edge cases', () => {
        it('same route as baseline and alternative → all deltas zero', () => {
            const result = compareRoutes(r001, r001);
            expect(result.deltaGhgIntensity).toBe(0);
            expect(result.deltaCb).toBe(0);
            expect(result.percentageSavings).toBe(0);
        });

        it('zero baseline GHG intensity → percentageSavings is 0 (no division by zero)', () => {
            const zeroRoute = makeRoute({ routeId: 'R-ZERO', ghgIntensity: 0, fuelConsumption: 5000 });
            const result = compareRoutes(zeroRoute, r002);
            expect(result.percentageSavings).toBe(0);
        });

        it('result includes all required fields', () => {
            const result = compareRoutes(r001, r002);
            expect(result).toHaveProperty('baselineRouteId');
            expect(result).toHaveProperty('alternativeRouteId');
            expect(result).toHaveProperty('baselineGhgIntensity');
            expect(result).toHaveProperty('alternativeGhgIntensity');
            expect(result).toHaveProperty('deltaGhgIntensity');
            expect(result).toHaveProperty('baselineCb');
            expect(result).toHaveProperty('alternativeCb');
            expect(result).toHaveProperty('deltaCb');
            expect(result).toHaveProperty('percentageSavings');
        });
    });
});
