import axios from "axios";
import { getRegistryContractId, registerAssetOnContract } from "./registryContract";

export async function registerAsset(userPublicKey: string, hash: string) {
    const assetCode = "ART";
    let registryId;

    try {
        const res = await axios.post("/api/registry/mint", {
            owner: userPublicKey,
            metadataHash: hash,
            assetCode,
            issuerPublicKey: getRegistryContractId(),
        });
        registryId = res.data.registeredAssetId;
    } catch (e) {
        console.error("Registry Mint Failed", e);
        throw new Error("Failed to generate Registry ID");
    }

    if (!registryId) throw new Error("No Registry ID returned");

    const result = await registerAssetOnContract(hash, userPublicKey);

    await axios.post("/api/registry/sync", {
        registeredAssetId: registryId,
        metadataHash: hash,
        txHash: result.txHash,
    });

    return {
        issuer: getRegistryContractId(),
        txHash: result.txHash,
        assetCode,
        registeredAssetId: registryId,
    };
}
