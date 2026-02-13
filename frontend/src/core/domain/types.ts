/**
 * Frontend Domain Types
 *
 * Mirror the backend API response shapes.
 * Zero framework dependencies — pure TypeScript interfaces.
 */

// ─── Route ─────────────────────────────────────────────────────────

export type VesselType = 'Container' | 'BulkCarrier' | 'Tanker' | 'RoRo';
export type FuelType = 'HFO' | 'LNG' | 'MGO' | 'VLSFO' | 'Methanol';

export interface Route {
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

// ─── Compliance Balance ────────────────────────────────────────────

export type ComplianceStatus = 'surplus' | 'deficit' | 'neutral';

export interface ComplianceBalance {
  shipId: string;
  year: number;
  cbGco2eq: number;
  status: ComplianceStatus;
}

export interface AdjustedComplianceBalance extends ComplianceBalance {
  rawCbGco2eq: number;
  bankedSurplus: number;
}

// ─── Comparison ────────────────────────────────────────────────────

export interface Comparison {
  baselineRouteId: string;
  alternativeRouteId: string;
  baselineGhgIntensity: number;
  alternativeGhgIntensity: number;
  deltaGhgIntensity: number;
  baselineCb: number;
  alternativeCb: number;
  deltaCb: number;
  percentageSavings: number;
}

// ─── Bank Entry (Article 20) ──────────────────────────────────────

export interface BankEntry {
  id: string;
  shipId: string;
  year: number;
  amountGco2eq: number;
}

// ─── Pool (Article 21) ────────────────────────────────────────────

export interface PoolMember {
  shipId: string;
  cbBefore: number;
  cbAfter: number;
}

export interface Pool {
  poolId: string;
  year: number;
  members: PoolMember[];
  netCb: number;
}

// ─── API Inputs ────────────────────────────────────────────────────

export interface BankDepositInput {
  shipId: string;
  amountGco2eq: number;
  year: number;
}

export interface BankApplyInput {
  shipId: string;
  amountGco2eq: number;
}

export interface CreatePoolInput {
  shipIds: string[];
  year: number;
}

// ─── API Error ─────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  code?: string;
}
