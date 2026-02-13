/**
 * Inbound HTTP adapter — Compliance Controller
 *
 * Thin controller that delegates to compliance use-cases.
 * Zero business logic — only HTTP concern mapping.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { ComputeComplianceBalanceUseCase } from '../../../core/application/use-cases/ComputeComplianceBalanceUseCase';
import { GetAdjustedComplianceBalanceUseCase } from '../../../core/application/use-cases/GetAdjustedComplianceBalanceUseCase';
import { DomainError } from '../../../shared/errors';

export function createComplianceController(
    computeCompliance: ComputeComplianceBalanceUseCase,
    getAdjustedCompliance: GetAdjustedComplianceBalanceUseCase,
): Router {
    const router = Router();

    /**
     * GET /compliance/cb
     * Computes CB for all routes and persists results.
     */
    router.get('/cb', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const year = req.query.year ? Number(req.query.year) : undefined;
            const results = await computeCompliance.execute(year);
            res.json(results);
        } catch (err) {
            next(err);
        }
    });

    /**
     * GET /compliance/adjusted-cb?year=2024
     * Returns CBs adjusted with banked surplus (Article 20).
     */
    router.get('/adjusted-cb', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const year = req.query.year ? Number(req.query.year) : undefined;
            const results = await getAdjustedCompliance.execute(year);
            res.json(results);
        } catch (err) {
            if (err instanceof DomainError) {
                res.status(400).json({ error: err.message, code: err.code });
                return;
            }
            next(err);
        }
    });

    return router;
}
