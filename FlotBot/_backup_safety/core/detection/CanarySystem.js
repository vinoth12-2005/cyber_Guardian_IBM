const fs = require("fs");
const path = require("path");
const os = require("os");

/**
 * CanarySystem
 * ─────────────────────────────────────────────────────────────
 * Safe decoy tripwire directory in user space.
 * Places decoy files (with harmless fake data, never real secrets)
 * and monitors them for modification, rename, or deletion.
 */
class CanarySystem {

    constructor(canaryDir = null) {
        this.canaryDir = canaryDir || path.join(os.homedir(), ".flotbot", "canaries");
        this.canaries = new Map(); // path -> { originalHash, mtimeMs }
        this._watcher = null;
        this.tripped = false;
        this.tripDetails = null;
    }

    /**
     * Deploy safe decoy canary files.
     */
    async deploy() {
        if (!fs.existsSync(this.canaryDir)) {
            fs.mkdirSync(this.canaryDir, { recursive: true, mode: 0o755 });
        }

        const decoyFiles = [
            { name: "financial_forecast_2026.docx", content: "MOCK_CANARY_FINANCIAL_FORECAST_DOCUMENT_HEADER_DATA_DECOY_BUFFER_SAFE_CONTENT" },
            { name: "employee_payroll_records.xlsx", content: "MOCK_CANARY_PAYROLL_EXCEL_SHEET_DECOY_BUFFER_SAFE_CONTENT" },
            { name: "database_backup_archive.sql", content: "MOCK_CANARY_DATABASE_BACKUP_SCHEMA_DECOY_BUFFER_SAFE_CONTENT" }
        ];

        for (const f of decoyFiles) {
            const fullPath = path.join(this.canaryDir, f.name);
            fs.writeFileSync(fullPath, f.content, "utf8");
            const st = fs.statSync(fullPath);
            this.canaries.set(fullPath, {
                name: f.name,
                path: fullPath,
                size: st.size,
                mtimeMs: st.mtimeMs
            });
        }

        this._startWatcher();
        console.log(`[CanarySystem] Deployed ${this.canaries.size} safe decoy canaries in ${this.canaryDir}`);
    }

    _startWatcher() {
        if (this._watcher) return;
        try {
            this._watcher = fs.watch(this.canaryDir, (eventType, filename) => {
                if (!filename) return;
                const fullPath = path.join(this.canaryDir, filename);

                // Check if canary file was modified, renamed or deleted
                if (!fs.existsSync(fullPath)) {
                    this.tripped = true;
                    this.tripDetails = {
                        action: "DELETED_OR_RENAMED",
                        filename,
                        timestamp: new Date().toISOString(),
                        reason: `Canary tripwire file "${filename}" was deleted or renamed.`
                    };
                } else {
                    const st = fs.statSync(fullPath);
                    const original = this.canaries.get(fullPath);
                    if (original && (st.mtimeMs !== original.mtimeMs || st.size !== original.size)) {
                        this.tripped = true;
                        this.tripDetails = {
                            action: "MODIFIED",
                            filename,
                            timestamp: new Date().toISOString(),
                            reason: `Canary tripwire file "${filename}" was modified.`
                        };
                    }
                }
            });
        } catch {}
    }

    /**
     * Check if canary tripwire has been triggered.
     * @returns {{tripped: boolean, details: object|null}}
     */
    checkStatus() {
        return {
            deployed: this.canaries.size > 0,
            canaryDir: this.canaryDir,
            tripped: this.tripped,
            details: this.tripDetails
        };
    }

    reset() {
        this.tripped = false;
        this.tripDetails = null;
    }

    cleanup() {
        if (this._watcher) {
            this._watcher.close();
            this._watcher = null;
        }
        try {
            if (fs.existsSync(this.canaryDir)) {
                fs.rmSync(this.canaryDir, { recursive: true, force: true });
            }
        } catch {}
        this.canaries.clear();
    }
}

module.exports = CanarySystem;
