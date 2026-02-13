/**
 * Outbound port — ApiClientPort
 *
 * Contract for communicating with the backend API.
 * Implemented by the Axios adapter. Zero framework dependencies here.
 */

import type {
    Route,
    ComplianceBalance,
    AdjustedComplianceBalance,
    Comparison,
    BankEntry,
    Pool,
    BankDepositInput,
    BankApplyInput,
    CreatePoolInput,
} from '../domain/types';

export interface ApiClientPort {
    // ─── Routes ────────────────────────────────────────────────────
    getRoutes(year?: number): Promise<Route[]>;
    setBaseline(routeId: string): Promise<void>;
    compareRoutes(routeId: string): Promise<Comparison>;

    // ─── Compliance ────────────────────────────────────────────────
    computeComplianceBalance(year?: number): Promise<ComplianceBalance[]>;
    getAdjustedComplianceBalance(year?: number): Promise<AdjustedComplianceBalance[]>;

    // ─── Banking (Article 20) ─────────────────────────────────────
    bankDeposit(input: BankDepositInput): Promise<BankEntry>;
    bankApply(input: BankApplyInput): Promise<void>;

    // ─── Pooling (Article 21) ─────────────────────────────────────
    createPool(input: CreatePoolInput): Promise<Pool>;
    getPools(year?: number): Promise<Pool[]>;
}
