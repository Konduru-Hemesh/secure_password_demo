import { useLocation } from 'wouter';
import { Suspense, lazy } from 'react';
import { SignInPage, type Testimonial } from '@/extension/components/ui/sign-in';
import { useAuth } from '@/extension/popup/contexts/AuthContext';
import { useToast } from '@/extension/popup/contexts/ToastContext';

const Spline = lazy(() => import('@splinetool/react-spline'));

/** Component or function for Landing. */
export default function Landing() {
    const [, setLocation] = useLocation();
    const { login } = useAuth();
    const { showToast } = useToast();

    const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            showToast('Signing in...', 'info');
            await login(email, password);
            showToast('Sign in successful!', 'success');
            setLocation('/dashboard');
        } catch (error: any) {
            showToast(error.message || 'Login failed', 'error');
        }
    };

    const handleGoogleSignIn = () => {
        showToast('Google sign-in is coming soon!', 'info');
    };

    const sampleTestimonials: Testimonial[] = [
        {
            avatarSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
            name: "Sarah Chen",
            handle: "@sarahdigital",
            text: "No more password panic. Zero-Vault delivers slick, secure password management everywhere."
        },
        {
            avatarSrc: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&q=80",
            name: "Marcus Johnson",
            handle: "@marcustech",
            text: "Flawless precision across all my devices. It's truly a zero-knowledge architecture I can trust."
        }
    ];

    return (
        <SignInPage
            title={<span className="font-light text-foreground tracking-tighter">Welcome back</span>}
            description="Access your secure Zero-Vault and continue your journey"
            isSignUp={false}
            testimonials={sampleTestimonials}
            onSignIn={handleSignIn}
            onGoogleSignIn={handleGoogleSignIn}
            onSwitchMode={() => setLocation('/register')}
            onResetPassword={() => { }}
            heroNode={
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    <div className="absolute -inset-y-[80px] -inset-x-[150px] pointer-events-auto">
                        <Suspense fallback={<div className="w-full h-full bg-black/50" />}>
                            <Spline scene="https://prod.spline.design/nyPq2v-2hiR8XXPp/scene.splinecode" />
                        </Suspense>
                    </div>
                    <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
                </div>
            }
        />
    );
}
