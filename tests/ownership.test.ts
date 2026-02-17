import { describe, it, expect } from "vitest";
import { resolveOwner } from "../lib/stellar/resolveOwner";

describe("Ownership resolution", () => {

    it("register sets owner", () => {
        const owner = resolveOwner("abc", [
            { memo: "REG|abc", source: "GAAA" }
        ]);

        expect(owner).toBe("GAAA");
    });

    it("transfer overrides owner", () => {
        const owner = resolveOwner("abc", [
            { memo: "REG|abc", source: "GAAA" },
            { memo: "OWN|abc", source: "GBBB" }
        ]);

        expect(owner).toBe("GBBB");
    });

    it("ignores unrelated transactions", () => {
        const owner = resolveOwner("abc", [
            { memo: "REG|xyz", source: "GAAA" }
        ]);

        expect(owner).toBeNull();
    });

});
