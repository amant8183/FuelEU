/**
 * PostgreSQL adapter — BankRepository
 *
 * Implements the BankRepository port using Knex.
 * Reads/writes against the `bank_entries` table.
 */

import { Knex } from 'knex';
import { BankEntry } from '../../../core/domain/entities/BankEntry';
import { BankRepository } from '../../../core/ports/outbound/BankRepository';

/** DB row shape (snake_case) */
interface BankRow {
    id: string;
    ship_id: string;
    year: number;
    amount_gco2eq: number;
}

const TABLE = 'bank_entries';

function toDomain(row: BankRow): BankEntry {
    return {
        id: row.id,
        shipId: row.ship_id,
        year: row.year,
        amountGco2eq: row.amount_gco2eq,
    };
}

function toRow(entry: BankEntry): BankRow {
    return {
        id: entry.id,
        ship_id: entry.shipId,
        year: entry.year,
        amount_gco2eq: entry.amountGco2eq,
    };
}

export class PgBankRepository implements BankRepository {
    constructor(private readonly db: Knex) { }

    async findByShipId(shipId: string): Promise<BankEntry[]> {
        const rows = await this.db<BankRow>(TABLE)
            .where('ship_id', shipId)
            .orderBy('year');
        return rows.map(toDomain);
    }

    async getTotalBanked(shipId: string): Promise<number> {
        const result = await this.db(TABLE)
            .where('ship_id', shipId)
            .sum('amount_gco2eq as total')
            .first();
        return Number(result?.total ?? 0);
    }

    async save(entry: BankEntry): Promise<void> {
        await this.db(TABLE).insert(toRow(entry));
    }

    async findAll(): Promise<BankEntry[]> {
        const rows = await this.db<BankRow>(TABLE)
            .select('*')
            .orderBy(['ship_id', 'year']);
        return rows.map(toDomain);
    }
}
