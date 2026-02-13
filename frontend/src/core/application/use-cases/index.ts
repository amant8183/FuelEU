/**
 * Frontend Use-Case Functions
 *
 * Thin application-layer functions that delegate to ApiClientPort.
 * Each function takes the port as its first argument (dependency injection).
 * Zero framework dependencies — pure TypeScript.
 */

import type { ApiClientPort } from '../../ports/ApiClientPort';
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
} from '../../domain/types';

// ─── Routes ──────────────────────────────────────────────────────────

export const fetchRoutes = (api: ApiClientPort, year?: number): Promise<Route[]> =>
    api.getRoutes(year);

export const setBaseline = (api: ApiClientPort, routeId: string): Promise<void> =>
    api.setBaseline(routeId);

export const compareRoutes = (api: ApiClientPort, routeId: string): Promise<Comparison> =>
    api.compareRoutes(routeId);

// ─── Compliance ──────────────────────────────────────────────────────

export const computeComplianceBalance = (api: ApiClientPort): Promise<ComplianceBalance[]> =>
    api.computeComplianceBalance();

export const fetchAdjustedCompliance = (
    api: ApiClientPort,
    year?: number,
): Promise<AdjustedComplianceBalance[]> =>
    api.getAdjustedComplianceBalance(year);

// ─── Banking (Article 20) ────────────────────────────────────────────

export const depositSurplus = (
    api: ApiClientPort,
    input: BankDepositInput,
): Promise<BankEntry> =>
    api.bankDeposit(input);

export const applySurplus = (
    api: ApiClientPort,
    input: BankApplyInput,
): Promise<void> =>
    api.bankApply(input);

// ─── Pooling (Article 21) ────────────────────────────────────────────

export const createPool = (
    api: ApiClientPort,
    input: CreatePoolInput,
): Promise<Pool> =>
    api.createPool(input);

export const fetchPools = (api: ApiClientPort, year?: number): Promise<Pool[]> =>
    api.getPools(year);
