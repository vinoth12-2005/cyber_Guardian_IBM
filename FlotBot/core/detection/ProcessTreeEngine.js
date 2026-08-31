/**
 * ProcessTreeEngine
 * ─────────────────────────────────────────────────────────────
 * Tracks process ancestry, builds hierarchical process trees, and detects
 * suspicious parent-child execution anomalies and LOLBin exploitation.
 */
class ProcessTreeEngine {

    static SUSPICIOUS_PARENTS = [
        { parent: /^(winword|excel|powerpnt|acrord32|acrobat|outlook)\.exe$/i, danger: "Office/PDF application spawning script interpreter", mitre: "T1204.002" },
        { parent: /^(chrome|firefox|msedge|brave|opera|safari)(\.exe)?$/i, danger: "Web browser spawning shell execution", mitre: "T1189" },
        { parent: /^(w3wp|httpd|nginx|tomcat)\.exe$/i, danger: "Web server daemon spawning shell (potential webshell)", mitre: "T1505.003" }
    ];

    static SUSPICIOUS_CHILDREN = /^(powershell|pwsh|cmd|bash|sh|zsh|wscript|cscript|mshta|regsvr32|rundll32|certutil|bitsadmin)(\.exe)?$/i;

    constructor() {
        this.processMap = new Map(); // pid -> ProcessNode
    }

    /**
     * Ingest a batch of process snapshots and build the tree.
     * @param {Array<object>} processes
     * @returns {object} { roots, anomalies }
     */
    update(processes = []) {
        this.processMap.clear();

        // 1. Create Nodes
        for (const p of processes) {
            const pid = parseInt(p.pid, 10);
            const ppid = parseInt(p.ppid || p.parentPid || 0, 10);
            this.processMap.set(pid, {
                pid,
                ppid,
                name: p.name || p.image || "Unknown",
                cmdLine: p.cmdLine || "",
                exePath: p.exePath || "",
                user: p.user || "",
                cpu: p.cpu || 0,
                mem: p.mem || "",
                children: []
            });
        }

        const roots = [];
        const anomalies = [];

        // 2. Link Parent -> Children and detect lineage anomalies
        for (const [pid, node] of this.processMap.entries()) {
            if (node.ppid && this.processMap.has(node.ppid)) {
                const parent = this.processMap.get(node.ppid);
                parent.children.push(node);

                // Analyze Parent-Child Relationship
                const anomaly = this._inspectParentChild(parent, node);
                if (anomaly) anomalies.push(anomaly);

            } else {
                roots.push(node);
            }

            // Check Process Masquerading
            const masqAnomaly = this._inspectMasquerading(node);
            if (masqAnomaly) anomalies.push(masqAnomaly);
        }

        return { roots, anomalies, totalNodes: this.processMap.size };
    }

    /**
     * Get full ancestry chain for a PID from root to leaf.
     * @param {number} pid
     * @returns {Array<object>}
     */
    getLineage(pid) {
        const lineage = [];
        let currentPid = parseInt(pid, 10);

        while (currentPid && this.processMap.has(currentPid)) {
            const node = this.processMap.get(currentPid);
            lineage.unshift({
                pid: node.pid,
                ppid: node.ppid,
                name: node.name,
                cmdLine: node.cmdLine,
                exePath: node.exePath
            });
            currentPid = node.ppid;
            // Guard against cyclic parent loops
            if (lineage.length > 50) break;
        }

        return lineage;
    }

    _inspectParentChild(parent, child) {
        if (!ProcessTreeEngine.SUSPICIOUS_CHILDREN.test(child.name)) {
            return null;
        }

        for (const sp of ProcessTreeEngine.SUSPICIOUS_PARENTS) {
            if (sp.parent.test(parent.name)) {
                return {
                    type: "SUSPICIOUS_PARENT_CHILD",
                    severity: "HIGH",
                    parent: { pid: parent.pid, name: parent.name, cmdLine: parent.cmdLine },
                    child: { pid: child.pid, name: child.name, cmdLine: child.cmdLine },
                    reason: `${sp.danger}: "${parent.name}" (PID ${parent.pid}) spawned "${child.name}" (PID ${child.pid})`,
                    mitre: [sp.mitre, "T1059"]
                };
            }
        }
        return null;
    }

    _inspectMasquerading(node) {
        const pathLower = (node.exePath || "").toLowerCase();
        const nameLower = (node.name || "").toLowerCase();

        // System binaries running from user Temp or Downloads
        const systemBinaries = ["svchost.exe", "lsass.exe", "csrss.exe", "services.exe", "explorer.exe", "taskhostw.exe"];
        if (systemBinaries.includes(nameLower)) {
            if (pathLower.includes("\\temp\\") || pathLower.includes("\\downloads\\") || pathLower.includes("/tmp/") || pathLower.includes("/var/tmp/")) {
                return {
                    type: "PROCESS_MASQUERADING",
                    severity: "CRITICAL",
                    process: { pid: node.pid, name: node.name, exePath: node.exePath },
                    reason: `Critical system binary name "${node.name}" executing from non-standard user location: ${node.exePath}`,
                    mitre: ["T1036.005"]
                };
            }
        }
        return null;
    }
}

module.exports = ProcessTreeEngine;
