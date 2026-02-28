import { useLocation } from 'wouter';
import { Suspense, lazy } from 'react';
import { SignInPage, type Testimonial } from '@/extension/components/ui/sign-in';
import { useAuth } from '@/extension/popup/contexts/AuthContext';
import { useToast } from '@/extension/popup/contexts/ToastContext';

const Spline = lazy(() => import('@splinetool/react-spline'));

/** Component or function for Register. */
export default function Register() {
    const [, setLocation] = useLocation();
    const { register } = useAuth();
    const { showToast } = useToast();

    const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const displayName = formData.get('displayName') as string;

        try {
            showToast('Creating account...', 'info');
            await register(email, password, displayName);
            showToast('Account created successfully!', 'success');
            setLocation('/dashboard');
        } catch (error: any) {
            showToast(error.message || 'Registration failed', 'error');
        }
    };

    const sampleTestimonials: Testimonial[] = [
        {
            avatarSrc: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80",
            name: "Elena Rodriguez",
            handle: "@elenacreates",
            text: "I set up my vault in less than a minute. Absolute control and complete peace of mind."
        },
        {
            avatarSrc: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80",
            name: "David Martinez",
            handle: "@davidsec",
            text: "The zero-knowledge architecture ensures that I am the only one with the keys to my data."
        }
    ];

    return (
        <SignInPage
            title={<span className="font-light text-foreground tracking-tighter">Create your vault</span>}
            description="Start securing your digital life with absolute control."
            isSignUp={true}
            testimonials={sampleTestimonials}
            onSignIn={handleSignUp}
            onGoogleSignIn={() => showToast('Google sign-in is coming soon!', 'info')}
            onSwitchMode={() => setLocation('/')}
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
