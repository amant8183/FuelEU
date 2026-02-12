import { CreatePoolUseCase } from '../../src/core/application/use-cases/CreatePoolUseCase';
import { ComplianceRepository } from '../../src/core/ports/outbound/ComplianceRepository';
import { PoolRepository } from '../../src/core/ports/outbound/PoolRepository';
import {
    ComplianceRecordNotFoundError,
    InsufficientMembersError,
    PoolNetNegativeError,
} from '../../src/shared/errors';

function createMockComplianceRepo(overrides: Partial<ComplianceRepository> = {}): ComplianceRepository {
    return {
        findByShipAndYear: jest.fn().mockResolvedValue(null),
        findAll: jest.fn().mockResolvedValue([]),
        save: jest.fn().mockResolvedValue(undefined),
        saveAll: jest.fn().mockResolvedValue(undefined),
        ...overrides,
    };
}

function createMockPoolRepo(overrides: Partial<PoolRepository> = {}): PoolRepository {
    return {
        createPool: jest.fn().mockResolvedValue(undefined),
        findById: jest.fn().mockResolvedValue(null),
        findAll: jest.fn().mockResolvedValue([]),
        ...overrides,
    };
}

describe('CreatePoolUseCase', () => {
    describe('validation', () => {
        it('throws ComplianceRecordNotFoundError when a ship has no CB record', async () => {
            const complianceRepo = createMockComplianceRepo();
            const poolRepo = createMockPoolRepo();
            const useCase = new CreatePoolUseCase(complianceRepo, poolRepo);

            await expect(useCase.execute(['R001', 'R002'], 2025)).rejects.toThrow(
                ComplianceRecordNotFoundError,
            );
        });

        it('throws InsufficientMembersError with < 2 ships', async () => {
            const complianceRepo = createMockComplianceRepo({
                findByShipAndYear: jest.fn().mockResolvedValue({
                    id: 'cb-1', shipId: 'R001', year: 2025, cbGco2eq: 500,
                }),
            });
            const poolRepo = createMockPoolRepo();
            const useCase = new CreatePoolUseCase(complianceRepo, poolRepo);

            await expect(useCase.execute(['R001'], 2025)).rejects.toThrow(InsufficientMembersError);
        });

        it('throws PoolNetNegativeError when net CB < 0', async () => {
            const findByShipAndYear = jest.fn()
                .mockResolvedValueOnce({ id: 'cb-1', shipId: 'S1', year: 2025, cbGco2eq: 100 })
                .mockResolvedValueOnce({ id: 'cb-2', shipId: 'S2', year: 2025, cbGco2eq: -500 });
            const complianceRepo = createMockComplianceRepo({ findByShipAndYear });
            const poolRepo = createMockPoolRepo();
            const useCase = new CreatePoolUseCase(complianceRepo, poolRepo);

            await expect(useCase.execute(['S1', 'S2'], 2025)).rejects.toThrow(PoolNetNegativeError);
        });
    });

    describe('happy path', () => {
        it('creates a pool with correct allocation', async () => {
            const findByShipAndYear = jest.fn()
                .mockResolvedValueOnce({ id: 'cb-1', shipId: 'S1', year: 2025, cbGco2eq: 500 })
                .mockResolvedValueOnce({ id: 'cb-2', shipId: 'S2', year: 2025, cbGco2eq: -300 });
            const createPoolFn = jest.fn().mockResolvedValue(undefined);
            const complianceRepo = createMockComplianceRepo({ findByShipAndYear });
            const poolRepo = createMockPoolRepo({ createPool: createPoolFn });
            const useCase = new CreatePoolUseCase(complianceRepo, poolRepo);

            const result = await useCase.execute(['S1', 'S2'], 2025);

            expect(result.poolId).toBeDefined();
            expect(result.year).toBe(2025);
            expect(result.members).toHaveLength(2);
            expect(result.netCb).toBe(200);

            const s1 = result.members.find((m) => m.shipId === 'S1')!;
            const s2 = result.members.find((m) => m.shipId === 'S2')!;
            expect(s1.cbBefore).toBe(500);
            expect(s1.cbAfter).toBe(200);
            expect(s2.cbBefore).toBe(-300);
            expect(s2.cbAfter).toBe(0);
        });

        it('persists pool and members via poolRepo.createPool', async () => {
            const findByShipAndYear = jest.fn()
                .mockResolvedValueOnce({ id: 'cb-1', shipId: 'S1', year: 2025, cbGco2eq: 400 })
                .mockResolvedValueOnce({ id: 'cb-2', shipId: 'S2', year: 2025, cbGco2eq: -200 });
            const createPoolFn = jest.fn().mockResolvedValue(undefined);
            const complianceRepo = createMockComplianceRepo({ findByShipAndYear });
            const poolRepo = createMockPoolRepo({ createPool: createPoolFn });
            const useCase = new CreatePoolUseCase(complianceRepo, poolRepo);

            await useCase.execute(['S1', 'S2'], 2025);

            expect(createPoolFn).toHaveBeenCalledTimes(1);
            const [savedPool, savedMembers] = createPoolFn.mock.calls[0];
            expect(savedPool.year).toBe(2025);
            expect(savedMembers).toHaveLength(2);
        });

        it('conservation holds in result', async () => {
            const findByShipAndYear = jest.fn()
                .mockResolvedValueOnce({ id: 'cb-1', shipId: 'S1', year: 2025, cbGco2eq: 1000 })
                .mockResolvedValueOnce({ id: 'cb-2', shipId: 'S2', year: 2025, cbGco2eq: -300 })
                .mockResolvedValueOnce({ id: 'cb-3', shipId: 'S3', year: 2025, cbGco2eq: -400 });
            const complianceRepo = createMockComplianceRepo({ findByShipAndYear });
            const poolRepo = createMockPoolRepo();
            const useCase = new CreatePoolUseCase(complianceRepo, poolRepo);

            const result = await useCase.execute(['S1', 'S2', 'S3'], 2025);

            const totalBefore = result.members.reduce((s, m) => s + m.cbBefore, 0);
            const totalAfter = result.members.reduce((s, m) => s + m.cbAfter, 0);
            expect(totalAfter).toBeCloseTo(totalBefore, 5);
        });
    });
});
