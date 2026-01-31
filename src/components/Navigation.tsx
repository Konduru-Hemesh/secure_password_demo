import { useLocation } from 'wouter';
import { Home, Settings, Lock, AlertOctagon, PieChart } from 'lucide-react';
import { useAutoLock } from '../contexts/AutoLockContext';
import { useToast } from '../contexts/ToastContext';

export default function Navigation() {
    const [location, setLocation] = useLocation();
    const { lockVault, panicLock } = useAutoLock();
    const { showToast } = useToast();

    const navItems = [
        { path: '/dashboard', icon: Home, label: 'Vault' },
        { path: '/insights', icon: PieChart, label: 'Insights' },
        // { path: '/extension', icon: Chrome, label: 'Extension' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    const handleLock = () => {
        showToast('Vault locked', 'info');
        lockVault();
    };

    const handlePanicLock = () => {
        showToast('Emergency lock activated!', 'warning');
        panicLock();
    };

    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="glass-panel px-3 py-2 rounded-2xl flex items-center gap-1">
                {navItems.map((item) => (
                    <button
                        key={item.path}
                        onClick={() => setLocation(item.path)}
                        className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all text-sm ${location === item.path
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                            }`}
                    >
                        <item.icon className="w-4 h-4" />
                        <span className="font-medium hidden md:inline">{item.label}</span>
                    </button>
                ))}

                <div className="w-px h-8 bg-white/10 mx-1" />

                <button
                    onClick={handleLock}
                    className="px-3 py-2 rounded-xl flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all text-sm"
                    title="Lock Vault (Ctrl+L)"
                >
                    <Lock className="w-4 h-4" />
                    <span className="font-medium hidden md:inline">Lock</span>
                </button>

                <button
                    onClick={handlePanicLock}
                    className="px-3 py-2 rounded-xl flex items-center gap-2 text-destructive hover:bg-destructive/10 transition-all text-sm"
                    title="Panic Lock (Clear All Data)"
                >
                    <AlertOctagon className="w-4 h-4" />
                    <span className="font-medium hidden md:inline">Panic</span>
                </button>
            </div>
        </nav>
    );
}
