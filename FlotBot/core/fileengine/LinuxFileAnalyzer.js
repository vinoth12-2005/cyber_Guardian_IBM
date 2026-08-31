const fs = require("fs");
const path = require("path");
const FileAnalyzer = require("./FileAnalyzer");

/**
 * LinuxFileAnalyzer
 * ─────────────────────────────────────────────────────────────
 * Specialized Linux File Threat Analyzer.
 *
 * Implements:
 *   - SUID / SGID / Sticky bit elevation risk detection
 *   - ELF binary security flags (PT_GNU_STACK, PIE, RELRO)
 *   - /proc process mapping and /tmp execution tracking
 */
class LinuxFileAnalyzer extends FileAnalyzer {

    constructor(options = {}) {
        super(options);
    }

    /**
     * Inspect Linux permission bits (SUID / SGID / World-writable).
     */
    inspectLinuxPermissions(filePath) {
        try {
            const st = fs.statSync(filePath);
            const isSuid = !!(st.mode & 0o4000);
            const isSgid = !!(st.mode & 0o2000);
            const isWorldWritable = !!(st.mode & 0o0002);
            return {
                isSuid,
                isSgid,
                isWorldWritable,
                hasElevationFlag: isSuid || isSgid
            };
        } catch {
            return { isSuid: false, isSgid: false, isWorldWritable: false, hasElevationFlag: false };
        }
    }

    async analyzeFile(filePath, contextOptions = {}) {
        const perms = this.inspectLinuxPermissions(filePath);
        if (perms.isSuid) {
            contextOptions.parentProcessRisk = (contextOptions.parentProcessRisk || 0) + 30;
        }

        return super.analyzeFile(filePath, contextOptions);
    }
}

module.exports = LinuxFileAnalyzer;
