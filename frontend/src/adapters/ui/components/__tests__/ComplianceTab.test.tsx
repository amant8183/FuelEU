import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComplianceTab } from '../ComplianceTab';
import { ApiProvider } from '../../hooks/useApi';
import type { ApiClientPort } from '../../../../core/ports/ApiClientPort';

function makeMockApi(overrides: Partial<ApiClientPort> = {}): ApiClientPort {
    return {
        getRoutes: vi.fn().mockResolvedValue([]),
        setBaseline: vi.fn().mockResolvedValue(undefined),
        compareRoutes: vi.fn().mockResolvedValue({}),
        computeComplianceBalance: vi.fn().mockResolvedValue([
            { shipId: 'S1', year: 2024, cbGco2eq: 5000, status: 'surplus' },
            { shipId: 'S2', year: 2024, cbGco2eq: -3000, status: 'deficit' },
        ]),
        getAdjustedComplianceBalance: vi.fn().mockResolvedValue([
            { shipId: 'S1', year: 2024, cbGco2eq: 4500, rawCbGco2eq: 5000, bankedSurplus: 500, status: 'surplus' },
        ]),
        bankDeposit: vi.fn().mockResolvedValue({ id: 'B1', shipId: 'S1', amountGco2eq: 100, year: 2024 }),
        bankApply: vi.fn().mockResolvedValue(undefined),
        getPools: vi.fn().mockResolvedValue([]),
        createPool: vi.fn().mockResolvedValue({ poolId: 'P1', year: 2024, members: [], netCb: 0 }),
        ...overrides,
    };
}

describe('ComplianceTab', () => {
    let mockApi: ApiClientPort;

    beforeEach(() => {
        mockApi = makeMockApi();
    });

    it('shows empty state initially', () => {
        render(
            <ApiProvider client={mockApi}>
                <ComplianceTab />
            </ApiProvider>,
        );
        expect(screen.getByText('No Compliance Data Yet')).toBeInTheDocument();
    });

    it('computes and displays compliance records', async () => {
        const user = userEvent.setup();
        render(
            <ApiProvider client={mockApi}>
                <ComplianceTab />
            </ApiProvider>,
        );
        // Use button role to avoid matching the instruction text
        const computeBtn = screen.getByRole('button', { name: /Compute CB/i });
        await user.click(computeBtn);
        expect(await screen.findByText('S1')).toBeInTheDocument();
        expect(screen.getByText('S2')).toBeInTheDocument();
    });

    it('shows surplus and deficit badges', async () => {
        const user = userEvent.setup();
        render(
            <ApiProvider client={mockApi}>
                <ComplianceTab />
            </ApiProvider>,
        );
        const computeBtn = screen.getByRole('button', { name: /Compute CB/i });
        await user.click(computeBtn);
        const surplusEls = await screen.findAllByText('Surplus');
        expect(surplusEls.length).toBeGreaterThanOrEqual(1);
        const deficitEls = screen.getAllByText('Deficit');
        expect(deficitEls.length).toBeGreaterThanOrEqual(1);
    });

    it('shows KPI cards after compute', async () => {
        const user = userEvent.setup();
        render(
            <ApiProvider client={mockApi}>
                <ComplianceTab />
            </ApiProvider>,
        );
        const computeBtn = screen.getByRole('button', { name: /Compute CB/i });
        await user.click(computeBtn);
        expect(await screen.findByText('Total Ships')).toBeInTheDocument();
    });

    it('handles compute error', async () => {
        const user = userEvent.setup();
        const failApi = makeMockApi({
            computeComplianceBalance: vi.fn().mockRejectedValue(new Error('fail')),
        });
        render(
            <ApiProvider client={failApi}>
                <ComplianceTab />
            </ApiProvider>,
        );
        const computeBtn = screen.getByRole('button', { name: /Compute CB/i });
        await user.click(computeBtn);
        expect(await screen.findByText(/Failed to compute/i)).toBeInTheDocument();
    });
});
