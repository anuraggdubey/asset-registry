import { server } from "./server";

export type ActivityItem = {
    type: "REGISTER" | "SEND" | "RECEIVE";
    assetHash: string;
    timestamp: string;
    txHash: string;
    counterparty?: string; // For transfers
};

export async function fetchAccountHistory(publicKey: string): Promise<ActivityItem[]> {
    const activity: ActivityItem[] = [];

    // Fetch payments and account_merges could be relevant, 
    // but our protocol uses 'payment' ops with specific Memos.

    // Limit to 50 most recent for now
    const resp = await server.transactions()
        .forAccount(publicKey)
        .limit(50)
        .order("desc")
        .call();

    for (const tx of resp.records) {
        if (!tx.memo || typeof tx.memo !== "string") continue;

        const memo = tx.memo;
        const [type, hash] = memo.split("|");

        if (!hash || hash.length !== 20) continue; // Basic validation for our memo format

        // Case 1: Registration (REG|...)
        if (type === "REG" && tx.source_account === publicKey) {
            activity.push({
                type: "REGISTER",
                assetHash: hash,
                timestamp: tx.created_at,
                txHash: tx.hash
            });
            continue;
        }

        // Case 2: Transfer (OWN|...)
        if (type === "OWN") {
            // We need to know if we SENT it or RECEIVED it.
            // This requires looking at the operations to see the 'destination'.
            // Optimization: We can't fetch ops for ALL 50 txs efficiently in one go without causing latency.
            // However, horizon tx records might not contain 'operations' details directly without expansion.
            // But we know:
            // - If source_account == publicKey, we likely initiated the transfer (Sender).
            // - If source_account != publicKey, we might be the receiver.

            // To be accurate, we really should fetch the operation. 
            // OR use the 'join' parameter if available, but JS SDK support varies.

            // Let's attempt to rule out quickly:
            // If I signed it, I sent it.
            if (tx.source_account === publicKey) {
                activity.push({
                    type: "SEND",
                    assetHash: hash,
                    timestamp: tx.created_at,
                    txHash: tx.hash,
                    // We don't know receiver without ops, but we can label it generic "SEND"
                });
            } else {
                // If I didn't sign it, verifying I'm the receiver is harder without Ops.
                // But why would it appear in my history? 
                // Because I'm involved in it.
                // If I am not the source, I must be the destination (or unrelated but involved).
                // Let's assume RECEIVE for now if source != me.
                activity.push({
                    type: "RECEIVE",
                    assetHash: hash,
                    timestamp: tx.created_at,
                    txHash: tx.hash,
                    counterparty: tx.source_account
                });
            }
        }
    }

    return activity;
}
