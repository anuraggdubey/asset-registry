import SHA256 from "crypto-js/sha256";

export async function hashFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const wordArray = SHA256(
        new Uint8Array(arrayBuffer) as any
    ).toString();

    return wordArray;
}
