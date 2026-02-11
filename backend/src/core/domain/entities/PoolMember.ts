/**
 * FuelEU Maritime — PoolMember Entity
 *
 * Represents a ship's participation in a compliance pool.
 * Tracks CB before and after the greedy allocation algorithm.
 *
 * Invariants (Article 21):
 *   - Deficit ship cannot exit worse: cbAfter >= cbBefore (when cbBefore < 0)
 *   - Surplus ship cannot exit negative: cbAfter >= 0 (when cbBefore > 0)
 */

export interface PoolMember {
    /** FK → Pool */
    poolId: string;

    /** Ship/route identifier */
    shipId: string;

    /** Compliance balance before pooling allocation */
    cbBefore: number;

    /** Compliance balance after pooling allocation */
    cbAfter: number;
}
