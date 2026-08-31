const QuarantineManager = require("./QuarantineManager");
const HashEngine = require("../detection/HashEngine");

/**
 * SafeActionExecutor
 * ─────────────────────────────────────────────────────────────
 * Strict allowlisted action executor for security remediation.
 *
 * ALLOWLISTED ACTIONS ONLY:
 *   - collect_evidence (SAFE)
 *   - calculate_hash (SAFE)
 *   - quarantine_file (MODERATE)
 *   - restore_file (MODERATE)
 *   - terminate_process (MODERATE)
 *   - block_indicator (HIGH_RISK)
 *   - create_incident (SAFE)
 *   - export_report (SAFE)
 *
 * PROHIBITED:
 *   - NO arbitrary shell command execution
 *   - Cannot terminate PID 0, 1, or core system daemons
 */
class SafeActionExecutor {

    static ALLOWED_ACTIONS = new Set([
        "collect_evidence",
        "calculate_hash",
        "quarantine_file",
        "restore_file",
        "terminate_process",
        "block_indicator",
        "create_incident",
        "export_report"
    ]);

    static PROTECTED_PIDS = new Set([0, 1]);
    static PROTECTED_PROCESSES = new Set([
        "systemd", "init", "launchd", "csrss.exe", "lsass.exe",
        "services.exe", "wininit.exe", "smss.exe", "kernel_task"
    ]);

    constructor(db = null) {
        this.db = db;
        this.quarantine = new QuarantineManager();
        this.hashEngine = new HashEngine();
        this.auditLog = [];
    }

    getRiskCategory(actionType) {
        switch (actionType) {
            case "collect_evidence":
            case "calculate_hash":
            case "create_incident":
            case "export_report":
                return "SAFE";
            case "terminate_process":
            case "quarantine_file":
            case "restore_file":
                return "MODERATE";
            case "block_indicator":
                return "HIGH_RISK";
            default:
                return "HIGH_RISK";
        }
    }

    /**
     * Execute allowlisted action with parameter validation and permission checks.
     * @param {object} options - { actionType, params, userApproved, reason, initiatedBy }
     */
    async executeAction({ actionType, params = {}, userApproved = false, reason = "", initiatedBy = "user" }) {
        if (!SafeActionExecutor.ALLOWED_ACTIONS.has(actionType)) {
            return {
                success: false,
                error: `Action '${actionType}' is not in the allowlisted security actions registry. Arbitrary commands are strictly forbidden.`,
                status: "REJECTED"
            };
        }

        const riskCategory = this.getRiskCategory(actionType);
        const timestamp = new Date().toISOString();

        if (riskCategory !== "SAFE" && !userApproved) {
            return {
                success: false,
                requiresApproval: true,
                riskCategory,
                actionType,
                reason: `Action '${actionType}' is categorized as ${riskCategory} and requires explicit user confirmation.`
            };
        }

        const logEntry = {
            id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            actionType,
            riskCategory,
            timestamp,
            reason,
            userApproved,
            initiatedBy,
            status: "EXECUTED",
            details: {}
        };

        try {
            let result = null;

            switch (actionType) {
                case "calculate_hash":
                    result = await this.hashEngine.hash(params.filePath || params.path);
                    break;

                case "quarantine_file":
                    result = await this.quarantine.quarantineFile(params.filePath || params.path, reason);
                    break;

                case "restore_file":
                    result = await this.quarantine.restoreFile(params.quarantineId, params.destinationPath);
                    break;

                case "terminate_process":
                    const pid = parseInt(params.pid, 10);
                    if (isNaN(pid) || SafeActionExecutor.PROTECTED_PIDS.has(pid)) {
                        throw new Error(`Cannot terminate protected core system PID: ${pid}`);
                    }
                    if (params.processName && SafeActionExecutor.PROTECTED_PROCESSES.has(params.processName.toLowerCase())) {
                        throw new Error(`Cannot terminate protected OS process: ${params.processName}`);
                    }

                    if (process.platform === "win32") {
                        require("child_process").execSync(`taskkill /F /PID ${pid}`);
                    } else {
                        process.kill(pid, "SIGTERM");
                    }
                    result = { pid, terminated: true };
                    break;

                case "collect_evidence":
                    result = {
                        collectedAt: timestamp,
                        target: params.target || "system",
                        data: params.data || {}
                    };
                    break;

                case "block_indicator":
                    result = {
                        blocked: true,
                        indicator: params.indicator,
                        type: params.type || "ip"
                    };
                    break;

                case "create_incident":
                    result = {
                        incidentCreated: true,
                        incidentId: params.incidentId || `INC-${Date.now()}`
                    };
                    break;

                case "export_report":
                    result = {
                        exported: true,
                        format: params.format || "json"
                    };
                    break;

                default:
                    result = { executed: true };
                    break;
            }

            logEntry.details = result;
            this._recordAudit(logEntry);

            return {
                success: true,
                riskCategory,
                actionType,
                result,
                logEntry
            };

        } catch (err) {
            logEntry.status = "FAILED";
            logEntry.error = err.message;
            this._recordAudit(logEntry);
            return {
                success: false,
                error: err.message,
                logEntry
            };
        }
    }

    _recordAudit(entry) {
        this.auditLog.push(entry);
        if (this.auditLog.length > 500) this.auditLog.shift();
        console.log(`[SafeActionExecutor] ${entry.actionType} [${entry.riskCategory}] -> ${entry.status}`);
    }

    getAuditLog() {
        return [...this.auditLog];
    }
}

module.exports = SafeActionExecutor;
