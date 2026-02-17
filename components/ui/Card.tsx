import { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
    title?: string;
}

export default function Card({ children, className = "", title }: CardProps) {
    return (
        <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
            {title && (
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        {title}
                    </h3>
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
        </div>
    );
}
