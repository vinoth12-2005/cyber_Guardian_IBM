const AlertFilter = require("./AlertFilter");
const WindowsNotifier = require("../notifications/WindowsNotifier");
const AlertSound = require("./AlertSound");

/**
 * AlertManager
 * Manages runtime alert state, coordinates DB persistence,
 * triggers system notifications, and plays severity-based sounds.
 */
class AlertManager {

    constructor(alertRepository = null, config = {}) {
        this.alerts          = [];
        this.repository      = alertRepository;
        this.notifier        = new WindowsNotifier(config.notificationsEnabled !== false);
        this.soundPlayer     = new AlertSound(config.soundEnabled !== false);
        this.listeners       = [];
    }

    /**
     * Add a listener callback for new alerts.
     */
    onAlert(callback) {
        this.listeners.push(callback);
    }

    /**
     * Add a new alert to runtime state, database, and trigger notifications.
     */
    async add(alert) {

        this.alerts.push(alert);

        // Notify and play sound for warning/critical alerts
        if (alert.severity === "CRITICAL" || alert.severity === "HIGH") {
            this.notifier.notify(alert.title, alert.description, alert.severity);
            this.soundPlayer.play(alert.severity);
        } else {
            this.soundPlayer.play(alert.severity);
        }

        // Notify listeners
        for (const listener of this.listeners) {
            try {
                listener(alert);
            } catch (err) {
                console.error("[AlertManager] Listener error:", err.message);
            }
        }

        // Persist to database if repository available
        if (this.repository) {
            try {
                await this.repository.save(alert);
            } catch (err) {
                console.error("[AlertManager] DB save error:", err.message);
            }
        }

    }

    /**
     * Get all alerts in memory.
     */
    getAll() {
        return this.alerts;
    }

    /**
     * Clear all alerts in memory.
     */
    clear() {
        this.alerts = [];
    }

    /**
     * Filter alerts using criteria.
     */
    filter(criteria) {
        return AlertFilter.filter(this.alerts, criteria);
    }

    /**
     * Acknowledge an alert by ID.
     */
    async acknowledge(id) {

        // Acknowledge in memory
        const alert = this.alerts.find(a => a.id === id);
        if (alert) {
            alert.acknowledged = true;
            alert.acknowledged_at = new Date();
        }

        // Acknowledge in database
        if (this.repository) {
            await this.repository.acknowledge(id);
        }

    }

    /**
     * Acknowledge all alerts.
     */
    async acknowledgeAll() {

        for (const alert of this.alerts) {
            alert.acknowledged = true;
            alert.acknowledged_at = new Date();
        }

        if (this.repository) {
            await this.repository.acknowledgeAll();
        }

    }

}

module.exports = AlertManager;