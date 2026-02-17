"use client";

import { useState } from "react";

interface CopyButtonProps {
    text: string;
    label?: string; // Optional label to show what is being copied
    className?: string;
}

export default function CopyButton({ text, className = "" }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={`
                inline-flex items-center gap-1.5 px-2 py-1 rounded-md 
                text-xs font-medium transition-colors
                ${copied
                    ? "bg-green-50 text-green-700 hover:bg-green-100"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900"}
                ${className}
            `}
            title="Copy to clipboard"
        >
            {copied ? (
                <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copied</span>
                </>
            ) : (
                <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                </>
            )}
        </button>
    );
}
