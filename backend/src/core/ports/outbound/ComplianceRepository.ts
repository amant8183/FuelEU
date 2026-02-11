/**
 * Outbound port — ComplianceRepository
 *
 * Contract for persisting and retrieving ComplianceBalance records.
 */

import { ComplianceBalance } from '../../domain/entities/ComplianceBalance';

export interface ComplianceRepository {
    /** Retrieve compliance balance for a specific ship and year */
    findByShipAndYear(shipId: string, year: number): Promise<ComplianceBalance | null>;

    /** Retrieve all compliance records, optionally filtered by year */
    findAll(year?: number): Promise<ComplianceBalance[]>;

    /** Insert or update a compliance balance record */
    save(record: ComplianceBalance): Promise<void>;

    /** Bulk save compliance records (for recomputation) */
    saveAll(records: ComplianceBalance[]): Promise<void>;
}
