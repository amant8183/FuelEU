/**
 * Inbound HTTP adapter — Pooling Controller
 *
 * Thin controller for Article 21 pooling operations.
 * Zero business logic — only HTTP concern mapping.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { CreatePoolUseCase } from '../../../core/application/use-cases/CreatePoolUseCase';
import { PoolRepository } from '../../../core/ports/outbound/PoolRepository';
import { DomainError } from '../../../shared/errors';

export function createPoolingController(
    createPool: CreatePoolUseCase,
    poolRepo: PoolRepository,
): Router {
    const router = Router();

    /**
     * POST /pools
     * Body: { shipIds: string[], year: number }
     * Creates a new compliance pool with greedy allocation.
     */
    router.post('/', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { shipIds, year } = req.body;
            const result = await createPool.execute(shipIds, year);
            res.status(201).json(result);
        } catch (err) {
            if (err instanceof DomainError) {
                res.status(400).json({ error: err.message, code: err.code });
                return;
            }
            next(err);
        }
    });

    /**
     * GET /pools?year=2024
     * Returns all pools with their members.
     */
    router.get('/', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const year = req.query.year ? Number(req.query.year) : undefined;
            const pools = await poolRepo.findAll(year);
            res.json(pools.map((p) => ({
                poolId: p.pool.id,
                year: p.pool.year,
                createdAt: p.pool.createdAt,
                members: p.members.map((m) => ({
                    shipId: m.shipId,
                    cbBefore: m.cbBefore,
                    cbAfter: m.cbAfter,
                })),
            })));
        } catch (err) {
            next(err);
        }
    });

    /**
     * GET /pools/:id
     * Returns a single pool by ID with its members.
     */
    router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const poolId = req.params.id as string;
            const result = await poolRepo.findById(poolId);
            if (!result) {
                res.status(404).json({ error: `Pool not found: ${poolId}` });
                return;
            }
            res.json({
                poolId: result.pool.id,
                year: result.pool.year,
                createdAt: result.pool.createdAt,
                members: result.members.map((m) => ({
                    shipId: m.shipId,
                    cbBefore: m.cbBefore,
                    cbAfter: m.cbAfter,
                })),
            });
        } catch (err) {
            next(err);
        }
    });

    return router;
}
