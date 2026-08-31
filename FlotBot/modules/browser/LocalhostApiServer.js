const http = require("http");
const URLAnalyzer = require("./URLAnalyzer");
const { activeAdapter } = require("../../platform");

/**
 * LocalhostApiServer
 * ─────────────────────────────────────────────────────────────
 * Serves a secure 127.0.0.1-only HTTP REST API for browser extensions
 * (Chrome / Firefox) and local diagnostic integrations.
 */
class LocalhostApiServer {

    constructor(port = 41738, aiEngine = null) {
        this.port = port;
        this.aiEngine = aiEngine;
        this.server = null;
    }

    start() {
        if (this.server) return;

        this.server = http.createServer(async (req, res) => {
            // Enforce localhost binding guard
            const clientIp = req.socket.remoteAddress;
            if (clientIp !== "127.0.0.1" && clientIp !== "::1" && clientIp !== "::ffff:127.0.0.1") {
                res.writeHead(403, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ error: "Access denied. API bound to localhost only." }));
            }

            // CORS headers for extension
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type");

            if (req.method === "OPTIONS") {
                res.writeHead(204);
                return res.end();
            }

            const url = new URL(req.url, `http://${req.headers.host}`);

            try {
                if (req.method === "GET" && url.pathname === "/api/system") {
                    const info = await activeAdapter.getSystemInformation();
                    res.writeHead(200, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify(info));

                } else if (req.method === "POST" && url.pathname === "/api/analyze/url") {
                    const body = await this._readJsonBody(req);
                    const result = await URLAnalyzer.analyze(body.url || "");
                    res.writeHead(200, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify(result));

                } else if (req.method === "POST" && url.pathname === "/api/explain") {
                    const body = await this._readJsonBody(req);
                    if (this.aiEngine && body.text) {
                        const reply = await this.aiEngine.chat("ext-session", `Please explain this selected text from webpage: "${body.text}"`);
                        res.writeHead(200, { "Content-Type": "application/json" });
                        return res.end(JSON.stringify(reply));
                    } else {
                        res.writeHead(200, { "Content-Type": "application/json" });
                        return res.end(JSON.stringify({ reply: `Selected text: "${body.text || ""}"` }));
                    }

                } else {
                    res.writeHead(404, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ error: "Endpoint not found" }));
                }

            } catch (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ error: err.message }));
            }
        });

        this.server.listen(this.port, "127.0.0.1", () => {
            console.log(`[LocalhostApiServer] Secure localhost API running on http://127.0.0.1:${this.port}`);
        });
    }

    stop() {
        if (this.server) {
            this.server.close();
            this.server = null;
        }
    }

    _readJsonBody(req) {
        return new Promise((resolve, reject) => {
            let body = "";
            req.on("data", chunk => body += chunk);
            req.on("end", () => {
                try {
                    resolve(JSON.parse(body || "{}"));
                } catch (e) {
                    reject(e);
                }
            });
            req.on("error", reject);
        });
    }
}

module.exports = LocalhostApiServer;
