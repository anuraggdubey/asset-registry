// lib/firebase/admin.ts
import * as admin from "firebase-admin";

// Validate server-side Firebase Admin env vars (these are NOT prefixed NEXT_PUBLIC_
// and are never sent to the browser).
const REQUIRED_ADMIN_VARS = [
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
] as const;

const missingAdmin = REQUIRED_ADMIN_VARS.filter((key) => !process.env[key]);
if (missingAdmin.length > 0) {
    throw new Error(
        `Firebase Admin SDK is missing required server env vars:\n  ${missingAdmin.join("\n  ")}\n` +
        `Add them to .env.local. Never prefix these with NEXT_PUBLIC_.`
    );
}

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Replace \n from env var if needed
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    } catch (error: any) {
        console.error("Firebase Admin initialization error:", error.stack);
    }
}

export const adminDb = admin.firestore();

