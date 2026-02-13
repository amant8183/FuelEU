import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppShell } from '../AppShell';

const TABS = [
    { key: 'routes', label: 'Routes', icon: 'R' },
    { key: 'compare', label: 'Compare', icon: 'C' },
    { key: 'banking', label: 'Banking', icon: 'B' },
    { key: 'pooling', label: 'Pooling', icon: 'P' },
];

describe('AppShell', () => {
    it('renders header with title', () => {
        render(
            <AppShell activeTab="routes" tabs={TABS} onTabChange={() => { }}>
                <div>Content</div>
            </AppShell>,
        );
        expect(screen.getByText('FuelEU Maritime')).toBeInTheDocument();
        expect(screen.getByText('Compliance Dashboard')).toBeInTheDocument();
    });

    it('renders all tabs', () => {
        render(
            <AppShell activeTab="routes" tabs={TABS} onTabChange={() => { }}>
                <div>Content</div>
            </AppShell>,
        );
        for (const tab of TABS) {
            expect(screen.getByText(tab.label)).toBeInTheDocument();
        }
    });

    it('marks active tab with aria-selected', () => {
        render(
            <AppShell activeTab="compare" tabs={TABS} onTabChange={() => { }}>
                <div>Content</div>
            </AppShell>,
        );
        const complianceTab = screen.getByRole('tab', { name: /Compare/i });
        expect(complianceTab).toHaveAttribute('aria-selected', 'true');

        const routesTab = screen.getByRole('tab', { name: /Routes/i });
        expect(routesTab).toHaveAttribute('aria-selected', 'false');
    });

    it('calls onTabChange when tab is clicked', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
            <AppShell activeTab="routes" tabs={TABS} onTabChange={onChange}>
                <div>Content</div>
            </AppShell>,
        );
        await user.click(screen.getByRole('tab', { name: /Banking/i }));
        expect(onChange).toHaveBeenCalledWith('banking');
    });

    it('renders children in main content area', () => {
        render(
            <AppShell activeTab="routes" tabs={TABS} onTabChange={() => { }}>
                <div data-testid="child">Hello</div>
            </AppShell>,
        );
        expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('has a skip-to-content link', () => {
        render(
            <AppShell activeTab="routes" tabs={TABS} onTabChange={() => { }}>
                <div>Content</div>
            </AppShell>,
        );
        expect(screen.getByText('Skip to main content')).toBeInTheDocument();
    });

    it('renders footer', () => {
        render(
            <AppShell activeTab="routes" tabs={TABS} onTabChange={() => { }}>
                <div>Content</div>
            </AppShell>,
        );
        expect(screen.getByText(/EU Regulation 2025\/1221/i)).toBeInTheDocument();
    });
});
