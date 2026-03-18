import { getContractOwner } from "./registryContract";

export async function getOnChainOwner(assetHash: string): Promise<string | null> {
    try {
        return await getContractOwner(assetHash);
    } catch (e) {
        console.error("Error resolving on-chain owner:", e);
        return null;
    }
}
