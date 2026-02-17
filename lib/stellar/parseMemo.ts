export type MemoEvent =
    | { type: "REGISTER"; hash: string }
    | { type: "TRANSFER"; hash: string }
    | null;

export function parseMemo(memo: string | null): MemoEvent {

    if (!memo) return null;

    if (memo.startsWith("REG|")) {
        return { type: "REGISTER", hash: memo.slice(4) };
    }

    if (memo.startsWith("OWN|")) {
        return { type: "TRANSFER", hash: memo.slice(4) };
    }

    return null;
}
