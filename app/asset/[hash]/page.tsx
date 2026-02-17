"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { verifyOwnership } from "@/lib/stellar/verifyOwnership";
import { transferAsset } from "@/lib/stellar/transferAsset";
import { useWalletStore } from "@/lib/state/walletStore";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import CopyButton from "@/components/ui/CopyButton";
import IdentityBar from "@/components/ui/IdentityBar";
import CertificateGenerator from "@/components/certificate/CertificateGenerator";

export default function AssetPage() {
    const params = useParams();
    // In our new model, the 'ID' in the URL is the Issuer Public Key
    const assetId = params.hash as string;
    const { publicKey, connected } = useWalletStore();

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [transferLoading, setTransferLoading] = useState(false);
    const [receiver, setReceiver] = useState("");
    const [transferTx, setTransferTx] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [assetId]);

    async function loadData() {
        setLoading(true);
        // assetId here acts as the Issuer (or Registry ID if URL updated)
        const res = await verifyOwnership(assetId);
        setData(res);
        setLoading(false);
    }

    async function handleTransfer() {
        if (!publicKey || !receiver) return;
        setError(null);

        // Calculate Target Issuer
        const targetIssuer = data?.live?.issuer || assetId;
        console.log("Transfer Request:", { publicKey, receiver, targetIssuer });

        // Basic Validation
        if (targetIssuer.length !== 56 || !targetIssuer.startsWith("G")) {
            setError("Invalid Asset Issuer. Cannot transfer this asset (Issuer Not Resolved).");
            return;
        }

        setTransferLoading(true);
        try {
            const tx = await transferAsset(publicKey, receiver, targetIssuer);
            setTransferTx(tx);
            // Reload data
            setTimeout(() => loadData(), 5000);
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Transfer failed");
        }
        setTransferLoading(false);
    }

    if (loading) {
        return (
            <main className="max-w-4xl mx-auto py-16 px-6 text-center">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 w-1/3 mx-auto rounded"></div>
                    <div className="h-4 bg-gray-200 w-1/4 mx-auto rounded"></div>
                </div>
            </main>
        );
    }

    const liveOwner = data?.live?.owner;
    const registryInfo = data?.registry;

    if (!liveOwner && !registryInfo) {
        return (
            <main className="max-w-4xl mx-auto py-16 px-6 text-center">
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">Asset Not Found</h1>
                <p className="text-neutral-500">
                    No active trustline found for this Asset ID.
                </p>
                <p className="text-xs text-gray-400 mt-2">ID: {assetId}</p>
            </main>
        );
    }

    // Debugging Ownership
    console.log("Ownership Check:", { publicKey, liveOwner });

    // Case-insensitive comparison
    const isOwner = publicKey && liveOwner && (publicKey.toLowerCase() === liveOwner.toLowerCase());

    return (
        <main className="max-w-5xl mx-auto py-16 px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Asset Details */}
            <div className="lg:col-span-2 space-y-6">
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-neutral-900">Digital Asset</h1>
                        {registryInfo ? (
                            <Badge variant="success">Registered</Badge>
                        ) : (
                            <Badge variant="warning">Legacy / Unregistered</Badge>
                        )}
                    </div>

                    {registryInfo && (
                        <div className="mb-4 bg-blue-50 p-3 rounded border border-blue-100">
                            <p className="text-xs text-blue-500 uppercase font-bold">Registry ID</p>
                            <p className="text-xl font-bold text-blue-800">{registryInfo.id}</p>
                        </div>
                    )}

                    <div className="space-y-1">
                        <p className="text-xs text-gray-500 uppercase font-bold">Issuer ID</p>
                        <div className="flex items-center gap-2">
                            <p className="font-mono text-xs text-neutral-600 break-all">{data?.live?.issuer || assetId}</p>
                            <CopyButton text={data?.live?.issuer || assetId} />
                        </div>
                    </div>

                    {registryInfo && (
                        <div className="mt-4 space-y-1">
                            <p className="text-xs text-gray-500 uppercase font-bold">Metadata Hash</p>
                            <p className="font-mono text-sm text-neutral-900 break-all">{registryInfo.metadataHash}</p>
                        </div>
                    )}
                </div>

                <Card title="Ownership Status">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-xl text-blue-600">
                            🛡️
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-xs text-neutral-500 uppercase font-semibold">True On-Chain Owner</p>
                                <CopyButton text={liveOwner || "None"} />
                            </div>
                            <p className="font-mono text-neutral-900 text-sm break-all">{liveOwner || "No Active Owner"}</p>
                        </div>
                    </div>

                    {!isOwner && (
                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm text-yellow-800">
                            <p className="font-bold">⚠ You are not the active owner.</p>
                            <p className="text-xs mt-1">
                                Current Owner: {liveOwner ? liveOwner.slice(0, 6) + "..." + liveOwner.slice(-6) : "None"} <br />
                                Your Wallet: {publicKey ? publicKey.slice(0, 6) + "..." + publicKey.slice(-6) : "Not Connected"}
                            </p>
                        </div>
                    )}
                </Card>
            </div>

            {/* Right Column: Actions */}
            <div className="space-y-6">
                <Card title="Actions">
                    {isOwner ? (
                        <div className="space-y-4">
                            <div className="bg-green-50 p-3 rounded-md border border-green-100 mb-4">
                                <p className="text-xs text-green-800 font-medium">
                                    ✅ You are the verified owner.
                                </p>
                            </div>

                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Transfer Ownership
                            </label>

                            <div className="space-y-2 mb-4">
                                <IdentityBar
                                    label="From (You)"
                                    address={publicKey || ""}
                                    type="sender"
                                />

                                <div className="flex justify-center -my-2 relative z-10">
                                    <div className="bg-gray-100 rounded-full p-1 border border-gray-200 text-gray-400">
                                        ⬇
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">To (Recipient)</p>
                                    <input
                                        type="text"
                                        placeholder="Recipient Public Key (G...)"
                                        value={receiver}
                                        onChange={(e) => setReceiver(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-3 text-sm outline-none focus:border-black font-mono shadow-sm"
                                    />
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400">
                                Note: Limits range of 0.0000001 XLM will be reserved for the claimable balance.
                            </p>

                            {error && (
                                <p className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded">
                                    {error}
                                </p>
                            )}

                            <Button
                                variant="primary"
                                className="w-full"
                                onClick={handleTransfer}
                                loading={transferLoading}
                            >
                                Transfer Securely
                            </Button>

                            {transferTx && (
                                <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded text-xs text-green-700 break-all space-y-2">
                                    <p>Success! TX: {transferTx}</p>
                                    <CertificateGenerator
                                        data={{
                                            type: "TRANSFER",
                                            registryId: registryInfo?.id || "N/A",
                                            assetCode: registryInfo?.code || "ART",
                                            issuer: data?.live?.issuer,
                                            ownerName: "Recipient",
                                            ownerAddress: receiver,
                                            senderAddress: publicKey || "",
                                            txHash: transferTx,
                                            issueDate: new Date().toISOString(),
                                            verifyUrl: window.location.href
                                        }}
                                    />
                                </div>
                            )}

                            {/* Owner Certificate */}
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <h3 className="text-sm font-medium text-gray-900 mb-3">Documents</h3>
                                <CertificateGenerator
                                    data={{
                                        type: "OWNERSHIP",
                                        registryId: registryInfo?.id || "N/A",
                                        assetCode: registryInfo?.code || "ART",
                                        issuer: data?.live?.issuer,
                                        ownerName: "Verified Owner",
                                        ownerAddress: publicKey!,
                                        txHash: "Verified On-Chain", // We might not have the original mint TX handy here easily without more queries
                                        issueDate: new Date().toISOString(),
                                        verifyUrl: window.location.href
                                    }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-neutral-500 text-sm">
                            <p className="mb-2">View Only Mode</p>
                            {connected ? (
                                <p className="text-xs text-neutral-400 break-all">Your wallet: {publicKey?.slice(0, 6)}...</p>
                            ) : (
                                <Button variant="secondary" onClick={() => { }} className="w-full">
                                    Connect Wallet
                                </Button>
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </main>
    );
}
