import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface ClipboardContextType {
    copyToClipboard: (text: string) => Promise<void>;
    clipboardState: {
        hasCopied: boolean;
        timeLeft: number;
        copiedId: number | null;
    };
}

export const ClipboardContext = createContext<ClipboardContextType | undefined>(undefined);

export function ClipboardProvider({ children }: { children: ReactNode }) {
    const [hasCopied, setHasCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (hasCopied && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setHasCopied(false);
            setCopiedId(null);
        }
        return () => clearInterval(interval);
    }, [hasCopied, timeLeft]);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setHasCopied(true);
            setTimeLeft(30);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    return (
        <ClipboardContext.Provider value={{
            copyToClipboard,
            clipboardState: { hasCopied, timeLeft, copiedId }
        }}>
            {children}
        </ClipboardContext.Provider>
    );
}

export function useClipboard() {
    const context = useContext(ClipboardContext);
    if (context === undefined) {
        throw new Error('useClipboard must be used within a ClipboardProvider');
    }
    return context;
}
