const fs = require("fs");
const path = require("path");
const os = require("os");

/**
 * FileCollector
 * Performs snapshot-based collection of monitored directories.
 * Returns file metadata for comparison between scan cycles.
 */
class FileCollector {

    constructor() {

        const home = os.homedir();
        const temp = os.tmpdir();

        this.monitoredDirs = [
            path.join(home, "Downloads"),
            path.join(home, "Desktop"),
            path.join(home, "Documents"),
            temp,
            "C:\\Windows\\Temp"
        ].filter(d => {
            try { return fs.existsSync(d); } catch { return false; }
        });

    }

    async collect() {

        const snapshot = new Map();

        for (const dir of this.monitoredDirs) {
            try {
                const entries = this._readDir(dir);
                for (const entry of entries) {
                    snapshot.set(entry.filePath, entry);
                }
            } catch (err) {
                // Skip inaccessible directories
            }
        }

        return snapshot;

    }

    _readDir(dirPath, depth = 0) {

        if (depth > 2) return [];  // max recursion depth

        const entries = [];

        let items;
        try {
            items = fs.readdirSync(dirPath, { withFileTypes: true });
        } catch {
            return entries;
        }

        for (const item of items) {

            const fullPath = path.join(dirPath, item.name);

            if (item.isDirectory() && depth < 2) {
                entries.push(...this._readDir(fullPath, depth + 1));
            } else if (item.isFile()) {
                try {
                    const stat = fs.statSync(fullPath);
                    entries.push({
                        filePath:  fullPath,
                        fileName:  item.name,
                        extension: path.extname(item.name).toLowerCase(),
                        size:      stat.size,
                        modified:  stat.mtimeMs,
                        created:   stat.birthtimeMs
                    });
                } catch {
                    // Skip locked/inaccessible files
                }
            }

        }

        return entries;

    }

}

module.exports = FileCollector;
