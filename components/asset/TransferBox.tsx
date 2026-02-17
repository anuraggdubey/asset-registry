"use client";

import { useState } from "react";
import { transferAsset } from "@/lib/stellar/transferAsset";
import { useWalletStore } from "@/lib/state/walletStore";

export default function TransferBox({ hash }: { hash: string }) {
    const { publicKey, connected } = useWalletStore();

    const [receiver, setReceiver] = useState("");
    const [tx, setTx] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const send = async () => {
        if (!connected || !publicKey) return alert("Connect wallet first");
        if (!receiver) return alert("Enter receiver address");

        setLoading(true);

        try {
            const txHash = await transferAsset(publicKey, receiver, hash);
            setTx(txHash);
        } catch (e) {
            alert("Transfer failed");
        }

        setLoading(false);
    };

    return (
        <div className="border p-6 rounded-xl space-y-4">
            <h2 className="text-xl font-semibold">Transfer Ownership</h2>

            <input
                type="text"
                placeholder="Receiver wallet address"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                className="w-full border p-2 rounded"
            />

            <button
                onClick={send}
                className="px-4 py-2 bg-blue-600 text-white rounded"
            >
                Transfer
            </button>

            {loading && <p>Submitting transaction...</p>}
            {tx && <p className="text-green-600">Transferred! TX: {tx}</p>}
        </div>
    );
}
