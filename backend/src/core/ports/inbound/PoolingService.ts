/**
 * Inbound port — PoolingService
 *
 * Contract for compliance pooling operations (Article 21).
 */

import { Pool } from '../../domain/entities/Pool';
import { PoolMember } from '../../domain/entities/PoolMember';

export interface PoolingService {
    /** Create a pool from selected ships and run allocation */
    createPool(shipIds: string[], year: number): Promise<{ pool: Pool; members: PoolMember[] }>;

    /** Retrieve all pools, optionally filtered by year */
    getPools(year?: number): Promise<{ pool: Pool; members: PoolMember[] }[]>;
}
