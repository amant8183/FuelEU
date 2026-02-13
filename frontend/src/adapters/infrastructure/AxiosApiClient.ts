/**
 * Outbound adapter — AxiosApiClient
 *
 * Implements ApiClientPort using Axios.
 * This is the ONLY place the HTTP library is referenced.
 */

import axios, { type AxiosInstance } from 'axios';
import type { ApiClientPort } from '../../core/ports/ApiClientPort';
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
} from '../../core/domain/types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export class AxiosApiClient implements ApiClientPort {
    private readonly http: AxiosInstance;

    constructor(baseURL = BASE_URL) {
        this.http = axios.create({ baseURL });
    }

    // ─── Routes ──────────────────────────────────────────────────────

    async getRoutes(year?: number): Promise<Route[]> {
        const params = year !== undefined ? { year } : {};
        const { data } = await this.http.get<Route[]>('/routes', { params });
        return data;
    }

    async setBaseline(routeId: string): Promise<void> {
        await this.http.post(`/routes/${routeId}/baseline`);
    }

    async compareRoutes(routeId: string): Promise<Comparison> {
        const { data } = await this.http.get<Comparison>('/routes/comparison', {
            params: { routeId },
        });
        return data;
    }

    // ─── Compliance ──────────────────────────────────────────────────

    async computeComplianceBalance(): Promise<ComplianceBalance[]> {
        const { data } = await this.http.get<ComplianceBalance[]>('/compliance/cb');
        return data;
    }

    async getAdjustedComplianceBalance(year?: number): Promise<AdjustedComplianceBalance[]> {
        const params = year !== undefined ? { year } : {};
        const { data } = await this.http.get<AdjustedComplianceBalance[]>(
            '/compliance/adjusted-cb',
            { params },
        );
        return data;
    }

    // ─── Banking (Article 20) ───────────────────────────────────────

    async bankDeposit(input: BankDepositInput): Promise<BankEntry> {
        const { data } = await this.http.post<BankEntry>('/banking/deposit', input);
        return data;
    }

    async bankApply(input: BankApplyInput): Promise<void> {
        await this.http.post('/banking/apply', input);
    }

    // ─── Pooling (Article 21) ───────────────────────────────────────

    async createPool(input: CreatePoolInput): Promise<Pool> {
        const { data } = await this.http.post<Pool>('/pools', input);
        return data;
    }

    async getPools(year?: number): Promise<Pool[]> {
        const params = year !== undefined ? { year } : {};
        const { data } = await this.http.get<Pool[]>('/pools', { params });
        return data;
    }
}
