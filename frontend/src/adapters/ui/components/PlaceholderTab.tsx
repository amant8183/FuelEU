/**
 * Placeholder tab content — replaced by real implementations in T-F2..F5.
 */

import { Construction } from 'lucide-react';

export function PlaceholderTab({ title }: { title: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mb-4">
                <Construction size={28} className="text-surface-400" />
            </div>
            <h2 className="text-xl font-semibold text-surface-700 mb-2">{title}</h2>
            <p className="text-sm text-surface-400 max-w-sm">
                This section is coming soon. Implementation in progress.
            </p>
        </div>
    );
}
