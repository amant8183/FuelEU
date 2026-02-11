/**
 * DTOs for Compliance Balance operations
 */

/** Output DTO — compliance balance returned to the client */
export interface ComplianceBalanceDto {
    shipId: string;
    year: number;
    cbGco2eq: number;
    status: 'surplus' | 'deficit' | 'neutral';
}
