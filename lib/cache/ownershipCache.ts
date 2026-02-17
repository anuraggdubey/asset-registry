type OwnershipRecord = {
    owner: string;
    txHash: string;
    timestamp: number;
};

const PREFIX = "stellar_asset_cache_";

export function getCachedOwnership(hash20: string): OwnershipRecord | null {
    if (typeof window === "undefined") return null;

    const raw = localStorage.getItem(PREFIX + hash20);
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function setCachedOwnership(hash20: string, data: OwnershipRecord) {
    if (typeof window === "undefined") return;

    localStorage.setItem(PREFIX + hash20, JSON.stringify(data));
}

export function clearOwnershipCache(hash20: string) {
    if (typeof window === "undefined") return;

    localStorage.removeItem(PREFIX + hash20);
}
