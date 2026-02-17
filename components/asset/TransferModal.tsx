"use client";

import { useState } from "react";
import { transferAsset } from "@/lib/stellar/transferAsset";
import { useWalletStore } from "@/lib/state/walletStore";

export default function TransferModal({ hash20 }: { hash20: string }) {
    const { publicKey } = useWalletStore();
    const [receiver, setReceiver] = useState("");
    const [loading, setLoading] = useState(false);
    const [tx, setTx] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleTransfer() {
        setError(null);

        if (!receiver.startsWith("G")) {
            setError("Enter valid Stellar address");
            return;
        }

        try {
            setLoading(true);

            const txHash = await transferAsset(publicKey!, receiver, hash20);

            setTx(txHash);
        } catch (e: any) {
            setError(e.message || "Transfer failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mt-6 p-4 border rounded-lg">
            <h3 className="font-semibold mb-2">Transfer Ownership</h3>

            <input
                type="text"
                placeholder="Receiver wallet address (G...)"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                className="w-full border p-2 rounded mb-3"
            />

            <button
                onClick={handleTransfer}
                className="bg-black text-white px-4 py-2 rounded"
                disabled={loading}
            >
                {loading ? "Sending..." : "Transfer"}
            </button>

            {tx && (
                <p className="text-green-600 mt-2">
                    Success! TX: {tx}
                </p>
            )}

            {error && (
                <p className="text-red-600 mt-2">
                    {error}
                </p>
            )}
        </div>
    );
}
