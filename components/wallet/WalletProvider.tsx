"use client";

import { useEffect } from "react";
import { useWalletStore } from "@/lib/state/walletStore";

export default function WalletProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const restore = useWalletStore((s) => s.restore);

    useEffect(() => {
        restore();
    }, []);

    return <>{children}</>;
}
