import { useState, useEffect } from 'react';
import { Shield, Clock, Trash2 } from 'lucide-react';
import { useAutoLock } from '../contexts/AutoLockContext';
import { useToast } from '../contexts/ToastContext';

export default function Settings() {
    const { autoLockMinutes, setAutoLockMinutes } = useAutoLock();
    const { showToast } = useToast();

    // Load settings from localStorage
    const [clipboardClearDelay, setClipboardClearDelay] = useState(() => {
        const saved = localStorage.getItem('clipboardClearDelay');
        return saved ? parseInt(saved) : 30;
    });



    // Time until auto-lock (mock calculation)
    const [timeUntilLock, setTimeUntilLock] = useState(autoLockMinutes * 60);

    // Persist settings to localStorage
    useEffect(() => {
        localStorage.setItem('autoLockMinutes', autoLockMinutes.toString());
    }, [autoLockMinutes]);

    useEffect(() => {
        localStorage.setItem('clipboardClearDelay', clipboardClearDelay.toString());
    }, [clipboardClearDelay]);



    // Mock countdown for demo
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeUntilLock(prev => {
                if (prev <= 1) return autoLockMinutes * 60;
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [autoLockMinutes]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSettingsChange = (setting: string) => {
        showToast(`${setting} updated`, 'success');
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="border-b border-white/5 glass-panel">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                        <Shield className="w-8 h-8 text-primary" />
                        Security Settings
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Configure your vault's security and behavior preferences
                    </p>
                </div>
            </div>

            {/* Settings Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Auto-Lock Timer */}
                <div className="glass-panel p-6 rounded-2xl">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-primary" />
                            <div>
                                <h3 className="font-semibold">Auto-Lock Timer</h3>
                                <p className="text-sm text-muted-foreground">
                                    Lock vault after inactivity
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-mono font-bold text-primary">
                                {autoLockMinutes} min
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Locks in: {formatTime(timeUntilLock)}
                            </div>
                        </div>
                    </div>

                    <input
                        type="range"
                        min="5"
                        max="60"
                        value={autoLockMinutes}
                        onChange={(e) => setAutoLockMinutes(Number(e.target.value))}
                        onMouseUp={() => handleSettingsChange('Auto-lock timer')}
                        onTouchEnd={() => handleSettingsChange('Auto-lock timer')}
                        className="w-full cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>5 min</span>
                        <span>60 min</span>
                    </div>
                </div>

                {/* Clipboard Clear Delay */}
                <div className="glass-panel p-6 rounded-2xl">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Trash2 className="w-5 h-5 text-primary" />
                            <div>
                                <h3 className="font-semibold">Clipboard Auto-Clear</h3>
                                <p className="text-sm text-muted-foreground">
                                    Clear copied passwords after delay
                                </p>
                            </div>
                        </div>
                        <div className="text-2xl font-mono font-bold text-primary">
                            {clipboardClearDelay}s
                        </div>
                    </div>

                    <input
                        type="range"
                        min="10"
                        max="120"
                        step="10"
                        value={clipboardClearDelay}
                        onChange={(e) => setClipboardClearDelay(Number(e.target.value))}
                        onMouseUp={() => handleSettingsChange('Clipboard clear delay')}
                        onTouchEnd={() => handleSettingsChange('Clipboard clear delay')}
                        className="w-full cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>10s</span>
                        <span>120s</span>
                    </div>
                </div>





                {/* Keyboard Shortcuts Hint */}
                <div className="glass-panel p-6 rounded-2xl bg-primary/5 border border-primary/20">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <span className="text-primary">⌨️</span>
                        Keyboard Shortcuts
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center justify-between p-2 bg-black/20 rounded">
                            <span className="text-muted-foreground">Search vault</span>
                            <kbd className="px-2 py-1 bg-white/10 rounded font-mono text-xs">Ctrl+K</kbd>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-black/20 rounded">
                            <span className="text-muted-foreground">New entry</span>
                            <kbd className="px-2 py-1 bg-white/10 rounded font-mono text-xs">Ctrl+N</kbd>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-black/20 rounded">
                            <span className="text-muted-foreground">Lock vault</span>
                            <kbd className="px-2 py-1 bg-white/10 rounded font-mono text-xs">Ctrl+L</kbd>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-black/20 rounded">
                            <span className="text-muted-foreground">Settings</span>
                            <kbd className="px-2 py-1 bg-white/10 rounded font-mono text-xs">Ctrl+,</kbd>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
