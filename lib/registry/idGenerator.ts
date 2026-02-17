// lib/registry/idGenerator.ts
import { db } from "../firebase/config"; // Client side or Admin side? 
// Actually, ID generation should happen on server side (Admin) to ensure uniqueness check is authoritarian.
import { adminDb } from "../firebase/admin";

export async function generateUniqueAssetId(): Promise<string> {
    const chars = "0123456789"; // 6 Digit Numeric as requested
    let isUnique = false;
    let newId = "";

    // Retrying a few times in case of collision
    // 1 Million combinations is small, but for this DApp scale it's fine. 
    // If it fills up, we'd need more digits.
    let attempts = 0;
    while (!isUnique && attempts < 10) {
        newId = "";
        for (let i = 0; i < 6; i++) {
            newId += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Check collision in Firestore
        // Using "assets" collection
        const snapshot = await adminDb.collection("assets").where("registeredAssetId", "==", newId).get();

        if (snapshot.empty) {
            isUnique = true;
        }
        attempts++;
    }

    if (!isUnique) {
        throw new Error("Failed to generate unique ID after 10 attempts. Registry might be full.");
    }

    return newId;
}
