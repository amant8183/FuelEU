/**
 * Inbound port — BankingService
 *
 * Contract for surplus banking operations (Article 20).
 */

import { BankEntry } from '../../domain/entities/BankEntry';

export interface BankingService {
    /** Bank surplus for a ship (must have CB > 0) */
    bankSurplus(shipId: string, amountGco2eq: number): Promise<BankEntry>;

    /** Apply banked surplus to offset a deficit */
    applyBanked(shipId: string, amountGco2eq: number): Promise<void>;

    /** Retrieve all bank entries for a ship */
    getEntries(shipId: string): Promise<BankEntry[]>;
}
