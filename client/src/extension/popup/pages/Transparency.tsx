import { useState } from 'react';
import { Lock, Unlock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * The Transparency page demonstrates the zero-knowledge encryption process.
 * It allows users to enter plaintext and see a mock representation of how it is encrypted before storage.
 * 
 * @returns React component.
 */
export default function Transparency() {
    const [plaintext, setPlaintext] = useState('');
    const [isEncrypting, setIsEncrypting] = useState(false);
    const [encrypted, setEncrypted] = useState('');

    const handleEncrypt = () => {
        if (!plaintext) return;

        setIsEncrypting(true);
        setEncrypted('');

        // Simulate encryption with delay
        setTimeout(() => {
            // Mock "encrypted" string (random characters)
            const mockEncrypted = btoa(plaintext).split('').map(() =>
                String.fromCharCode(33 + Math.floor(Math.random() * 94))
            ).join('');
            setEncrypted(mockEncrypted);
            setIsEncrypting(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-white/5 glass-panel sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <h1 className="text-2xl font-display font-bold">Encryption Transparency Demo</h1>
                    <p className="text-sm text-muted-foreground">See how your data is encrypted before storage</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="glass-panel p-8 rounded-3xl">
                    {/* Explainer */}
                    <div className="mb-8 text-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Zero-Knowledge Encryption</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Your data is encrypted on your device before it ever reaches our servers.
                            We never see your plaintext passwords - only encrypted blobs.
                        </p>
                    </div>

                    {/* Demo */}
                    <div className="space-y-6">
                        {/* Input */}
                        <div>
                            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                <Unlock className="w-4 h-4 text-muted-foreground" />
                                Plaintext (Visible to you only)
                            </label>
                            <textarea
                                value={plaintext}
                                onChange={(e) => setPlaintext(e.target.value)}
                                placeholder="Enter sensitive data (e.g., a password)..."
                                className="w-full px-4 py-3 bg-secondary/30 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all resize-none h-24 font-mono"
                            />
                        </div>

                        {/* Encrypt Button */}
                        <div className="flex justify-center">
                            <button
                                onClick={handleEncrypt}
                                disabled={!plaintext || isEncrypting}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isEncrypting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Encrypting...
                                    </>
                                ) : (
                                    <>
                                        Encrypt
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Output */}
                        {encrypted && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-primary" />
                                    Encrypted (Stored on server)
                                </label>
                                <div className="w-full px-4 py-3 bg-black/30 border border-primary/20 rounded-xl font-mono text-sm break-all h-24 overflow-auto scrollbar-hide text-primary/80">
                                    {encrypted}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 text-center">
                                    ✓ This gibberish is what we store. Without your master password, it's impossible to decrypt.
                                </p>
                            </motion.div>
                        )}
                    </div>

                    {/* Info Cards */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { title: 'Client-Side', desc: 'Encryption happens in your browser' },
                            { title: 'Zero-Knowledge', desc: 'We never see your master password' },
                            { title: 'AES-256', desc: 'Military-grade encryption standard' },
                        ].map((card, i) => (
                            <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                                <h3 className="font-semibold mb-1">{card.title}</h3>
                                <p className="text-xs text-muted-foreground">{card.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
