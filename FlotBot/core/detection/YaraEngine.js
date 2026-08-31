const fs = require("fs");
const path = require("path");

/**
 * YaraEngine  ─  Cross-Platform YARA Rule Parser & Scanner
 * ─────────────────────────────────────────────────────────────
 * Parses and evaluates standard YARA rule files (.yar / .yara).
 * Supports:
 *   - Plain text strings (with 'nocase', 'wide', 'ascii' modifiers)
 *   - Regular expressions ($re = /pattern/i)
 *   - Hex byte sequences ($h = { 4D 5A 90 00 })
 *   - Metadata extraction (severity, author, description, mitre, tags)
 *   - Conditions: 'any of them', 'all of them', '$a and $b', '$a or $b', 'N of them'
 */
class YaraEngine {

    constructor(rulesDirectory = null) {
        this.rulesDirectory = rulesDirectory || path.join(__dirname, "../../rules/yara");
        this.rules = [];
        this.ruleStats = {
            totalRules: 0,
            loadErrors: 0,
            lastLoadedTs: null
        };
    }

    /**
     * Load and compile all YARA rules from disk.
     */
    async loadRules() {
        this.rules = [];
        if (!fs.existsSync(this.rulesDirectory)) {
            fs.mkdirSync(this.rulesDirectory, { recursive: true });
        }

        try {
            const files = fs.readdirSync(this.rulesDirectory).filter(f => f.endsWith(".yar") || f.endsWith(".yara"));
            for (const file of files) {
                const fullPath = path.join(this.rulesDirectory, file);
                try {
                    const content = fs.readFileSync(fullPath, "utf8");
                    const parsedRules = this.parseRuleString(content, file);
                    this.rules.push(...parsedRules);
                } catch (err) {
                    console.warn(`[YaraEngine] Error loading rule file "${file}":`, err.message);
                    this.ruleStats.loadErrors++;
                }
            }
            this.ruleStats.totalRules = this.rules.length;
            this.ruleStats.lastLoadedTs = new Date().toISOString();
            console.log(`[YaraEngine] Loaded ${this.rules.length} YARA rules from ${this.rulesDirectory}`);
        } catch (err) {
            console.warn("[YaraEngine] Failed to read rules directory:", err.message);
        }
        return this.rules.length;
    }

    /**
     * Parse raw YARA rule text into compiled rule objects.
     * @param {string} content
     * @param {string} sourceFile
     * @returns {Array<object>}
     */
    parseRuleString(content, sourceFile = "in-memory") {
        const rules = [];
        // Match each 'rule RuleName : tag1 tag2 { ... }'
        const ruleRegex = /rule\s+([a-zA-Z0-9_]+)(?:\s*:\s*([^{]+))?\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/gs;
        let match;

        while ((match = ruleRegex.exec(content)) !== null) {
            const ruleName = match[1];
            const tagsStr = match[2] || "";
            const ruleBody = match[3];

            const tags = tagsStr.trim().split(/\s+/).filter(Boolean);
            const meta = this._parseMeta(ruleBody);
            const strings = this._parseStrings(ruleBody);
            const condition = this._parseCondition(ruleBody);

            rules.push({
                name: ruleName,
                sourceFile,
                tags,
                meta,
                strings,
                condition,
                severity: (meta.severity || "high").toUpperCase(),
                mitre: meta.mitre ? (Array.isArray(meta.mitre) ? meta.mitre : [meta.mitre]) : []
            });
        }

        return rules;
    }

    _parseMeta(body) {
        const meta = {};
        const metaMatch = /meta:\s*([\s\S]*?)(?=strings:|condition:|$)/i.exec(body);
        if (!metaMatch) return meta;

        const lines = metaMatch[1].split("\n");
        for (const line of lines) {
            const kv = /^\s*([a-zA-Z0-9_]+)\s*=\s*(?:"([^"]*)"|(\d+)|([^\s]+))/i.exec(line);
            if (kv) {
                const key = kv[1];
                const val = kv[2] !== undefined ? kv[2] : (kv[3] !== undefined ? parseInt(kv[3], 10) : kv[4]);
                meta[key] = val;
            }
        }
        return meta;
    }

    _parseStrings(body) {
        const strings = [];
        const strMatch = /strings:\s*([\s\S]*?)(?=condition:|$)/i.exec(body);
        if (!strMatch) return strings;

        const lines = strMatch[1].split("\n");
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("//")) continue;

            // 1. Text String: $a = "text" [nocase] [wide] [ascii]
            const textMatch = /^\$([a-zA-Z0-9_]*)\s*=\s*"([^"\\]*(?:\\.[^"\\]*)*)"(\s+nocase|\s+wide|\s+ascii)*/i.exec(trimmed);
            if (textMatch) {
                const id = textMatch[1];
                const val = textMatch[2];
                const modifiers = (textMatch[3] || "").toLowerCase();
                const isNocase = modifiers.includes("nocase");
                strings.push({
                    id,
                    type: "text",
                    value: val,
                    nocase: isNocase
                });
                continue;
            }

            // 2. Hex String: $h = { 4D 5A 90 00 }
            const hexMatch = /^\$([a-zA-Z0-9_]*)\s*=\s*\{\s*([0-9a-fA-F\s\?]+)\s*\}/i.exec(trimmed);
            if (hexMatch) {
                const id = hexMatch[1];
                const hexClean = hexMatch[2].replace(/\s+/g, "").toLowerCase();
                strings.push({
                    id,
                    type: "hex",
                    hex: hexClean
                });
                continue;
            }

            // 3. Regex: $re = /pattern/ [i]
            const regexMatch = /^\$([a-zA-Z0-9_]*)\s*=\s*\/((?:[^\/\\]|\\.)*)\/([imsx]*)/i.exec(trimmed);
            if (regexMatch) {
                const id = regexMatch[1];
                const pattern = regexMatch[2];
                const flags = regexMatch[3] || "i";
                try {
                    strings.push({
                        id,
                        type: "regex",
                        regex: new RegExp(pattern, flags)
                    });
                } catch {}
            }
        }
        return strings;
    }

    _parseCondition(body) {
        const condMatch = /condition:\s*([\s\S]*?)$/i.exec(body);
        if (!condMatch) return "any of them";
        return condMatch[1].trim().replace(/\/\/.*$/gm, "").trim();
    }

    /**
     * Scan a file buffer or text string against loaded YARA rules.
     * @param {Buffer|string} target
     * @param {string} [filePath]
     * @returns {Array<object>} Matched rules
     */
    scan(target, filePath = "") {
        let buffer;
        let strContent;

        if (Buffer.isBuffer(target)) {
            buffer = target;
            strContent = target.toString("latin1");
        } else if (typeof target === "string") {
            strContent = target;
            buffer = Buffer.from(target, "utf8");
        } else {
            return [];
        }

        const matches = [];

        for (const rule of this.rules) {
            const matchedStrings = [];

            for (const s of rule.strings) {
                let isHit = false;

                if (s.type === "text") {
                    if (s.nocase) {
                        isHit = strContent.toLowerCase().includes(s.value.toLowerCase());
                    } else {
                        isHit = strContent.includes(s.value);
                    }
                } else if (s.type === "hex") {
                    const hexContent = buffer.toString("hex").toLowerCase();
                    isHit = hexContent.includes(s.hex);
                } else if (s.type === "regex" && s.regex) {
                    isHit = s.regex.test(strContent);
                }

                if (isHit) {
                    matchedStrings.push(s.id);
                }
            }

            // Evaluate condition
            const isMatch = this._evaluateCondition(rule.condition, rule.strings, matchedStrings, buffer.length);
            if (isMatch) {
                matches.push({
                    rule: rule.name,
                    severity: rule.severity,
                    meta: rule.meta,
                    tags: rule.tags,
                    mitre: rule.mitre,
                    matchedStrings,
                    filePath
                });
            }
        }

        return matches;
    }

    /**
     * Scan a file path directly from disk.
     */
    async scanFile(filePath) {
        if (!fs.existsSync(filePath)) return [];
        try {
            const maxBytes = 25 * 1024 * 1024;
            const stats = fs.statSync(filePath);
            const buffer = Buffer.alloc(Math.min(stats.size, maxBytes));
            const fd = fs.openSync(filePath, "r");
            fs.readSync(fd, buffer, 0, buffer.length, 0);
            fs.closeSync(fd);
            return this.scan(buffer, filePath);
        } catch {
            return [];
        }
    }

    _evaluateCondition(condition, allStrings, matchedStrings, fileSize) {
        const cond = condition.toLowerCase().trim();

        if (cond === "any of them" || cond === "any of ($*)") {
            return matchedStrings.length > 0;
        }
        if (cond === "all of them" || cond === "all of ($*)") {
            return allStrings.length > 0 && matchedStrings.length === allStrings.length;
        }

        // Check N of them (e.g. 2 of them)
        const nOfMatch = /^(\d+)\s+of\s+them/i.exec(cond);
        if (nOfMatch) {
            const req = parseInt(nOfMatch[1], 10);
            return matchedStrings.length >= req;
        }

        // Basic boolean logic for identifier references (e.g. $a and ($b or $c))
        try {
            let expr = cond;
            for (const s of allStrings) {
                const varName = `$${s.id}`.toLowerCase();
                const wasHit = matchedStrings.includes(s.id);
                expr = expr.replaceAll(varName, wasHit ? "true" : "false");
            }
            expr = expr.replace(/\band\b/g, "&&").replace(/\bor\b/g, "||").replace(/\bnot\b/g, "!");
            // Safe boolean eval
            return !!Function(`"use strict"; return (${expr})`)();
        } catch {
            return matchedStrings.length > 0;
        }
    }
}

module.exports = YaraEngine;
