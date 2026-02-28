import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, AlertTriangle, RefreshCw, Key, ChevronRight, CheckCircle2, Lock } from 'lucide-react';
import { calculatePasswordStrength, isCommonPassword } from '@/shared/utils/passwordStrength';
import type { VaultEntry } from '@/shared/models/vault.types';

interface HealthAuditModalProps {
    isOpen: boolean;
    onClose: () => void;
    entries: VaultEntry[];
    onEditEntry: (entry: VaultEntry) => void;
}

/** Renders the Health Audit Modal. */
export default function HealthAuditModal({ isOpen, onClose, entries, onEditEntry }: HealthAuditModalProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'weak' | 'reused' | 'compromised'>('all');

    const issues = useMemo(() => {
        const weak: VaultEntry[] = [];
        const compromised: VaultEntry[] = [];

        const passwordMap = new Map<string, VaultEntry[]>();

        entries.forEach(entry => {
            const strength = calculatePasswordStrength(entry.password);
            if (strength.score < 3) weak.push(entry);
            if (isCommonPassword(entry.password)) compromised.push(entry);

            const existing = passwordMap.get(entry.password) || [];
            existing.push(entry);
            passwordMap.set(entry.password, existing);
        });

        const reused: VaultEntry[] = [];
        passwordMap.forEach(items => {
            if (items.length > 1) {
                reused.push(...items);
            }
        });

        return { weak, compromised, reused };
    }, [entries]);

    const getFavicon = (url: string) => {
        try {
            let domain = url;
            if (!url.includes('.')) domain = `${url}.com`;
            domain = new URL(domain.startsWith('http') ? domain : `https://${domain}`).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        } catch {
            return null;
        }
    };

    const getDisplayList = () => {
        switch (activeTab) {
            case 'weak': return issues.weak;
            case 'reused': return issues.reused;
            case 'compromised': return issues.compromised;
            default:
                // Deduplicate for 'all' list
                const all = [...issues.compromised, ...issues.reused, ...issues.weak];
                return Array.from(new Set(all.map(a => a.id))).map(id => all.find(a => a.id === id)!);
        }
    };

    const displayList = getDisplayList();
    const totalIssues = (new Set([...issues.weak, ...issues.compromised, ...issues.reused].map(i => i.id))).size;
    const isPerfect = entries.length > 0 && totalIssues === 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60]"
                    />

                    {/* Slide-over Panel */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0.5 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-md bg-card border-l border-border/50 shadow-2xl z-[70] flex flex-col font-body"
                    >
                        {/* Header */}
                        <div className="p-6 pb-4 border-b border-border/50 flex items-center justify-between shrink-0 bg-card/50 backdrop-blur-md sticky top-0 z-10">
                            <div>
                                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5 text-primary" />
                                    Security Audit
                                </h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {totalIssues > 0 ? `${totalIssues} passwords need your attention` : 'Your vault is in great shape!'}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 bg-secondary/50 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6">

                            {entries.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                                    <Lock className="w-16 h-16 mb-4 text-muted-foreground" />
                                    <h3 className="font-bold text-lg">No Passwords</h3>
                                    <p className="text-sm">Add some passwords to audit their security.</p>
                                </div>
                            ) : isPerfect ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center">
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 bg-green-500 blur-3xl opacity-20 rounded-full" />
                                        <div className="w-24 h-24 bg-card border border-green-500/20 rounded-[28px] shadow-xl flex items-center justify-center relative z-10 transform scale-110">
                                            <CheckCircle2 className="w-10 h-10 text-green-500" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground tracking-tight mb-2">Excellent Health</h3>
                                    <p className="text-muted-foreground text-sm max-w-[250px]">
                                        All your passwords are strong, unique, and secure. Great job!
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Summary Cards */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            onClick={() => setActiveTab('compromised')}
                                            className={`p-3 rounded-2xl flex flex-col items-center text-center gap-2 transition-all border ${activeTab === 'compromised' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-card border-border/50 hover:bg-secondary/50'}`}
                                        >
                                            <AlertTriangle className={`w-5 h-5 ${activeTab === 'compromised' ? 'text-red-500' : 'text-red-400'}`} />
                                            <div className="text-2xl font-bold leading-none">{issues.compromised.length}</div>
                                            <div className="text-[10px] uppercase font-bold tracking-wider opacity-70">At Risk</div>
                                        </button>

                                        <button
                                            onClick={() => setActiveTab('weak')}
                                            className={`p-3 rounded-2xl flex flex-col items-center text-center gap-2 transition-all border ${activeTab === 'weak' ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' : 'bg-card border-border/50 hover:bg-secondary/50'}`}
                                        >
                                            <ShieldAlert className={`w-5 h-5 ${activeTab === 'weak' ? 'text-orange-500' : 'text-orange-400'}`} />
                                            <div className="text-2xl font-bold leading-none">{issues.weak.length}</div>
                                            <div className="text-[10px] uppercase font-bold tracking-wider opacity-70">Weak</div>
                                        </button>

                                        <button
                                            onClick={() => setActiveTab('reused')}
                                            className={`p-3 rounded-2xl flex flex-col items-center text-center gap-2 transition-all border ${activeTab === 'reused' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' : 'bg-card border-border/50 hover:bg-secondary/50'}`}
                                        >
                                            <RefreshCw className={`w-5 h-5 ${activeTab === 'reused' ? 'text-yellow-500' : 'text-yellow-400'}`} />
                                            <div className="text-2xl font-bold leading-none">{issues.reused.length}</div>
                                            <div className="text-[10px] uppercase font-bold tracking-wider opacity-70">Reused</div>
                                        </button>
                                    </div>

                                    {/* List Section */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4 mt-2">
                                            <h3 className="font-bold tracking-tight capitalize">
                                                {activeTab === 'all' ? 'All Issues' : `${activeTab} Passwords`}
                                            </h3>
                                            {activeTab !== 'all' && (
                                                <button onClick={() => setActiveTab('all')} className="text-xs font-semibold text-primary hover:underline">
                                                    View All
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            {displayList.length === 0 ? (
                                                <div className="p-4 text-center text-sm text-muted-foreground bg-secondary/20 rounded-2xl border border-border/50">
                                                    No issues in this category!
                                                </div>
                                            ) : (
                                                displayList.map((entry) => {
                                                    const isCompromised = isCommonPassword(entry.password);
                                                    const isWeak = calculatePasswordStrength(entry.password).score < 3;
                                                    const isReused = issues.reused.some(r => r.id === entry.id);

                                                    return (
                                                        <div key={entry.id} className="group relative flex items-center justify-between p-4 bg-card border border-border/50 hover:border-primary/30 rounded-2xl transition-all hover:shadow-lg hover:shadow-primary/5 cursor-pointer overflow-hidden" onClick={() => onEditEntry(entry)}>
                                                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none" />

                                                            <div className="flex items-center gap-3 min-w-0 z-10">
                                                                <div className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center shrink-0">
                                                                    {getFavicon(entry.website) ? (
                                                                        <img src={getFavicon(entry.website)!} alt="" className="w-5 h-5 object-contain" onError={(e) => { (e.target as any).style.display = 'none'; }} />
                                                                    ) : <Key className="w-4 h-4 text-muted-foreground" />}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="font-bold text-sm truncate">{entry.website}</div>
                                                                    <div className="flex gap-1.5 mt-1 overflow-x-auto no-scrollbar">
                                                                        {isCompromised && <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 rounded text-[9px] font-bold uppercase tracking-wider shrink-0">At Risk</span>}
                                                                        {isWeak && !isCompromised && <span className="px-1.5 py-0.5 bg-orange-500/10 text-orange-500 rounded text-[9px] font-bold uppercase tracking-wider shrink-0">Weak</span>}
                                                                        {isReused && <span className="px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 rounded text-[9px] font-bold uppercase tracking-wider shrink-0">Reused</span>}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="w-8 h-8 rounded-full bg-secondary text-foreground group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center shrink-0 transition-colors z-10 shadow-sm">
                                                                <ChevronRight className="w-4 h-4" />
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
