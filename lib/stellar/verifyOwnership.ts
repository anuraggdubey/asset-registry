import { getOnChainOwner } from "./ownership";
import axios from "axios";
import { getRegistryContractId } from "./registryContract";

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
        let assetHash = "";

        const isRegistryId = /^\d{6}$/.test(identifier);
        const isHash = !isRegistryId;

        if (isRegistryId) {
            try {
                const res = await axios.get(`/api/registry/asset?id=${identifier}`);
                registryData = res.data;
                assetHash = registryData.metadataHash;
            } catch (e) {
                console.warn("Registry Lookup Failed (ID)", e);
            }
        } else if (isHash) {
            assetHash = identifier;
            try {
                const res = await axios.get(`/api/registry/asset?hash=${identifier}`);
                registryData = res.data;
            } catch (e) {
                console.warn("Registry Lookup Failed (Hash)", e);
            }
        }

        if (!assetHash) {
            return {
                registry: null,
                live: { owner: null, issuer: "", isVerified: false },
                error: "Could not resolve a valid asset fingerprint from the provided identifier."
            };
        }

        const onChainOwner = await getOnChainOwner(assetHash);

        const isVerified = registryData ? (onChainOwner === registryData.currentKnownOwner) : false;

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
                issuer: getRegistryContractId(),
                isVerified: isVerified,
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
