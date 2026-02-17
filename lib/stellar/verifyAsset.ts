import { server } from "./server";

export async function verifyAsset(hash: string, publicKey?: string) {
    const prefix = hash.slice(0, 20);

    // if no wallet passed, scan latest ledger transactions
    const txs: any = publicKey
        ? await server.transactions().forAccount(publicKey).limit(200).order("desc").call()
        : await server.transactions().limit(200).order("desc").call();

    for (const tx of txs.records) {
        if (tx.memo && tx.memo.includes(`REG|${prefix}`)) {
            return {
                owner: tx.source_account,
                tx: tx.hash,
                time: tx.created_at,
            };
        }
    }

    return null;
}
