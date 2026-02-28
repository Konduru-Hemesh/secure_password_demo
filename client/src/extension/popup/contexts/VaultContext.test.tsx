import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { VaultProvider, useVault } from '@/extension/popup/contexts/VaultContext';
import { ToastProvider } from '@/extension/popup/contexts/ToastContext';
import type { ReactNode } from 'react';

const mockUser = { id: 'test-user' };
const mockLogin = vi.fn();
const mockRegister = vi.fn();
const mockLogout = vi.fn();

// Mock AuthContext
vi.mock('../contexts/AuthContext', async () => {
    const actual = await vi.importActual('../contexts/AuthContext');
    return {
        ...actual,
        useAuth: () => ({
            user: mockUser,
            token: 'test-token',
            login: mockLogin,
            register: mockRegister,
            logout: mockLogout
        }),
        AuthProvider: ({ children }: { children: ReactNode }) => <div>{children}</div>
    };
});

// Mock crypto service to avoid web crypto issues in jsdom
vi.mock('../services/crypto.service', () => ({
    cryptoService: {
        encrypt: vi.fn((data) => Promise.resolve(`encrypted-${data}`)),
        decrypt: vi.fn((data) => Promise.resolve(data.replace('encrypted-', ''))),
    }
}));

// Mock fetch — handles GET /vault (initial load) and POST /vault/sync separately
(globalThis as any).fetch = vi.fn(async (url: string, options?: RequestInit) => {
    const isPost = options?.method === 'POST';

    // Initial GET vault fetch — return version 0 with empty entries
    if (!isPost) {
        return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({
                vaultVersion: 0,
                encryptedEntries: [],
                lastSyncedAt: null,
            }),
        });
    }

    // POST /vault/sync — parse baseVersion and return incremented version
    let responseVersion = 1;
    try {
        const body = JSON.parse(options?.body as string);
        responseVersion = (body.baseVersion ?? 0) + 1;
    } catch (e) {
        console.error('Mock fetch parse error', e);
    }

    return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
            success: true,
            vaultVersion: responseVersion,
            lastSyncedAt: new Date().toISOString(),
        }),
    });
});
// Assign to window.fetch so VaultContext's fetch() calls use this mock
(globalThis as any).fetch.__isMock = true;

// Test Component to consume context
const TestComponent = () => {
    const { addEntry, deleteEntry, entries, syncStatus, isOnline, vaultVersion } = useVault();

    return (
        <div>
            <div data-testid="sync-status">{syncStatus}</div>
            <div data-testid="vault-version">{vaultVersion}</div>
            <div data-testid="online-status">{isOnline ? 'Online' : 'Offline'}</div>
            <div data-testid="entries-count">{entries.length}</div>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <button onClick={() => addEntry({ title: 'Test', username: 'user', password: 'pw' } as any)}>
                Add Entry
            </button>
            {entries.length > 0 && (
                <button onClick={() => deleteEntry(entries[0].id)}>Delete First</button>
            )}
        </div>
    );
};

const renderWithProviders = (ui: ReactNode) => {
    return render(
        <ToastProvider>
            <VaultProvider>
                {ui}
            </VaultProvider>
        </ToastProvider>
    );
};

describe('VaultContext Integration', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should add an entry successfully', async () => {
        renderWithProviders(<TestComponent />);

        // Wait for initialization (initial GET returns version 0)
        await waitFor(() => {
            expect(screen.getByTestId('vault-version')).toHaveTextContent('0');
        }, { timeout: 5000 });

        const btn = screen.getByText('Add Entry');
        await act(async () => {
            btn.click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('entries-count')).toHaveTextContent('1');
        }, { timeout: 5000 });
    });

    it('should mark entry as deleted (tombstone)', async () => {
        renderWithProviders(<TestComponent />);

        // Wait for initialization (initial GET returns version 0)
        await waitFor(() => {
            expect(screen.getByTestId('vault-version')).toHaveTextContent('0');
        }, { timeout: 5000 });

        // Add
        const addBtn = screen.getByText('Add Entry');
        await act(async () => {
            addBtn.click();
        });
        await waitFor(() => expect(screen.getByTestId('entries-count')).toHaveTextContent('1'), { timeout: 5000 });

        // Delete
        const delBtn = screen.getByText('Delete First');
        await act(async () => {
            delBtn.click();
        });

        // Should return to 0 visible entries (context filters deleted)
        await waitFor(() => {
            expect(screen.getByTestId('entries-count')).toHaveTextContent('0');
        }, { timeout: 5000 });
    });

    it('should queue changes to outbox when offline', async () => {
        // Mock offline
        Object.defineProperty(window.navigator, 'onLine', { value: false, configurable: true });
        window.dispatchEvent(new Event('offline'));

        renderWithProviders(<TestComponent />);

        // Verify initial state
        expect(screen.getByTestId('online-status')).toHaveTextContent('Offline');

        // Add Entry
        const btn = screen.getByText('Add Entry');
        await act(async () => {
            btn.click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('entries-count')).toHaveTextContent('1');
        });

        // Check LocalStorage for outbox persistence
        await waitFor(() => {
            const outbox = JSON.parse(localStorage.getItem('vault_outbox_test-user') || '[]');
            expect(outbox).toHaveLength(1);
            expect(outbox[0].delta.updated).toHaveLength(1);
        });
    });
});
