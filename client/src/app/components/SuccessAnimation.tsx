import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

/**
 * Props for the SuccessAnimation component.
 */
interface SuccessAnimationProps {
    /** Whether to show the animation */
    show: boolean;
    /** Optional message to display below the checkmark icon */
    message?: string;
}

/**
 * A full-screen success animation overlay with a checkmark and message.
 * 
 * @param props The component props.
 * @returns React component.
 */
export default function SuccessAnimation({ show, message = 'Success!' }: SuccessAnimationProps) {
    if (!show) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
                type: "spring",
                damping: 15,
                stiffness: 400
            }}
            className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none"
        >
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                    type: "spring",
                    damping: 12,
                    stiffness: 200,
                    delay: 0.1
                }}
                className="bg-primary/20 backdrop-blur-xl border-2 border-primary rounded-full p-8 shadow-2xl"
            >
                <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <CheckCircle className="w-20 h-20 text-primary" strokeWidth={3} />
                </motion.div>
            </motion.div>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute top-1/2 mt-24 text-2xl font-bold text-primary"
            >
                {message}
            </motion.p>
        </motion.div>
    );
}
