/**
 * EntropyCalculator
 * ─────────────────────────────────────────────────────────────
 * Calculates Shannon Entropy for file buffers, chunks, and sections.
 * Formula: H(X) = -Σ p(x) * log2(p(x))
 *
 * Range: 0.0 (uniform bytes) to 8.0 (pure random/encrypted bytes)
 *
 * Baseline Rules:
 *   - Plain text / normal code: 3.5 - 5.5
 *   - Normal compiled binaries: 5.5 - 6.8
 *   - Compressed / media / packed: 7.0 - 7.6
 *   - Heavily encrypted / packed malware: > 7.6
 *
 * NOTE: High entropy ALONE != malware (e.g. valid zip or jpg).
 * Must be correlated with executable status, signature, and imports.
 */
class EntropyCalculator {

    /**
     * Calculate Shannon Entropy of a buffer (0.0 to 8.0).
     * @param {Buffer} buffer
     * @returns {number}
     */
    static calculate(buffer) {
        if (!buffer || buffer.length === 0) return 0.0;

        const len = buffer.length;
        const frequencies = new Uint32Array(256);

        for (let i = 0; i < len; i++) {
            frequencies[buffer[i]]++;
        }

        let entropy = 0.0;
        for (let i = 0; i < 256; i++) {
            const count = frequencies[i];
            if (count > 0) {
                const p = count / len;
                entropy -= p * Math.log2(p);
            }
        }

        return parseFloat(entropy.toFixed(3));
    }

    /**
     * Calculate chunked entropy profile across a file buffer.
     * Useful for detecting embedded packed shellcode inside a larger binary.
     * @param {Buffer} buffer
     * @param {number} [chunkSize=1024]
     * @returns {object} { overallEntropy, maxChunkEntropy, minChunkEntropy, highEntropyChunksCount, chunks }
     */
    static calculateProfile(buffer, chunkSize = 1024) {
        if (!buffer || buffer.length === 0) {
            return {
                overallEntropy: 0.0,
                maxChunkEntropy: 0.0,
                minChunkEntropy: 0.0,
                highEntropyChunksCount: 0,
                chunks: []
            };
        }

        const overall = EntropyCalculator.calculate(buffer);
        const chunks = [];
        let maxChunk = 0.0;
        let minChunk = 8.0;
        let highCount = 0;

        for (let offset = 0; offset < buffer.length; offset += chunkSize) {
            const end = Math.min(buffer.length, offset + chunkSize);
            const slice = buffer.slice(offset, end);
            const chunkEnt = EntropyCalculator.calculate(slice);

            if (chunkEnt > maxChunk) maxChunk = chunkEnt;
            if (chunkEnt < minChunk) minChunk = chunkEnt;
            if (chunkEnt >= 7.2) highCount++;

            chunks.push({
                offset,
                size: slice.length,
                entropy: chunkEnt,
                isHigh: chunkEnt >= 7.2
            });
        }

        return {
            overallEntropy: overall,
            maxChunkEntropy: parseFloat(maxChunk.toFixed(3)),
            minChunkEntropy: parseFloat(minChunk.toFixed(3)),
            highEntropyChunksCount: highCount,
            totalChunks: chunks.length,
            isPackedOrEncrypted: overall >= 7.4 || (chunks.length >= 3 && (highCount / chunks.length) >= 0.6),
            chunks
        };
    }

    /**
     * Map entropy to human-readable classification tier.
     * @param {number} entropy
     * @returns {string}
     */
    static getTier(entropy) {
        if (entropy < 4.5) return "LOW";
        if (entropy < 6.5) return "NORMAL";
        if (entropy < 7.2) return "MODERATE";
        if (entropy < 7.7) return "HIGH";
        return "CRITICAL_PACKED_OR_ENCRYPTED";
    }
}

module.exports = EntropyCalculator;
