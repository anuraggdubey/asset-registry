"use client";

import { useState } from "react";
import { verifyOwnership } from "@/lib/stellar/verifyOwnership";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import CopyButton from "@/components/ui/CopyButton";

export default function VerifyPage() {

    const [hash, setHash] = useState("");
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleVerify() {
        setError("");
        setResult(null);

        if (hash.length < 5) {
            setError("Please enter a valid asset fingerprint (start or full)");
            return;
        }

        try {
            setLoading(true);
            const res = await verifyOwnership(hash);

            if (!res) {
                setError("No ownership record found for this fingerprint.");
            } else {
                setResult(res);

                // Save to local history
                try {
                    const stored = localStorage.getItem("stellar_verified_assets");
                    let history = stored ? JSON.parse(stored) : [];

                    // Add new item to top, remove duplicates by hash
                    const newItem = { hash, owner: res.owner, timestamp: Date.now() };
                    history = [newItem, ...history.filter((h: any) => h.hash !== hash)].slice(0, 10); // Keep last 10

                    localStorage.setItem("stellar_verified_assets", JSON.stringify(history));
                } catch (e) {
                    console.error("Failed to save local history", e);
                }
            }

        } catch (e) {
            console.error(e);
            setError("Verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="max-w-2xl mx-auto py-16 px-6">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">Verify Ownership</h1>
                <p className="text-neutral-500">
                    Check the authenticity and current owner of any digital asset.
                </p>
            </div>

            <Card className="mb-8">
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Paste Asset Fingerprint (SHA-256)..."
                        value={hash}
                        onChange={(e) => setHash(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all"
                        onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                    />
                    <Button
                        onClick={handleVerify}
                        loading={loading}
                        variant="primary"
                    >
                        Verify
                    </Button>
                </div>
                {error && (
                    <p className="text-red-600 text-sm mt-3 bg-red-50 p-2 rounded border border-red-100">
                        {error}
                    </p>
                )}
            </Card>

            {result && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card title="Verification Result" className="border-t-4 border-t-emerald-500">

                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-neutral-900">Valid Ownership Record</h3>
                                <p className="text-sm text-neutral-500">This asset is registered on the Stellar network.</p>
                            </div>
                            <Badge variant="success">✓ Verified</Badge>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-md">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-xs text-neutral-500 uppercase font-semibold">Current Owner</p>
                                    <CopyButton text={result.owner} />
                                </div>
                                <p className="font-mono text-sm break-all text-neutral-900">{result.owner}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-md">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-xs text-neutral-500 uppercase font-semibold">Last Transaction</p>
                                        <CopyButton text={result.txHash} />
                                    </div>
                                    <p className="font-mono text-xs break-all text-neutral-700">{result.txHash}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-md">
                                    <p className="text-xs text-neutral-500 uppercase font-semibold mb-1">Status</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        <span className="text-sm text-neutral-700">Active</span>
                                        {result.cached && (
                                            <span className="text-xs text-gray-400 ml-auto">(Cached)</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <Link href={`/asset/${hash}`}>
                                <Button variant="outline" className="text-xs">
                                    View Full History →
                                </Button>
                            </Link>
                        </div>

                    </Card>
                </div>
            )}
        </main>
    );
}
