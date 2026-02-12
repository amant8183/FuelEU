import { ApplyBankedSurplusUseCase } from '../../src/core/application/use-cases/ApplyBankedSurplusUseCase';
import { BankRepository } from '../../src/core/ports/outbound/BankRepository';
import {
    InvalidAmountError,
    InsufficientBankedError,
} from '../../src/shared/errors';

function createMockBankRepo(overrides: Partial<BankRepository> = {}): BankRepository {
    return {
        findByShipId: jest.fn().mockResolvedValue([]),
        getTotalBanked: jest.fn().mockResolvedValue(0),
        save: jest.fn().mockResolvedValue(undefined),
        findAll: jest.fn().mockResolvedValue([]),
        ...overrides,
    };
}

describe('ApplyBankedSurplusUseCase', () => {
    describe('validation', () => {
        it('throws InvalidAmountError when amount <= 0', async () => {
            const bankRepo = createMockBankRepo();
            const useCase = new ApplyBankedSurplusUseCase(bankRepo);

            await expect(useCase.execute('R001', 0)).rejects.toThrow(InvalidAmountError);
            await expect(useCase.execute('R001', -50)).rejects.toThrow(InvalidAmountError);
        });

        it('throws InsufficientBankedError when amount > total banked', async () => {
            const bankRepo = createMockBankRepo({
                getTotalBanked: jest.fn().mockResolvedValue(100),
            });
            const useCase = new ApplyBankedSurplusUseCase(bankRepo);

            await expect(useCase.execute('R001', 200)).rejects.toThrow(InsufficientBankedError);
        });

        it('throws InsufficientBankedError when nothing is banked', async () => {
            const bankRepo = createMockBankRepo({
                getTotalBanked: jest.fn().mockResolvedValue(0),
            });
            const useCase = new ApplyBankedSurplusUseCase(bankRepo);

            await expect(useCase.execute('R001', 50)).rejects.toThrow(InsufficientBankedError);
        });
    });

    describe('happy path', () => {
        it('saves a negative bank entry as withdrawal', async () => {
            const saveFn = jest.fn().mockResolvedValue(undefined);
            const bankRepo = createMockBankRepo({
                getTotalBanked: jest.fn().mockResolvedValue(500),
                save: saveFn,
            });
            const useCase = new ApplyBankedSurplusUseCase(bankRepo);

            await useCase.execute('R001', 200);

            expect(saveFn).toHaveBeenCalledTimes(1);
            const savedEntry = saveFn.mock.calls[0][0];
            expect(savedEntry.shipId).toBe('R001');
            expect(savedEntry.amountGco2eq).toBe(-200);
            expect(savedEntry.id).toBeDefined();
        });

        it('applies exact banked amount', async () => {
            const saveFn = jest.fn().mockResolvedValue(undefined);
            const bankRepo = createMockBankRepo({
                getTotalBanked: jest.fn().mockResolvedValue(300),
                save: saveFn,
            });
            const useCase = new ApplyBankedSurplusUseCase(bankRepo);

            await useCase.execute('R002', 300);

            expect(saveFn).toHaveBeenCalledTimes(1);
            const savedEntry = saveFn.mock.calls[0][0];
            expect(savedEntry.amountGco2eq).toBe(-300);
        });
    });
});
