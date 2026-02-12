import { CompareRoutesUseCase } from '../../src/core/application/use-cases/CompareRoutesUseCase';
import { RouteRepository } from '../../src/core/ports/outbound/RouteRepository';
import { Route, VesselType, FuelType } from '../../src/core/domain/entities/Route';
import { NoBaselineError, RouteNotFoundError } from '../../src/shared/errors';

/** Stub route factory */
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

const baseline = makeRoute({ routeId: 'R001', ghgIntensity: 91.0, fuelConsumption: 5000, isBaseline: true });
const alternative = makeRoute({ routeId: 'R002', ghgIntensity: 88.0, fuelConsumption: 4800, fuelType: FuelType.LNG });

/** Mock RouteRepository */
function createMockRepo(overrides: Partial<RouteRepository> = {}): RouteRepository {
    return {
        findAll: jest.fn().mockResolvedValue([]),
        findByRouteId: jest.fn().mockResolvedValue(null),
        findBaseline: jest.fn().mockResolvedValue(null),
        setBaseline: jest.fn().mockResolvedValue(undefined),
        save: jest.fn().mockResolvedValue(undefined),
        seedAll: jest.fn().mockResolvedValue(undefined),
        ...overrides,
    };
}

describe('CompareRoutesUseCase', () => {
    it('throws NoBaselineError when no baseline is set', async () => {
        const repo = createMockRepo();
        const useCase = new CompareRoutesUseCase(repo);

        await expect(useCase.execute('R002')).rejects.toThrow(NoBaselineError);
    });

    it('throws RouteNotFoundError when alternative does not exist', async () => {
        const repo = createMockRepo({
            findBaseline: jest.fn().mockResolvedValue(baseline),
        });
        const useCase = new CompareRoutesUseCase(repo);

        await expect(useCase.execute('R999')).rejects.toThrow(RouteNotFoundError);
    });

    it('returns correct comparison result', async () => {
        const repo = createMockRepo({
            findBaseline: jest.fn().mockResolvedValue(baseline),
            findByRouteId: jest.fn().mockResolvedValue(alternative),
        });
        const useCase = new CompareRoutesUseCase(repo);

        const result = await useCase.execute('R002');

        expect(result.baselineRouteId).toBe('R001');
        expect(result.alternativeRouteId).toBe('R002');
        expect(result.deltaGhgIntensity).toBeCloseTo(3.0, 5);
        expect(result.deltaCb).toBeGreaterThan(0);
        expect(result.percentageSavings).toBeGreaterThan(0);
    });

    it('calls repo methods with correct arguments', async () => {
        const findBaseline = jest.fn().mockResolvedValue(baseline);
        const findByRouteId = jest.fn().mockResolvedValue(alternative);
        const repo = createMockRepo({ findBaseline, findByRouteId });
        const useCase = new CompareRoutesUseCase(repo);

        await useCase.execute('R002');

        expect(findBaseline).toHaveBeenCalledTimes(1);
        expect(findByRouteId).toHaveBeenCalledWith('R002');
    });
});
