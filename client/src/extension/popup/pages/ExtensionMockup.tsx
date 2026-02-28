import { useState, useEffect } from 'react';
import { Globe, Shield, ShieldAlert, KeyRound, Search, Maximize2, Plus, Settings, Check, Lock, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * A highly interactive mockup page demonstrating a browser extension playground.
 */
export default function ExtensionMockup() {
    const [currentUrl, setCurrentUrl] = useState('https://github.com/login');
    const [isExtensionOpen, setIsExtensionOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'vault' | 'generator'>('vault');
    const [searchQuery, setSearchQuery] = useState('');
    const [autofilledInputs, setAutofilledInputs] = useState(false);

    const [usernameInput, setUsernameInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');

    const mockEntries = [
        { id: 1, website: 'github.com', name: 'GitHub Personal', username: 'developer@zerovault.me', password: '••••••••••••' },
        { id: 2, website: 'github.com', name: 'GitHub Work', username: 'work@company.com', password: '••••••••••••' },
        { id: 3, website: 'twitter.com', name: 'Twitter', username: '@zerovault', password: '••••••••••••' },
        { id: 4, website: 'figma.com', name: 'Figma', username: 'design@zerovault.me', password: '••••••••••••' },
    ];

    const testScenarios = [
        { url: 'https://github.com/login', domain: 'github.com', safe: true, label: 'GitHub Login' },
        { url: 'https://gith-ub.login-secure.com', domain: 'gith-ub.login-secure.com', safe: false, label: 'Phishing Attempt' },
        { url: 'https://figma.com/login', domain: 'figma.com', safe: true, label: 'Figma' },
    ];

    const getCurrentDomain = () => {
        try {
            return new URL(currentUrl).hostname.replace('www.', '');
        } catch {
            return 'invalid-url';
        }
    };

    const isDomainSafe = () => {
        const domain = getCurrentDomain();
        return mockEntries.some(e => domain.includes(e.website));
    };

    const handleAutofill = (entry: typeof mockEntries[0]) => {
        setUsernameInput(entry.username);
        setPasswordInput('thisisarealpassword123'); // Fake password fill
        setAutofilledInputs(true);
        setIsExtensionOpen(false);

        // Remove highlight after a moment
        setTimeout(() => setAutofilledInputs(false), 1500);
    };

    // Filter entries for the extension dropdown
    const availableEntries = mockEntries.filter(e =>
        e.website.includes(searchQuery.toLowerCase()) ||
        e.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter strictly for the current site
    const currentSiteEntries = mockEntries.filter(e => getCurrentDomain().includes(e.website));

    // Reset inputs when URL changes
    useEffect(() => {
        setUsernameInput('');
        setPasswordInput('');
        setIsExtensionOpen(false);
    }, [currentUrl]);

    return (
        <div className="min-h-screen bg-background font-body pb-24">
            {/* Minimal Header */}
            <div className="border-b border-white/5 bg-secondary/20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
                            <Maximize2 className="w-6 h-6 text-primary" />
                            Extension Playground
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Experience the Zero Vault browser companion in real-time.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-8">

                {/* Left Side: The "Browser" Mockup */}
                <div className="flex-1 flex flex-col rounded-2xl border border-white/10 overflow-hidden shadow-2xl bg-black relative min-h-[600px]">

                    {/* Browser Toolbar (Chrome-like) */}
                    <div className="bg-[#1e1e1e] flex flex-col border-b border-white/10 shrink-0">
                        {/* Tab bar */}
                        <div className="flex items-end px-2 pt-2 gap-1 h-10">
                            <div className="bg-[#2d2d2d] text-white/90 text-xs px-4 py-2 rounded-t-lg flex items-center gap-2 max-w-[200px] border-t border-x border-white/5 relative z-10">
                                <Globe className="w-3 h-3 text-primary" />
                                <span className="truncate">{getCurrentDomain()}</span>
                                <div className="absolute -bottom-px left-0 right-0 h-px bg-[#2d2d2d]" />
                            </div>
                        </div>

                        {/* URL / Navigation bar */}
                        <div className="bg-[#2d2d2d] p-2 flex items-center gap-3 z-0 relative">
                            <div className="flex gap-4 px-2 text-white/50">
                                <span className="cursor-not-allowed">&larr;</span>
                                <span className="cursor-not-allowed">&rarr;</span>
                                <span className="cursor-not-allowed">&#x21bb;</span>
                            </div>

                            {/* Omnibox */}
                            <div className="flex-1 bg-[#1e1e1e] border border-white/10 rounded-full flex items-center px-4 py-1.5 focus-within:ring-1 focus-within:ring-primary/50 transition-shadow">
                                {isDomainSafe() ? (
                                    <Shield className="w-4 h-4 text-green-500 mr-2 shrink-0" />
                                ) : (
                                    <ShieldAlert className="w-4 h-4 text-red-500 mr-2 shrink-0" />
                                )}
                                <input
                                    type="text"
                                    value={currentUrl}
                                    onChange={(e) => setCurrentUrl(e.target.value)}
                                    className="flex-1 bg-transparent border-none outline-none text-sm text-white/90 font-mono"
                                />
                            </div>

                            {/* Extension Area */}
                            <div className="flex items-center gap-2 pr-2 relative">
                                <div className="w-px h-5 bg-white/10 mx-2" />

                                {/* Zero Vault Extension Icon */}
                                <button
                                    onClick={() => setIsExtensionOpen(!isExtensionOpen)}
                                    className={`relative p-1.5 rounded-md transition-all ${isExtensionOpen ? 'bg-primary/20' : 'hover:bg-white/10'}`}
                                >
                                    <KeyRound className={`w-5 h-5 ${isExtensionOpen ? 'text-primary' : 'text-white/70'}`} />
                                    {/* Notification Badge if matches found on safe site */}
                                    {isDomainSafe() && currentSiteEntries.length > 0 && (
                                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary border-2 border-[#2d2d2d] rounded-full text-[8px] font-bold flex items-center justify-center text-white">
                                            {currentSiteEntries.length}
                                        </span>
                                    )}
                                </button>

                                {/* Simulated Extension Popup */}
                                <AnimatePresence>
                                    {isExtensionOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute top-full right-0 mt-3 w-80 bg-[#1c1c1e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100] font-body"
                                            style={{ filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.5))' }}
                                        >
                                            {/* Extension Header */}
                                            <div className="p-3 border-b border-white/10 flex items-center gap-2 bg-[#252528]">
                                                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30">
                                                    <KeyRound className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-bold tracking-tight">Zero Vault</div>
                                                    <div className="text-[10px] text-primary font-medium flex items-center gap-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                        Vault Unlocked
                                                    </div>
                                                </div>
                                                <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-white/60 hover:text-white">
                                                    <Settings className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Extension Tabs */}
                                            <div className="flex border-b border-white/10 bg-[#1c1c1e]">
                                                <button
                                                    onClick={() => setActiveTab('vault')}
                                                    className={`flex-1 py-2.5 text-xs font-semibold relative ${activeTab === 'vault' ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
                                                >
                                                    Matches
                                                    {activeTab === 'vault' && <motion.div layoutId="extTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                                                </button>
                                                <button
                                                    onClick={() => setActiveTab('generator')}
                                                    className={`flex-1 py-2.5 text-xs font-semibold relative ${activeTab === 'generator' ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
                                                >
                                                    Generator
                                                    {activeTab === 'generator' && <motion.div layoutId="extTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                                                </button>
                                            </div>

                                            {/* Extension Content */}
                                            <div className="h-[280px] overflow-y-auto custom-scrollbar bg-[#1c1c1e]">
                                                {activeTab === 'vault' ? (
                                                    <div className="p-2 space-y-2">
                                                        {currentSiteEntries.length > 0 ? (
                                                            <>
                                                                <div className="px-2 pt-2 pb-1 text-[10px] uppercase tracking-wider font-bold text-white/40">Suggested for {getCurrentDomain()}</div>
                                                                {currentSiteEntries.map(entry => (
                                                                    <div
                                                                        key={entry.id}
                                                                        onClick={() => handleAutofill(entry)}
                                                                        className="group flex flex-col p-2.5 rounded-lg hover:bg-primary/10 border border-transparent hover:border-primary/20 cursor-pointer transition-all"
                                                                    >
                                                                        <div className="flex items-center justify-between mb-0.5">
                                                                            <span className="text-sm font-bold">{entry.name}</span>
                                                                            <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                                                <Check className="w-3 h-3" /> Fill
                                                                            </span>
                                                                        </div>
                                                                        <span className="text-xs text-white/50">{entry.username}</span>
                                                                    </div>
                                                                ))}
                                                                <div className="h-px bg-white/10 my-1 mx-2" />
                                                            </>
                                                        ) : (
                                                            <div className="px-3 py-4 text-center">
                                                                <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2 opacity-50" />
                                                                <p className="text-sm font-medium mb-1">No matches found</p>
                                                                <p className="text-xs text-white/50">Zero Vault doesn't have any saved logins for {getCurrentDomain()}.</p>
                                                            </div>
                                                        )}

                                                        <div className="relative mt-2">
                                                            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-white/40" />
                                                            <input
                                                                type="text"
                                                                placeholder="Search all vaults..."
                                                                value={searchQuery}
                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                                className="w-full bg-black/40 border border-white/10 rounded-md py-1.5 pl-8 pr-3 text-xs outline-none focus:border-primary/50"
                                                            />
                                                        </div>

                                                        {searchQuery && (
                                                            <div className="mt-2 space-y-1">
                                                                {availableEntries.map(entry => (
                                                                    <div key={`search-${entry.id}`} className="flex flex-col p-2 rounded-lg hover:bg-white/5 border border-transparent cursor-pointer transition-all">
                                                                        <span className="text-sm font-medium">{entry.name}</span>
                                                                        <span className="text-xs text-white/40">{entry.website}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="p-4 flex flex-col items-center justify-center h-full text-center">
                                                        <KeyRound className="w-12 h-12 text-primary opacity-20 mb-3" />
                                                        <h4 className="font-bold text-sm mb-1">Generate Password</h4>
                                                        <p className="text-xs text-white/50 mb-4">Create a strong, secure password for this site.</p>
                                                        <button className="w-full py-2 bg-primary text-black font-bold text-sm rounded-lg hover:bg-primary/90 transition-colors">
                                                            Generate Now
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Extension Footer */}
                                            <div className="p-2 border-t border-white/10 bg-[#1c1c1e] flex gap-2">
                                                <button className="flex-1 py-1.5 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 rounded border border-white/5 text-xs font-semibold transition-colors">
                                                    <Plus className="w-3.5 h-3.5" /> Add
                                                </button>
                                                <button className="py-1.5 px-3 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded border border-white/5 text-xs text-white/60 hover:text-white transition-colors">
                                                    Open Vault
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    {/* Webpage Content Area */}
                    <div className="flex-1 bg-white dark:bg-[#0f0f13] relative overflow-hidden flex flex-col">

                        {/* Phishing Banner Injection */}
                        {!isDomainSafe() && (
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                className="bg-red-500 text-white px-4 py-3 flex items-start gap-3 text-sm shadow-md z-40 relative"
                            >
                                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="block mb-0.5">Zero Vault Warning: Suspicious Site Detected</strong>
                                    Zero Vault prevented autofill because this URL ({getCurrentDomain()}) does not exactly match any of your saved credentials. Do not enter your password here unless you are certain it is safe.
                                </div>
                            </motion.div>
                        )}

                        {/* Page Body */}
                        <div className="flex-1 flex items-center justify-center p-8">
                            <div className="w-full max-w-sm rounded-2xl border border-border/50 bg-card p-8 shadow-2xl relative">

                                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Lock className="w-5 h-5 opacity-50 text-foreground" />
                                </div>
                                <h2 className="text-xl font-bold text-center mb-8 text-foreground">Sign in to continue</h2>

                                <div className="space-y-4">
                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Username or Email</label>
                                        <input
                                            type="text"
                                            value={usernameInput}
                                            onChange={(e) => setUsernameInput(e.target.value)}
                                            className={`w-full px-4 py-2.5 bg-background border rounded-lg focus:outline-none transition-all ${autofilledInputs ? 'border-primary bg-primary/5 text-primary font-medium shadow-[0_0_15px_rgba(var(--primary),0.2)]' : 'border-border/50 focus:border-primary'}`}
                                        />

                                        {/* Inline Zero Vault Icon Injection */}
                                        {isDomainSafe() && currentSiteEntries.length > 0 && (
                                            <button
                                                onClick={() => setIsExtensionOpen(true)}
                                                className="absolute right-3 top-1/2 mt-0.5 transform -translate-y-1/2 p-1 hover:bg-secondary rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Autofill with Zero Vault"
                                            >
                                                <KeyRound className="w-4 h-4 text-primary" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="relative group">
                                        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Password</label>
                                        <input
                                            type="password"
                                            value={passwordInput}
                                            onChange={(e) => setPasswordInput(e.target.value)}
                                            className={`w-full px-4 py-2.5 bg-background border rounded-lg focus:outline-none transition-all ${autofilledInputs ? 'border-primary bg-primary/5 text-primary font-medium shadow-[0_0_15px_rgba(var(--primary),0.2)]' : 'border-border/50 focus:border-primary'}`}
                                        />
                                    </div>

                                    <button className="w-full py-3 mt-4 bg-foreground text-background font-bold rounded-lg hover:opacity-90 transition-opacity shadow-md">
                                        Sign In
                                    </button>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>

                {/* Right Side: Demo Controls / Explanation */}
                <div className="w-full lg:w-80 flex flex-col gap-4">
                    <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
                        <h3 className="font-bold tracking-tight mb-4 flex items-center gap-2">
                            <Settings className="w-5 h-5 text-primary" />
                            Simulation Setup
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Click a test scenario below to simulate navigating to different domains. Watch how the extension reacts.
                        </p>

                        <div className="space-y-2">
                            {testScenarios.map((scenario) => (
                                <button
                                    key={scenario.url}
                                    onClick={() => setCurrentUrl(scenario.url)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all border text-sm text-left ${currentUrl === scenario.url ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-transparent border-border/50 hover:border-primary/50 text-foreground'}`}
                                >
                                    <span>
                                        {scenario.label}
                                        <span className="block text-[10px] opacity-70 mt-0.5 font-mono">{scenario.domain}</span>
                                    </span>
                                    {scenario.safe ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <ShieldAlert className="w-4 h-4 text-red-500" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
                        <h4 className="font-bold text-primary mb-2 text-sm">How to test:</h4>
                        <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-4 marker:font-bold marker:text-primary">
                            <li>Set scenario to <strong>GitHub</strong>.</li>
                            <li>Click the small key icon (<KeyRound className="w-3 h-3 inline pb-0.5" />) in the URL bar, or hover the username field.</li>
                            <li>Click a saved login from the extension dropdown.</li>
                            <li>Watch the fields securely highlight and autofill!</li>
                            <li className="pt-2 border-t border-primary/10">Now try the <strong>Phishing Attempt</strong> scenario to see the block in action.</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
