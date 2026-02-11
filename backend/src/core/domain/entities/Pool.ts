/**
 * FuelEU Maritime — Pool Entity
 *
 * Represents a compliance pool per Article 21.
 * Groups multiple ships to collectively meet compliance targets
 * by redistributing surplus from compliant ships to deficit ships.
 */

export interface Pool {
    /** Database primary key (UUID) */
    id: string;

    /** Pool reporting year */
    year: number;

    /** Timestamp of pool creation */
    createdAt: Date;
}
