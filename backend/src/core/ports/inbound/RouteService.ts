/**
 * Inbound port — RouteService
 *
 * Contract for route-related operations exposed to inbound adapters.
 */

import { Route } from '../../domain/entities/Route';

export interface RouteService {
    /** Retrieve all routes, optionally filtered by year */
    getAll(year?: number): Promise<Route[]>;

    /** Set a route as the baseline for comparisons */
    setBaseline(routeId: string): Promise<void>;

    /** Seed initial route data */
    seedRoutes(routes: Route[]): Promise<void>;
}
