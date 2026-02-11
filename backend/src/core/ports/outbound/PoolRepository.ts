/**
 * Outbound port — PoolRepository
 *
 * Contract for persisting and retrieving Pool + PoolMember records (Article 21).
 */

import { Pool } from '../../domain/entities/Pool';
import { PoolMember } from '../../domain/entities/PoolMember';

export interface PoolRepository {
    /** Create a new pool and its members atomically */
    createPool(pool: Pool, members: PoolMember[]): Promise<void>;

    /** Retrieve a pool by ID, including its members */
    findById(poolId: string): Promise<{ pool: Pool; members: PoolMember[] } | null>;

    /** Retrieve all pools, optionally filtered by year */
    findAll(year?: number): Promise<{ pool: Pool; members: PoolMember[] }[]>;
}
