import { describe, it, expect } from "vitest";
import { createHash } from "crypto";

function hashBuffer(buffer: Buffer) {
    return createHash("sha256").update(buffer).digest("hex");
}

describe("File hashing", () => {

    it("same content should produce same hash", () => {
        const data = Buffer.from("hello world");

        const hash1 = hashBuffer(data);
        const hash2 = hashBuffer(data);

        expect(hash1).toBe(hash2);
    });

    it("different content should produce different hash", () => {
        const data1 = Buffer.from("hello world");
        const data2 = Buffer.from("hello world!");

        const hash1 = hashBuffer(data1);
        const hash2 = hashBuffer(data2);

        expect(hash1).not.toBe(hash2);
    });

});
