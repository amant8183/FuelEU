/**
 * PostgreSQL adapter — PoolRepository
 *
 * Implements the PoolRepository port using Knex.
 * Reads/writes against `pools` and `pool_members` tables.
 */

import { Knex } from 'knex';
import { Pool } from '../../../core/domain/entities/Pool';
import { PoolMember } from '../../../core/domain/entities/PoolMember';
import { PoolRepository } from '../../../core/ports/outbound/PoolRepository';

/** DB row shapes (snake_case) */
interface PoolRow {
    id: string;
    year: number;
    created_at: string | Date;
}

interface MemberRow {
    pool_id: string;
    ship_id: string;
    cb_before: number;
    cb_after: number;
}

function poolToDomain(row: PoolRow): Pool {
    return {
        id: row.id,
        year: row.year,
        createdAt: new Date(row.created_at),
    };
}

function memberToDomain(row: MemberRow): PoolMember {
    return {
        poolId: row.pool_id,
        shipId: row.ship_id,
        cbBefore: row.cb_before,
        cbAfter: row.cb_after,
    };
}

export class PgPoolRepository implements PoolRepository {
    constructor(private readonly db: Knex) { }

    async createPool(pool: Pool, members: PoolMember[]): Promise<void> {
        await this.db.transaction(async (trx) => {
            await trx('pools').insert({
                id: pool.id,
                year: pool.year,
                created_at: pool.createdAt,
            });

            if (members.length > 0) {
                await trx('pool_members').insert(
                    members.map((m) => ({
                        pool_id: m.poolId,
                        ship_id: m.shipId,
                        cb_before: m.cbBefore,
                        cb_after: m.cbAfter,
                    })),
                );
            }
        });
    }

    async findById(poolId: string): Promise<{ pool: Pool; members: PoolMember[] } | null> {
        const poolRow = await this.db<PoolRow>('pools')
            .where('id', poolId)
            .first();

        if (!poolRow) return null;

        const memberRows = await this.db<MemberRow>('pool_members')
            .where('pool_id', poolId)
            .orderBy('ship_id');

        return {
            pool: poolToDomain(poolRow),
            members: memberRows.map(memberToDomain),
        };
    }

    async findAll(year?: number): Promise<{ pool: Pool; members: PoolMember[] }[]> {
        const query = this.db<PoolRow>('pools');
        if (year !== undefined) {
            query.where('year', year);
        }
        const poolRows = await query.select('*').orderBy('created_at', 'desc');

        const results: { pool: Pool; members: PoolMember[] }[] = [];

        for (const poolRow of poolRows) {
            const memberRows = await this.db<MemberRow>('pool_members')
                .where('pool_id', poolRow.id)
                .orderBy('ship_id');

            results.push({
                pool: poolToDomain(poolRow),
                members: memberRows.map(memberToDomain),
            });
        }

        return results;
    }
}
