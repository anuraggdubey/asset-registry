import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getOnChainOwner } from "@/lib/stellar/ownership";
// We need a server-side version of getOnChainOwner or ensure it works here? yes it uses 'server' which is stellar-sdk.

export async function POST(req: NextRequest) {
    try {
        const { registeredAssetId, txHash } = await req.json();

        if (!registeredAssetId) {
            return NextResponse.json({ error: "Missing Asset ID" }, { status: 400 });
        }

        // 1. Get Asset Record
        const assetRef = adminDb.collection("assets").doc(registeredAssetId);
        const assetSnap = await assetRef.get();

        if (!assetSnap.exists) {
            return NextResponse.json({ error: "Asset not found in registry" }, { status: 404 });
        }

        const assetData = assetSnap.data()!;

        // 2. Verify On-Chain (Strict)
        // We use the stored Issuer/Code to check real ownership on Stellar
        const realOwner = await getOnChainOwner(assetData.assetCode, assetData.issuerPublicKey);

        if (!realOwner) {
            // Asset might be burned or trustline removed
            await assetRef.update({ status: "flagged" });
            return NextResponse.json({ status: "flagged", message: "No on-chain owner found" });
        }

        // 3. Update Registry
        await assetRef.update({
            currentKnownOwner: realOwner,
            lastVerifiedLedger: Date.now() // Ideally fetch ledger seq from tx
        });

        // 4. Log Verification
        await adminDb.collection("verification_logs").add({
            registeredAssetId: registeredAssetId,
            verifiedOwner: realOwner,
            verifiedAt: Date.now(),
            verificationSource: "live_chain",
            triggerTx: txHash || "manual_sync"
        });

        // 5. Update User Profile (if new owner)
        await adminDb.collection("users").doc(realOwner).set({
            walletAddress: realOwner,
            createdAt: Date.now() // only if new
        }, { merge: true });

        return NextResponse.json({
            success: true,
            owner: realOwner,
            verified: true
        });

    } catch (error: any) {
        console.error("Sync API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
