import { getOnChainOwner } from "./ownership";
import axios from "axios";
import { StrKey } from "@stellar/stellar-sdk";

export interface OwnershipVerificationResult {
    registry: {
        id: string;
        metadataHash: string;
        cachedOwner: string;
        ownerName: string;
        status: string;
        lastVerified: number;
        code: string;
        issuer: string;
    } | null;
    live: {
        owner: string | null;
        issuer: string;
        isVerified: boolean;
    };
    error?: string;
}

export async function verifyOwnership(identifier: string): Promise<OwnershipVerificationResult> {
    try {
        let registryData = null;
        let issuerPublicKey = "";
        let assetCode = "ART"; // Default

        // Detect Identifier Type
        const isRegistryId = /^\d{6}$/.test(identifier);
        const isStellarKey = StrKey.isValidEd25519PublicKey(identifier);
        // Assume anything else might be a Hash if it's not a key and not an ID
        const isHash = !isRegistryId && !isStellarKey;

        if (isRegistryId) {
            // 1. Fetch by ID
            try {
                const res = await axios.get(`/api/registry/asset?id=${identifier}`);
                registryData = res.data;
                issuerPublicKey = registryData.issuerPublicKey;
                assetCode = registryData.assetCode;
            } catch (e) {
                console.warn("Registry Lookup Failed (ID)", e);
            }
        } else if (isHash) {
            // 1. Fetch by Hash
            try {
                const res = await axios.get(`/api/registry/asset?hash=${identifier}`);
                registryData = res.data;
                issuerPublicKey = registryData.issuerPublicKey;
                assetCode = registryData.assetCode;
            } catch (e) {
                console.warn("Registry Lookup Failed (Hash)", e);
            }
        }

        if (!isRegistryId && !isHash && isStellarKey) {
            // Identifier IS the issuer
            issuerPublicKey = identifier;
        }

        // If we still don't have an issuer (e.g. Hash lookup failed), we can't verify on-chain.
        if (!issuerPublicKey || !StrKey.isValidEd25519PublicKey(issuerPublicKey)) {
            return {
                registry: null,
                live: { owner: null, issuer: "", isVerified: false },
                error: "Could not resolve valid Asset Issuer from identifiers."
            };
        }

        // 2. Fetch Real On-Chain Owner (Source of Truth)
        const onChainOwner = await getOnChainOwner(assetCode, issuerPublicKey);

        // 3. Determine Verification Status
        const isVerified = registryData ? (onChainOwner === registryData.currentKnownOwner) : false;

        // 4. Return Hybrid Data
        return {
            registry: registryData ? {
                id: registryData.registeredAssetId,
                metadataHash: registryData.metadataHash,
                cachedOwner: registryData.currentKnownOwner,
                ownerName: registryData.ownerProfile?.displayName || "Anonymous",
                status: registryData.status,
                lastVerified: registryData.lastVerifiedLedger,
                code: registryData.assetCode,
                issuer: registryData.issuerPublicKey
            } : null,
            live: {
                owner: onChainOwner,
                issuer: issuerPublicKey,
                isVerified: isVerified,
                // We could infer type here, but getOnChainOwner abstracts it.
                // For now, let's just trust the owner string.
            }
        };

    } catch (e: any) {
        console.error("Verification Error", e);
        return {
            registry: null,
            live: { owner: null, issuer: "", isVerified: false },
            error: e.message || "Verification Failed"
        };
    }
}
