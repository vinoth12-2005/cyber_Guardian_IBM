const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const FilesystemSensor = require("../../core/platform/sensors/FilesystemSensor");

class MacOSFilesystemSensor extends FilesystemSensor {
    constructor() {
        super("darwin");
        this.monitoredDirs = this.getMonitoredDirectories();
        this._snapshot = new Map();
    }

    getMonitoredDirectories() {
        const home = os.homedir();
        const targets = [
            path.join(home, "Downloads"),
            path.join(home, "Desktop"),
            path.join(home, "Documents"),
            path.join(home, "Library", "LaunchAgents"),
            "/Library/LaunchAgents",
            "/Library/LaunchDaemons",
            "/tmp"
        ];

        return targets.filter(d => {
            try { return fs.existsSync(d); } catch { return false; }
        });
    }

    async hashFile(filePath) {
        try {
            if (!fs.existsSync(filePath)) return null;
            const buffer = fs.readFileSync(filePath);
            return crypto.createHash("sha256").update(buffer).digest("hex");
        } catch {
            return null;
        }
    }

    async scanFileChanges() {
        const t0 = Date.now();
        const current = new Map();
        const events = [];

        for (const dir of this.monitoredDirs) {
            try {
                this._scanDir(dir, current, 0);
            } catch {}
        }

        for (const [p, meta] of current.entries()) {
            if (!this._snapshot.has(p)) {
                events.push({ action: "CREATED", file: meta });
            } else {
                const prev = this._snapshot.get(p);
                if (prev.mtimeMs !== meta.mtimeMs || prev.size !== meta.size) {
                    events.push({ action: "MODIFIED", file: meta, oldSize: prev.size });
                }
            }
        }

        for (const [p, meta] of this._snapshot.entries()) {
            if (!current.has(p)) {
                events.push({ action: "DELETED", file: meta });
            }
        }

        this._snapshot = current;
        this._recordCollection(Date.now() - t0);
        return { events, fileCount: current.size };
    }

    _scanDir(dir, map, depth) {
        if (depth > 2) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory() && depth < 2) {
                this._scanDir(fullPath, map, depth + 1);
            } else if (entry.isFile()) {
                try {
                    const st = fs.statSync(fullPath);
                    map.set(fullPath, {
                        filePath: fullPath,
                        fileName: entry.name,
                        extension: path.extname(entry.name).toLowerCase(),
                        size: st.size,
                        mtimeMs: st.mtimeMs,
                        ctimeMs: st.ctimeMs
                    });
                } catch {}
            }
        }
    }

    async collect() {
        return this.scanFileChanges();
    }
}

module.exports = MacOSFilesystemSensor;
