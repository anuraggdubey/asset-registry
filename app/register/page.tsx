"use client";

import { useState } from "react";
import { hashFile } from "@/lib/crypto/hash";
import { registerAsset } from "@/lib/stellar/registerAsset";
import { useWalletStore } from "@/lib/state/walletStore";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import CopyButton from "@/components/ui/CopyButton";
import IdentityBar from "@/components/ui/IdentityBar";

export default function RegisterPage() {
    const { publicKey, connected } = useWalletStore();

    const [file, setFile] = useState<File | null>(null);
    const [hash, setHash] = useState<string | null>(null);
    const [tx, setTx] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;

        const f = e.target.files[0];
        setFile(f);
        setTx(null); // reset

        // Calculate hash
        setLoading(true);
        const fileHash = await hashFile(f);
        setHash(fileHash);
        setLoading(false);
    };

    const registerOnChain = async () => {
        if (!hash || !publicKey) return;

        setLoading(true);
        try {
            const result = await registerAsset(publicKey, hash);
            setTx(result.txHash);
        } catch (error) {
            console.error(error);
            alert("Registration failed");
        }
        setLoading(false);
    };

    return (
        <main className="max-w-2xl mx-auto py-16 px-6">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                    Register Asset
                </h1>
                <p className="text-neutral-500">
                    Create a permanent record of ownership on the Stellar network.
                </p>
            </div>

            <Card className="overflow-hidden">
                {!file ? (
                    <div
                        className={`
                            border-2 border-dashed rounded-lg p-12 text-center transition-colors
                            ${isHovering ? "border-neutral-400 bg-gray-50" : "border-gray-200"}
                        `}
                        onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
                        onDragLeave={() => setIsHovering(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsHovering(false);
                            if (e.dataTransfer.files[0]) {
                                // Manual trigger for drop not implemented for brevity, 
                                // relying on input click
                            }
                        }}
                    >
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <p className="text-neutral-900 font-medium mb-1">
                            Click to upload a file
                        </p>
                        <p className="text-sm text-neutral-500 mb-6">
                            Any file type (Image, PDF, Audio)
                        </p>
                        <input
                            type="file"
                            onChange={handleFile}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* File Preview Header */}
                        <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-500">
                                    📄
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-medium text-neutral-900">{file.name}</p>
                                    <p className="text-xs text-neutral-500">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                            </div>
                            <Button variant="ghost" className="text-xs" onClick={() => { setFile(null); setHash(null); }}>
                                Change
                            </Button>
                        </div>

                        {/* Fingerprint Display */}
                        <div className="bg-gray-50 rounded-md p-4 text-left">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">
                                    SHA-256 Fingerprint
                                </p>
                                {hash && <CopyButton text={hash} />}
                            </div>
                            <p className="font-mono text-xs text-neutral-700 break-all select-all">
                                {hash || "Calculating..."}
                            </p>
                        </div>

                        {/* Action Area */}
                        {!tx ? (
                            <div className="mt-8">
                                {!connected ? (
                                    <div className="bg-amber-50 border border-amber-100 rounded-md p-4 text-sm text-amber-800">
                                        Please connect your wallet to register this asset.
                                    </div>
                                ) : (
                                    <div className="flex justify-end">
                                        <div className="w-full mb-4">
                                            <IdentityBar
                                                label="Owner (You)"
                                                address={publicKey || ""}
                                                type="sender"
                                            />
                                        </div>
                                        <Button
                                            loading={loading}
                                            onClick={registerOnChain}
                                            variant="primary"
                                        >
                                            Sign & Register
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-6 text-center">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    ✓
                                </div>
                                <h3 className="text-emerald-900 font-medium mb-1">Registration Complete</h3>
                                <p className="text-emerald-700 text-sm mb-6 flex items-center justify-center gap-2">
                                    Transaction confirmed.
                                    {tx && <CopyButton text={tx} className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200" />}
                                </p>
                                <div className="flex justify-center gap-3">
                                    <Link href={`/asset/${hash}`}>
                                        <Button variant="secondary">View Asset</Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </main>
    );
}
