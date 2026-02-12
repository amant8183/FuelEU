import { BankSurplusUseCase } from '../../src/core/application/use-cases/BankSurplusUseCase';
import { ComplianceRepository } from '../../src/core/ports/outbound/ComplianceRepository';
import { BankRepository } from '../../src/core/ports/outbound/BankRepository';
import {
    InvalidAmountError,
    ComplianceRecordNotFoundError,
    InsufficientSurplusError,
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

function createMockBankRepo(overrides: Partial<BankRepository> = {}): BankRepository {
    return {
        findByShipId: jest.fn().mockResolvedValue([]),
        getTotalBanked: jest.fn().mockResolvedValue(0),
        save: jest.fn().mockResolvedValue(undefined),
        findAll: jest.fn().mockResolvedValue([]),
        ...overrides,
    };
}

describe('BankSurplusUseCase', () => {
    describe('validation', () => {
        it('throws InvalidAmountError when amount <= 0', async () => {
            const complianceRepo = createMockComplianceRepo();
            const bankRepo = createMockBankRepo();
            const useCase = new BankSurplusUseCase(complianceRepo, bankRepo);

            await expect(useCase.execute('R001', 0, 2025)).rejects.toThrow(InvalidAmountError);
            await expect(useCase.execute('R001', -100, 2025)).rejects.toThrow(InvalidAmountError);
        });

        it('throws ComplianceRecordNotFoundError when no record exists', async () => {
            const complianceRepo = createMockComplianceRepo();
            const bankRepo = createMockBankRepo();
            const useCase = new BankSurplusUseCase(complianceRepo, bankRepo);

            await expect(useCase.execute('R001', 100, 2025)).rejects.toThrow(ComplianceRecordNotFoundError);
        });

        it('throws InsufficientSurplusError when CB <= 0', async () => {
            const complianceRepo = createMockComplianceRepo({
                findByShipAndYear: jest.fn().mockResolvedValue({
                    id: 'cb-1', shipId: 'R001', year: 2025, cbGco2eq: -500,
                }),
            });
            const bankRepo = createMockBankRepo();
            const useCase = new BankSurplusUseCase(complianceRepo, bankRepo);

            await expect(useCase.execute('R001', 100, 2025)).rejects.toThrow(InsufficientSurplusError);
        });

        it('throws InsufficientSurplusError when amount > available surplus', async () => {
            const complianceRepo = createMockComplianceRepo({
                findByShipAndYear: jest.fn().mockResolvedValue({
                    id: 'cb-1', shipId: 'R001', year: 2025, cbGco2eq: 200,
                }),
            });
            const bankRepo = createMockBankRepo();
            const useCase = new BankSurplusUseCase(complianceRepo, bankRepo);

            await expect(useCase.execute('R001', 300, 2025)).rejects.toThrow(InsufficientSurplusError);
        });
    });

    describe('happy path', () => {
        it('creates and persists a bank entry', async () => {
            const saveFn = jest.fn().mockResolvedValue(undefined);
            const complianceRepo = createMockComplianceRepo({
                findByShipAndYear: jest.fn().mockResolvedValue({
                    id: 'cb-1', shipId: 'R001', year: 2025, cbGco2eq: 500,
                }),
            });
            const bankRepo = createMockBankRepo({ save: saveFn });
            const useCase = new BankSurplusUseCase(complianceRepo, bankRepo);

            const result = await useCase.execute('R001', 200, 2025);

            expect(result.shipId).toBe('R001');
            expect(result.year).toBe(2025);
            expect(result.amountGco2eq).toBe(200);
            expect(result.id).toBeDefined();
            expect(saveFn).toHaveBeenCalledTimes(1);
        });

        it('banks exact surplus amount', async () => {
            const complianceRepo = createMockComplianceRepo({
                findByShipAndYear: jest.fn().mockResolvedValue({
                    id: 'cb-1', shipId: 'R002', year: 2025, cbGco2eq: 300,
                }),
            });
            const bankRepo = createMockBankRepo();
            const useCase = new BankSurplusUseCase(complianceRepo, bankRepo);

            const result = await useCase.execute('R002', 300, 2025);

            expect(result.amountGco2eq).toBe(300);
        });
    });
});
