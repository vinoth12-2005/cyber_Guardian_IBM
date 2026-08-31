const FileThreatEngine = require("../../core/fileengine/FileThreatEngine");

/**
 * DeepFileSystemScanner
 * ─────────────────────────────────────────────────────────────
 * Cross-platform deep inch-by-inch file system security auditor.
 * Powered by FloatBot Master File Threat Analysis Engine.
 */
class DeepFileSystemScanner {

    constructor(aiEngine = null) {
        this.aiEngine = aiEngine;
        this.engine = new FileThreatEngine({ aiEngine });
    }

    /**
     * Perform deep inch-by-inch security audit scan across host target directories.
     * @param {function} [progressCallback] - (scannedCount, currentFile) => void
     * @returns {Promise<object>} Complete security audit report
     */
    async performDeepScan(progressCallback = null) {
        return this.engine.performDeepScan(progressCallback);
    }

    /**
     * Get target scan directories.
     */
    getScanTargets() {
        return this.engine.getScanTargets();
    }
}

module.exports = DeepFileSystemScanner;
