import axios from "axios";
import { StrKey } from "@stellar/stellar-sdk";
import { getOnChainOwner } from "./ownership";
import { transferAssetOnContract } from "./registryContract";

export async function transferAsset(
    senderPublicKey: string,
    receiverPublicKey: string,
    assetHash: string
) {
    console.log("transferAsset initiating", { senderPublicKey, receiverPublicKey, assetHash });

    if (!StrKey.isValidEd25519PublicKey(senderPublicKey)) throw new Error("Invalid Sender Public Key");
    if (!StrKey.isValidEd25519PublicKey(receiverPublicKey)) throw new Error("Invalid Receiver Public Key");
    if (assetHash.length < 20) throw new Error("Invalid Asset Hash");

    try {
        const currentOwner = await getOnChainOwner(assetHash);
        console.log("Current On-Chain Owner:", currentOwner);

        if (currentOwner !== senderPublicKey) {
            throw new Error(`SECURITY BLOCK: You are not the current blockchain owner of this asset. Current: ${currentOwner}, You: ${senderPublicKey}`);
        }

        const result = await transferAssetOnContract(assetHash, senderPublicKey, receiverPublicKey);

        await axios.post("/api/registry/sync", {
            metadataHash: assetHash,
            txHash: result.txHash,
        });

        console.log("Transfer (Contract) Success:", result.txHash);
        return result.txHash;
    } catch (e: any) {
        console.error("transferAsset Failed:", e);
        throw e;
    }
}
