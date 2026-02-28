import { useState, useEffect } from 'react';
import { X, ChevronDown, Tag, Briefcase, User, DollarSign, MessageSquare, Film, ShoppingCart, Globe, Mail, Lock, ShieldQuestion, Dices, Save, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PasswordGenerator from './PasswordGenerator';
import { EyeToggleIcon } from './ui/animated-state-icons';

/**
 * Represents a single password entry in the vault.
 */
interface VaultEntry {
    id?: number;
    website: string;
    username: string;
    password: string;
    securityQuestion?: string;
    securityAnswer?: string;
    isFavorite: boolean;
    category?: string;
    passwordHistory?: Array<{ password: string; changedAt: string }>;
}

interface EntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (entry: VaultEntry) => void;
    entry?: VaultEntry;
    mode: 'add' | 'edit';
}

import type { Variants } from 'framer-motion';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.04 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

/** Renders the Entry Modal. */
export default function EntryModal({ isOpen, onClose, onSave, entry, mode }: EntryModalProps) {
    const [formData, setFormData] = useState<VaultEntry>(
        entry || { website: '', username: '', password: '', securityQuestion: '', securityAnswer: '', isFavorite: false }
    );
    const [errors, setErrors] = useState<Partial<Record<keyof VaultEntry, string>>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

    // Reset when modal opens with new entry
    useEffect(() => {
        if (isOpen) {
            setFormData(entry || { website: '', username: '', password: '', securityQuestion: '', securityAnswer: '', isFavorite: false });
            setErrors({});
            setShowPassword(false);
            setIsCategoryOpen(false);
            setIsGeneratorOpen(false);
        }
    }, [isOpen, entry]);

    const categories = [
        { id: 'Work', label: 'Work', icon: <Briefcase className="w-4 h-4" />, color: 'text-blue-400' },
        { id: 'Personal', label: 'Personal', icon: <User className="w-4 h-4" />, color: 'text-purple-400' },
        { id: 'Finance', label: 'Finance', icon: <DollarSign className="w-4 h-4" />, color: 'text-emerald-400' },
        { id: 'Social', label: 'Social', icon: <MessageSquare className="w-4 h-4" />, color: 'text-pink-400' },
        { id: 'Entertainment', label: 'Entertainment', icon: <Film className="w-4 h-4" />, color: 'text-orange-400' },
        { id: 'Shopping', label: 'Shopping', icon: <ShoppingCart className="w-4 h-4" />, color: 'text-indigo-400' },
    ];

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof VaultEntry, string>> = {};

        if (!formData.website.trim()) {
            newErrors.website = 'Website/App name is required';
        }

        if (!formData.username.trim()) {
            newErrors.username = 'Username/Email is required';
        }

        if (!formData.password.trim()) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 4) {
            newErrors.password = 'Password must be at least 4 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validate()) {
            onSave(formData);
            handleClose();
        }
    };

    const handleClose = () => {
        onClose();
    };

    const handleChange = (field: keyof VaultEntry, value: string | boolean) => {
        setFormData((prev: VaultEntry) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-background/80 backdrop-blur-md z-50"
                    />

                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 font-body">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-card/90 backdrop-blur-3xl p-6 sm:p-8 rounded-[32px] w-full max-w-[480px] max-h-[90vh] overflow-y-auto shadow-2xl border border-border/60 flex flex-col relative custom-scrollbar"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10 pointer-events-none" />

                            <div className="flex items-center justify-between mb-8 z-10">
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight text-foreground">
                                        {mode === 'add' ? 'Add New Entry' : 'Edit Entry'}
                                    </h2>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {mode === 'add' ? 'Securely store a new credential.' : 'Update your existing credentials.'}
                                    </p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="p-2.5 bg-secondary/50 hover:bg-secondary rounded-2xl transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <motion.form
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                onSubmit={handleSubmit}
                                className="space-y-5 z-10"
                            >
                                <motion.div variants={itemVariants}>
                                    <label className="block text-sm font-semibold mb-2 text-foreground/80">
                                        Website / App Name <span className="text-destructive">*</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                                            <Globe className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.website}
                                            onChange={(e) => handleChange('website', e.target.value)}
                                            placeholder="e.g., Netflix, GitHub"
                                            className={`w-full pl-12 pr-4 py-3.5 bg-background border rounded-2xl focus:ring-2 focus:ring-primary/40 outline-none transition-all ${errors.website ? 'border-destructive' : 'border-border/60'}`}
                                        />
                                    </div>
                                    {errors.website && <p className="text-destructive text-xs mt-1.5 ml-1 font-medium">{errors.website}</p>}
                                </motion.div>

                                <motion.div variants={itemVariants} className="relative z-20">
                                    <label className="block text-sm font-semibold mb-2 text-foreground/80">
                                        Category <span className="text-muted-foreground font-medium text-xs ml-1">(Optional)</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                        className="w-full px-4 py-3.5 bg-background border border-border/60 rounded-2xl flex items-center justify-between hover:bg-secondary/50 transition-all outline-none focus:ring-2 focus:ring-primary/40 group"
                                    >
                                        <div className="flex items-center gap-3">
                                            {formData.category ? (
                                                <>
                                                    {categories.find(c => c.id === formData.category)?.icon}
                                                    <span className="font-medium">{formData.category}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Tag className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                                    <span className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">Select category</span>
                                                </>
                                            )}
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isCategoryOpen ? 'rotate-180 text-foreground' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {isCategoryOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 5, scale: 0.98 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute top-full left-0 right-0 mt-2 p-2 bg-card border border-border/60 rounded-2xl z-50 shadow-2xl max-h-60 overflow-y-auto custom-scrollbar"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleChange('category', '');
                                                        setIsCategoryOpen(false);
                                                    }}
                                                    className="w-full px-4 py-3 rounded-xl text-left text-sm hover:bg-secondary transition-all flex items-center gap-3 font-medium"
                                                >
                                                    <Tag className="w-4 h-4 text-muted-foreground" />
                                                    No category
                                                </button>
                                                <div className="h-px bg-border/50 my-1 mx-2" />
                                                {categories.map((cat) => (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        onClick={() => {
                                                            handleChange('category', cat.id);
                                                            setIsCategoryOpen(false);
                                                        }}
                                                        className="w-full px-4 py-3 rounded-xl text-left text-sm hover:bg-secondary transition-all flex items-center justify-between group/cat font-medium"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className={`${cat.color} group-hover/cat:scale-110 transition-transform`}>{cat.icon}</span>
                                                            <span className={formData.category === cat.id ? 'text-primary' : ''}>{cat.label}</span>
                                                        </div>
                                                        {formData.category === cat.id && (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                                                        )}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>

                                <motion.div variants={itemVariants} className="z-10 relative">
                                    <label className="block text-sm font-semibold mb-2 text-foreground/80">
                                        Username / Email <span className="text-destructive">*</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                                            <Mail className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => handleChange('username', e.target.value)}
                                            placeholder="user@example.com"
                                            className={`w-full pl-12 pr-4 py-3.5 bg-background border rounded-2xl focus:ring-2 focus:ring-primary/40 outline-none transition-all ${errors.username ? 'border-destructive' : 'border-border/60'}`}
                                        />
                                    </div>
                                    {errors.username && <p className="text-destructive text-xs mt-1.5 ml-1 font-medium">{errors.username}</p>}
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <label className="block text-sm font-semibold mb-2 text-foreground/80">
                                        Password <span className="text-destructive">*</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                                            <Lock className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={(e) => handleChange('password', e.target.value)}
                                            placeholder="••••••••••••"
                                            className={`w-full pl-12 pr-12 py-3.5 bg-background border rounded-2xl focus:ring-2 focus:ring-primary/40 outline-none transition-all ${errors.password ? 'border-destructive' : 'border-border/60'}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors group-focus-within:text-primary"
                                        >
                                            <EyeToggleIcon size={20} isHidden={!showPassword} className="transition-colors" />
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-destructive text-xs mt-1.5 ml-1 font-medium">{errors.password}</p>}

                                    <div className="mt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsGeneratorOpen(!isGeneratorOpen)}
                                            className="w-full flex items-center justify-between px-4 py-3 bg-secondary/30 hover:bg-secondary/60 rounded-xl transition-colors font-medium text-sm text-primary border border-primary/20 hover:border-primary/40"
                                        >
                                            <span className="flex items-center gap-2"><Dices className="w-4 h-4" /> Generate Strong Password</span>
                                            <ChevronDown className={`w-4 h-4 transition-transform ${isGeneratorOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        <AnimatePresence>
                                            {isGeneratorOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1, transition: { duration: 0.2 } }}
                                                    exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-5 mt-2 bg-secondary/20 rounded-2xl border border-white/5">
                                                        <PasswordGenerator onGenerate={(pwd) => handleChange('password', pwd)} />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants} className="grid grid-cols-1 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-foreground/80">
                                            Security Question <span className="text-muted-foreground font-medium text-xs ml-1">(Optional)</span>
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                                                <ShieldQuestion className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            </div>
                                            <input
                                                type="text"
                                                value={formData.securityQuestion || ''}
                                                onChange={(e) => handleChange('securityQuestion', e.target.value)}
                                                placeholder="e.g., Mother's maiden name?"
                                                className="w-full pl-12 pr-4 py-3.5 bg-background border border-border/60 rounded-2xl focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-foreground/80">
                                            Security Answer <span className="text-muted-foreground font-medium text-xs ml-1">(If question is set)</span>
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                                                <Lock className="w-4 h-4 opacity-50 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            </div>
                                            <input
                                                type="text"
                                                value={formData.securityAnswer || ''}
                                                onChange={(e) => handleChange('securityAnswer', e.target.value)}
                                                placeholder="Your secret answer"
                                                className="w-full pl-12 pr-4 py-3.5 bg-background border border-border/60 rounded-2xl focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div variants={itemVariants} className="pt-2">
                                    <label className="flex items-center gap-4 p-4 bg-secondary/30 hover:bg-secondary/50 rounded-2xl cursor-pointer transition-colors border border-border/60">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.isFavorite || false}
                                                onChange={(e) => handleChange('isFavorite', e.target.checked)}
                                                className="peer appearance-none w-6 h-6 border-2 border-muted-foreground rounded-lg checked:border-primary checked:bg-primary transition-colors cursor-pointer"
                                            />
                                            <X className="absolute inset-0 w-6 h-6 text-background pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity scale-0 peer-checked:scale-100 peer-checked:rotate-[360deg] duration-300" style={{ strokeWidth: 3 }} />
                                            <svg className="absolute inset-0 w-6 h-6 text-background pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity drop-shadow-sm delay-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm">Mark as favorite</div>
                                            <div className="text-xs text-muted-foreground font-medium mt-0.5">Keep this entry at the top of your vault</div>
                                        </div>
                                    </label>
                                </motion.div>

                                <motion.div variants={itemVariants} className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="flex-1 py-4 bg-secondary/50 hover:bg-secondary rounded-2xl font-bold transition-all text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 text-sm flex items-center justify-center gap-2"
                                    >
                                        {mode === 'add' ? <><Plus className="w-5 h-5" /> Add Entry</> : <><Save className="w-5 h-5" /> Save Changes</>}
                                    </button>
                                </motion.div>
                            </motion.form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
