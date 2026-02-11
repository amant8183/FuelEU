/**
 * FuelEU Maritime — Route Entity
 *
 * Represents a vessel voyage with fuel and emissions data.
 * Used as the base for compliance calculations and comparisons.
 */

/** Vessel classification types per FuelEU scope */
export enum VesselType {
    Container = 'Container',
    BulkCarrier = 'BulkCarrier',
    Tanker = 'Tanker',
    RoRo = 'RoRo',
}

/** Fuel types tracked under FuelEU Maritime */
export enum FuelType {
    HFO = 'HFO',
    LNG = 'LNG',
    MGO = 'MGO',
}

/** Route entity — core domain object */
export interface Route {
    /** Database primary key (UUID) */
    id: string;

    /** Business identifier (e.g. R001, R002) */
    routeId: string;

    /** Type of vessel */
    vesselType: VesselType;

    /** Fuel type used on this route */
    fuelType: FuelType;

    /** Reporting year */
    year: number;

    /** GHG intensity in gCO₂e/MJ */
    ghgIntensity: number;

    /** Fuel consumption in tonnes */
    fuelConsumption: number;

    /** Distance in km */
    distance: number;

    /** Total emissions in tonnes */
    totalEmissions: number;

    /** Whether this route is the current baseline for comparison */
    isBaseline: boolean;
}
