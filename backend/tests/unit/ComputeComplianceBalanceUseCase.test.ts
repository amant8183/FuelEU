import { ComputeComplianceBalanceUseCase } from '../../src/core/application/use-cases/ComputeComplianceBalanceUseCase';
import { RouteRepository } from '../../src/core/ports/outbound/RouteRepository';
import { ComplianceRepository } from '../../src/core/ports/outbound/ComplianceRepository';
import { Route, VesselType, FuelType } from '../../src/core/domain/entities/Route';
import { TARGET_INTENSITY } from '../../src/shared/constants';

function makeRoute(routeId: string, ghgIntensity: number, fuelConsumption: number): Route {
    return {
        id: `id-${routeId}`,
        routeId,
        vesselType: VesselType.Container,
        fuelType: FuelType.HFO,
        year: 2025,
        ghgIntensity,
        fuelConsumption,
        distance: 1000,
        totalEmissions: 0,
        isBaseline: false,
    };
}

function createMockRouteRepo(routes: Route[]): RouteRepository {
    return {
        findAll: jest.fn().mockResolvedValue(routes),
        findByRouteId: jest.fn().mockResolvedValue(null),
        findBaseline: jest.fn().mockResolvedValue(null),
        setBaseline: jest.fn().mockResolvedValue(undefined),
        save: jest.fn().mockResolvedValue(undefined),
        seedAll: jest.fn().mockResolvedValue(undefined),
    };
}

function createMockComplianceRepo(): ComplianceRepository {
    return {
        findByShipAndYear: jest.fn().mockResolvedValue(null),
        findAll: jest.fn().mockResolvedValue([]),
        save: jest.fn().mockResolvedValue(undefined),
        saveAll: jest.fn().mockResolvedValue(undefined),
    };
}

describe('ComputeComplianceBalanceUseCase', () => {
    const routes = [
        makeRoute('R001', 91.0, 5000),   // deficit (above target)
        makeRoute('R002', 88.0, 4800),   // surplus (below target)
        makeRoute('R003', TARGET_INTENSITY, 5000), // neutral (exactly at target)
    ];

    it('returns correct DTOs with status for each route', async () => {
        const routeRepo = createMockRouteRepo(routes);
        const complianceRepo = createMockComplianceRepo();
        const useCase = new ComputeComplianceBalanceUseCase(routeRepo, complianceRepo);

        const results = await useCase.execute();

        expect(results).toHaveLength(3);

        const r001 = results.find((r) => r.shipId === 'R001')!;
        expect(r001.status).toBe('deficit');
        expect(r001.cbGco2eq).toBeLessThan(0);

        const r002 = results.find((r) => r.shipId === 'R002')!;
        expect(r002.status).toBe('surplus');
        expect(r002.cbGco2eq).toBeGreaterThan(0);

        const r003 = results.find((r) => r.shipId === 'R003')!;
        expect(r003.status).toBe('neutral');
        expect(r003.cbGco2eq).toBeCloseTo(0, 10);
    });

    it('persists all records via complianceRepo.saveAll', async () => {
        const routeRepo = createMockRouteRepo(routes);
        const complianceRepo = createMockComplianceRepo();
        const useCase = new ComputeComplianceBalanceUseCase(routeRepo, complianceRepo);

        await useCase.execute();

        expect(complianceRepo.saveAll).toHaveBeenCalledTimes(1);
        const savedRecords = (complianceRepo.saveAll as jest.Mock).mock.calls[0][0];
        expect(savedRecords).toHaveLength(3);
    });

    it('handles empty route list gracefully', async () => {
        const routeRepo = createMockRouteRepo([]);
        const complianceRepo = createMockComplianceRepo();
        const useCase = new ComputeComplianceBalanceUseCase(routeRepo, complianceRepo);

        const results = await useCase.execute();

        expect(results).toHaveLength(0);
        expect(complianceRepo.saveAll).toHaveBeenCalledWith([]);
    });

    it('maps year from route to compliance record', async () => {
        const routeRepo = createMockRouteRepo([makeRoute('R001', 91.0, 5000)]);
        const complianceRepo = createMockComplianceRepo();
        const useCase = new ComputeComplianceBalanceUseCase(routeRepo, complianceRepo);

        const results = await useCase.execute();

        expect(results[0].year).toBe(2025);
    });
});
