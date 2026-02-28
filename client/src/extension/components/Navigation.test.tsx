import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Navigation from './Navigation';

// Mock dependencies
vi.mock('wouter', () => ({
    useLocation: () => ['/dashboard', vi.fn()],
}));

vi.mock('@/extension/popup/contexts/AutoLockContext', () => ({
    useAutoLock: () => ({ panicLock: vi.fn() }),
}));

vi.mock('@/extension/popup/contexts/ToastContext', () => ({
    useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock('@/extension/popup/contexts/ThemeContext', () => ({
    useTheme: () => ({ theme: 'dark', toggleTheme: vi.fn() }),
}));

describe('Navigation', () => {
    it('renders navigation items', () => {
        // Render with mocks
        render(<Navigation />);

        // Check if main elements exist
        expect(screen.getByRole('navigation')).toBeInTheDocument();

        // Check specific labels
        expect(screen.getByText('Vault')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
    });
});
