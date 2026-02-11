/**
 * FuelEU Maritime — Domain Error Classes
 *
 * Typed errors for business rule violations.
 * All extend a base DomainError for consistent handling.
 */

export class DomainError extends Error {
    constructor(
        message: string,
        public readonly code: string,
    ) {
        super(message);
        this.name = this.constructor.name;
    }
}

/** Thrown when a route cannot be found by ID */
export class RouteNotFoundError extends DomainError {
    constructor(routeId: string) {
        super(`Route not found: ${routeId}`, 'ROUTE_NOT_FOUND');
    }
}

/** Thrown when a comparison is attempted but no baseline route is set */
export class NoBaselineError extends DomainError {
    constructor() {
        super('No baseline route has been set', 'NO_BASELINE_SET');
    }
}

/** Thrown when attempting to bank from a ship with no surplus (CB ≤ 0) */
export class InsufficientSurplusError extends DomainError {
    constructor(shipId: string) {
        super(`Ship ${shipId} has no surplus to bank (CB ≤ 0)`, 'INSUFFICIENT_SURPLUS');
    }
}

/** Thrown when the apply amount exceeds available banked surplus */
export class InsufficientBankedError extends DomainError {
    constructor(shipId: string, requested: number, available: number) {
        super(
            `Ship ${shipId}: requested ${requested} but only ${available} banked`,
            'INSUFFICIENT_BANKED_AMOUNT',
        );
    }
}

/** Thrown when a pool's net compliance balance is negative (∑CB < 0) */
export class PoolNetNegativeError extends DomainError {
    constructor(netCb: number) {
        super(`Pool net CB is negative: ${netCb}. Sum must be ≥ 0`, 'POOL_NET_NEGATIVE');
    }
}

/** Thrown when pool allocation violates Article 21 invariants */
export class AllocationInvariantError extends DomainError {
    constructor(detail: string) {
        super(`Pool allocation invariant violated: ${detail}`, 'ALLOCATION_INVARIANT_VIOLATED');
    }
}

/** Thrown when no compliance record exists for a ship/year */
export class ComplianceRecordNotFoundError extends DomainError {
    constructor(shipId: string, year: number) {
        super(`No compliance record for ship ${shipId} year ${year}`, 'NO_COMPLIANCE_RECORD');
    }
}

/** Thrown when an invalid amount is provided (e.g. amount ≤ 0) */
export class InvalidAmountError extends DomainError {
    constructor(amount: number) {
        super(`Invalid amount: ${amount}. Must be > 0`, 'INVALID_AMOUNT');
    }
}

/** Thrown when a pool has fewer than 2 members */
export class InsufficientMembersError extends DomainError {
    constructor(count: number) {
        super(`Pool requires at least 2 members, got ${count}`, 'INSUFFICIENT_MEMBERS');
    }
}
