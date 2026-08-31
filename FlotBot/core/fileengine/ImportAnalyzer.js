/**
 * ImportAnalyzer
 * ─────────────────────────────────────────────────────────────
 * Cross-platform API import analyzer.
 * Evaluates executable imports across 8 threat capability vectors.
 *
 * Rules:
 *   - An executable importing a sensitive API is NOT automatically malware.
 *   - Evaluates combinations of capabilities (e.g. Injection + Network + Persistence).
 *   - Categorizes imports into NORMAL, UNUSUAL, and SUSPICIOUS.
 */
class ImportAnalyzer {

    static CAPABILITIES = {
        PROCESS_INJECTION: {
            weight: 25,
            severity: "HIGH",
            apis: [
                "virtualallocex", "writeprocessmemory", "createremotethread",
                "ntunmapviewofsection", "queueuserapc", "setthreadcontext",
                "resumethread", "ptrace", "process_vm_writev", "process_vm_readv"
            ]
        },
        CREDENTIAL_ACCESS: {
            weight: 25,
            severity: "HIGH",
            apis: [
                "openprocesstoken", "adjusttokenprivileges", "lsalogonuser",
                "cryptunprotectdata", "minidumpwritedump", "samconnect", "credread"
            ]
        },
        PERSISTENCE: {
            weight: 20,
            severity: "MEDIUM",
            apis: [
                "regsetvalueexa", "regsetvalueexw", "regcreatekeyexa", "regcreatekeyexw",
                "createservicea", "createservicew", "setwindowshookexa", "setwindowshookexw"
            ]
        },
        DEFENSE_EVASION: {
            weight: 20,
            severity: "HIGH",
            apis: [
                "isdebuggerpresent", "checkremotedebuggerpresent", "ntsetinformationthread",
                "amsiscanbuffer", "amsiinitialize", "virtualprotect", "virtualprotectex"
            ]
        },
        NETWORK_C2: {
            weight: 15,
            severity: "MEDIUM",
            apis: [
                "wsastartup", "connect", "internetopenurla", "internetopenurlw",
                "httpsendrequesta", "httpsendrequestw", "socket", "getaddrinfo", "urldownloadtofile"
            ]
        },
        SHELL_EXECUTION: {
            weight: 15,
            severity: "MEDIUM",
            apis: [
                "winexec", "shellexecutea", "shellexecutew", "createprocessa",
                "createprocessw", "execve", "execvp", "system", "popen"
            ]
        },
        FILE_ENCRYPTION_RANSOM: {
            weight: 30,
            severity: "CRITICAL",
            apis: [
                "cryptencrypt", "cryptderivekey", "cryptgenkey", "movefilewithprogressw",
                "deletefilea", "deletefilew", "setfileattributesw"
            ]
        },
        KEYLOGGING: {
            weight: 20,
            severity: "HIGH",
            apis: [
                "getasynckeystate", "getkeystate", "getforegroundwindow", "bitblt"
            ]
        }
    };

    /**
     * Analyze extracted imports or string symbols from a binary.
     * @param {Array<string>} importsList - List of imported APIs, DLLs, or symbol names
     * @returns {object} Import analysis summary
     */
    static analyze(importsList = []) {
        if (!importsList || importsList.length === 0) {
            return {
                totalImports: 0,
                matchedCapabilities: [],
                suspiciousApis: [],
                threatScore: 0,
                verdict: "NORMAL",
                summary: "No suspicious API imports detected"
            };
        }

        const normalized = importsList.map(s => String(s).toLowerCase());
        const matchedCaps = [];
        const suspiciousApis = [];
        let rawScore = 0;

        for (const [capName, def] of Object.entries(ImportAnalyzer.CAPABILITIES)) {
            const hits = [];
            for (const api of def.apis) {
                if (normalized.some(n => n.includes(api))) {
                    hits.push(api);
                    if (!suspiciousApis.includes(api)) {
                        suspiciousApis.push(api);
                    }
                }
            }

            if (hits.length > 0) {
                matchedCaps.push({
                    capability: capName,
                    severity: def.severity,
                    weight: def.weight,
                    matchedApis: hits
                });
                rawScore += def.weight;
            }
        }

        // Synergy boost: multiple combined malicious capabilities (e.g. Injection + C2 + Evasion)
        if (matchedCaps.length >= 3) {
            rawScore += 20;
        }

        const threatScore = Math.min(100, rawScore);
        let verdict = "NORMAL";
        if (threatScore >= 60) verdict = "SUSPICIOUS";
        else if (threatScore >= 20) verdict = "UNUSUAL";

        return {
            totalImports: importsList.length,
            matchedCapabilities: matchedCaps,
            suspiciousApis,
            threatScore,
            verdict,
            summary: matchedCaps.length > 0
                ? `Detected ${matchedCaps.length} sensitive capability vector(s): ${matchedCaps.map(c => c.capability).join(", ")}`
                : "Standard benign API import profile"
        };
    }
}

module.exports = ImportAnalyzer;
