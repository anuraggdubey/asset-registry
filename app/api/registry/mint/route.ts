import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { generateUniqueAssetId } from "@/lib/registry/idGenerator";

export async function POST(req: NextRequest) {
    try {
        const { assetCode, issuerPublicKey, metadataHash, owner } = await req.json();

        if (!issuerPublicKey || !owner) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Generate ID
        const registryId = await generateUniqueAssetId();

        // 2. Create Pending Record
        await adminDb.collection("assets").doc(registryId).set({
            registeredAssetId: registryId,
            assetCode: assetCode || "ART",
            issuerPublicKey: issuerPublicKey,
            metadataHash: metadataHash || "",
            currentKnownOwner: owner,
            createdAt: Date.now(),
            lastVerifiedLedger: 0,
            status: "active"
        });

        // 3. Create User Profile if not exists
        await adminDb.collection("users").doc(owner).set({
            walletAddress: owner,
            displayName: "Anonymous User", // Can be updated later
            createdAt: Date.now()
        }, { merge: true });

        return NextResponse.json({ registeredAssetId: registryId });

    } catch (error: any) {
        console.error("Mint API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
