/**
 * Use-case — ComputeComplianceBalance
 *
 * Fetches all routes, computes the compliance balance for each
 * using the ComplianceCalculator domain service, and persists results
 * via the ComplianceRepository port.
 */

import { RouteRepository } from '../../ports/outbound/RouteRepository';
import { ComplianceRepository } from '../../ports/outbound/ComplianceRepository';
import { computeComplianceBalance } from '../../domain/services/ComplianceCalculator';
import { ComplianceBalance } from '../../domain/entities/ComplianceBalance';
import { ComplianceBalanceDto } from '../dtos/ComplianceBalanceDto';
import { randomUUID } from 'crypto';

export class ComputeComplianceBalanceUseCase {
    constructor(
        private readonly routeRepo: RouteRepository,
        private readonly complianceRepo: ComplianceRepository,
    ) { }

    async execute(year?: number): Promise<ComplianceBalanceDto[]> {
        const routes = await this.routeRepo.findAll(year);

        const records: ComplianceBalance[] = routes.map((r) => {
            const cbGco2eq = computeComplianceBalance(r.ghgIntensity, r.fuelConsumption);
            return {
                id: randomUUID(),
                shipId: r.routeId,
                year: r.year,
                cbGco2eq,
            };
        });

        await this.complianceRepo.saveAll(records);

        return records.map((rec) => ({
            shipId: rec.shipId,
            year: rec.year,
            cbGco2eq: rec.cbGco2eq,
            status: rec.cbGco2eq > 0 ? 'surplus' : rec.cbGco2eq < 0 ? 'deficit' : 'neutral',
        }));
    }
}
