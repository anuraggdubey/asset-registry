"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { verifyOwnership } from "@/lib/stellar/verifyOwnership";
import { transferAsset } from "@/lib/stellar/transferAsset";
import { useWalletStore } from "@/lib/state/walletStore";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Timeline } from "@/components/ui/Timeline";
import CopyButton from "@/components/ui/CopyButton";
import DownloadCertificateButton from "@/components/certificate/DownloadCertificateButton";

export default function AssetPage() {
    const params = useParams();
    const hash = params.hash as string;
    const { publicKey, connected } = useWalletStore();

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [transferLoading, setTransferLoading] = useState(false);
    const [receiver, setReceiver] = useState("");
    const [transferTx, setTransferTx] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [hash]);

    async function loadData(skipCache = false) {
        setLoading(true);
        const res = await verifyOwnership(hash, skipCache);
        setData(res);
        setLoading(false);
    }

    async function handleTransfer() {
        if (!publicKey || !receiver) return;

        setTransferLoading(true);
        try {
            // Check if hash is valid (handling the slice logic safely)
            const safeHash = hash.slice(0, 20);
            const tx = await transferAsset(publicKey, receiver, safeHash);
            setTransferTx(tx);
            // Reload data to show new owner (might need a delay for network propagation in real app)
            setTimeout(() => loadData(true), 4000);
        } catch (e) {
            console.error(e);
            alert("Transfer failed. Check console.");
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

    if (!data) {
        return (
            <main className="max-w-4xl mx-auto py-16 px-6 text-center">
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">Asset Not Found</h1>
                <p className="text-neutral-500">
                    The fingerprint <span className="font-mono text-sm bg-gray-100 p-1 rounded">{hash.slice(0, 10)}...</span> is not registered on the Stellar network.
                </p>
            </main>
        );
    }

    const isOwner = publicKey === data.owner;

    return (
        <main className="max-w-5xl mx-auto py-16 px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Asset Details */}
            <div className="lg:col-span-2 space-y-6">
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-neutral-900">Digital Asset</h1>
                        <Badge variant="success">Active</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="font-mono text-xs text-neutral-400 break-all">{hash}</p>
                        <CopyButton text={hash} />
                    </div>
                </div>

                <Card title="Ownership Status">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                            👤
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-xs text-neutral-500 uppercase font-semibold">Current Owner</p>
                                <CopyButton text={data.owner} />
                            </div>
                            <p className="font-mono text-neutral-900 text-sm break-all">{data.owner}</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <h4 className="text-sm font-semibold text-neutral-900 mb-4">Activity History</h4>
                        <Timeline>
                            {/* Render Full History if available, otherwise just latest */}
                            {data.history ? (
                                data.history.map((event: any, idx: number) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="w-24 text-right pt-1">
                                            <span className="text-xs text-gray-500 font-mono">
                                                {new Date(event.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="relative flex flex-col items-center">
                                            <div className={`
                                                w-3 h-3 rounded-full z-10 border-2 border-white ring-1 ring-gray-200
                                                ${event.type === 'REGISTER' ? 'bg-purple-600' : 'bg-neutral-900'}
                                            `}></div>
                                            {/* Line connector */}
                                            {idx < data.history.length - 1 && (
                                                <div className="w-0.5 h-full bg-gray-200 absolute top-3"></div>
                                            )}
                                        </div>
                                        <div className="pb-8 pt-0.5">
                                            <h4 className="text-sm font-medium text-gray-900">
                                                {event.type === 'REGISTER' ? 'Asset Registered' : 'Ownership Transferred'}
                                            </h4>
                                            <div className="text-xs text-gray-500 mt-1">
                                                <span className="font-semibold">{event.type === 'REGISTER' ? 'Creator' : 'To'}:</span> {event.owner.slice(0, 8)}...
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 font-mono break-all flex items-center gap-2">
                                                TX: {event.txHash.slice(0, 8)}...
                                                <CopyButton text={event.txHash} />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex gap-4">
                                    <div className="w-24 text-right pt-1">
                                        <span className="text-xs text-gray-500 font-mono">Latest</span>
                                    </div>
                                    <div className="relative flex flex-col items-center">
                                        <div className="w-3 h-3 bg-neutral-900 rounded-full z-10 border-2 border-white ring-1 ring-gray-200"></div>
                                    </div>
                                    <div className="pb-8 pt-0.5">
                                        <h4 className="text-sm font-medium text-gray-900">Ownership Confirmed</h4>
                                        <div className="text-xs text-gray-500 mt-1 font-mono break-all flex items-center gap-2">
                                            TX: {data.txHash}
                                            <CopyButton text={data.txHash} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Timeline>
                    </div>
                </Card>
            </div>

            {/* Right Column: Actions */}
            <div className="space-y-6">
                <Card title="Actions">
                    {/* Sticky behavior removed for simplicity in Card component */}
                    {isOwner ? (
                        <div className="space-y-4">
                            <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mb-4">
                                <p className="text-xs text-blue-800 font-medium mb-2">
                                    You are the verified owner of this asset.
                                </p>
                                <DownloadCertificateButton
                                    data={{
                                        certificateId: `${hash.slice(0, 8).toUpperCase()}-${Date.now().toString().slice(-6)}`,
                                        assetHash: hash.slice(0, 20) + "...",
                                        fullFingerprint: hash,
                                        ownerAddress: publicKey!,
                                        txHash: data.txHash,
                                        timestamp: new Date().toLocaleString() // Ideally from blockchain timestamp
                                    }}
                                />
                            </div>

                            <label className="block text-sm font-medium text-neutral-700 mb-1">
                                Transfer Ownership
                            </label>
                            <input
                                type="text"
                                placeholder="Recipient Public Key (G...)"
                                value={receiver}
                                onChange={(e) => setReceiver(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all"
                            />
                            <Button
                                variant="primary"
                                className="w-full"
                                onClick={handleTransfer}
                                loading={transferLoading}
                            >
                                Transfer Asset
                            </Button>

                            {transferTx && (
                                <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded text-xs text-green-700 break-all">
                                    Transfer initiated! TX: {transferTx}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-neutral-500 text-sm">
                            <p className="mb-2">You are not the owner.</p>
                            {connected ? (
                                <p className="text-xs text-neutral-400 break-all">Current: {publicKey?.slice(0, 6)}...</p>
                            ) : (
                                <p className="text-xs bg-gray-100 py-1 px-2 rounded inline-block">Connect wallet to interact</p>
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </main>
    );
}
