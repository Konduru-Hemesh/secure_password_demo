import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'wouter';

/**
 * Shape of the AutoLock context state and methods.
 */
interface AutoLockContextType {
    /** Lock the vault immediately (clear session key) */
    lockVault: () => void;
    /** Immediate lock with full memory cleanup (clear localStorage) */
    panicLock: () => void;
    /** Current auto-lock duration in minutes */
    autoLockMinutes: number;
    /** Update the auto-lock duration */
    setAutoLockMinutes: (minutes: number) => void;
}

const AutoLockContext = createContext<AutoLockContextType | undefined>(undefined);

/**
 * Provides auto-lock functionality based on user inactivity.
 * Monitors interaction events and handles vault locking and session clearing.
 * 
 * @param props - React children.
 */
export function AutoLockProvider({ children }: { children: ReactNode }) {
    const [, setLocation] = useLocation();
    const [autoLockMinutes, setAutoLockMinutes] = useState(15);
    const [lastActivity, setLastActivity] = useState(Date.now());

    // Track user activity
    useEffect(() => {
        const handleActivity = () => {
            setLastActivity(Date.now());
        };

        // Listen to user activity events
        window.addEventListener('mousedown', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('touchstart', handleActivity);
        window.addEventListener('scroll', handleActivity);

        return () => {
            window.removeEventListener('mousedown', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('touchstart', handleActivity);
            window.removeEventListener('scroll', handleActivity);
        };
    }, []);

    // Check inactivity periodically
    useEffect(() => {
        const checkInactivity = setInterval(() => {
            const inactiveTime = (Date.now() - lastActivity) / 1000 / 60; // minutes

            if (inactiveTime >= autoLockMinutes) {
                lockVault();
            }
        }, 10000); // Check every 10 seconds

        return () => clearInterval(checkInactivity);
    }, [lastActivity, autoLockMinutes]);

    const lockVault = () => {
        // Clear sensitive data from memory
        localStorage.removeItem('vaultMasterPassword');

        // Redirect to unlock page
        setLocation('/unlock');
    };

    const panicLock = () => {
        // Immediate lock with memory cleanup
        localStorage.clear();
        sessionStorage.clear();

        // Clear clipboard
        navigator.clipboard.writeText('');

        // Redirect to landing
        setLocation('/');
    };

    return (
        <AutoLockContext.Provider value={{ lockVault, panicLock, autoLockMinutes, setAutoLockMinutes }}>
            {children}
        </AutoLockContext.Provider>
    );
}

/**
 * Hook to access auto-lock state and methods.
 * @throws Error if used outside of AutoLockProvider.
 */
export function useAutoLock() {
    const context = useContext(AutoLockContext);
    if (!context) {
        throw new Error('useAutoLock must be used within AutoLockProvider');
    }
    return context;
}
