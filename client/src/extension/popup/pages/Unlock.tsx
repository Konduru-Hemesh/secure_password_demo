import { useState, Suspense, lazy } from 'react';
import { useLocation } from 'wouter';
import { Fingerprint, KeyRound, Hash, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Spline = lazy(() => import('@splinetool/react-spline'));

type UnlockMethod = 'password' | 'otp' | 'biometric';

/**
 * The Unlock page handles vault access verification.
 * Supports multiple methods: master password, OTP (mock), and biometrics (mock).
 * 
 * @returns React component.
 */
export default function Unlock() {
    const [, setLocation] = useLocation();
    const [method, setMethod] = useState<UnlockMethod>('password');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [shakeError, setShakeError] = useState(false);
    const [scanActive, setScanActive] = useState(false);

    const handleUnlock = () => {
        // Demonstrate cinematic error shake if password is too short
        if (method === 'password' && password.length < 4) {
            setShakeError(true);
            setTimeout(() => setShakeError(false), 500);
            return;
        }

        if (method === 'biometric') {
            setScanActive(true);
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setScanActive(false);
            setLocation('/dashboard');
        }, 1500);
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // Auto-focus next input
            if (value && index < 5) {
                const nextInput = document.getElementById(`otp-${index + 1}`);
                nextInput?.focus();
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500/10 via-teal-500/10 to-emerald-500/10 p-4">

            {/* Split Layout Container */}
            <div className="w-full max-w-6xl h-[85vh] min-h-[600px] flex rounded-[2rem] overflow-hidden shadow-2xl shadow-black/50 border border-white/5 bg-background">

                {/* Left Side: 3D Model & Text (Always shown on md and larger) */}
                <div className="hidden md:block relative w-1/2 bg-black overflow-hidden">
                    {/* Text Overlay */}
                    <div className="absolute top-12 left-12 z-10 max-w-md pointer-events-none">
                        <h2 className="text-4xl font-display font-bold text-white mb-4 leading-tight">
                            Access your vault securely.
                        </h2>
                        <p className="text-white/70 text-lg">
                            Welcome back. Verify your identity to seamlessly access your encrypted data and powerful security tools.
                        </p>
                    </div>

                    {/* Spline Model Wrapper */}
                    <div className="absolute -top-[10px] -left-[10px] w-[calc(100%+80px)] h-[calc(100%+80px)] z-0 pointer-events-auto">
                        <style>{`
                            #logo, a[href^="https://spline.design"] {
                                display: none !important;
                            }
                        `}</style>
                        <div className="w-full h-full transform translate-x-4 translate-y-4">
                            <Suspense fallback={
                                <div className="absolute inset-0 bg-black flex items-center justify-center">
                                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            }>
                                <Spline scene="https://prod.spline.design/nyPq2v-2hiR8XXPp/scene.splinecode" />
                            </Suspense>
                        </div>
                    </div>

                    {/* Gradient Overlay at Bottom */}
                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                </div>

                {/* Right Side: Form */}
                <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 py-8 relative overflow-y-auto scrollbar-hide">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-full max-w-md mx-auto"
                    >
                        {/* Header */}
                        <div className="mb-8 text-center lg:text-left">
                            <h1 className="text-3xl font-display font-bold mb-2">Vault Locked</h1>
                            <p className="text-muted-foreground text-sm">
                                Verify your identity to proceed
                            </p>
                        </div>

                        <div className="space-y-6">
                            <AnimatePresence mode="wait">
                                {/* Password Method */}
                                {method === 'password' && (
                                    <motion.div
                                        key="password"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={shakeError ? { x: [-10, 10, -10, 10, 0], transition: { duration: 0.4 } } : { opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-4"
                                    >
                                        <div className="relative group">
                                            <div className={`absolute -inset-0.5 rounded-xl blur opacity-0 transition duration-500 ${shakeError ? 'bg-red-500/50 opacity-100' : 'group-hover:opacity-30 bg-primary/30'}`}></div>
                                            <div className="relative">
                                                <label className={`block text-sm font-medium mb-1.5 transition-colors ${shakeError ? 'text-red-400' : 'text-foreground/80'}`}>
                                                    Master Password<span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => {
                                                        setPassword(e.target.value);
                                                        setShakeError(false);
                                                    }}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                                                    placeholder="Enter your password"
                                                    className={`w-full px-4 py-3 bg-secondary/80 backdrop-blur-sm border rounded-xl focus:ring-2 focus:outline-none transition-all ${shakeError ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:ring-primary/50 focus:border-primary'}`}
                                                />
                                            </div>
                                        </div>
                                        {shakeError && (
                                            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-red-400 text-xs font-medium">
                                                Password must be at least 4 characters to attempt unlock.
                                            </motion.p>
                                        )}
                                        <button
                                            onClick={handleUnlock}
                                            disabled={loading || !password}
                                            className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-2 shadow-lg ${shakeError ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'}`}
                                        >
                                            {loading ? 'Decrypting Vault...' : 'Unlock'}
                                            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                                        </button>
                                    </motion.div>
                                )}

                                {/* OTP Method */}
                                {method === 'otp' && (
                                    <motion.div
                                        key="otp"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-4"
                                    >
                                        <p className="text-sm text-foreground/80 mb-2">
                                            Enter the 6-digit code sent to your device
                                        </p>
                                        <div className="flex gap-2 justify-center lg:justify-start">
                                            {otp.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    id={`otp-${index}`}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                                    className="w-12 h-14 text-center text-xl font-mono bg-secondary/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                                                />
                                            ))}
                                        </div>
                                        <button
                                            onClick={handleUnlock}
                                            disabled={loading || otp.some(d => !d)}
                                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 rounded-xl font-semibold transition-all disabled:opacity-50 mt-4 shadow-lg shadow-primary/20"
                                        >
                                            {loading ? 'Verifying...' : 'Verify OTP'}
                                        </button>
                                    </motion.div>
                                )}

                                {/* Biometric Method */}
                                {method === 'biometric' && (
                                    <motion.div
                                        key="biometric"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="py-8 text-center"
                                    >
                                        <div className="relative w-32 h-32 mx-auto mb-8">
                                            {/* Scanning glow behind */}
                                            {scanActive && (
                                                <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse" />
                                            )}

                                            {/* Fingerprint Button */}
                                            <div
                                                onClick={handleUnlock}
                                                className={`relative z-10 w-full h-full rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 border-2 overflow-hidden ${scanActive ? 'bg-primary/20 border-primary' : 'bg-secondary/50 border-white/10 hover:border-primary/50 hover:bg-secondary'}`}
                                            >
                                                <Fingerprint className={`w-14 h-14 transition-colors duration-500 ${scanActive ? 'text-primary' : 'text-muted-foreground'}`} strokeWidth={1.5} />

                                                {/* Scanning Line Animation */}
                                                {scanActive && (
                                                    <motion.div
                                                        initial={{ top: '-10%' }}
                                                        animate={{ top: '110%' }}
                                                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                                        className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_15px_5px_rgba(var(--primary),0.5)] z-20"
                                                    />
                                                )}
                                            </div>

                                            {/* Ripple effects */}
                                            {scanActive && (
                                                <>
                                                    <div className="absolute inset-0 border-2 border-primary rounded-full animate-ping opacity-20" style={{ animationDuration: '2s' }} />
                                                    <div className="absolute inset-[-10px] border border-primary rounded-full animate-ping opacity-10" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                                                </>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">
                                            {scanActive ? 'Scanning Biometrics...' : 'Touch ID Required'}
                                        </h3>
                                        <p className="text-sm text-foreground/60">
                                            {scanActive ? 'Please keep your finger on the sensor' : 'Tap the sensor to unlock your secure vault'}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Method Selector */}
                            <div className="grid grid-cols-3 gap-2 pt-6 border-t border-white/5">
                                <button
                                    onClick={() => setMethod('password')}
                                    className={`py-3 px-3 rounded-xl text-sm font-medium transition-all ${method === 'password' ? 'bg-secondary/50 text-foreground border border-white/10' : 'text-muted-foreground hover:bg-white/5 border border-transparent'
                                        }`}
                                >
                                    <KeyRound className="w-5 h-5 mx-auto mb-1" />
                                    Password
                                </button>
                                <button
                                    onClick={() => setMethod('otp')}
                                    className={`py-3 px-3 rounded-xl text-sm font-medium transition-all ${method === 'otp' ? 'bg-secondary/50 text-foreground border border-white/10' : 'text-muted-foreground hover:bg-white/5 border border-transparent'
                                        }`}
                                >
                                    <Hash className="w-5 h-5 mx-auto mb-1" />
                                    OTP
                                </button>
                                <button
                                    onClick={() => setMethod('biometric')}
                                    className={`py-3 px-3 rounded-xl text-sm font-medium transition-all ${method === 'biometric' ? 'bg-secondary/50 text-foreground border border-white/10' : 'text-muted-foreground hover:bg-white/5 border border-transparent'
                                        }`}
                                >
                                    <Fingerprint className="w-5 h-5 mx-auto mb-1" />
                                    Bio
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 text-center text-sm text-muted-foreground pt-6 border-t border-white/5">
                            New here?{' '}
                            <button onClick={() => setLocation('/register')} className="text-foreground hover:text-primary font-medium hover:underline transition-colors mt-2">
                                Create an account
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
