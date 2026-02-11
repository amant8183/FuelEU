import { allocatePool, ShipCb } from '../../src/core/domain/services/PoolAllocator';
import { InsufficientMembersError, PoolNetNegativeError } from '../../src/shared/errors';

const POOL_ID = 'pool-001';

describe('PoolAllocator', () => {
    describe('validation', () => {
        it('throws InsufficientMembersError with < 2 ships', () => {
            const ships: ShipCb[] = [{ shipId: 'S1', cbGco2eq: 100 }];
            expect(() => allocatePool(POOL_ID, ships)).toThrow(InsufficientMembersError);
        });

        it('throws InsufficientMembersError with 0 ships', () => {
            expect(() => allocatePool(POOL_ID, [])).toThrow(InsufficientMembersError);
        });

        it('throws PoolNetNegativeError when net CB < 0', () => {
            const ships: ShipCb[] = [
                { shipId: 'S1', cbGco2eq: 100 },
                { shipId: 'S2', cbGco2eq: -200 },
            ];
            expect(() => allocatePool(POOL_ID, ships)).toThrow(PoolNetNegativeError);
        });
    });

    describe('allocation — simple 2-ship pool', () => {
        it('surplus covers deficit completely', () => {
            const ships: ShipCb[] = [
                { shipId: 'S1', cbGco2eq: 500 },
                { shipId: 'S2', cbGco2eq: -300 },
            ];
            const result = allocatePool(POOL_ID, ships);

            const s1 = result.members.find((m) => m.shipId === 'S1')!;
            const s2 = result.members.find((m) => m.shipId === 'S2')!;

            expect(s1.cbBefore).toBe(500);
            expect(s1.cbAfter).toBe(200);    // gave 300
            expect(s2.cbBefore).toBe(-300);
            expect(s2.cbAfter).toBe(0);      // fully covered

            // Invariants
            expect(s1.cbAfter).toBeGreaterThanOrEqual(0);
            expect(s2.cbAfter).toBeGreaterThanOrEqual(s2.cbBefore);
        });

        it('surplus exactly matches deficit', () => {
            const ships: ShipCb[] = [
                { shipId: 'S1', cbGco2eq: 400 },
                { shipId: 'S2', cbGco2eq: -400 },
            ];
            const result = allocatePool(POOL_ID, ships);

            const s1 = result.members.find((m) => m.shipId === 'S1')!;
            const s2 = result.members.find((m) => m.shipId === 'S2')!;

            expect(s1.cbAfter).toBe(0);
            expect(s2.cbAfter).toBe(0);
            expect(result.netCb).toBe(0);
        });
    });

    describe('allocation — multi-ship pool', () => {
        it('distributes surplus across multiple deficit ships', () => {
            const ships: ShipCb[] = [
                { shipId: 'S1', cbGco2eq: 1000 },
                { shipId: 'S2', cbGco2eq: -300 },
                { shipId: 'S3', cbGco2eq: -400 },
            ];
            const result = allocatePool(POOL_ID, ships);

            const s1 = result.members.find((m) => m.shipId === 'S1')!;
            const s2 = result.members.find((m) => m.shipId === 'S2')!;
            const s3 = result.members.find((m) => m.shipId === 'S3')!;

            expect(s1.cbAfter).toBe(300);     // 1000 - 300 - 400
            expect(s2.cbAfter).toBe(0);
            expect(s3.cbAfter).toBe(0);

            // Conservation
            const totalBefore = ships.reduce((s, ship) => s + ship.cbGco2eq, 0);
            const totalAfter = result.members.reduce((s, m) => s + m.cbAfter, 0);
            expect(totalAfter).toBeCloseTo(totalBefore, 5);
        });

        it('multiple surplus ships cover deficit', () => {
            const ships: ShipCb[] = [
                { shipId: 'S1', cbGco2eq: 200 },
                { shipId: 'S2', cbGco2eq: 300 },
                { shipId: 'S3', cbGco2eq: -400 },
            ];
            const result = allocatePool(POOL_ID, ships);

            const s3 = result.members.find((m) => m.shipId === 'S3')!;
            expect(s3.cbAfter).toBe(0); // fully covered by S1 + S2

            // No surplus ship goes negative
            result.members.forEach((m) => {
                if (m.cbBefore > 0) {
                    expect(m.cbAfter).toBeGreaterThanOrEqual(0);
                }
            });

            // Conservation
            const totalBefore = ships.reduce((s, ship) => s + ship.cbGco2eq, 0);
            const totalAfter = result.members.reduce((s, m) => s + m.cbAfter, 0);
            expect(totalAfter).toBeCloseTo(totalBefore, 5);
        });
    });

    describe('allocation — edge cases', () => {
        it('all surplus, no deficit → no changes', () => {
            const ships: ShipCb[] = [
                { shipId: 'S1', cbGco2eq: 100 },
                { shipId: 'S2', cbGco2eq: 200 },
            ];
            const result = allocatePool(POOL_ID, ships);
            result.members.forEach((m) => {
                expect(m.cbAfter).toBe(m.cbBefore);
            });
        });

        it('includes zero-CB ships unchanged', () => {
            const ships: ShipCb[] = [
                { shipId: 'S1', cbGco2eq: 100 },
                { shipId: 'S2', cbGco2eq: 0 },
                { shipId: 'S3', cbGco2eq: -50 },
            ];
            const result = allocatePool(POOL_ID, ships);

            const s2 = result.members.find((m) => m.shipId === 'S2')!;
            expect(s2.cbBefore).toBe(0);
            expect(s2.cbAfter).toBe(0);
        });

        it('conservation holds with 5 ships', () => {
            const ships: ShipCb[] = [
                { shipId: 'R001', cbGco2eq: -341 },
                { shipId: 'R002', cbGco2eq: 263 },
                { shipId: 'R003', cbGco2eq: -870 },
                { shipId: 'R004', cbGco2eq: 28 },
                { shipId: 'R005', cbGco2eq: 1200 },
            ];
            const result = allocatePool(POOL_ID, ships);

            const totalBefore = ships.reduce((s, ship) => s + ship.cbGco2eq, 0);
            const totalAfter = result.members.reduce((s, m) => s + m.cbAfter, 0);
            expect(totalAfter).toBeCloseTo(totalBefore, 5);

            // Invariants
            result.members.forEach((m) => {
                if (m.cbBefore > 0) expect(m.cbAfter).toBeGreaterThanOrEqual(0);
                if (m.cbBefore < 0) expect(m.cbAfter).toBeGreaterThanOrEqual(m.cbBefore);
            });
        });
    });

    describe('result metadata', () => {
        it('returns correct totals and net', () => {
            const ships: ShipCb[] = [
                { shipId: 'S1', cbGco2eq: 500 },
                { shipId: 'S2', cbGco2eq: -300 },
            ];
            const result = allocatePool(POOL_ID, ships);

            expect(result.totalSurplusBefore).toBe(500);
            expect(result.totalDeficitBefore).toBe(-300);
            expect(result.netCb).toBe(200);
        });
    });
});
