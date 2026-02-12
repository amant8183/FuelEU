/**
 * Use-case — CompareRoutes
 *
 * Compares the current baseline route against an alternative route.
 * Depends on RouteRepository port and ComparisonCalculator domain service.
 */

import { RouteRepository } from '../../ports/outbound/RouteRepository';
import { compareRoutes } from '../../domain/services/ComparisonCalculator';
import { ComparisonDto } from '../dtos/ComparisonDto';
import { NoBaselineError, RouteNotFoundError } from '../../../shared/errors';

export class CompareRoutesUseCase {
    constructor(private readonly routeRepo: RouteRepository) { }

    async execute(alternativeRouteId: string): Promise<ComparisonDto> {
        const baseline = await this.routeRepo.findBaseline();
        if (!baseline) {
            throw new NoBaselineError();
        }

        const alternative = await this.routeRepo.findByRouteId(alternativeRouteId);
        if (!alternative) {
            throw new RouteNotFoundError(alternativeRouteId);
        }

        const result = compareRoutes(baseline, alternative);

        return {
            baselineRouteId: result.baselineRouteId,
            alternativeRouteId: result.alternativeRouteId,
            baselineGhgIntensity: result.baselineGhgIntensity,
            alternativeGhgIntensity: result.alternativeGhgIntensity,
            deltaGhgIntensity: result.deltaGhgIntensity,
            baselineCb: result.baselineCb,
            alternativeCb: result.alternativeCb,
            deltaCb: result.deltaCb,
            percentageSavings: result.percentageSavings,
        };
    }
}
