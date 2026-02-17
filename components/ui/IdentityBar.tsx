import React from "react";
import CopyButton from "./CopyButton";

interface IdentityBarProps {
    label: string;
    address: string;
    type?: "sender" | "receiver" | "display";
    className?: string;
}

export default function IdentityBar({ label, address, type = "display", className = "" }: IdentityBarProps) {
    const getBgColor = () => {
        switch (type) {
            case "sender": return "bg-blue-50 border-blue-100 text-blue-800";
            case "receiver": return "bg-green-50 border-green-100 text-green-800";
            default: return "bg-gray-50 border-gray-200 text-gray-800";
        }
    };

    const getIcon = () => {
        switch (type) {
            case "sender": return "📤";
            case "receiver": return "📥";
            default: return "👤";
        }
    };

    return (
        <div className={`flex items-center justify-between p-3 rounded-md border ${getBgColor()} ${className}`}>
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-lg shadow-sm">
                    {getIcon()}
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">
                        {label}
                    </span>
                    <span className="font-mono text-xs truncate font-medium">
                        {address || "Not connected"}
                    </span>
                </div>
            </div>
            {address && <CopyButton text={address} className="opacity-60 hover:opacity-100" />}
        </div>
    );
}
