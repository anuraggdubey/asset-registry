"use client";

import { useWalletStore } from "@/lib/state/walletStore";
import { requestAccess } from "@stellar/freighter-api";

export default function ConnectButton() {
    const { publicKey, connected, setWallet, disconnect } = useWalletStore();

    const connectWallet = async () => {
        try {
            const res = await requestAccess();

            // New Freighter API returns object
            if (typeof res === "object" && "address" in res) {
                setWallet(res.address);
            } else if (typeof res === "string") {
                setWallet(res);
            } else {
                throw new Error("Wallet not found");
            }
        } catch (err) {
            console.error(err);
            alert("Freighter not installed or locked");
        }
    };

    if (connected && publicKey) {
        return (
            <button
                onClick={disconnect}
                className="px-4 py-2 bg-red-500 text-white rounded"
            >
                {publicKey.substring(0, 5)}... Disconnect
            </button>
        );
    }

    return (
        <button
            onClick={connectWallet}
            className="px-4 py-2 bg-black text-white rounded"
        >
            Connect Wallet
        </button>
    );
}
