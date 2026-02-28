import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Props for the DeleteConfirm component.
 */
interface DeleteConfirmProps {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Function to call when the modal is closed without confirmation */
    onClose: () => void;
    /** Function to call when the deletion is confirmed */
    onConfirm: () => void;
    /** The name of the entry being deleted */
    entryName: string;
}

/**
 * A confirmation modal for deleting a vault entry.
 * Displays a warning message and provides "Cancel" and "Delete" actions.
 * 
 * @param props The component props.
 * @returns React component.
 */
export default function DeleteConfirm({ isOpen, onClose, onConfirm, entryName }: DeleteConfirmProps) {
    const handleConfirm = () => {
        onConfirm();
        onClose();
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
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{
                                type: "spring",
                                damping: 25,
                                stiffness: 300
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="glass-panel rounded-3xl p-8 w-full max-w-md border-2 border-destructive/30 shadow-2xl"
                        >
                            {/* Icon */}
                            <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-6 h-6 text-destructive" />
                            </div>

                            {/* Title */}
                            <h2 className="text-xl font-display font-bold text-center mb-2">
                                Delete Entry?
                            </h2>

                            {/* Message */}
                            <p className="text-muted-foreground text-center mb-6">
                                Are you sure you want to delete <span className="font-semibold text-foreground">"{entryName}"</span>?
                                <br />
                                <span className="text-sm">This action cannot be undone.</span>
                            </p>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-semibold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="flex-1 px-4 py-3 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl font-semibold transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
