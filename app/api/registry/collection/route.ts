import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const owner = searchParams.get("owner");

        if (!owner) {
            return NextResponse.json({ error: "Missing owner parameter" }, { status: 400 });
        }

        // Query Firestore for assets where currentKnownOwner == owner
        // This is much faster and reliable than blockchain history scanning for "My Assets"
        const snapshot = await adminDb.collection("assets")
            .where("currentKnownOwner", "==", owner)
            .get();

        const assets = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json({ assets });
    } catch (error: any) {
        console.error("Collection API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
