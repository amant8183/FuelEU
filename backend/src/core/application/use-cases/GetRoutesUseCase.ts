/**
 * Use-case — GetRoutes
 *
 * Retrieves all routes, optionally filtered by year.
 * Depends only on the RouteRepository outbound port.
 */

import { RouteRepository } from '../../ports/outbound/RouteRepository';
import { RouteDto } from '../dtos/RouteDto';

export class GetRoutesUseCase {
    constructor(private readonly routeRepo: RouteRepository) { }

    async execute(year?: number): Promise<RouteDto[]> {
        const routes = await this.routeRepo.findAll(year);

        return routes.map((r) => ({
            id: r.id,
            routeId: r.routeId,
            vesselType: r.vesselType,
            fuelType: r.fuelType,
            year: r.year,
            ghgIntensity: r.ghgIntensity,
            fuelConsumption: r.fuelConsumption,
            distance: r.distance,
            totalEmissions: r.totalEmissions,
            isBaseline: r.isBaseline,
        }));
    }
}
