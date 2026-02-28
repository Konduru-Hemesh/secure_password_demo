import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Mail, ShieldCheck, ChevronDown, Check, Archive } from 'lucide-react';
import { useToast } from '@/extension/popup/contexts/ToastContext';

interface ProfileData {
    firstName: string;
    lastName: string;
    email: string;
    country: string;
    username: string;
    avatarUrl: string;
    bannerUrl: string;
    isPremium: boolean;
    isEmailVerified: boolean;
    memberSince: string;
    lastLogin: string;
    totalLogins: number;
    vaultHealth: number;
}

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/** Renders the Profile Modal. */
export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const [profile, setProfile] = useState<ProfileData>({
        firstName: 'Vault',
        lastName: 'User',
        email: 'user@zerovault.me',
        country: 'United States',
        username: 'vaultuser',
        avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1bf8ce?q=80&w=256&auto=format&fit=crop',
        bannerUrl: 'https://images.unsplash.com/photo-1543373014-cfe4f4bc1cdf?q=80&w=1000&auto=format&fit=crop',
        isPremium: true,
        isEmailVerified: true,
        memberSince: '1 Mar, 2025',
        lastLogin: 'Today at 9:41 AM',
        totalLogins: 118,
        vaultHealth: 92
    });

    useEffect(() => {
        const saved = localStorage.getItem('userProfileDetailed');
        if (saved) {
            setProfile(JSON.parse(saved));
        }
    }, [isOpen]);

    const handleSave = () => {
        localStorage.setItem('userProfileDetailed', JSON.stringify(profile));
        showToast('Profile updated', 'success');
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatarUrl' | 'bannerUrl') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile(prev => ({ ...prev, [field]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 font-body">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-[#0f0f12] text-white border border-[#27272a] rounded-[24px] shadow-2xl overflow-hidden custom-scrollbar max-h-[90vh] overflow-y-auto"
                    >
                        {/* Banner Area */}
                        <div className="relative h-[200px] w-full bg-muted group overflow-hidden">
                            {profile.bannerUrl ? (
                                <img src={profile.bannerUrl} alt="Banner" className="w-full h-full object-cover opacity-90 transition-opacity hover:opacity-100" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f12] to-transparent opacity-60" />

                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors backdrop-blur-sm"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <button onClick={() => bannerInputRef.current?.click()} className="absolute top-4 left-4 px-3 py-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-lg text-xs font-semibold text-white/90 transition-all opacity-0 group-hover:opacity-100">
                                Change Cover
                            </button>
                            <input type="file" ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'bannerUrl')} accept="image/*" className="hidden" />
                        </div>

                        <div className="px-8 pb-8">
                            <div className="flex justify-between items-end -mt-16 mb-6">
                                {/* Avatar */}
                                <div className="relative group cursor-pointer z-10" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-32 h-32 rounded-full border-[6px] border-[#0f0f12] bg-[#27272a] overflow-hidden relative">
                                        {profile.avatarUrl ? (
                                            <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-xs font-semibold drop-shadow-md">Change</span>
                                        </div>
                                    </div>
                                    {/* Verified Badge */}
                                    <div className="absolute bottom-2 right-2 bg-[#0f0f12] rounded-full text-blue-500 border-[3px] border-[#0f0f12] z-20">
                                        <CheckCircle2 className="w-6 h-6 fill-blue-500 text-white" />
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e, 'avatarUrl')} accept="image/*" className="hidden" />
                                </div>

                                {/* Top Right Status Buttons */}
                                <div className="flex gap-3 mb-2">
                                    <button className="flex items-center gap-2 px-4 py-2 border border-[#3f3f46] hover:bg-[#27272a] rounded-xl text-sm font-semibold transition-colors">
                                        <ShieldCheck className="w-4 h-4 text-primary" />
                                        Security Check
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 border border-[#3f3f46] hover:bg-[#27272a] rounded-xl text-sm font-semibold transition-colors">
                                        <Archive className="w-4 h-4 text-muted-foreground" />
                                        Export Vault
                                    </button>
                                </div>
                            </div>

                            {/* Info & Badges */}
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-3xl font-bold tracking-tight">{profile.firstName} {profile.lastName}</h2>
                                {profile.isPremium && (
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/20 rounded-md text-xs font-bold text-primary">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        Premium Plan
                                    </span>
                                )}
                            </div>
                            <p className="text-[#a1a1aa] mb-8">{profile.email}</p>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-4 gap-4 pb-8 mb-8 border-b border-[#27272a]">
                                <div>
                                    <div className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider mb-1.5">Member Since</div>
                                    <div className="font-medium">{profile.memberSince}</div>
                                </div>
                                <div>
                                    <div className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider mb-1.5">Last Login</div>
                                    <div className="font-medium">{profile.lastLogin}</div>
                                </div>
                                <div>
                                    <div className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider mb-1.5">Total Logins</div>
                                    <div className="font-medium">{profile.totalLogins}</div>
                                </div>
                                <div>
                                    <div className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider mb-1.5">Vault Health</div>
                                    <div className="font-medium text-primary">{profile.vaultHealth}%</div>
                                </div>
                            </div>

                            {/* Forms */}
                            <div className="space-y-6">
                                {/* Name */}
                                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                    <label className="text-sm font-semibold text-white/90">Name</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            value={profile.firstName}
                                            onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                                            className="w-full px-4 py-2.5 bg-[#18181b] border border-[#3f3f46] rounded-xl focus:border-white focus:ring-1 focus:ring-white outline-none transition-all text-sm font-medium"
                                        />
                                        <input
                                            type="text"
                                            value={profile.lastName}
                                            onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                                            className="w-full px-4 py-2.5 bg-[#18181b] border border-[#3f3f46] rounded-xl focus:border-white focus:ring-1 focus:ring-white outline-none transition-all text-sm font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Email Address */}
                                <div className="grid grid-cols-[140px_1fr] gap-4">
                                    <label className="text-sm font-semibold text-white/90 pt-3">Email address</label>
                                    <div>
                                        <div className="relative flex items-center mb-2">
                                            <Mail className="absolute left-4 w-4 h-4 text-[#a1a1aa]" />
                                            <input
                                                type="email"
                                                value={profile.email}
                                                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                                                className="w-full pl-11 pr-4 py-2.5 bg-[#18181b] border border-[#3f3f46] rounded-xl focus:border-white focus:ring-1 focus:ring-white outline-none transition-all text-sm font-medium"
                                            />
                                        </div>
                                        {profile.isEmailVerified && (
                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-400 uppercase tracking-widest pl-1">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                Verified 2 Jan, 2025
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Country */}
                                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                    <label className="text-sm font-semibold text-white/90">Country</label>
                                    <div className="relative flex items-center">
                                        <span className="absolute left-4 z-10 text-base">🇺🇸</span>
                                        <input
                                            type="text"
                                            value={profile.country}
                                            onChange={(e) => setProfile(prev => ({ ...prev, country: e.target.value }))}
                                            className="w-full pl-11 pr-11 py-2.5 bg-[#18181b] border border-[#3f3f46] rounded-xl focus:border-white focus:ring-1 focus:ring-white outline-none transition-all text-sm font-medium"
                                        />
                                        <ChevronDown className="absolute right-4 w-4 h-4 text-[#a1a1aa] pointer-events-none" />
                                    </div>
                                </div>

                                {/* Username */}
                                <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                                    <label className="text-sm font-semibold text-white/90">Username</label>
                                    <div className="flex bg-[#18181b] border border-[#3f3f46] rounded-xl overflow-hidden focus-within:border-white focus-within:ring-1 focus-within:ring-white transition-all">
                                        <div className="px-4 py-2.5 bg-[#18181b] text-[#a1a1aa] border-r border-[#3f3f46] text-sm select-none">
                                            @
                                        </div>
                                        <div className="relative flex-1 flex items-center">
                                            <input
                                                type="text"
                                                value={profile.username}
                                                onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                                                className="w-full pl-4 pr-10 py-2.5 flex-1 bg-transparent outline-none text-sm font-medium"
                                            />
                                            <div className="absolute right-3 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-[#27272a]">
                                <button
                                    onClick={onClose}
                                    className="px-5 py-2.5 border border-[#3f3f46] hover:bg-[#27272a] rounded-xl text-sm font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-5 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-xl text-sm font-bold transition-colors"
                                >
                                    Save changes
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
