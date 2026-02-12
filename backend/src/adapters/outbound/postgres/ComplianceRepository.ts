/**
 * PostgreSQL adapter — ComplianceRepository
 *
 * Implements the ComplianceRepository port using Knex.
 * Reads/writes against the `ship_compliance` table.
 */

import { Knex } from 'knex';
import { ComplianceBalance } from '../../../core/domain/entities/ComplianceBalance';
import { ComplianceRepository } from '../../../core/ports/outbound/ComplianceRepository';

/** DB row shape (snake_case) */
interface ComplianceRow {
    id: string;
    ship_id: string;
    year: number;
    cb_gco2eq: number;
}

const TABLE = 'ship_compliance';

function toDomain(row: ComplianceRow): ComplianceBalance {
    return {
        id: row.id,
        shipId: row.ship_id,
        year: row.year,
        cbGco2eq: row.cb_gco2eq,
    };
}

function toRow(record: ComplianceBalance): ComplianceRow {
    return {
        id: record.id,
        ship_id: record.shipId,
        year: record.year,
        cb_gco2eq: record.cbGco2eq,
    };
}

export class PgComplianceRepository implements ComplianceRepository {
    constructor(private readonly db: Knex) { }

    async findByShipAndYear(shipId: string, year: number): Promise<ComplianceBalance | null> {
        const row = await this.db<ComplianceRow>(TABLE)
            .where({ ship_id: shipId, year })
            .first();
        return row ? toDomain(row) : null;
    }

    async findAll(year?: number): Promise<ComplianceBalance[]> {
        const query = this.db<ComplianceRow>(TABLE);
        if (year !== undefined) {
            query.where('year', year);
        }
        const rows = await query.select('*').orderBy('ship_id');
        return rows.map(toDomain);
    }

    async save(record: ComplianceBalance): Promise<void> {
        const row = toRow(record);
        await this.db(TABLE)
            .insert(row)
            .onConflict(['ship_id', 'year'])
            .merge({ cb_gco2eq: row.cb_gco2eq });
    }

    async saveAll(records: ComplianceBalance[]): Promise<void> {
        if (records.length === 0) return;
        const rows = records.map(toRow);
        await this.db.transaction(async (trx) => {
            for (const row of rows) {
                await trx(TABLE)
                    .insert(row)
                    .onConflict(['ship_id', 'year'])
                    .merge({ cb_gco2eq: row.cb_gco2eq });
            }
        });
    }
}
