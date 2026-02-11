/**
 * Outbound port — RouteRepository
 *
 * Contract for persisting and retrieving Route entities.
 * Implemented by the outbound adapter (e.g. PostgresRouteRepository).
 */

import { Route } from '../../domain/entities/Route';

export interface RouteRepository {
    /** Retrieve all routes, optionally filtered by year */
    findAll(year?: number): Promise<Route[]>;

    /** Retrieve a route by its business identifier (e.g. R001) */
    findByRouteId(routeId: string): Promise<Route | null>;

    /** Retrieve the current baseline route (if any) */
    findBaseline(): Promise<Route | null>;

    /** Set a route as the baseline (clears any previous baseline) */
    setBaseline(routeId: string): Promise<void>;

    /** Insert a new route */
    save(route: Route): Promise<void>;

    /** Seed multiple routes at once (for initial data load) */
    seedAll(routes: Route[]): Promise<void>;
}
