/**
 * Placeholder tab content — replaced by real implementations in T-F2..F5.
 */

export function PlaceholderTab({ title }: { title: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-2xl text-surface-400">🚧</span>
            </div>
            <h2 className="text-xl font-semibold text-surface-700 mb-2">{title}</h2>
            <p className="text-sm text-surface-400 max-w-sm">
                This section is coming soon. Implementation in progress.
            </p>
        </div>
    );
}
