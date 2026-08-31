/**
 * ThreatGraph
 * ─────────────────────────────────────────────────────────────
 * Grounded entity-relationship graph connecting security entities:
 *   - Nodes: USER, PROCESS, FILE, HASH, URL, DOMAIN, IP, PERSISTENCE, INCIDENT
 *   - Edges: SPAWNED, DOWNLOADED, CREATED_FILE, CONNECTED_TO, RESOLVED_DOMAIN, INSTALLED_PERSISTENCE, MATCHED_YARA
 */
class ThreatGraph {

    constructor() {
        this.nodes = new Map(); // id -> { id, type, label, data }
        this.edges = []; // [{ from, to, type, label, timestamp }]
    }

    addNode(type, id, label, data = {}) {
        const nodeId = `${type}:${id}`;
        if (!this.nodes.has(nodeId)) {
            this.nodes.set(nodeId, {
                id: nodeId,
                type,
                label: label || String(id),
                data
            });
        }
        return nodeId;
    }

    addEdge(fromNodeId, toNodeId, type, label = "", data = {}) {
        const edge = {
            from: fromNodeId,
            to: toNodeId,
            type,
            label: label || type,
            data,
            timestamp: new Date().toISOString()
        };
        this.edges.push(edge);
        return edge;
    }

    /**
     * Build graph representation from an array of UnifiedSecurityEvents.
     * @param {Array<object>} events
     */
    buildFromEvents(events = []) {
        for (const e of events) {
            let procNodeId = null;
            let fileNodeId = null;
            let netNodeId  = null;
            let urlNodeId  = null;

            // 1. Process Node
            if (e.process && (e.process.pid || e.process.name)) {
                procNodeId = this.addNode("PROCESS", `${e.process.name}_${e.process.pid}`, `${e.process.name} (PID ${e.process.pid})`, e.process);
            }

            // 2. File Node & Hash
            if (e.file && (e.file.path || e.file.name)) {
                fileNodeId = this.addNode("FILE", e.file.path || e.file.name, e.file.name || e.file.path, e.file);
                if (e.file.hash) {
                    const hashNodeId = this.addNode("HASH", e.file.hash, e.file.hash.slice(0, 12) + "...", { sha256: e.file.hash });
                    this.addEdge(fileNodeId, hashNodeId, "HAS_HASH", "SHA-256");
                }
                if (procNodeId) {
                    this.addEdge(procNodeId, fileNodeId, "CREATED_FILE", e.file.action || "CREATED");
                }
            }

            // 3. Network & IP Nodes
            if (e.network && e.network.remote_ip) {
                netNodeId = this.addNode("IP", e.network.remote_ip, e.network.remote_ip, e.network);
                if (procNodeId) {
                    this.addEdge(procNodeId, netNodeId, "CONNECTED_TO", `${e.network.protocol || "TCP"}:${e.network.remote_port}`);
                }
            }

            // 4. URL Node
            if (e.url && e.url.raw_url) {
                urlNodeId = this.addNode("URL", e.url.raw_url, e.url.domain || e.url.raw_url, e.url);
                if (netNodeId) {
                    this.addEdge(urlNodeId, netNodeId, "RESOLVED_TO", "DNS");
                }
            }

            // 5. Persistence Node
            if (e.persistence && e.persistence.location) {
                const persistNodeId = this.addNode("PERSISTENCE", e.persistence.location, e.persistence.type || "Startup Entry", e.persistence);
                if (procNodeId) {
                    this.addEdge(procNodeId, persistNodeId, "INSTALLED_PERSISTENCE", e.persistence.type);
                }
            }
        }

        return this.toJSON();
    }

    toJSON() {
        return {
            nodes: Array.from(this.nodes.values()),
            edges: this.edges,
            totalNodes: this.nodes.size,
            totalEdges: this.edges.length
        };
    }

    clear() {
        this.nodes.clear();
        this.edges = [];
    }
}

module.exports = ThreatGraph;
