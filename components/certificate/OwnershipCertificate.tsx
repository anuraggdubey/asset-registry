import React from 'react';

interface OwnershipCertificateProps {
    certificateId: string;
    assetHash: string;
    fullFingerprint: string;
    ownerAddress: string;
    previousOwner?: string;
    txHash: string;
    timestamp: string;
}

export const OwnershipCertificate = React.forwardRef<HTMLDivElement, OwnershipCertificateProps>(
    ({ certificateId, assetHash, fullFingerprint, ownerAddress, previousOwner, txHash, timestamp }, ref) => {
        return (
            <div
                ref={ref}
                className="w-[800px] h-[1132px] bg-white text-black p-16 flex flex-col justify-between font-serif relative border border-gray-200 shadow-xl mx-auto"
                style={{ fontFamily: "'Times New Roman', serif" }} // Ensure serif for reliability in PDF
            >
                {/* Watermark / Background Texture (Optional) */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center">
                    <div className="w-96 h-96 rounded-full border-[20px] border-black"></div>
                </div>

                {/* 1. Header */}
                <div className="text-center border-b-2 border-black pb-8">
                    <h1 className="text-4xl font-bold tracking-widest uppercase mb-2">
                        Certificate OF Digital Asset Ownership
                    </h1>
                    <p className="text-sm tracking-widest uppercase text-gray-600">
                        Blockchain-verified proof of authenticity recorded on Stellar Network
                    </p>
                </div>

                {/* Content Container */}
                <div className="flex-1 py-12 space-y-12">

                    {/* Registry Info */}
                    <div className="flex justify-between items-end text-sm">
                        <div>
                            <p className="font-bold uppercase tracking-wider">Stellar Asset Registry</p>
                            <p className="text-gray-500">Decentralized Verification Protocol</p>
                        </div>
                        <div className="text-right">
                            <p className="font-mono text-xs">CERTIFICATE ID: {certificateId}</p>
                            <p className="font-mono text-xs">ISSUE DATE: {new Date().toISOString().split('T')[0]}</p>
                            <p className="font-bold text-black mt-1">STATUS: VERIFIED</p>
                        </div>
                    </div>

                    {/* 2. Asset Information */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-4">
                            Asset Information
                        </h3>
                        <div className="grid grid-cols-2 gap-y-4 text-sm">
                            <div>
                                <p className="text-gray-500 text-xs uppercase">Asset Identifier</p>
                                <p className="font-mono font-bold">{assetHash}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs uppercase">Registration Time</p>
                                <p className="font-mono">{timestamp}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-gray-500 text-xs uppercase">Full SHA-256 Fingerprint</p>
                                <p className="font-mono text-xs break-all bg-gray-50 p-2 border border-gray-100 mt-1">
                                    {fullFingerprint}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 3. Ownership Information */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-4">
                            Ownership Record
                        </h3>
                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="text-gray-500 text-xs uppercase">Registered Owner (Wallet Address)</p>
                                <p className="font-mono text-lg font-bold break-all bg-gray-50 p-3 border border-gray-100 mt-1">
                                    {ownerAddress}
                                </p>
                            </div>
                            {previousOwner && (
                                <div>
                                    <p className="text-gray-500 text-xs uppercase">Acquired From</p>
                                    <p className="font-mono text-xs text-gray-600">{previousOwner}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4. Blockchain Verification */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-4">
                            Blockchain Proof
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                            <div>
                                <p className="text-gray-500 uppercase">Network</p>
                                <p>Stellar Testnet</p>
                            </div>
                            <div>
                                <p className="text-gray-500 uppercase">Verification Method</p>
                                <p>Public Ledger Scan</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-gray-500 uppercase">Transaction Hash</p>
                                <p className="break-all">{txHash}</p>
                            </div>
                        </div>
                    </div>

                    {/* 6. Declaration */}
                    <div className="mt-8 p-6 border border-gray-300 bg-gray-50 text-justify text-sm leading-relaxed italic">
                        “This document certifies that the above wallet address is the recorded owner of the specified digital asset fingerprint according to publicly verifiable blockchain data. The registry does not store the asset itself, only its cryptographic identity.”
                    </div>
                </div>

                {/* 7. Footer */}
                <div className="border-t-2 border-black pt-6 flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-wider">
                    <div>
                        <p>Generated by Stellar Asset Registry</p>
                        <p>Not a legal contract • Cryptographic Proof Record</p>
                    </div>
                    <div className="text-right">
                        <p>{new Date().toUTCString()}</p>
                        <div className="w-24 h-8 bg-black mt-2"></div> {/* Placeholder for barcode/stamp style */}
                    </div>
                </div>
            </div>
        );
    }
);

OwnershipCertificate.displayName = "OwnershipCertificate";
