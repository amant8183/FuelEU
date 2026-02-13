import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PoolingTab } from '../PoolingTab';
import { ApiProvider } from '../../hooks/useApi';
import type { ApiClientPort } from '../../../../core/ports/ApiClientPort';

function makeMockApi(overrides: Partial<ApiClientPort> = {}): ApiClientPort {
    return {
        getRoutes: vi.fn().mockResolvedValue([]),
        setBaseline: vi.fn().mockResolvedValue(undefined),
        compareRoutes: vi.fn().mockResolvedValue({}),
        computeComplianceBalance: vi.fn().mockResolvedValue([]),
        getAdjustedComplianceBalance: vi.fn().mockResolvedValue([]),
        bankDeposit: vi.fn().mockResolvedValue({ id: 'B1', shipId: 'S1', amountGco2eq: 100, year: 2024 }),
        bankApply: vi.fn().mockResolvedValue(undefined),
        getPools: vi.fn().mockResolvedValue([
            {
                poolId: 'POOL-1',
                year: 2024,
                netCb: 2000,
                members: [
                    { shipId: 'S1', cbBefore: 5000, cbAfter: 3500 },
                    { shipId: 'S2', cbBefore: -3000, cbAfter: -1500 },
                ],
            },
        ]),
        createPool: vi.fn().mockResolvedValue({
            poolId: 'POOL-NEW',
            year: 2024,
            members: [
                { shipId: 'A1', cbBefore: 1000, cbAfter: 500 },
                { shipId: 'A2', cbBefore: -500, cbAfter: 0 },
            ],
            netCb: 500,
        }),
        ...overrides,
    };
}

describe('PoolingTab', () => {
    let mockApi: ApiClientPort;

    beforeEach(() => {
        mockApi = makeMockApi();
    });

    it('renders header and create form', async () => {
        render(
            <ApiProvider client={mockApi}>
                <PoolingTab />
            </ApiProvider>,
        );
        expect(screen.getByText('Article 21 — Pooling')).toBeInTheDocument();
        expect(screen.getByText('Create Pool')).toBeInTheDocument();
    });

    it('loads and displays existing pools', async () => {
        render(
            <ApiProvider client={mockApi}>
                <PoolingTab />
            </ApiProvider>,
        );
        expect(await screen.findByText('POOL-1')).toBeInTheDocument();
    });

    it('shows KPI cards', async () => {
        render(
            <ApiProvider client={mockApi}>
                <PoolingTab />
            </ApiProvider>,
        );
        await screen.findByText('POOL-1');
        expect(screen.getByText('Total Pools')).toBeInTheDocument();
        expect(screen.getByText('Ships Pooled')).toBeInTheDocument();
    });

    it('expands pool to show members', async () => {
        const user = userEvent.setup();
        render(
            <ApiProvider client={mockApi}>
                <PoolingTab />
            </ApiProvider>,
        );
        const poolRow = await screen.findByText('POOL-1');
        await user.click(poolRow);
        expect(await screen.findByText('S1')).toBeInTheDocument();
        expect(screen.getByText('S2')).toBeInTheDocument();
    });

    it('validates minimum 2 ship IDs', async () => {
        const user = userEvent.setup();
        render(
            <ApiProvider client={mockApi}>
                <PoolingTab />
            </ApiProvider>,
        );
        await screen.findByText('POOL-1');
        await user.type(screen.getByPlaceholderText(/SHIP-001/i), 'ONLY-ONE');
        await user.click(screen.getByText('🤝 Create Pool'));
        expect(await screen.findByText(/at least 2 ship IDs/i)).toBeInTheDocument();
    });

    it('creates pool successfully', async () => {
        const user = userEvent.setup();
        render(
            <ApiProvider client={mockApi}>
                <PoolingTab />
            </ApiProvider>,
        );
        await screen.findByText('POOL-1');
        await user.type(
            screen.getByPlaceholderText(/SHIP-001/i),
            'SHIP-A, SHIP-B',
        );
        await user.click(screen.getByText('🤝 Create Pool'));
        expect(await screen.findByText(/Pool "POOL-NEW" created/i)).toBeInTheDocument();
    });

    it('shows empty state when no pools', async () => {
        const emptyApi = makeMockApi({ getPools: vi.fn().mockResolvedValue([]) });
        render(
            <ApiProvider client={emptyApi}>
                <PoolingTab />
            </ApiProvider>,
        );
        expect(await screen.findByText('No Pools Yet')).toBeInTheDocument();
    });
});
