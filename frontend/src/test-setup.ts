import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import React from 'react';

// Polyfill React for JSDOM
// @ts-ignore
global.React = React;

// Cleanup after each test
afterEach(() => {
    cleanup();
});

// Mock fetch globally for JSDOM
// @ts-ignore
global.fetch = vi.fn(() => Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    ok: true
}));

// Mock console.error to avoid noise from handled errors
const originalConsoleError = console.error;
// @ts-ignore
console.error = (...args) => {
    if (args[0]?.includes?.('Error: connect ECONNREFUSED')) return;
    originalConsoleError(...args);
};
