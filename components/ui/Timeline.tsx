import { ReactNode } from "react";

interface TimelineItemProps {
    date: string;
    title: string;
    description?: ReactNode;
    isLast?: boolean;
}

export function Timeline({ children }: { children: ReactNode }) {
    return (
        <div className="space-y-0">
            {children}
        </div>
    );
}

export function TimelineItem({ date, title, description, isLast = false }: TimelineItemProps) {
    return (
        <div className="flex gap-4">
            {/* Column 1: Date */}
            <div className="w-24 text-right pt-1">
                <span className="text-xs text-gray-500 font-mono">{date}</span>
            </div>

            {/* Column 2: Line + Dot */}
            <div className="relative flex flex-col items-center">
                <div className="w-3 h-3 bg-neutral-900 rounded-full z-10 border-2 border-white ring-1 ring-gray-200"></div>
                {!isLast && (
                    <div className="w-px bg-gray-200 flex-1 my-1"></div>
                )}
            </div>

            {/* Column 3: Content */}
            <div className="pb-8 pt-0.5">
                <h4 className="text-sm font-medium text-gray-900">{title}</h4>
                {description && (
                    <div className="text-sm text-gray-500 mt-1">
                        {description}
                    </div>
                )}
            </div>
        </div>
    );
}
