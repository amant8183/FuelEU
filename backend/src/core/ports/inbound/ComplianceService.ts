/**
 * Inbound port — ComplianceService
 *
 * Contract for compliance-related operations exposed to inbound adapters.
 */

import { ComplianceBalance } from '../../domain/entities/ComplianceBalance';

export interface ComplianceService {
    /** Compute compliance balance for all routes and persist results */
    computeAll(): Promise<ComplianceBalance[]>;

    /** Retrieve all compliance records, optionally filtered by year */
    getAll(year?: number): Promise<ComplianceBalance[]>;
}
