/**
 * Use-case — CreatePool
 *
 * Creates a compliance pool from selected ships (Article 21).
 * Fetches CB for each ship, delegates to PoolAllocator domain service,
 * and persists the pool + members via PoolRepository.
 */

import { ComplianceRepository } from '../../ports/outbound/ComplianceRepository';
import { PoolRepository } from '../../ports/outbound/PoolRepository';
import { allocatePool, ShipCb } from '../../domain/services/PoolAllocator';
import { Pool } from '../../domain/entities/Pool';
import { PoolDto, PoolMemberDto } from '../dtos/PoolingDto';
import { ComplianceRecordNotFoundError } from '../../../shared/errors';
import { randomUUID } from 'crypto';

export class CreatePoolUseCase {
    constructor(
        private readonly complianceRepo: ComplianceRepository,
        private readonly poolRepo: PoolRepository,
    ) { }

    async execute(shipIds: string[], year: number): Promise<PoolDto> {
        // 1. Fetch CB for each ship
        const shipCbs: ShipCb[] = [];
        for (const shipId of shipIds) {
            const record = await this.complianceRepo.findByShipAndYear(shipId, year);
            if (!record) {
                throw new ComplianceRecordNotFoundError(shipId, year);
            }
            shipCbs.push({ shipId: record.shipId, cbGco2eq: record.cbGco2eq });
        }

        // 2. Run allocation (may throw InsufficientMembersError or PoolNetNegativeError)
        const poolId = randomUUID();
        const allocation = allocatePool(poolId, shipCbs);

        // 3. Persist pool + members
        const pool: Pool = {
            id: poolId,
            year,
            createdAt: new Date(),
        };

        await this.poolRepo.createPool(pool, allocation.members);

        // 4. Map to DTO
        const memberDtos: PoolMemberDto[] = allocation.members.map((m) => ({
            shipId: m.shipId,
            cbBefore: m.cbBefore,
            cbAfter: m.cbAfter,
        }));

        return {
            poolId: pool.id,
            year: pool.year,
            members: memberDtos,
            netCb: allocation.netCb,
        };
    }
}
