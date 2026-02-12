/**
 * Inbound HTTP adapter — Banking Controller
 *
 * Thin controller for Article 20 banking operations.
 * Zero business logic — only HTTP concern mapping.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { BankSurplusUseCase } from '../../../core/application/use-cases/BankSurplusUseCase';
import { ApplyBankedSurplusUseCase } from '../../../core/application/use-cases/ApplyBankedSurplusUseCase';
import { DomainError } from '../../../shared/errors';

export function createBankingController(
    bankSurplus: BankSurplusUseCase,
    applyBanked: ApplyBankedSurplusUseCase,
): Router {
    const router = Router();

    /**
     * POST /banking/deposit
     * Body: { shipId, amountGco2eq, year }
     * Banks surplus CB for future use.
     */
    router.post('/deposit', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { shipId, amountGco2eq, year } = req.body;
            const result = await bankSurplus.execute(shipId, amountGco2eq, year);
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
     * POST /banking/apply
     * Body: { shipId, amountGco2eq }
     * Applies banked surplus to offset deficit.
     */
    router.post('/apply', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { shipId, amountGco2eq } = req.body;
            await applyBanked.execute(shipId, amountGco2eq);
            res.json({ message: `Applied ${amountGco2eq} gCO2eq from banked surplus for ${shipId}` });
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
