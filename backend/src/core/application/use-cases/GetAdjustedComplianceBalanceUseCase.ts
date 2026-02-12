/**
 * Use-case — GetAdjustedComplianceBalance
 *
 * Retrieves all compliance balances and adjusts deficit ships
 * by applying any banked surplus (Article 20).
 * Depends on ComplianceRepository and BankRepository ports.
 */

import { ComplianceRepository } from '../../ports/outbound/ComplianceRepository';
import { BankRepository } from '../../ports/outbound/BankRepository';
import { ComplianceBalanceDto } from '../dtos/ComplianceBalanceDto';

export interface AdjustedComplianceBalanceDto extends ComplianceBalanceDto {
    /** Original CB before banking adjustment */
    rawCbGco2eq: number;

    /** Total banked surplus available for this ship */
    bankedSurplus: number;
}

export class GetAdjustedComplianceBalanceUseCase {
    constructor(
        private readonly complianceRepo: ComplianceRepository,
        private readonly bankRepo: BankRepository,
    ) { }

    async execute(year?: number): Promise<AdjustedComplianceBalanceDto[]> {
        const records = await this.complianceRepo.findAll(year);

        const results: AdjustedComplianceBalanceDto[] = [];

        for (const rec of records) {
            const bankedSurplus = await this.bankRepo.getTotalBanked(rec.shipId);
            const adjustedCb = rec.cbGco2eq + bankedSurplus;

            results.push({
                shipId: rec.shipId,
                year: rec.year,
                rawCbGco2eq: rec.cbGco2eq,
                bankedSurplus,
                cbGco2eq: adjustedCb,
                status: adjustedCb > 0 ? 'surplus' : adjustedCb < 0 ? 'deficit' : 'neutral',
            });
        }

        return results;
    }
}
