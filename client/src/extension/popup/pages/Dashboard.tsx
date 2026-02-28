import { useState, useEffect, useMemo } from 'react';
import { LayoutGrid, Plus, Trash2, Lock, Bell, Upload, Download, Tag, Briefcase, User, DollarSign, MessageSquare, Film, ShoppingCart, LineChart, Puzzle, ShieldCheck, Settings, AlertOctagon, LogOut, Shield, Edit } from 'lucide-react';
import { useLocation } from 'wouter';
import ProfileModal from '@/extension/components/ProfileModal';
import EntryModal from '@/extension/components/EntryModal';
import DeleteConfirm from '@/extension/components/DeleteConfirm';
import HealthAuditModal from '@/extension/components/HealthAuditModal';
import SuccessAnimation from '@/extension/components/SuccessAnimation';
import { useToast } from '@/extension/popup/contexts/ToastContext';
import { calculatePasswordStrength } from '@/shared/utils/passwordStrength';
import { useAutoLock } from '@/extension/popup/contexts/AutoLockContext';
import { AnimatedThemeToggle } from '@/extension/components/ui/animated-theme-toggle';
import { EyeToggleIcon, CopiedIcon } from '@/extension/components/ui/animated-state-icons';
import { AppleSpotlight } from '@/extension/components/ui/apple-spotlight';
import { DonutChart } from '@/extension/components/ui/donut-chart';
import { motion } from 'framer-motion';
import { useVault } from '@/extension/popup/contexts/VaultContext';
import { useAuth } from '@/extension/popup/contexts/AuthContext';
import { cryptoService } from '@/shared/sync/crypto.service';

/** Interface defining the structure for Vault Entry. */
export interface VaultEntry {
    id: number;
    website: string;
    username: string;
    password: string;
    securityQuestion?: string;
    securityAnswer?: string;
    isFavorite: boolean;
    category?: string;
    passwordHistory?: Array<{ password: string; changedAt: string }>;
}

const getCategoryColor = (cat = '') => {
    switch (cat.toLowerCase()) {
        case 'social': return { bg: 'bg-blue-500/10', text: 'text-blue-500' };
        case 'entertainment': return { bg: 'bg-green-500/10', text: 'text-green-500' };
        case 'retail': return { bg: 'bg-orange-500/10', text: 'text-orange-500' };
        case 'work': return { bg: 'bg-purple-500/10', text: 'text-purple-500' };
        case 'finance': return { bg: 'bg-yellow-500/10', text: 'text-yellow-500' };
        default: return { bg: 'bg-primary/10', text: 'text-primary' };
    }
};

const StrengthBar = ({ score }: { score: number }) => {
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-400', 'bg-green-500'];
    const color = colors[score] || 'bg-muted';
    return (
        <div className="flex gap-1.5 mt-1">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-1.5 w-6 rounded-full transition-all ${i <= score ? color : 'bg-foreground/10'}`} />
            ))}
        </div>
    );
};

const ActivityRing = ({ score }: { score: number }) => {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center p-6">
            <svg width="120" height="120" className="transform -rotate-90 filter drop-shadow-xl">
                <circle cx="60" cy="60" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                <circle
                    cx="60" cy="60" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent"
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                    className="text-primary transition-all duration-1000 ease-out" strokeLinecap="round"
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{score}</span>
                <span className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Score</span>
            </div>
        </div>
    );
};


/** Component or function for Dashboard. */
export default function Dashboard() {
    const [, setLocation] = useLocation();
    const { showToast } = useToast();
    const { panicLock } = useAutoLock();
    const { logout } = useAuth();
    const { entries: rawEntries, addEntry, updateEntry, deleteEntry, isSyncing, syncStatus } = useVault();
    const [search, setSearch] = useState('');
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [revealedId, setRevealedId] = useState<number | null>(null);
    const [decryptedPasswords, setDecryptedPasswords] = useState<Record<number, string>>({});

    // Decrypt passwords for display when entries change
    useEffect(() => {
        const decryptAll = async () => {
            const map: Record<number, string> = {};
            for (const e of rawEntries) {
                try {
                    map[e.id] = await cryptoService.decrypt(e.password);
                } catch {
                    map[e.id] = e.password; // fallback: show raw if not encrypted
                }
            }
            setDecryptedPasswords(map);
        };
        decryptAll();
    }, [rawEntries]);

    // Adapt raw vault entries (which have encrypted passwords) for display
    const entries: VaultEntry[] = rawEntries.map(e => ({
        ...e,
        password: decryptedPasswords[e.id] ?? '••••••••',
    })) as unknown as VaultEntry[];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isHealthAuditOpen, setIsHealthAuditOpen] = useState(false);
    const [userProfile, setUserProfile] = useState<{ avatarUrl?: string, firstName?: string }>({});

    useEffect(() => {
        const saved = localStorage.getItem('userProfileDetailed');
        if (saved) {
            setUserProfile(JSON.parse(saved));
        }
    }, [isProfileModalOpen]);

    const [editingEntry, setEditingEntry] = useState<VaultEntry | undefined>(undefined);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<VaultEntry | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const filteredEntries = entries.filter(e => {
        return e.website.toLowerCase().includes(search.toLowerCase()) || e.username.toLowerCase().includes(search.toLowerCase());
    });

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        entries.forEach(e => {
            const cat = e.category || 'Other';
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return counts;
    }, [entries]);

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Work': return Briefcase;
            case 'Personal': return User;
            case 'Finance': return DollarSign;
            case 'Social': return MessageSquare;
            case 'Entertainment': return Film;
            case 'Shopping': return ShoppingCart;
            default: return Tag;
        }
    };

    const statsCards = useMemo(() => {
        const sorted = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
        const top3 = sorted.slice(0, 3);
        const cards = [
            { icon: LayoutGrid, count: entries.length, label: 'Total', color: { bg: 'bg-red-500/10', text: 'text-red-500' } },
        ];
        top3.forEach(([name, count]) => {
            cards.push({ icon: getCategoryIcon(name), count, label: name, color: getCategoryColor(name) });
        });
        // Pad with placeholders if < 3 categories exist
        while (cards.length < 4) {
            cards.push({ icon: Tag, count: 0, label: 'Empty', color: { bg: 'bg-foreground/5', text: 'text-muted-foreground' } });
        }
        return cards;
    }, [entries.length, categoryCounts]);

    const avgScore = useMemo(() => {
        if (entries.length === 0) return 0;
        const total = entries.reduce((acc, e) => acc + calculatePasswordStrength(e.password).score, 0);
        return Math.round((total / (entries.length * 4)) * 100);
    }, [entries]);

    const healthData = useMemo(() => {
        const counts = { weak: 0, fair: 0, good: 0, strong: 0, vstrong: 0 };
        entries.forEach(e => {
            const s = calculatePasswordStrength(e.password).score;
            if (s === 0) counts.weak++;
            else if (s === 1) counts.fair++;
            else if (s === 2) counts.good++;
            else if (s === 3) counts.strong++;
            else counts.vstrong++;
        });

        return [
            { value: counts.weak, color: "#ef4444", label: "Weak" },
            { value: counts.fair, color: "#f97316", label: "Fair" },
            { value: counts.good, color: "#eab308", label: "Good" },
            { value: counts.strong, color: "#4ade80", label: "Strong" },
            { value: counts.vstrong, color: "#22c55e", label: "Very Strong" }
        ].filter(d => d.value > 0);
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

    const handleCopy = (id: number, password: string) => {
        navigator.clipboard.writeText(password);
        setCopiedId(id);
        showToast('Password copied!', 'success');
        setTimeout(() => { setCopiedId(null); }, 3000);
    };

    const handleSaveEntry = async (entryData: Omit<VaultEntry, 'id'> & { id?: number }) => {
        try {
            if (modalMode === 'edit' && entryData.id) {
                await updateEntry(entryData.id, entryData);
                showToast('Entry updated', 'success');
            } else {
                await addEntry({
                    website: entryData.website,
                    username: entryData.username,
                    password: entryData.password,
                    category: entryData.category,
                    isFavorite: entryData.isFavorite || false,
                    securityQuestion: entryData.securityQuestion,
                    securityAnswer: entryData.securityAnswer,
                });
                showToast('Entry added', 'success');
            }
        } catch (err) {
            showToast('Failed to save entry', 'error');
            console.error(err);
        }
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1500);
        setIsModalOpen(false);
    };

    return (
        <div className="min-h-screen bg-background flex font-body text-foreground pb-24 lg:pb-0">
            {/* LEFT SIDEBAR - Desktop Only */}
            <aside className="hidden lg:flex w-[260px] bg-card border-r border-border/50 flex-col pt-8 pb-6 shadow-xl z-20 sticky top-0 h-screen">
                <div className="px-8 mb-10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-primary" />
                        <span className="font-bold text-lg tracking-tight">ZeroVault</span>
                    </div>
                </div>

                <div className="px-6 mb-8">
                    <button onClick={() => { setModalMode('add'); setEditingEntry(undefined); setIsModalOpen(true); }} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20">
                        <Plus className="w-5 h-5" /> Add Password
                    </button>
                </div>

                <div className="flex-1 px-4 space-y-2">
                    <button onClick={() => setLocation('/dashboard')} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold bg-primary/10 text-primary transition-colors">
                        <Lock className="w-5 h-5" /> Vault
                    </button>
                    <button onClick={() => setLocation('/insights')} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors">
                        <LineChart className="w-5 h-5" /> Insights
                    </button>
                    <button onClick={() => setLocation('/extension')} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors">
                        <Puzzle className="w-5 h-5" /> Extension
                    </button>
                    <button onClick={() => setLocation('/transparency')} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors">
                        <ShieldCheck className="w-5 h-5" /> Transparency
                    </button>
                    <button onClick={() => setLocation('/settings')} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors">
                        <Settings className="w-5 h-5" /> Settings
                    </button>

                    <div className="pt-2">
                        <div className="w-full h-px bg-border/50 mb-2" />

                        {/* Interactive Dark/Light Theme Switcher from code snippet */}
                        <div className="w-full flex justify-center px-4 py-3.5 mb-2 rounded-2xl">
                            <AnimatedThemeToggle className="w-full" />
                        </div>

                        <button onClick={() => { showToast('Emergency lock activated!', 'warning'); panicLock(); }} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors">
                            <AlertOctagon className="w-5 h-5" /> Panic Lock
                        </button>
                        <button onClick={() => { showToast('Logging out...', 'info'); logout(); setLocation('/'); }} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors">
                            <LogOut className="w-5 h-5" /> Logout
                        </button>
                    </div>
                </div>

                <div className="px-6 mt-auto shrink-0 relative">
                    {/* Illustration replacement */}
                    <div className="bg-gradient-to-tr from-primary/10 to-primary/5 rounded-3xl p-6 border border-primary/20 text-center relative overflow-hidden">
                        <div className="w-24 h-24 bg-primary/20 blur-2xl absolute -top-8 -right-8 rounded-full" />
                        <Shield className="w-10 h-10 text-primary mx-auto mb-4 relative z-10" />
                        <h4 className="font-bold text-sm text-foreground mb-1 relative z-10">Upgrade Plan</h4>
                        <p className="text-xs text-muted-foreground mb-4 relative z-10 leading-relaxed">Get premium features, zero borders.</p>
                        <button className="bg-background border border-border/50 text-foreground px-4 py-2.5 rounded-xl text-xs font-bold w-full relative z-10 hover:bg-foreground/5 transition-colors">
                            Upgrade Now
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full relative">

                {/* Header Row */}
                <div className="flex items-center justify-between p-6 lg:p-10 pb-4 sticky top-0 bg-background/80 backdrop-blur-xl z-10">
                    <h1 className="text-2xl font-bold tracking-tight">Hi <span className="text-primary">User</span>,</h1>
                    <div className="flex items-center gap-6">
                        <div className="relative hidden md:block w-72 h-14 z-50">
                            <AppleSpotlight
                                searchValue={search}
                                onSearchChange={setSearch}
                                shortcuts={[
                                    { label: 'Import CSV', icon: <Upload />, onClick: () => showToast('Importing passwords...', 'info') },
                                    { label: 'Export Vault', icon: <Download />, onClick: () => showToast('Exporting vault...', 'info') }
                                ]}
                            />
                        </div>
                        <button className="relative text-muted-foreground hover:text-foreground transition-colors p-2">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-background"></span>
                        </button>
                        <button onClick={() => setIsProfileModalOpen(true)} className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm border border-primary/30 shrink-0 shadow-inner overflow-hidden">
                            {userProfile.avatarUrl ? (
                                <img src={userProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                userProfile.firstName?.[0] || 'U'
                            )}
                        </button>
                    </div>
                </div>

                <div className="px-6 lg:px-10 pb-10 flex flex-col gap-8 max-w-7xl">

                    {/* Top Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                        {statsCards.map((card, i) => (
                            <div key={i} className="bg-card border border-border/50 rounded-[28px] p-6 shadow-sm flex flex-col justify-between h-36 relative overflow-hidden group">
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${card.color.bg} ${card.color.text} mb-auto transition-transform group-hover:scale-110`}>
                                    <card.icon className="w-5 h-5" />
                                </div>
                                <div className="mt-4">
                                    <div className="text-3xl font-bold tracking-tight mb-0.5">{card.count}</div>
                                    <div className="text-sm font-medium text-muted-foreground capitalize tracking-wide">{card.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Lower Section Split */}
                    <div className="flex flex-col xl:flex-row gap-8">

                        {/* Left: Recently Added List */}
                        <div className="flex-1 w-full min-w-0">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg tracking-tight">Recently Added</h3>
                                <button onClick={() => { setModalMode('add'); setEditingEntry(undefined); setIsModalOpen(true); }} className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform shadow-md">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-2">
                                {filteredEntries.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="py-16 px-8 flex flex-col items-center justify-center text-center border border-dashed border-border/60 rounded-[32px] bg-card/30 relative overflow-hidden group"
                                    >
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                        <div className="relative mb-6">
                                            <div className="absolute inset-0 bg-primary blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 rounded-full" />
                                            <div className="w-24 h-24 bg-card border border-border/50 rounded-[28px] shadow-2xl flex items-center justify-center relative z-10 transform group-hover:-translate-y-2 transition-transform duration-500">
                                                <Shield className="w-10 h-10 text-primary opacity-80" />
                                                <Lock className="w-5 h-5 text-white absolute bottom-6 right-6" />
                                            </div>

                                            {/* decorative particles */}
                                            <div className="absolute top-0 right-[-10px] w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:-translate-y-4 group-hover:translate-x-4 transition-all duration-700 delay-100" />
                                            <div className="absolute bottom-2 left-[-10px] w-2.5 h-2.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 group-hover:translate-y-4 group-hover:-translate-x-4 transition-all duration-700 delay-200" />
                                            <div className="absolute top-1/2 right-[120%] w-1.5 h-1.5 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:-translate-x-6 transition-all duration-700" />
                                        </div>

                                        <h4 className="text-xl font-bold tracking-tight mb-2 text-foreground">Your Vault is Empty</h4>
                                        <p className="text-muted-foreground max-w-sm mb-8 text-sm leading-relaxed">
                                            Add your first password to securely store and easily manage your credentials. They'll be encrypted locally.
                                        </p>

                                        <button
                                            onClick={() => { setModalMode('add'); setEditingEntry(undefined); setIsModalOpen(true); }}
                                            className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center gap-2 text-sm"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add First Password
                                        </button>
                                    </motion.div>
                                ) : (
                                    filteredEntries.map(entry => {
                                        const strength = calculatePasswordStrength(entry.password);
                                        const catColor = getCategoryColor(entry.category);

                                        return (
                                            <div key={entry.id} className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 py-3 px-4 hover:bg-card/40 bg-transparent rounded-[24px] transition-all duration-300 border border-transparent hover:border-primary/20 group overflow-hidden">
                                                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500 pointer-events-none" />
                                                <div className="absolute top-[50%] left-[-10%] w-[40%] h-[150%] bg-primary/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -translate-y-1/2" />

                                                <div className="relative z-10 flex items-center gap-4 flex-1 min-w-0">
                                                    <div className="w-12 h-12 rounded-2xl bg-card border border-border/50 flex items-center justify-center flex-shrink-0 shadow-sm">
                                                        {getFavicon(entry.website) ? (
                                                            <img src={getFavicon(entry.website)!} alt="" className="w-6 h-6 object-contain" onError={(e) => { (e.target as any).style.display = 'none'; }} />
                                                        ) : <Lock className="w-6 h-6 text-muted-foreground" />}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-foreground text-base tracking-tight truncate">{entry.website}</div>
                                                        <div className="text-sm text-muted-foreground truncate">{entry.username}</div>
                                                    </div>
                                                </div>

                                                <div className="hidden md:flex items-center gap-8 lg:gap-12 pl-4 sm:pl-0 w-full sm:w-auto mt-2 sm:mt-0">
                                                    <div className={`px-3 py-1.5 rounded-lg text-xs font-bold leading-none ${catColor.bg} ${catColor.text} capitalize w-24 text-center truncate`}>
                                                        {entry.category || 'Other'}
                                                    </div>

                                                    <div className="w-32">
                                                        <div className={`text-[11px] uppercase font-bold tracking-widest leading-none ${strength.color}`}>
                                                            {strength.label}
                                                        </div>
                                                        <StrengthBar score={strength.score} />
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 mt-2 sm:mt-0 w-full justify-end sm:w-auto sm:opacity-0 sm:group-hover:opacity-100 transition-opacity pl-16 sm:pl-0">
                                                    <div className="flex bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
                                                        <button onClick={() => revealedId === entry.id ? setRevealedId(null) : setRevealedId(entry.id)} className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors border-r border-border/50">
                                                            <EyeToggleIcon isHidden={revealedId !== entry.id} size={16} />
                                                        </button>
                                                        <button onClick={() => handleCopy(entry.id, entry.password)} className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors border-r border-border/50">
                                                            <CopiedIcon isCopied={copiedId === entry.id} size={16} className={copiedId === entry.id ? "text-green-500" : ""} />
                                                        </button>
                                                        <button onClick={() => { setModalMode('edit'); setEditingEntry(entry); setIsModalOpen(true); }} className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors border-r border-border/50">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => { setEntryToDelete(entry); setDeleteConfirmOpen(true); }} className="p-2.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Right: Activity & Logins Sidebar */}
                        <div className="w-full xl:w-80 flex flex-col gap-6 shrink-0">

                            {/* Score Card */}
                            <div
                                onClick={() => setIsHealthAuditOpen(true)}
                                className="bg-[#1c1c21] dark:bg-[#0f0f13] hover:bg-[#25252b] dark:hover:bg-[#15151a] transition-all cursor-pointer border border-border/10 hover:border-border/30 rounded-[32px] overflow-hidden shadow-2xl relative group"
                            >
                                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500 pointer-events-none" />
                                {/* Decor Blob */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full pointer-events-none group-hover:bg-primary/30 transition-colors" />

                                <div className="p-6 pb-2 flex items-center justify-between relative z-10">
                                    <h3 className="font-bold text-white tracking-tight flex items-center gap-2 group-hover:text-primary transition-colors">Vault Health <span className="opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span></h3>
                                    <span className="text-xs font-medium text-white/50 bg-white/5 px-2 py-1 rounded-md">Audit</span>
                                </div>

                                {healthData.length > 0 ? (
                                    <div className="pb-6">
                                        <DonutChart
                                            data={healthData}
                                            size={170}
                                            strokeWidth={20}
                                            centerContent={
                                                <div className="flex flex-col items-center">
                                                    <div className="text-xl font-bold text-white leading-none">{avgScore}</div>
                                                    <div className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Score</div>
                                                </div>
                                            }
                                        />
                                    </div>
                                ) : (
                                    <ActivityRing score={avgScore} />
                                )}
                            </div>

                            {/* Recent Additions List */}
                            <div className="bg-card border border-border/50 rounded-[32px] p-6 shadow-sm flex-1">
                                <h3 className="font-bold tracking-tight mb-5">Recent Additions</h3>
                                <div className="space-y-4">
                                    {entries.length === 0 && <p className="text-sm text-muted-foreground">No recent activity.</p>}
                                    {entries.slice(-4).reverse().map((entry, i) => (
                                        <div key={i} className="flex gap-4 relative">
                                            {/* Timeline dot/line */}
                                            <div className="flex flex-col items-center">
                                                <div className="w-2.5 h-2.5 rounded-full border-2 border-primary bg-background shrink-0 mt-1.5 z-10" />
                                                {i !== entries.slice(-4).length - 1 && <div className="w-px h-full bg-border/50 absolute top-4 bottom-[-16px]" />}
                                            </div>

                                            <div className={`flex-1 rounded-2xl p-3 ${getCategoryColor(entry.category).bg.replace('/10', '/5')}`}>
                                                <div className="font-bold text-sm tracking-tight">{entry.website}</div>
                                                <div className="text-xs text-muted-foreground truncate">{entry.username}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {entries.length > 0 && (
                                    <button className="w-full text-center text-xs font-bold text-foreground mt-6 hover:text-primary transition-colors">
                                        See all
                                    </button>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

            </main>

            {/* Modals */}
            <EntryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveEntry} entry={editingEntry} mode={modalMode} />
            <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />

            <HealthAuditModal
                isOpen={isHealthAuditOpen}
                onClose={() => setIsHealthAuditOpen(false)}
                entries={entries}
                onEditEntry={(entry) => {
                    setIsHealthAuditOpen(false);
                    setModalMode('edit');
                    setEditingEntry(entry);
                    setIsModalOpen(true);
                }}
            />

            <DeleteConfirm isOpen={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} onConfirm={async () => { if (entryToDelete) { try { await deleteEntry(entryToDelete.id); showToast('Entry deleted', 'success'); } catch (e) { showToast('Failed to delete entry', 'error'); } setEntryToDelete(null); } }} entryName={entryToDelete?.website || ''} />
            <SuccessAnimation show={showSuccess} />
        </div>
    );
}
