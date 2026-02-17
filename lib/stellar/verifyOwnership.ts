import { server } from "./server";
import { getCachedOwnership, setCachedOwnership } from "../cache/ownershipCache";

export async function verifyOwnership(hash: string, skipCache = false) {

    // Ensure we are working with the 20-byte fingerprint
    const hash20 = hash.length > 20 ? hash.slice(0, 20) : hash;

    // cache
    if (!skipCache) {
        const cached = getCachedOwnership(hash20);
        if (cached) {
            return {
                owner: cached.owner,
                txHash: cached.txHash,
                cached: true
            };
        }
    }

    // History collection
    const history: Array<{
        owner: string;
        txHash: string;
        timestamp: string; // approximate based on ledger close or just "Unknown" if not fetched
        type: "REGISTER" | "TRANSFER";
    }> = [];

    // Increase depth to 20 pages for better reliability on testnet
    for (let i = 0; i < 20; i++) {

        const callBuilder = server.transactions().order("desc").limit(200);

        if (cursor) {
            callBuilder.cursor(cursor);
        }

        const page = await callBuilder.call();

        if (page.records.length === 0) break;

        for (const tx of page.records) {

            if (!tx.memo || typeof tx.memo !== "string") continue;

            const isReg = tx.memo === `REG|${hash20}`;
            const isTransfer = tx.memo === `OWN|${hash20}`;

            if (isReg) {
                const recordOwner = tx.source_account;

                // Add to history
                history.push({
                    owner: recordOwner,
                    txHash: tx.hash,
                    timestamp: tx.created_at,
                    type: "REGISTER"
                });

                // If this is the first (latest) relevant event we found, it's the current owner
                if (!foundTx) {
                    owner = recordOwner;
                    foundTx = tx.hash;
                }
            }

            if (isTransfer) {
                // Fetch ops to find receiver
                const ops = await page.records.find(r => r.hash === tx.hash)?.operations();
                if (ops && ops.records.length > 0) {
                    const payment = ops.records.find(op => op.type === "payment" || op.type === "create_account");
                    if (payment) {
                        // @ts-ignore
                        const recordOwner = payment.to || payment.account;

                        // Add to history
                        history.push({
                            owner: recordOwner,
                            txHash: tx.hash,
                            timestamp: tx.created_at,
                            type: "TRANSFER"
                        });

                        // If this is the first (latest) relevant event we found
                        if (!foundTx) {
                            owner = recordOwner;
                            foundTx = tx.hash;
                        }
                    }
                }
            }
        }

        // Optimization: If we found the OWNER, we technically could stop if we only needed current owner.
        // But for FULL HISTORY, we must keep scanning backwards until we find the REGISTRATION.
        // Once we find REG, we can stop because that's the beginning of time for this asset.

        // However, since we scan DESC (newest first), we find latest Transfer first.
        // We need to keep going to find earlier transfers and finally the Reg.

        // If we found the REG event, we can stop generally.
        const regFound = history.some(h => h.type === "REGISTER");
        if (regFound) break;

        cursor = page.records[page.records.length - 1].paging_token;
    }

    if (!owner || !foundTx) return null;

    // cache (only current owner)
    if (!skipCache) {
        setCachedOwnership(hash20, {
            owner,
            txHash: foundTx,
            timestamp: Date.now()
        });
    }

    return {
        owner,
        txHash: foundTx,
        cached: false,
        history: history // New field
    };
}
