import { motion, AnimatePresence } from "framer-motion";

interface StateIconProps {
    size?: number;
    color?: string;
    className?: string;
}

// Custom wrapper to replace cn without adding dependencies
const cx = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

/* ─── 1. LOADING → SUCCESS ─── */
/** Component or function for Success Icon. */
export function SuccessIcon({ size = 40, color = "currentColor", className, isDone = false }: StateIconProps & { isDone?: boolean }) {
    return (
        <svg viewBox="0 0 40 40" fill="none" className={cx(className)} style={{ width: size, height: size }}>
            <motion.circle cx="20" cy="20" r="16" stroke={color} strokeWidth={2}
                animate={isDone
                    ? { pathLength: 1, opacity: 1 }
                    : { pathLength: 0.7, opacity: 0.4 }}
                transition={{ duration: 0.5 }}
            />
            {!isDone && (
                <motion.circle cx="20" cy="20" r="16" stroke={color} strokeWidth={2}
                    strokeLinecap="round" strokeDasharray="25 75"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: "20px 20px" }}
                />
            )}
            <motion.path d="M12 20l6 6 10-12" stroke={color} strokeWidth={2.5}
                strokeLinecap="round" strokeLinejoin="round"
                animate={isDone
                    ? { pathLength: 1, opacity: 1 }
                    : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.4, delay: isDone ? 0.2 : 0 }}
            />
        </svg>
    );
}

/* ─── 4. LOCK → UNLOCK ─── shackle lifts */
/** Component or function for Lock Unlock Icon. */
export function LockUnlockIcon({ size = 40, color = "currentColor", className, isUnlocked = false }: StateIconProps & { isUnlocked?: boolean }) {
    return (
        <svg viewBox="0 0 40 40" fill="none" className={cx(className)} style={{ width: size, height: size }}>
            <rect x="9" y="18" width="22" height="16" rx="3" stroke={color} strokeWidth={2} />
            <motion.path d="M14 18V13a6 6 0 0112 0v5" stroke={color} strokeWidth={2} strokeLinecap="round"
                animate={isUnlocked
                    ? { d: "M14 18V13a6 6 0 0112 0v2" }
                    : { d: "M14 18V13a6 6 0 0112 0v5" }}
                transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            />
            <motion.circle cx="20" cy="26" r="2" fill={color}
                animate={isUnlocked ? { scale: 0.6, opacity: 0.4 } : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
            />
        </svg>
    );
}

/* ─── 5. COPY → COPIED ─── clipboard with checkmark flash */
/** Component or function for Copied Icon. */
export function CopiedIcon({ size = 40, color = "currentColor", className, isCopied = false }: StateIconProps & { isCopied?: boolean }) {
    return (
        <svg viewBox="0 0 40 40" fill="none" className={cx(className)} style={{ width: size, height: size }}>
            <rect x="12" y="10" width="18" height="22" rx="2" stroke={color} strokeWidth={2} />
            <path d="M10 14h-0a2 2 0 00-2 2v18a2 2 0 002 2h14" stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.3} />
            <AnimatePresence mode="wait">
                {isCopied ? (
                    <motion.path key="check" d="M16 21l4 4 6-8" stroke={color} strokeWidth={2.5}
                        strokeLinecap="round" strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        exit={{ pathLength: 0 }}
                        transition={{ duration: 0.3 }}
                    />
                ) : (
                    <motion.g key="lines"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}>
                        <line x1="17" y1="18" x2="25" y2="18" stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.4} />
                        <line x1="17" y1="23" x2="25" y2="23" stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.4} />
                        <line x1="17" y1="28" x2="22" y2="28" stroke={color} strokeWidth={2} strokeLinecap="round" opacity={0.4} />
                    </motion.g>
                )}
            </AnimatePresence>
        </svg>
    );
}

/* ─── 6. BELL → NOTIFICATION ─── bell rings then dot appears */
/** Component or function for Notification Icon. */
export function NotificationIcon({ size = 40, color = "currentColor", className, hasNotif = false }: StateIconProps & { hasNotif?: boolean }) {
    return (
        <motion.svg viewBox="0 0 40 40" fill="none" className={cx(className)}
            animate={hasNotif ? { rotate: [0, 8, -8, 6, -6, 3, 0] } : { rotate: 0 }}
            transition={{ duration: 0.6 }}
            style={{ width: size, height: size, transformOrigin: "20px 6px" }}>
            <path d="M28 16a8 8 0 00-16 0c0 8-4 10-4 10h24s-4-2-4-10" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17.5 30a3 3 0 005 0" stroke={color} strokeWidth={2} strokeLinecap="round" />
            <motion.circle cx="28" cy="10" r="4" fill="#EF4444"
                animate={hasNotif
                    ? { scale: [0, 1.3, 1], opacity: 1 }
                    : { scale: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            />
        </motion.svg>
    );
}


/* ─── 11. EYE → HIDDEN ─── eye opens/closes with slash */
/** Component or function for Eye Toggle Icon. */
export function EyeToggleIcon({ size = 40, color = "currentColor", className, isHidden = false }: StateIconProps & { isHidden?: boolean }) {
    return (
        <svg viewBox="0 0 40 40" fill="none" className={cx(className)} style={{ width: size, height: size }}>
            <motion.path d="M4 20s6-10 16-10 16 10 16 10-6 10-16 10S4 20 4 20z"
                stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                animate={isHidden ? { opacity: 0.3 } : { opacity: 1 }}
                transition={{ duration: 0.3 }}
            />
            <motion.circle cx="20" cy="20" r="5" stroke={color} strokeWidth={2}
                animate={isHidden ? { scale: 0.6, opacity: 0.2 } : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
            />
            <motion.line x1="6" y1="34" x2="34" y2="6" stroke={color} strokeWidth={2.5} strokeLinecap="round"
                animate={isHidden ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.25 }}
            />
        </svg>
    );
}
