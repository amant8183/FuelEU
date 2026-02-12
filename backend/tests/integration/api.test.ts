/**
 * Integration tests — API endpoints via Supertest.
 *
 * These tests hit the actual Express app with a real database.
 * Requires: DATABASE_URL pointing to a running PostgreSQL instance.
 *
 * Run: npm run test:integration
 */

import request from 'supertest';
import { app } from '../../src/infrastructure/server/app';
import db from '../../src/infrastructure/db/connection';

beforeAll(async () => {
    // Ensure schema is up to date
    await db.migrate.latest();
    await db.seed.run();
});

afterAll(async () => {
    await db.destroy();
});

describe('Health', () => {
    it('GET /health → 200 with status ok', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
        expect(res.body.timestamp).toBeDefined();
    });
});

describe('Routes', () => {
    it('GET /routes → 200 with 5 routes', async () => {
        const res = await request(app).get('/routes');
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(5);
        expect(res.body[0]).toHaveProperty('routeId');
        expect(res.body[0]).toHaveProperty('ghgIntensity');
    });

    it('GET /routes?year=2024 → only 2024 routes', async () => {
        const res = await request(app).get('/routes?year=2024');
        expect(res.status).toBe(200);
        expect(res.body.every((r: any) => r.year === 2024)).toBe(true);
        expect(res.body).toHaveLength(3);
    });

    it('POST /routes/:id/baseline → sets baseline', async () => {
        const res = await request(app).post('/routes/R001/baseline');
        expect(res.status).toBe(200);
        expect(res.body.message).toContain('R001');

        // Verify it changed
        const routes = await request(app).get('/routes');
        const baseline = routes.body.find((r: any) => r.isBaseline);
        expect(baseline.routeId).toBe('R001');
    });

    it('POST /routes/INVALID/baseline → 404', async () => {
        const res = await request(app).post('/routes/INVALID/baseline');
        expect(res.status).toBe(404);
        expect(res.body.code).toBe('ROUTE_NOT_FOUND');
    });

    it('GET /routes/comparison?routeId=R002 → comparison result', async () => {
        // Ensure R001 is baseline first
        await request(app).post('/routes/R001/baseline');
        const res = await request(app).get('/routes/comparison?routeId=R002');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('baselineRouteId', 'R001');
        expect(res.body).toHaveProperty('alternativeRouteId', 'R002');
        expect(res.body).toHaveProperty('deltaGhgIntensity');
        expect(res.body).toHaveProperty('percentageSavings');
    });

    it('GET /routes/comparison without routeId → 400', async () => {
        const res = await request(app).get('/routes/comparison');
        expect(res.status).toBe(400);
    });
});

describe('Compliance', () => {
    it('GET /compliance/cb → computes and returns CB records', async () => {
        const res = await request(app).get('/compliance/cb');
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(5);
        expect(res.body[0]).toHaveProperty('shipId');
        expect(res.body[0]).toHaveProperty('cbGco2eq');
        expect(res.body[0]).toHaveProperty('status');
    });

    it('GET /compliance/adjusted-cb → adjusted balances', async () => {
        const res = await request(app).get('/compliance/adjusted-cb');
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(5);
        expect(res.body[0]).toHaveProperty('rawCbGco2eq');
        expect(res.body[0]).toHaveProperty('bankedSurplus');
    });
});

describe('Banking', () => {
    beforeAll(async () => {
        // Ensure CB records exist
        await request(app).get('/compliance/cb');
        // Clean bank_entries for a fresh start
        await db('bank_entries').del();
    });

    it('POST /banking/deposit → banks surplus', async () => {
        const res = await request(app)
            .post('/banking/deposit')
            .send({ shipId: 'R002', amountGco2eq: 50000000, year: 2024 });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.shipId).toBe('R002');
        expect(res.body.amountGco2eq).toBe(50000000);
    });

    it('POST /banking/deposit with deficit ship → 400', async () => {
        const res = await request(app)
            .post('/banking/deposit')
            .send({ shipId: 'R001', amountGco2eq: 1000, year: 2024 });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('INSUFFICIENT_SURPLUS');
    });

    it('POST /banking/apply → applies banked surplus', async () => {
        const res = await request(app)
            .post('/banking/apply')
            .send({ shipId: 'R002', amountGco2eq: 10000000 });
        expect(res.status).toBe(200);
        expect(res.body.message).toContain('R002');
    });

    it('POST /banking/apply exceeding balance → 400', async () => {
        const res = await request(app)
            .post('/banking/apply')
            .send({ shipId: 'R002', amountGco2eq: 999999999999 });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('INSUFFICIENT_BANKED_AMOUNT');
    });
});

describe('Pooling', () => {
    beforeAll(async () => {
        // Ensure CB records exist
        await request(app).get('/compliance/cb');
    });

    it('POST /pools with net negative → 400', async () => {
        const res = await request(app)
            .post('/pools')
            .send({ shipIds: ['R001', 'R002'], year: 2024 });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('POOL_NET_NEGATIVE');
    });

    it('POST /pools with missing CB → 400', async () => {
        const res = await request(app)
            .post('/pools')
            .send({ shipIds: ['R001', 'R999'], year: 2024 });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('NO_COMPLIANCE_RECORD');
    });

    it('GET /pools → returns array', async () => {
        const res = await request(app).get('/pools');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
