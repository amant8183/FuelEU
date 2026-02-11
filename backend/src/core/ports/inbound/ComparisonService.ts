/**
 * Inbound port — ComparisonService
 *
 * Contract for route comparison operations exposed to inbound adapters.
 */

import { ComparisonResult } from '../../domain/services/ComparisonCalculator';

export interface ComparisonService {
    /** Compare the baseline route against an alternative route */
    compare(alternativeRouteId: string): Promise<ComparisonResult>;
}
