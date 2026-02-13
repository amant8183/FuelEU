import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BankingTab } from '../BankingTab';
import { ApiProvider } from '../../hooks/useApi';
import type { ApiClientPort } from '../../../../core/ports/ApiClientPort';

function makeMockApi(overrides: Partial<ApiClientPort> = {}): ApiClientPort {
    return {
        getRoutes: vi.fn().mockResolvedValue([]),
        setBaseline: vi.fn().mockResolvedValue(undefined),
        compareRoutes: vi.fn().mockResolvedValue({}),
        computeComplianceBalance: vi.fn().mockResolvedValue([]),
        getAdjustedComplianceBalance: vi.fn().mockResolvedValue([]),
        bankDeposit: vi.fn().mockResolvedValue({
            id: 'B1',
            shipId: 'SHIP-001',
            amountGco2eq: 5000,
            year: 2024,
        }),
        bankApply: vi.fn().mockResolvedValue(undefined),
        getPools: vi.fn().mockResolvedValue([]),
        createPool: vi.fn().mockResolvedValue({ poolId: 'P1', year: 2024, members: [], netCb: 0 }),
        ...overrides,
    };
}

describe('BankingTab', () => {
    let mockApi: ApiClientPort;

    beforeEach(() => {
        mockApi = makeMockApi();
    });

    it('renders deposit and apply forms', () => {
        render(
            <ApiProvider client={mockApi}>
                <BankingTab />
            </ApiProvider>,
        );
        expect(screen.getByText('Deposit Surplus')).toBeInTheDocument();
        expect(screen.getByText('Apply Banked')).toBeInTheDocument();
    });

    it('renders KPI cards with zero values initially', () => {
        render(
            <ApiProvider client={mockApi}>
                <BankingTab />
            </ApiProvider>,
        );
        expect(screen.getByText('Deposits')).toBeInTheDocument();
        expect(screen.getByText('Total Banked')).toBeInTheDocument();
        expect(screen.getByText('Applies')).toBeInTheDocument();
        expect(screen.getByText('Total Applied')).toBeInTheDocument();
    });

    it('deposits surplus successfully', async () => {
        const user = userEvent.setup();
        render(
            <ApiProvider client={mockApi}>
                <BankingTab />
            </ApiProvider>,
        );

        // Both forms have "e.g. SHIP-001" placeholder — use getAllByPlaceholderText and pick first (deposit form)
        const shipInputs = screen.getAllByPlaceholderText('e.g. SHIP-001');
        await user.type(shipInputs[0], 'SHIP-001');
        const amountInput = screen.getByPlaceholderText('e.g. 5000');
        await user.type(amountInput, '5000');
        await user.click(screen.getByRole('button', { name: /Deposit Surplus/i }));

        expect(await screen.findByText(/Deposited/i)).toBeInTheDocument();
        expect(mockApi.bankDeposit).toHaveBeenCalled();
    });

    it('handles deposit error', async () => {
        const user = userEvent.setup();
        const failApi = makeMockApi({
            bankDeposit: vi.fn().mockRejectedValue(new Error('fail')),
        });
        render(
            <ApiProvider client={failApi}>
                <BankingTab />
            </ApiProvider>,
        );

        const shipInputs = screen.getAllByPlaceholderText('e.g. SHIP-001');
        await user.type(shipInputs[0], 'BAD');
        const amountInput = screen.getByPlaceholderText('e.g. 5000');
        await user.type(amountInput, '100');
        await user.click(screen.getByRole('button', { name: /Deposit Surplus/i }));

        expect(await screen.findByText(/Deposit failed/i)).toBeInTheDocument();
    });
});
