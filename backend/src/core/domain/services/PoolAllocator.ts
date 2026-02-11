/**
 * FuelEU Maritime — PoolAllocator
 *
 * Pure domain service implementing Article 21 compliance pooling.
 *
 * Algorithm (greedy allocation):
 *   1. Separate ships into surplus (CB > 0) and deficit (CB < 0) groups
 *   2. Sort surplus descending, deficit ascending (most negative first)
 *   3. For each deficit ship, greedily pull surplus from surplus ships
 *   4. Each surplus ship can give at most its entire surplus (cannot go negative)
 *   5. Each deficit ship receives at most enough to reach 0
 *
 * Invariants:
 *   - Deficit ship cannot exit worse: cbAfter ≥ cbBefore
 *   - Surplus ship cannot exit negative: cbAfter ≥ 0
 *   - Total CB is conserved: ∑cbBefore = ∑cbAfter
 *   - Pool net CB ≥ 0 (validated before allocation)
 */

import { PoolMember } from '../entities/PoolMember';
import {
    PoolNetNegativeError,
    InsufficientMembersError,
} from '../../../shared/errors';

/** Input to the allocator: a ship's ID and its computed CB */
export interface ShipCb {
    shipId: string;
    cbGco2eq: number;
}

/** Output: allocation result with the pool members and metadata */
export interface AllocationResult {
    members: PoolMember[];
    totalSurplusBefore: number;
    totalDeficitBefore: number;
    netCb: number;
}

/**
 * Run the greedy pool allocation algorithm.
 *
 * @param poolId - The pool these members belong to
 * @param ships - Array of { shipId, cbGco2eq } entries
 * @returns AllocationResult with cbBefore/cbAfter for each member
 * @throws InsufficientMembersError if < 2 ships
 * @throws PoolNetNegativeError if net CB < 0
 */
export function allocatePool(poolId: string, ships: ShipCb[]): AllocationResult {
    if (ships.length < 2) {
        throw new InsufficientMembersError(ships.length);
    }

    const netCb = ships.reduce((sum, s) => sum + s.cbGco2eq, 0);
    if (netCb < 0) {
        throw new PoolNetNegativeError(netCb);
    }

    // Separate into surplus and deficit
    const surplusShips = ships
        .filter((s) => s.cbGco2eq > 0)
        .map((s) => ({ ...s, remaining: s.cbGco2eq }))
        .sort((a, b) => b.remaining - a.remaining); // largest surplus first

    const deficitShips = ships
        .filter((s) => s.cbGco2eq < 0)
        .map((s) => ({ ...s, needed: Math.abs(s.cbGco2eq), received: 0 }))
        .sort((a, b) => b.needed - a.needed); // largest deficit first

    // Ships at exactly zero
    const zeroShips = ships.filter((s) => s.cbGco2eq === 0);

    // Greedy allocation: fill each deficit from available surplus
    let surplusIdx = 0;
    for (const deficit of deficitShips) {
        while (deficit.received < deficit.needed && surplusIdx < surplusShips.length) {
            const surplus = surplusShips[surplusIdx];
            const transfer = Math.min(surplus.remaining, deficit.needed - deficit.received);

            surplus.remaining -= transfer;
            deficit.received += transfer;

            if (surplus.remaining === 0) {
                surplusIdx++;
            }
        }
    }

    // Build PoolMember results
    const members: PoolMember[] = [];

    for (const s of surplusShips) {
        members.push({
            poolId,
            shipId: s.shipId,
            cbBefore: s.cbGco2eq,
            cbAfter: s.remaining,
        });
    }

    for (const d of deficitShips) {
        members.push({
            poolId,
            shipId: d.shipId,
            cbBefore: -d.needed, // original negative CB
            cbAfter: -d.needed + d.received, // improved (closer to 0)
        });
    }

    for (const z of zeroShips) {
        members.push({
            poolId,
            shipId: z.shipId,
            cbBefore: 0,
            cbAfter: 0,
        });
    }

    const totalSurplusBefore = surplusShips.reduce((sum, s) => sum + s.cbGco2eq, 0);
    const totalDeficitBefore = deficitShips.reduce((sum, d) => sum + -d.needed, 0);

    return { members, totalSurplusBefore, totalDeficitBefore, netCb };
}
