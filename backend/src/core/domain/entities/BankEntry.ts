/**
 * FuelEU Maritime — BankEntry Entity
 *
 * Represents a banked surplus per Article 20.
 * Ships with positive CB can bank surplus for future use
 * to offset deficits in subsequent years.
 */

export interface BankEntry {
    /** Database primary key (UUID) */
    id: string;

    /** Ship/route identifier */
    shipId: string;

    /** Year the surplus was earned */
    year: number;

    /** Banked surplus amount in gCO₂eq (always > 0) */
    amountGco2eq: number;
}
