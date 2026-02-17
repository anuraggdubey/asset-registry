"use client";

import { useState } from "react";
import { hashFile } from "@/lib/crypto/hash";
import { registerAsset } from "@/lib/stellar/registerAsset";
import { useWalletStore } from "@/lib/state/walletStore";

export default function UploadBox() {
    const { publicKey, connected } = useWalletStore();

    const [hash, setHash] = useState<string | null>(null);
    const [tx, setTx] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        setLoading(true);

        const file = e.target.files[0];
        const fileHash = await hashFile(file);

        setHash(fileHash);
        setLoading(false);
    };

    const registerOnChain = async () => {
        if (!hash || !publicKey) return;

        setLoading(true);
        const txHash = await registerAsset(publicKey, hash);
        setTx(txHash);
        setLoading(false);
    };

    return (
        <div className="border-2 border-dashed p-8 text-center rounded-xl">
            <input type="file" onChange={handleFile} />

            {hash && (
                <>
                    <p className="mt-4 font-mono break-all">{hash}</p>

                    {connected && (
                        <button
                            onClick={registerOnChain}
                            className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
                        >
                            Register on Blockchain
                        </button>
                    )}
                </>
            )}

            {loading && <p className="mt-4">Writing to blockchain...</p>}

            {tx && (
                <p className="mt-4 text-green-600">
                    Registered! TX: {tx}
                </p>
            )}
        </div>
    );
}
