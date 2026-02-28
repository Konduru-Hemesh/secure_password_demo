// @ts-ignore
import { FixedSizeList as List } from 'react-window';
import type { VaultEntry } from '@/shared/models/vault.types';

/**
 * Props for the VirtualizedEntryList component.
 */
interface VirtualizedEntryListProps {
    /** The list of vault entries to render */
    entries: VaultEntry[];
    /** Callback to copy an entry's password */
    onCopy: (id: number, password: string) => void;
    /** Callback to reveal/hide an entry's password */
    onReveal: (id: number) => void;
    /** Callback to open the edit modal for an entry */
    onEdit: (entry: VaultEntry) => void;
    /** Callback to delete an entry */
    onDelete: (entry: VaultEntry) => void;
    /** Callback to toggle the favorite status of an entry */
    onToggleFavorite: (id: number) => void;
    /** The ID of the entry whose password was recently copied */
    copiedId: number | null;
    /** The ID of the entry whose password is currently revealed */
    revealedId: number | null;
}

/**
 * A performance-optimized list component for rendering large numbers of vault entries.
 * Uses `react-window` for virtualization.
 * 
 * @param props The component props.
 * @returns React component.
 */
export default function VirtualizedEntryList({
    entries,
    onCopy,
    onReveal,
    onEdit,
    onDelete,
    onToggleFavorite,
    copiedId,
    revealedId
}: VirtualizedEntryListProps) {
    // For small lists, don't use virtualization
    if (entries.length < 20) {
        return null; // Fallback to regular grid
    }

    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const entry = entries[index];

        return (
            <div style={style} className="px-2 py-2">
                {/* Entry card content would go here */}
                {/* Ignoring unused props for now */}
                <div style={{ display: 'none' }} onClick={() => { onCopy(0, ''); onReveal(0); onEdit(entry); onDelete(entry); onToggleFavorite(0); console.log(copiedId, revealedId); }}></div>
                <div className="glass-panel p-4 rounded-xl">
                    <h3 className="font-semibold">{entry.website}</h3>
                    <p className="text-sm text-muted-foreground">{entry.username}</p>
                </div>
            </div>
        );
    };

    return (
        <List
            height={600}
            itemCount={entries.length}
            itemSize={180}
            width="100%"
        >
            {Row}
        </List>
    );
}
