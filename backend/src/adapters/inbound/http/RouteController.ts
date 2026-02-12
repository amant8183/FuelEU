/**
 * Inbound HTTP adapter — Route Controller
 *
 * Thin controller that delegates to use-cases.
 * Zero business logic — only HTTP concern mapping.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { GetRoutesUseCase } from '../../../core/application/use-cases/GetRoutesUseCase';
import { SetBaselineUseCase } from '../../../core/application/use-cases/SetBaselineUseCase';
import { CompareRoutesUseCase } from '../../../core/application/use-cases/CompareRoutesUseCase';
import { DomainError } from '../../../shared/errors';

export function createRouteController(
    getRoutes: GetRoutesUseCase,
    setBaseline: SetBaselineUseCase,
    compareRoutes: CompareRoutesUseCase,
): Router {
    const router = Router();

    /**
     * GET /routes?year=2024
     * Returns all routes, optionally filtered by year.
     */
    router.get('/', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const year = req.query.year ? Number(req.query.year) : undefined;
            const routes = await getRoutes.execute(year);
            res.json(routes);
        } catch (err) {
            next(err);
        }
    });

    /**
     * POST /routes/:id/baseline
     * Sets the specified route as the baseline.
     */
    router.post('/:id/baseline', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const routeId = req.params.id as string;
            await setBaseline.execute(routeId);
            res.json({ message: `Baseline set to ${routeId}` });
        } catch (err) {
            if (err instanceof DomainError) {
                res.status(404).json({ error: err.message, code: err.code });
                return;
            }
            next(err);
        }
    });

    /**
     * GET /routes/comparison?routeId=R002
     * Compares the baseline route against the specified alternative.
     */
    router.get('/comparison', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const routeId = req.query.routeId as string;
            if (!routeId) {
                res.status(400).json({ error: 'routeId query parameter is required' });
                return;
            }
            const result = await compareRoutes.execute(routeId);
            res.json(result);
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
