"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { verifyOwnership, OwnershipVerificationResult } from "@/lib/stellar/verifyOwnership";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import CopyButton from "@/components/ui/CopyButton";
import Link from "next/link";
import CertificateGenerator from "@/components/certificate/CertificateGenerator";

export default function VerifyPage() {
    const params = useParams();
    const id = params.id as string;

    const [result, setResult] = useState<OwnershipVerificationResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadVerification();
        }
    }, [id]);

    async function loadVerification() {
        setLoading(true);
        const res = await verifyOwnership(id);
        setResult(res);
        setLoading(false);
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                    <p className="mt-4 text-gray-400 text-sm">Verifying on Stellar Network...</p>
                </div>
            </main>
        );
    }

    if (!result || result.error) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card title="Verification Failed">
                    <div className="text-center py-8">
                        <div className="text-4xl mb-4">❌</div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Asset Not Found</h2>
                        <p className="text-gray-500 mb-6">{result?.error || "Invalid Asset ID"}</p>
                        <Link href="/" className="text-blue-600 hover:underline">Return Home</Link>
                    </div>
                </Card>
            </main>
        );
    }

    const isVerified = result.live.isVerified;
    const isFlagged = result.registry?.status === 'flagged';
    const hasLiveOwner = !!result.live.owner;

    return (
        <main className="min-h-screen bg-neutral-100 py-12 px-4">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Header Badge */}
                <div className="text-center">
                    {isVerified ? (
                        <div className="inline-flex items-center gap-2 bg-green-100 border border-green-200 text-green-800 px-6 py-2 rounded-full font-bold text-lg">
                            <span>✅</span> Verified Ownership
                        </div>
                    ) : hasLiveOwner ? (
                        <div className="inline-flex items-center gap-2 bg-yellow-100 border border-yellow-200 text-yellow-800 px-6 py-2 rounded-full font-bold text-lg">
                            <span>⚠</span> Ownership Mismatch
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-2 bg-red-100 border border-red-200 text-red-800 px-6 py-2 rounded-full font-bold text-lg">
                            <span>❌</span> Verification Failed
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Public Registry Record */}
                    <Card title="Registry Record">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">Registered Asset ID</label>
                                <p className="font-mono text-xl font-bold text-blue-600">{result.registry?.id}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">Registry Owner</label>
                                <p className="text-lg font-medium">{result.registry?.ownerName}</p>
                                <p className="text-xs text-gray-400 font-mono truncate">{result.registry?.cachedOwner}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">Status</label>
                                <div className="mt-1">
                                    <Badge variant={result.registry?.status === 'active' ? 'success' : 'error'}>
                                        {result.registry?.status.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Live Blockchain Data */}
                    <Card title="Live Blockchain Data">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">Blockchain Status</label>
                                <div className="mt-1 flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${hasLiveOwner ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                    <p className="text-sm font-medium">{hasLiveOwner ? "Active Trustline Found" : "No Active Owner"}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">True Owner Address</label>
                                <div className="flex items-center gap-2 mt-1 bg-gray-50 p-2 rounded border border-gray-100">
                                    <p className="font-mono text-xs text-gray-700 break-all">{result.live.owner || "None"}</p>
                                    {result.live.owner && <CopyButton text={result.live.owner} />}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-bold">Issuer Address</label>
                                <p className="font-mono text-xs text-gray-400 break-all mt-1">{result.live.issuer}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Actions */}
                <div className="flex justify-center pb-12">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center gap-4">
                        <h3 className="font-bold text-gray-900">Ownership Tools</h3>
                        {isVerified && result.registry ? (
                            <CertificateGenerator data={{
                                registryId: result.registry.id,
                                assetCode: result.registry.code || "ART",
                                issuer: result.live.issuer,
                                ownerName: result.registry.ownerName,
                                ownerAddress: result.live.owner || "",
                                txHash: "Verified Live", // or fetch from registry history if available
                                issueDate: new Date(result.registry.lastVerified).toLocaleDateString(),
                                verifyUrl: typeof window !== 'undefined' ? window.location.href : ""
                            }} />
                        ) : (
                            <p className="text-sm text-gray-500">Certificate available only for verified owners.</p>
                        )}
                    </div>
                </div>

                {/* Footer / Disclaimer */}
                <div className="text-center text-xs text-gray-400 pb-8">
                    <p>Verified on Stellar Network.</p>
                    <p>Registry ID: {result.registry?.id} • Timestamp: {new Date().toLocaleString()}</p>
                </div>

            </div>
        </main>
    );
}
