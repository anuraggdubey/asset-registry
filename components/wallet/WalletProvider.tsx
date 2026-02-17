"use client";

import { useEffect } from "react";
import { useWalletStore } from "@/lib/state/walletStore";

export default function WalletProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const restoreWallet = useWalletStore((s) => s.restoreWallet);

    useEffect(() => {
        const saved = localStorage.getItem("wallet");
        if (saved) restoreWallet(saved);
    }, []);

    return <>{children}</>;
}
