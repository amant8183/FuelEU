/**
 * Use-case — BankSurplus
 *
 * Banks a portion of a ship's surplus CB for future use (Article 20).
 * Validates that the ship has a positive CB and the amount is valid.
 * Depends on ComplianceRepository and BankRepository ports.
 */

import { ComplianceRepository } from '../../ports/outbound/ComplianceRepository';
import { BankRepository } from '../../ports/outbound/BankRepository';
import { BankEntry } from '../../domain/entities/BankEntry';
import { BankEntryDto } from '../dtos/BankingDto';
import {
    InvalidAmountError,
    ComplianceRecordNotFoundError,
    InsufficientSurplusError,
} from '../../../shared/errors';
import { randomUUID } from 'crypto';

export class BankSurplusUseCase {
    constructor(
        private readonly complianceRepo: ComplianceRepository,
        private readonly bankRepo: BankRepository,
    ) { }

    async execute(shipId: string, amountGco2eq: number, year: number): Promise<BankEntryDto> {
        if (amountGco2eq <= 0) {
            throw new InvalidAmountError(amountGco2eq);
        }

        const record = await this.complianceRepo.findByShipAndYear(shipId, year);
        if (!record) {
            throw new ComplianceRecordNotFoundError(shipId, year);
        }

        if (record.cbGco2eq <= 0) {
            throw new InsufficientSurplusError(shipId);
        }

        if (amountGco2eq > record.cbGco2eq) {
            throw new InsufficientSurplusError(shipId);
        }

        const entry: BankEntry = {
            id: randomUUID(),
            shipId,
            year,
            amountGco2eq,
        };

        await this.bankRepo.save(entry);

        return {
            id: entry.id,
            shipId: entry.shipId,
            year: entry.year,
            amountGco2eq: entry.amountGco2eq,
        };
    }
}
