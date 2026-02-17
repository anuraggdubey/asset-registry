import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

// GET /api/registry/asset?id=123456
// GET /api/registry/asset?id=123456 OR /api/registry/asset?hash=...
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const hash = searchParams.get("hash");

    if (!id && !hash) {
        return NextResponse.json({ error: "Missing ID or Hash" }, { status: 400 });
    }

    try {
        let data: any = null;
        let docId = id;

        if (id) {
            const doc = await adminDb.collection("assets").doc(id).get();
            if (doc.exists) {
                data = doc.data();
            }
        } else if (hash) {
            const snapshot = await adminDb.collection("assets").where("metadataHash", "==", hash).limit(1).get();
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                data = doc.data();
                docId = doc.id;
            }
        }

        if (!data) {
            return NextResponse.json({ error: "Asset not found" }, { status: 404 });
        }

        // Fetch User Profile for current owner
        let ownerProfile = { displayName: "Unknown" };
        if (data.currentKnownOwner) {
            const userDoc = await adminDb.collection("users").doc(data.currentKnownOwner).get();
            if (userDoc.exists) {
                ownerProfile = userDoc.data() as any;
            }
        }

        return NextResponse.json({
            ...data,
            ownerProfile
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
