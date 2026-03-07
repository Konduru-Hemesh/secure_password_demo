import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

// Automatically cleanup after each test to prevent state leakage
afterEach(() => {
    cleanup();
});

// Mock ResizeObserver which is not available in jsdom
beforeAll(() => {
    vi.stubGlobal('ResizeObserver', class ResizeObserver {
        observe() { }
        unobserve() { }
        disconnect() { }
    });

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(), // deprecated
            removeListener: vi.fn(), // deprecated
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });
});
