/**
 * DTOs for Route-related operations
 */

import { VesselType, FuelType } from '../../domain/entities/Route';

/** Output DTO — route data returned to the client */
export interface RouteDto {
    id: string;
    routeId: string;
    vesselType: VesselType;
    fuelType: FuelType;
    year: number;
    ghgIntensity: number;
    fuelConsumption: number;
    distance: number;
    totalEmissions: number;
    isBaseline: boolean;
}

/** Input DTO — set baseline request */
export interface SetBaselineInput {
    routeId: string;
}
