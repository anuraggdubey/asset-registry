import { describe, it, expect } from "vitest";
import { parseMemo } from "../lib/stellar/parseMemo";

describe("Memo parsing", () => {

    it("should detect registration", () => {
        const res = parseMemo("REG|abcd1234");
        expect(res).toEqual({ type: "REGISTER", hash: "abcd1234" });
    });

    it("should detect transfer", () => {
        const res = parseMemo("OWN|abcd1234");
        expect(res).toEqual({ type: "TRANSFER", hash: "abcd1234" });
    });

    it("should ignore unrelated memos", () => {
        const res = parseMemo("hello world");
        expect(res).toBeNull();
    });

});
