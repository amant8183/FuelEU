/**
 * Outbound port — BankRepository
 *
 * Contract for persisting and retrieving BankEntry records (Article 20).
 */

import { BankEntry } from '../../domain/entities/BankEntry';

export interface BankRepository {
    /** Retrieve all bank entries for a ship */
    findByShipId(shipId: string): Promise<BankEntry[]>;

    /** Retrieve total banked amount for a ship */
    getTotalBanked(shipId: string): Promise<number>;

    /** Insert a new bank entry */
    save(entry: BankEntry): Promise<void>;

    /** Retrieve all bank entries */
    findAll(): Promise<BankEntry[]>;
}
