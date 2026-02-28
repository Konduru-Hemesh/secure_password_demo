

/**
 * A loading skeleton placeholder for a vault entry card.
 * Uses CSS shimmer animations to indicate loading state.
 * 
 * @returns React component.
 */
export default function SkeletonCard() {
    return (
        <div className="glass-panel p-6 rounded-2xl">
            {/* Header skeleton */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="h-6 w-32 bg-white/10 rounded shimmer mb-2" />
                    <div className="h-4 w-48 bg-white/10 rounded shimmer" />
                </div>
                <div className="h-5 w-5 bg-white/10 rounded-full shimmer" />
            </div>

            {/* Strength badge skeleton */}
            <div className="mb-3">
                <div className="h-6 w-20 bg-white/10 rounded shimmer inline-block" />
            </div>

            {/* Password field skeleton */}
            <div className="mb-4 bg-black/20 rounded-xl p-3 border border-white/5">
                <div className="h-4 w-24 bg-white/10 rounded shimmer" />
            </div>

            {/* Actions skeleton */}
            <div className="flex gap-2">
                <div className="flex-1 h-10 bg-white/10 rounded-lg shimmer" />
                <div className="h-10 w-10 bg-white/10 rounded-lg shimmer" />
                <div className="h-10 w-10 bg-white/10 rounded-lg shimmer" />
            </div>
        </div>
    );
}
