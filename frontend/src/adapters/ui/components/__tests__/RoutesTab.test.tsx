import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoutesTab } from '../RoutesTab';
import { ApiProvider } from '../../hooks/useApi';
import type { ApiClientPort } from '../../../../core/ports/ApiClientPort';

function makeMockApi(overrides: Partial<ApiClientPort> = {}): ApiClientPort {
    return {
        getRoutes: vi.fn().mockResolvedValue([
            {
                id: 'R1',
                routeId: 'RT-001',
                vesselType: 'Container',
                fuelType: 'VLSFO',
                year: 2024,
                ghgIntensity: 91.2,
                fuelConsumption: 1000,
                distance: 500,
                totalEmissions: 50000,
                isBaseline: false,
            },
            {
                id: 'R2',
                routeId: 'RT-002',
                vesselType: 'Tanker',
                fuelType: 'LNG',
                year: 2024,
                ghgIntensity: 70.0,
                fuelConsumption: 800,
                distance: 600,
                totalEmissions: 40000,
                isBaseline: true,
            },
        ]),
        setBaseline: vi.fn().mockResolvedValue(undefined),
        compareRoutes: vi.fn().mockResolvedValue({
            baselineRouteId: 'RT-002',
            alternativeRouteId: 'RT-001',
            baselineGhgIntensity: 70.0,
            alternativeGhgIntensity: 91.2,
            deltaGhgIntensity: 21.2,
            baselineCb: 5000,
            alternativeCb: -3000,
            deltaCb: -8000,
            percentageSavings: -30.29,
        }),
        computeComplianceBalance: vi.fn().mockResolvedValue([]),
        getAdjustedComplianceBalance: vi.fn().mockResolvedValue([]),
        bankDeposit: vi.fn().mockResolvedValue({ id: 'B1', shipId: 'S1', amountGco2eq: 100, year: 2024 }),
        bankApply: vi.fn().mockResolvedValue(undefined),
        getPools: vi.fn().mockResolvedValue([]),
        createPool: vi.fn().mockResolvedValue({ poolId: 'P1', year: 2024, members: [], netCb: 0 }),
        ...overrides,
    };
}

describe('RoutesTab', () => {
    let mockApi: ApiClientPort;

    beforeEach(() => {
        mockApi = makeMockApi();
    });

    it('renders loading then route data', async () => {
        render(
            <ApiProvider client={mockApi}>
                <RoutesTab />
            </ApiProvider>,
        );
        // The component renders vesselType, not vessel names
        expect(await screen.findByText('RT-001')).toBeInTheDocument();
        expect(screen.getByText('RT-002')).toBeInTheDocument();
    });

    it('shows baseline badge on baseline route', async () => {
        render(
            <ApiProvider client={mockApi}>
                <RoutesTab />
            </ApiProvider>,
        );
        expect(await screen.findByText('Baseline')).toBeInTheDocument();
    });

    it('calls setBaseline when button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <ApiProvider client={mockApi}>
                <RoutesTab />
            </ApiProvider>,
        );
        const btn = await screen.findByText('Set Baseline');
        await user.click(btn);
        expect(mockApi.setBaseline).toHaveBeenCalledWith('RT-001');
    });

    it('shows route count', async () => {
        render(
            <ApiProvider client={mockApi}>
                <RoutesTab />
            </ApiProvider>,
        );
        expect(await screen.findByText('2 routes')).toBeInTheDocument();
    });

    it('handles API error gracefully', async () => {
        const failApi = makeMockApi({
            getRoutes: vi.fn().mockRejectedValue(new Error('fail')),
        });
        render(
            <ApiProvider client={failApi}>
                <RoutesTab />
            </ApiProvider>,
        );
        expect(await screen.findByText(/Failed to load routes/i)).toBeInTheDocument();
    });
});
