/**
 * PostgreSQL adapter — RouteRepository
 *
 * Implements the RouteRepository port using Knex.
 * Maps between snake_case DB columns and camelCase domain entities.
 */

import { Knex } from 'knex';
import { Route, VesselType, FuelType } from '../../../core/domain/entities/Route';
import { RouteRepository } from '../../../core/ports/outbound/RouteRepository';

/** DB row shape (snake_case) */
interface RouteRow {
    id: string;
    route_id: string;
    vessel_type: string;
    fuel_type: string;
    year: number;
    ghg_intensity: number;
    fuel_consumption: number;
    distance: number;
    total_emissions: number;
    is_baseline: boolean;
}

function toDomain(row: RouteRow): Route {
    return {
        id: row.id,
        routeId: row.route_id,
        vesselType: row.vessel_type as VesselType,
        fuelType: row.fuel_type as FuelType,
        year: row.year,
        ghgIntensity: row.ghg_intensity,
        fuelConsumption: row.fuel_consumption,
        distance: row.distance,
        totalEmissions: row.total_emissions,
        isBaseline: row.is_baseline,
    };
}

function toRow(route: Route): Omit<RouteRow, 'id'> & { id?: string } {
    return {
        id: route.id,
        route_id: route.routeId,
        vessel_type: route.vesselType,
        fuel_type: route.fuelType,
        year: route.year,
        ghg_intensity: route.ghgIntensity,
        fuel_consumption: route.fuelConsumption,
        distance: route.distance,
        total_emissions: route.totalEmissions,
        is_baseline: route.isBaseline,
    };
}

export class PgRouteRepository implements RouteRepository {
    constructor(private readonly db: Knex) { }

    async findAll(year?: number): Promise<Route[]> {
        const query = this.db<RouteRow>('routes');
        if (year !== undefined) {
            query.where('year', year);
        }
        const rows = await query.select('*').orderBy('route_id');
        return rows.map(toDomain);
    }

    async findByRouteId(routeId: string): Promise<Route | null> {
        const row = await this.db<RouteRow>('routes')
            .where('route_id', routeId)
            .first();
        return row ? toDomain(row) : null;
    }

    async findBaseline(): Promise<Route | null> {
        const row = await this.db<RouteRow>('routes')
            .where('is_baseline', true)
            .first();
        return row ? toDomain(row) : null;
    }

    async setBaseline(routeId: string): Promise<void> {
        await this.db.transaction(async (trx) => {
            await trx('routes').update({ is_baseline: false });
            await trx('routes').where('route_id', routeId).update({ is_baseline: true });
        });
    }

    async save(route: Route): Promise<void> {
        const row = toRow(route);
        await this.db('routes')
            .insert(row)
            .onConflict('route_id')
            .merge();
    }

    async seedAll(routes: Route[]): Promise<void> {
        const rows = routes.map(toRow);
        await this.db.transaction(async (trx) => {
            await trx('routes').del();
            if (rows.length > 0) {
                await trx('routes').insert(rows);
            }
        });
    }
}
