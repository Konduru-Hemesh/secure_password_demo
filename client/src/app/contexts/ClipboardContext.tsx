import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

/**
 * Shape of the Clipboard context state and methods.
 */
interface ClipboardContextType {
    /** Copy text to clipboard and schedule auto-clear */
    copyWithAutoClear: (text: string, clearAfterSeconds?: number) => void;
    /** The most recently copied text, if still valid */
    lastCopied: string | null;
    /** Seconds remaining until the clipboard is cleared */
    timeRemaining: number;
}

const ClipboardContext = createContext<ClipboardContextType | undefined>(undefined);

/**
 * Manages secure clipboard operations with automatic clearing.
 * Helps prevent sensitive data from lingering in the system clipboard.
 * 
 * @param props - React children.
 */
export function ClipboardProvider({ children }: { children: ReactNode }) {
    const [lastCopied, setLastCopied] = useState<string | null>(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [timerId, setTimerId] = useState<any>(null);

    const copyWithAutoClear = (text: string, clearAfterSeconds: number = 30) => {
        // Copy to clipboard
        navigator.clipboard.writeText(text);
        setLastCopied(text);
        setTimeRemaining(clearAfterSeconds);

        // Clear any existing timer
        if (timerId) {
            clearInterval(timerId);
        }

        // Start countdown
        const interval = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    // Clear clipboard
                    navigator.clipboard.writeText('');
                    setLastCopied(null);
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        setTimerId(interval);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerId) {
                clearInterval(timerId);
            }
        };
    }, [timerId]);

    return (
        <ClipboardContext.Provider value={{ copyWithAutoClear, lastCopied, timeRemaining }}>
            {children}
        </ClipboardContext.Provider>
    );
}

/**
 * Hook to access clipboard management state and methods.
 * @throws Error if used outside of ClipboardProvider.
 */
export function useClipboard() {
    const context = useContext(ClipboardContext);
    if (!context) {
        throw new Error('useClipboard must be used within ClipboardProvider');
    }
    return context;
}
