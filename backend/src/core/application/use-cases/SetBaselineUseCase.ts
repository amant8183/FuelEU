/**
 * Use-case — SetBaseline
 *
 * Sets a route as the baseline for comparisons.
 * Validates that the route exists before updating.
 * Depends only on the RouteRepository outbound port.
 */

import { RouteRepository } from '../../ports/outbound/RouteRepository';
import { RouteNotFoundError } from '../../../shared/errors';

export class SetBaselineUseCase {
    constructor(private readonly routeRepo: RouteRepository) { }

    async execute(routeId: string): Promise<void> {
        const route = await this.routeRepo.findByRouteId(routeId);
        if (!route) {
            throw new RouteNotFoundError(routeId);
        }

        await this.routeRepo.setBaseline(routeId);
    }
}
