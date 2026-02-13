import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { CompareTab } from '../CompareTab';
import { ApiProvider } from '../../hooks/useApi';
import type { Route, Comparison } from '../../../../core/domain/types';
import React from 'react';
import type { ApiClientPort } from '../../../../core/ports/ApiClientPort';

// Mock Recharts since it doesn't render well in JSDOM
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
    Bar: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
    ReferenceLine: () => null,
    Cell: () => null,
}));

// Mock AxiosApiClient to avoid side effects during module import
vi.mock('../../../infrastructure/AxiosApiClient', () => ({
    AxiosApiClient: vi.fn(),
}));

afterEach(() => {
    cleanup();
});

// Mock Data
const mockRoutes: Route[] = [
    {
        id: '1', routeId: 'R001', vesselType: 'Container', fuelType: 'HFO',
        year: 2024, ghgIntensity: 91.0, fuelConsumption: 1000, distance: 100,
        totalEmissions: 10, isBaseline: true
    },
    {
        id: '2', routeId: 'R002', vesselType: 'Tanker', fuelType: 'LNG',
        year: 2024, ghgIntensity: 88.0, fuelConsumption: 900, distance: 100,
        totalEmissions: 9, isBaseline: false
    }
];

const mockComparison: Comparison = {
    baselineRouteId: 'R001',
    alternativeRouteId: 'R002',
    baselineGhgIntensity: 91.0,
    alternativeGhgIntensity: 88.0,
    deltaGhgIntensity: 3.0,
    baselineCb: 100,
    alternativeCb: 120,
    deltaCb: 20,
    percentageSavings: 3.29,
    percentDiff: -3.29,
    compliant: true
};

// Create a mock API client
const createMockApi = (): ApiClientPort => ({
    getRoutes: vi.fn(),
    compareRoutes: vi.fn(),
    computeComplianceBalance: vi.fn(),
    getAdjustedComplianceBalance: vi.fn(),
    bankDeposit: vi.fn(),
    bankApply: vi.fn(),
    createPool: vi.fn(),
    getPools: vi.fn(),
    setBaseline: vi.fn(),
});

describe('CompareTab', () => {
    it('renders empty state when no baseline is found', async () => {
        const mockApi = createMockApi();
        (mockApi.getRoutes as any).mockResolvedValue([]);

        render(
            <ApiProvider client={mockApi}>
                <CompareTab />
            </ApiProvider>
        );

        // Use findBy for async appearance
        expect(await screen.findByText('No Baseline Set')).toBeInTheDocument();
    });

    it('renders comparison table and chart when baseline exists', async () => {
        const mockApi = createMockApi();
        (mockApi.getRoutes as any).mockResolvedValue(mockRoutes);
        (mockApi.compareRoutes as any).mockResolvedValue(mockComparison);

        render(
            <ApiProvider client={mockApi}>
                <CompareTab />
            </ApiProvider>
        );

        // Use findBy for async appearance
        expect(await screen.findByRole('heading', { name: /Compliance Comparison/i })).toBeInTheDocument();
        expect(screen.getByText((content, element) => {
            return element?.tagName.toLowerCase() === 'span' && content.includes('Target:') && element.textContent?.includes('89.34') || false;
        })).toBeInTheDocument();

        // Check for table content
        expect(screen.getByText('R002')).toBeInTheDocument();
        expect(screen.getByText('88.00')).toBeInTheDocument(); // GHG
        expect(screen.getByText('-3.29%')).toBeInTheDocument(); // Percent Diff

        // Check for chart
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

        // Check for compliant badge
        expect(screen.getByText('Compliant')).toBeInTheDocument();
    });
});
