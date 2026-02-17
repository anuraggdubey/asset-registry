import { parseMemo } from "./parseMemo";

type Tx = {
    memo: string | null;
    source: string;
};

export function resolveOwner(hash20: string, txs: Tx[]) {

    let owner: string | null = null;

    for (const tx of txs) {
        const event = parseMemo(tx.memo);

        if (!event) continue;
        if (event.hash !== hash20) continue;

        if (event.type === "REGISTER") {
            owner = tx.source;
        }

        if (event.type === "TRANSFER") {
            owner = tx.source;
        }
    }

    return owner;
}
