/**
 * SystemAdapter  ─  Cross-Platform System Inspection Interface
 * ─────────────────────────────────────────────────────────────
 * Base class defining unified security inspection interface across:
 *   - Windows
 *   - Linux
 *   - macOS
 *
 * All platform-specific adapters must implement these methods using
 * native APIs or trusted OS system tools.
 */
class SystemAdapter {

    /**
     * Collect hardware, OS, kernel, hostname, current user & privilege level.
     * @returns {Promise<object>}
     */
    async getSystemInformation() {
        throw new Error("getSystemInformation() not implemented by platform adapter.");
    }

    /**
     * Enumerate all active running processes with metadata (PID, PPID, exe, user, cpu, mem, hash, signature).
     * @returns {Promise<Array<object>>}
     */
    async getRunningProcesses() {
        throw new Error("getRunningProcesses() not implemented by platform adapter.");
    }

    /**
     * Enumerate open TCP/UDP network connections correlated with PIDs.
     * @returns {Promise<Array<object>>}
     */
    async getOpenNetworkConnections() {
        throw new Error("getOpenNetworkConnections() not implemented by platform adapter.");
    }

    /**
     * Inspect startup locations (Registry Run keys, systemd, LaunchAgents, cron, autostart).
     * @returns {Promise<Array<object>>}
     */
    async getStartupItems() {
        throw new Error("getStartupItems() not implemented by platform adapter.");
    }

    /**
     * Retrieve OS background services status.
     * @returns {Promise<Array<object>>}
     */
    async getServices() {
        throw new Error("getServices() not implemented by platform adapter.");
    }

    /**
     * Read native firewall status (read-only).
     * @returns {Promise<object>}
     */
    async getFirewallStatus() {
        throw new Error("getFirewallStatus() not implemented by platform adapter.");
    }

    /**
     * Read OS security status (Defender, AppArmor, SELinux, SIP, Gatekeeper).
     * @returns {Promise<object>}
     */
    async getSecurityStatus() {
        throw new Error("getSecurityStatus() not implemented by platform adapter.");
    }

    /**
     * Retrieve active logged-in users.
     * @returns {Promise<Array<object>>}
     */
    async getLoggedInUsers() {
        throw new Error("getLoggedInUsers() not implemented by platform adapter.");
    }

    /**
     * Get disk storage and filesystem information.
     * @returns {Promise<Array<object>>}
     */
    async getDiskInformation() {
        throw new Error("getDiskInformation() not implemented by platform adapter.");
    }

    /**
     * Get recent security-relevant system events / logs.
     * @returns {Promise<Array<object>>}
     */
    async getRecentSystemEvents() {
        throw new Error("getRecentSystemEvents() not implemented by platform adapter.");
    }
}

module.exports = SystemAdapter;
