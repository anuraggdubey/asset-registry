import { ReactNode } from "react";

interface BadgeProps {
    children: ReactNode;
    variant?: "default" | "success" | "warning" | "error" | "neutral";
}

export default function Badge({ children, variant = "neutral" }: BadgeProps) {

    const variants = {
        neutral: "bg-gray-100 text-gray-700 border-gray-200",
        default: "bg-blue-50 text-blue-700 border-blue-200",
        success: "bg-emerald-50 text-emerald-700 border-emerald-200",
        warning: "bg-amber-50 text-amber-700 border-amber-200",
        error: "bg-red-50 text-red-700 border-red-200",
    };

    return (
        <span className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
            ${variants[variant]}
        `}>
            {children}
        </span>
    );
}
