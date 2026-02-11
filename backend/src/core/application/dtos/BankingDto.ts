/**
 * DTOs for Banking operations (Article 20)
 */

/** Input DTO — bank surplus request */
export interface BankSurplusInput {
    shipId: string;
    amountGco2eq: number;
}

/** Input DTO — apply banked surplus request */
export interface ApplyBankedInput {
    shipId: string;
    amountGco2eq: number;
}

/** Output DTO — bank entry returned to the client */
export interface BankEntryDto {
    id: string;
    shipId: string;
    year: number;
    amountGco2eq: number;
}
