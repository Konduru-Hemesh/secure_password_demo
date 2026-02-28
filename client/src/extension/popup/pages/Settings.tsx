import { useState, useEffect } from 'react';
import { Shield, Clock, Trash2, User, RefreshCw, Smartphone, Monitor, Globe, Command, AlertTriangle, KeyRound } from 'lucide-react';
import { useAutoLock } from '@/extension/popup/contexts/AutoLockContext';
import { useToast } from '@/extension/popup/contexts/ToastContext';
import ProfileModal from '@/extension/components/ProfileModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';

/**
 * The Settings Command Center.
 * Handles auto-lock, syncing, and dangerous actions.
 */
export default function Settings() {
    const { autoLockMinutes, setAutoLockMinutes } = useAutoLock();
    const { showToast } = useToast();
    const [, setLocation] = useLocation();

    const [clipboardClearDelay, setClipboardClearDelay] = useState(() => {
        const saved = localStorage.getItem('clipboardClearDelay');
        return saved ? parseInt(saved) : 30;
    });

    const [showProfileModal, setShowProfileModal] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<string | null>(localStorage.getItem('lastSyncTime') || 'Never');
    const [timeUntilLock, setTimeUntilLock] = useState(autoLockMinutes * 60);

    // Danger Zone state
    const [showDangerModal, setShowDangerModal] = useState(false);
    const [dangerPassword, setDangerPassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        localStorage.setItem('autoLockMinutes', autoLockMinutes.toString());
    }, [autoLockMinutes]);

    useEffect(() => {
        localStorage.setItem('clipboardClearDelay', clipboardClearDelay.toString());
    }, [clipboardClearDelay]);

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

    const handleSync = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            const time = new Date().toLocaleTimeString();
            setLastSyncTime(time);
            localStorage.setItem('lastSyncTime', time);
            showToast('Vault synchronized securely', 'success');
        }, 1500);
    };

    const handleDeleteVault = () => {
        if (dangerPassword.length < 4) {
            showToast('Invalid master password', 'error');
            return;
        }
        setIsDeleting(true);
        setTimeout(() => {
            setIsDeleting(false);
            setShowDangerModal(false);
            setDangerPassword('');
            // Clear mock storage
            localStorage.removeItem('userProfileDetailed');
            localStorage.removeItem('lastSyncTime');
            showToast('Vault data purged successfully', 'success');
            setTimeout(() => setLocation('/register'), 500); // Redirect to sign up
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-background font-body pb-24 text-foreground selection:bg-primary/30">
            {/* Command Center Header */}
            <div className="relative overflow-hidden border-b border-white/5 bg-card/50 backdrop-blur-3xl pt-12 pb-8">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

                <div className="max-w-4xl mx-auto px-6 relative z-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold flex items-center gap-3 tracking-tight mb-2">
                            <Shield className="w-8 h-8 text-primary" />
                            Command Center
                        </h1>
                        <p className="text-muted-foreground">Configure security protocols and system behavior</p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-full border border-border/50 shadow-inner">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium text-foreground/80">System Secured</span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Security Controls */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Auto-Lock Control */}
                    <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-primary/20 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-secondary rounded-2xl group-hover:bg-primary/10 transition-colors">
                                    <Clock className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">Auto-Lock Timer</h3>
                                    <p className="text-sm text-muted-foreground">Vault locks after inactivity</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-mono font-bold tracking-tight text-foreground">
                                    {autoLockMinutes} <span className="text-sm text-muted-foreground">min</span>
                                </div>
                                <div className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md inline-block mt-1">
                                    Locks in {formatTime(timeUntilLock)}
                                </div>
                            </div>
                        </div>

                        <input
                            type="range" min="1" max="60" value={autoLockMinutes}
                            onChange={(e) => setAutoLockMinutes(Number(e.target.value))}
                            onMouseUp={() => handleSettingsChange('Auto-lock timer')}
                            onTouchEnd={() => handleSettingsChange('Auto-lock timer')}
                            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-3 font-medium">
                            <span>1 min</span>
                            <span>30 min</span>
                            <span>60 min</span>
                        </div>
                    </div>

                    {/* Clipboard Control */}
                    <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-primary/20 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-secondary rounded-2xl group-hover:bg-primary/10 transition-colors">
                                    <Trash2 className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">Clipboard Auto-Clear</h3>
                                    <p className="text-sm text-muted-foreground">Clear copied secrets from memory</p>
                                </div>
                            </div>
                            <div className="text-2xl font-mono font-bold tracking-tight text-foreground">
                                {clipboardClearDelay} <span className="text-sm text-muted-foreground">sec</span>
                            </div>
                        </div>

                        <input
                            type="range" min="10" max="120" step="10" value={clipboardClearDelay}
                            onChange={(e) => setClipboardClearDelay(Number(e.target.value))}
                            onMouseUp={() => handleSettingsChange('Clipboard clear delay')}
                            onTouchEnd={() => handleSettingsChange('Clipboard clear delay')}
                            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-3 font-medium">
                            <span>10s</span>
                            <span>60s</span>
                            <span>120s</span>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-destructive/5 border border-destructive/20 rounded-3xl p-6 relative overflow-hidden mt-12 group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />

                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-destructive/10 rounded-2xl text-destructive mt-1">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-destructive">Danger Zone</h3>
                                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                                    These actions are permanent and cannot be undone. Proceed with extreme caution.
                                </p>
                            </div>
                        </div>

                        <div className="bg-background/50 border border-destructive/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h4 className="font-bold text-foreground">Purge All Vault Data</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">Permanently delete all passwords and settings.</p>
                            </div>
                            <button
                                onClick={() => setShowDangerModal(true)}
                                className="px-4 py-2 bg-destructive/10 hover:bg-destructive text-destructive hover:text-white font-bold text-sm rounded-xl transition-colors whitespace-nowrap"
                            >
                                Delete Vault
                            </button>
                        </div>
                    </div>

                </div>

                {/* Right Column: Meta Controls */}
                <div className="space-y-6">

                    {/* Sync Panel */}
                    <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                            <Globe className="w-24 h-24" />
                        </div>

                        <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
                            <RefreshCw className={`w-5 h-5 text-blue-500 ${isSyncing ? 'animate-spin' : ''}`} />
                            Device Sync
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6">Last: {lastSyncTime}</p>

                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className="w-full py-3 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSyncing ? 'Synchronizing Network...' : 'Force Sync Now'}
                        </button>

                        <div className="mt-6 space-y-3">
                            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <Monitor className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-medium">This PC</span>
                                </div>
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl border border-white/5 opacity-60">
                                <div className="flex items-center gap-3">
                                    <Smartphone className="w-4 h-4" />
                                    <span className="text-sm">iPhone 15 Pro</span>
                                </div>
                                <span className="text-xs text-muted-foreground">2h ago</span>
                            </div>
                        </div>
                    </div>

                    {/* Identity Panel */}
                    <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-xl">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                            <User className="w-5 h-5 text-primary" />
                            Identity
                        </h3>
                        <div className="flex items-center gap-4 mb-6">
                            <img src="https://images.unsplash.com/photo-1531123897727-8f129e1bf8ce?q=80&w=256&auto=format&fit=crop" alt="" className="w-12 h-12 rounded-full object-cover border-2 border-primary/20" />
                            <div>
                                <div className="font-bold text-sm">developer@zerovault.me</div>
                                <div className="text-xs text-primary font-medium mt-0.5">Premium Plan Active</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowProfileModal(true)}
                            className="w-full py-2.5 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 font-bold text-sm transition-colors"
                        >
                            Manage Profile
                        </button>
                    </div>

                    {/* Shortcuts Reference */}
                    <div className="bg-secondary/30 rounded-3xl p-6 border border-border/50">
                        <h3 className="font-bold text-sm flex items-center gap-2 mb-4">
                            <Command className="w-4 h-4" />
                            Pro Shortcuts
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Universal Search</span>
                                <kbd className="px-2 py-1 bg-background border border-border/50 rounded text-foreground font-mono">⌘K</kbd>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Insta-Lock</span>
                                <kbd className="px-2 py-1 bg-background border border-border/50 rounded text-foreground font-mono">⌘L</kbd>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">New Record</span>
                                <kbd className="px-2 py-1 bg-background border border-border/50 rounded text-foreground font-mono">⌘N</kbd>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Profile Modal */}
            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
            />

            {/* Danger Zone Modal */}
            <AnimatePresence>
                {showDangerModal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDangerModal(false)} className="fixed inset-0 bg-background/90 backdrop-blur-md z-[100]" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-destructive/30 rounded-3xl shadow-2xl z-[110] overflow-hidden">
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-destructive/20 relative">
                                    <div className="absolute inset-0 border-2 border-destructive rounded-full animate-ping opacity-20" />
                                    <AlertTriangle className="w-8 h-8 text-destructive" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">Purge Vault?</h2>
                                <p className="text-muted-foreground text-sm mb-6">This action will permanently delete all encrypted data stored on this device. You will need your recovery key to restore access elsewhere.</p>

                                <div className="text-left mb-6">
                                    <label className="block text-xs font-bold text-foreground mb-2">MASTER PASSWORD REQUIRED</label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-3 w-5 h-5 text-muted-foreground/50" />
                                        <input
                                            type="password"
                                            value={dangerPassword}
                                            onChange={(e) => setDangerPassword(e.target.value)}
                                            placeholder="Enter master password to confirm"
                                            className="w-full bg-background border border-border/50 focus:border-destructive focus:ring-1 focus:ring-destructive rounded-xl py-3 pl-10 pr-4 outline-none transition-all placeholder:text-muted-foreground/50 text-foreground"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => setShowDangerModal(false)} className="flex-1 py-3 bg-secondary hover:bg-secondary/80 text-foreground font-bold rounded-xl transition-colors">
                                        Cancel
                                    </button>
                                    <button onClick={handleDeleteVault} disabled={isDeleting} className="flex-1 py-3 bg-destructive hover:bg-destructive/90 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-destructive/20">
                                        {isDeleting ? 'Purging...' : 'Delete Forever'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
