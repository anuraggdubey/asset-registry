import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getOnChainOwner } from "@/lib/stellar/ownership";
// We need a server-side version of getOnChainOwner or ensure it works here? yes it uses 'server' which is stellar-sdk.

export async function POST(req: NextRequest) {
    try {
        const { registeredAssetId, metadataHash, txHash } = await req.json();

        if (!registeredAssetId && !metadataHash) {
            return NextResponse.json({ error: "Missing Asset ID or hash" }, { status: 400 });
        }

        let assetRef;
        let assetSnap;

        if (registeredAssetId) {
            assetRef = adminDb.collection("assets").doc(registeredAssetId);
            assetSnap = await assetRef.get();
        } else {
            const snapshot = await adminDb.collection("assets")
                .where("metadataHash", "==", metadataHash)
                .limit(1)
                .get();

            if (snapshot.empty) {
                return NextResponse.json({ error: "Asset not found in registry" }, { status: 404 });
            }

            assetRef = snapshot.docs[0].ref;
            assetSnap = snapshot.docs[0];
        }

        if (!assetSnap.exists) {
            return NextResponse.json({ error: "Asset not found in registry" }, { status: 404 });
        }

        const assetData = assetSnap.data()!;

        const realOwner = await getOnChainOwner(assetData.metadataHash);

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
            registeredAssetId: assetData.registeredAssetId || assetRef.id,
            verifiedOwner: realOwner,
            verifiedAt: Date.now(),
            verificationSource: "soroban_contract",
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
