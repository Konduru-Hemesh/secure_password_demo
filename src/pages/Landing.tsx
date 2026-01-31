import { useLocation } from 'wouter';
import { Shield, ArrowRight, Lock, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
    const [, setLocation] = useLocation();

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute w-96 h-96 bg-primary/10 rounded-full blur-3xl -top-20 -left-20 animate-pulse"></div>
                <div className="absolute w-96 h-96 bg-accent/10 rounded-full blur-3xl -bottom-20 -right-20 animate-pulse delay-1000"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl w-full text-center z-10"
            >
                {/* Logo / Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-primary to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/50"
                >
                    <Shield className="w-12 h-12 text-white" />
                </motion.div>

                {/* Hero Text */}
                <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
                    <span className="text-gradient">Zero-Knowledge</span>
                    <br />
                    Password Vault
                </h1>

                <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
                    Your passwords, encrypted locally. Only you hold the key.
                    <br />
                    <span className="text-primary font-semibold">Not even we can access your data.</span>
                </p>

                {/* Feature Pills */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {[
                        { icon: Lock, text: 'End-to-End Encryption' },
                        { icon: Eye, text: 'Zero-Knowledge Architecture' },
                        { icon: Shield, text: 'Military-Grade Security' },
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                            className="glass-panel px-4 py-2 rounded-full flex items-center gap-2"
                        >
                            <feature.icon className="w-4 h-4 text-primary" />
                            <span className="text-sm">{feature.text}</span>
                        </motion.div>
                    ))}
                </div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <button
                        onClick={() => setLocation('/register')}
                        className="group glass-panel px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-primary/50"
                    >
                        Create Vault
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={() => setLocation('/unlock')}
                        className="glass-panel px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/10 transition-all duration-300"
                    >
                        Unlock Existing Vault
                    </button>
                </motion.div>

                {/* Trust Badge */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-16 text-sm text-muted-foreground"
                >
                    🔐 Your master password never leaves your device
                </motion.p>
            </motion.div>
        </div>
    );
}
