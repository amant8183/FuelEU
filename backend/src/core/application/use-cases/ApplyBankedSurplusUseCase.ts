/**
 * Use-case — ApplyBankedSurplus
 *
 * Applies previously banked surplus to offset a ship's deficit (Article 20).
 * Validates that the ship has sufficient banked surplus and the amount is valid.
 * Creates a negative bank entry to record the withdrawal.
 * Depends on BankRepository port.
 */

import { BankRepository } from '../../ports/outbound/BankRepository';
import { BankEntry } from '../../domain/entities/BankEntry';
import {
    InvalidAmountError,
    InsufficientBankedError,
} from '../../../shared/errors';
import { randomUUID } from 'crypto';

export class ApplyBankedSurplusUseCase {
    constructor(private readonly bankRepo: BankRepository) { }

    async execute(shipId: string, amountGco2eq: number): Promise<void> {
        if (amountGco2eq <= 0) {
            throw new InvalidAmountError(amountGco2eq);
        }

        const totalBanked = await this.bankRepo.getTotalBanked(shipId);

        if (amountGco2eq > totalBanked) {
            throw new InsufficientBankedError(shipId, amountGco2eq, totalBanked);
        }

        // Record a negative entry to represent the withdrawal
        const entry: BankEntry = {
            id: randomUUID(),
            shipId,
            year: new Date().getFullYear(),
            amountGco2eq: -amountGco2eq,
        };

        await this.bankRepo.save(entry);
    }
}
