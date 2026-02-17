import { server } from "./server";
import { Asset } from "@stellar/stellar-sdk";

export async function getOnChainOwner(assetCode: string, issuerPublicKey: string): Promise<string | null> {
    try {
        const asset = new Asset(assetCode, issuerPublicKey);

        // Find accounts that hold this asset
        const response = await server.accounts()
            .forAsset(asset)
            .limit(10) // Assuming NFT, should be 1. If fractional, we might see more.
            .call();

        // Filter for balance > 0
        // (Horizon returns all trustlines, even with 0 balance, so we must check)
        const owners = response.records.filter((record: any) => {
            const balanceLine = record.balances.find((b: any) =>
                b.asset_code === assetCode && b.asset_issuer === issuerPublicKey
            );
            return balanceLine && parseFloat(balanceLine.balance) > 0;
        });

        if (owners.length > 0) {
            return owners[0].id; // Active Owner found
        }

        // If no active owner, check for Pending Claimable Balances
        // (This happens when an asset is transferred to a user without a trustline)
        const cbResponse = await server.claimableBalances()
            .asset(asset)
            .limit(1)
            .call();

        if (cbResponse.records.length > 0) {
            // Found a pending claimable balance.
            // The "Owner" is effectively the Claimant (Destination)
            const claimants = cbResponse.records[0].claimants;
            if (claimants.length > 0) {
                return claimants[0].destination;
            }
        }

        return null; // Burned or not found
    } catch (e) {
        console.error("Error resolving on-chain owner:", e);
        return null;
    }
}
