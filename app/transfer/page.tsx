"use client";

import { useState } from "react";
import { transferAsset } from "@/lib/stellar/transferAsset";
import { useWalletStore } from "@/lib/state/walletStore";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import CopyButton from "@/components/ui/CopyButton";

export default function TransferPage() {
    const { publicKey, connected } = useWalletStore();

    const [hash, setHash] = useState("");
    const [receiver, setReceiver] = useState("");
    const [loading, setLoading] = useState(false);
    const [tx, setTx] = useState<string | null>(null);
    const [error, setError] = useState("");

    const handleTransfer = async () => {
        setError("");
        setTx(null);

        if (!connected || !publicKey) {
            setError("Please connect your wallet first.");
            return;
        }

        if (hash.length < 20) {
            setError("Invalid asset fingerprint. Please paste the full SHA-256 hash.");
            return;
        }

        if (receiver.length < 20) {
            setError("Invalid receiver address.");
            return;
        }

        setLoading(true);

        try {
            // Internally slice to 20 chars for the memo
            const safeHash = hash.slice(0, 20);

            const txHash = await transferAsset(publicKey, receiver, safeHash);
            setTx(txHash);
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Transfer failed. Ensure you are the owner.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="max-w-2xl mx-auto py-16 px-6">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">Transfer Ownership</h1>
                <p className="text-neutral-500">
                    Send your digital asset rights to another Stellar wallet.
                </p>
            </div>

            <Card>
                <div className="space-y-6">

                    {/* Asset Input */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Asset Fingerprint
                        </label>
                        <input
                            type="text"
                            placeholder="Paste the full SHA-256 asset hash"
                            value={hash}
                            onChange={(e) => setHash(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all font-mono text-sm"
                        />
                        <p className="text-xs text-neutral-400 mt-1">
                            We will automatically handle the formatting.
                        </p>
                    </div>

                    {/* Receiver Input */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Recipient Address (Public Key)
                        </label>
                        <input
                            type="text"
                            placeholder="G..."
                            value={receiver}
                            onChange={(e) => setReceiver(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all font-mono text-sm"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {/* Button */}
                    <div className="pt-2">
                        <Button
                            variant="primary"
                            className="w-full py-3 text-base"
                            onClick={handleTransfer}
                            loading={loading}
                            disabled={!connected}
                        >
                            {connected ? "Confirm Transfer" : "Connect Wallet to Transfer"}
                        </Button>
                    </div>

                    {/* Success Message */}
                    {tx && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-6 text-center animate-in fade-in zoom-in duration-300">
                            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                ✓
                            </div>
                            <h3 className="text-emerald-900 font-medium mb-1">Transfer Successful!</h3>
                            <p className="text-emerald-700 text-sm mb-2 break-all font-mono text-xs flex items-center justify-center gap-2">
                                TX: {tx}
                                <CopyButton text={tx} className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200" />
                            </p>
                            <p className="text-emerald-600 text-xs">
                                Ownership has been moved to the new wallet.
                            </p>
                        </div>
                    )}

                </div>
            </Card>
        </main>
    );
}
