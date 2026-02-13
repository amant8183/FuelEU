/**
 * ApiProvider — React context for dependency injection.
 *
 * Provides the ApiClientPort instance to all child components.
 * This is the composition root for the frontend.
 */

import { createContext, useContext, type ReactNode } from 'react';
import type { ApiClientPort } from '../../../core/ports/ApiClientPort';
import { AxiosApiClient } from '../../infrastructure/AxiosApiClient';

const ApiContext = createContext<ApiClientPort | null>(null);

const defaultClient = new AxiosApiClient();

export function ApiProvider({
    client,
    children,
}: {
    client?: ApiClientPort;
    children: ReactNode;
}) {
    // Use passed client or fallback to default
    const apiClient = client || defaultClient;
    return <ApiContext.Provider value={apiClient}>{children}</ApiContext.Provider>;
}

export function useApi(): ApiClientPort {
    const ctx = useContext(ApiContext);
    if (!ctx) throw new Error('useApi must be used inside <ApiProvider>');
    return ctx;
}
