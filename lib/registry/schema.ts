// lib/registry/schema.ts

export interface UserProfile {
    walletAddress: string;
    displayName: string;
    email?: string;
    createdAt: number;
}

export interface RegistryAsset {
    registeredAssetId: string; // 6-digit unique ID
    assetCode: string;
    issuerPublicKey: string;
    metadataHash: string;
    currentKnownOwner: string; // Cached
    createdAt: number;
    lastVerifiedLedger: number;
    status: 'active' | 'burned' | 'flagged';
}

export interface OwnershipEvent {
    registeredAssetId: string;
    from: string;
    to: string;
    txHash: string;
    ledger: number;
    timestamp: number;
    type: 'MINT' | 'TRANSFER';
}

export interface VerificationLog {
    registeredAssetId: string;
    verifiedOwner: string;
    verifiedAt: number;
    verificationSource: 'live_chain';
}
