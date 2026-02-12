/**
 * Express application — infrastructure layer.
 *
 * Wires all adapters, use-cases, and middleware.
 * This is the composition root: the only place concrete classes connect.
 */

import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

// --- Infrastructure ---
import db from '../db/connection';

// --- Outbound adapters ---
import { PgRouteRepository } from '../../adapters/outbound/postgres/RouteRepository';
import { PgComplianceRepository } from '../../adapters/outbound/postgres/ComplianceRepository';
import { PgBankRepository } from '../../adapters/outbound/postgres/BankRepository';
import { PgPoolRepository } from '../../adapters/outbound/postgres/PoolRepository';

// --- Use-cases ---
import { GetRoutesUseCase } from '../../core/application/use-cases/GetRoutesUseCase';
import { SetBaselineUseCase } from '../../core/application/use-cases/SetBaselineUseCase';
import { CompareRoutesUseCase } from '../../core/application/use-cases/CompareRoutesUseCase';
import { ComputeComplianceBalanceUseCase } from '../../core/application/use-cases/ComputeComplianceBalanceUseCase';
import { GetAdjustedComplianceBalanceUseCase } from '../../core/application/use-cases/GetAdjustedComplianceBalanceUseCase';
import { BankSurplusUseCase } from '../../core/application/use-cases/BankSurplusUseCase';
import { ApplyBankedSurplusUseCase } from '../../core/application/use-cases/ApplyBankedSurplusUseCase';
import { CreatePoolUseCase } from '../../core/application/use-cases/CreatePoolUseCase';

// --- Inbound adapters ---
import { createRouteController } from '../../adapters/inbound/http/RouteController';

// ─── Dependency Injection ──────────────────────────────────────────

const routeRepo = new PgRouteRepository(db);
const complianceRepo = new PgComplianceRepository(db);
const bankRepo = new PgBankRepository(db);
const poolRepo = new PgPoolRepository(db);

const getRoutes = new GetRoutesUseCase(routeRepo);
const setBaseline = new SetBaselineUseCase(routeRepo);
const compareRoutes = new CompareRoutesUseCase(routeRepo);
const computeCompliance = new ComputeComplianceBalanceUseCase(routeRepo, complianceRepo);
const getAdjustedCompliance = new GetAdjustedComplianceBalanceUseCase(complianceRepo, bankRepo);
const bankSurplus = new BankSurplusUseCase(complianceRepo, bankRepo);
const applyBanked = new ApplyBankedSurplusUseCase(bankRepo);
const createPool = new CreatePoolUseCase(complianceRepo, poolRepo);

// ─── Express App ───────────────────────────────────────────────────

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Health check ---
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Routes ---
app.use('/routes', createRouteController(getRoutes, setBaseline, compareRoutes));

// --- Error handler ---
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    const status = (err as any).statusCode || 500;
    res.status(status).json({
        error: err.message || 'Internal Server Error',
    });
});

// ─── Export for use by controllers (Phase D) and server start ──────

export {
    app,
    getRoutes,
    setBaseline,
    compareRoutes,
    computeCompliance,
    getAdjustedCompliance,
    bankSurplus,
    applyBanked,
    createPool,
};

// --- Start server ---
const PORT = process.env.PORT || 3001;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 FuelEU Maritime API running on http://localhost:${PORT}`);
    });
}
