import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/extension/popup/contexts/AuthContext';
import { ToastProvider } from '@/extension/popup/contexts/ToastContext';
import { ReactNode } from 'react';

// Mock fetch using globalThis which works in both Node and browser environments
(globalThis as any).fetch = vi.fn();

const wrapper = ({ children }: { children: ReactNode }) => (
    <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
);

describe('AuthContext', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should initialize with specific default state', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        // Wait for initialization
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
        expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle successful login', async () => {
        const mockUser = { id: '123', email: 'test@example.com' };
        const mockToken = 'fake-jwt-token';

        (globalThis as any).fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ user: mockUser, token: mockToken }),
        });

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await act(async () => {
            await result.current.login('test@example.com', 'password');
        });

        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.token).toBe(mockToken);
        expect(localStorage.getItem('vault_token')).toBe(mockToken);
    });

    it('should handle login failure', async () => {
        (globalThis as any).fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'Invalid credentials' }),
        });

        const { result } = renderHook(() => useAuth(), { wrapper });
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        await expect(result.current.login('wrong', 'pass')).rejects.toThrow('Invalid credentials');
        expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle logout', async () => {
        // Setup logged in state
        localStorage.setItem('vault_token', 'token');
        localStorage.setItem('vault_user', JSON.stringify({ id: '1' }));

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

        act(() => {
            result.current.logout();
        });

        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
        expect(localStorage.getItem('vault_token')).toBeNull();
    });
});
