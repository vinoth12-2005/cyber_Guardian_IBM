const Event = require("../../core/events/Event");
const EventTypes = require("../../core/events/EventTypes");

/**
 * NetworkWatcher
 * Tracks connection deltas between scan cycles.
 * Emits CONNECTION_ESTABLISHED / CONNECTION_CLOSED events.
 */
class NetworkWatcher {

    constructor(collector, eventBus) {
        this.collector = collector;
        this.eventBus  = eventBus;
        this.previous  = new Map();
    }

    _connectionKey(conn) {
        return `${conn.protocol}:${conn.localAddr}:${conn.localPort}->${conn.remoteAddr}:${conn.remotePort}:${conn.pid}`;
    }

    async scan() {

        let connections, dnsCache;

        try {
            ({ connections, dnsCache } = await this.collector.collect());
        } catch (err) {
            console.error("[NetworkWatcher] Collection error:", err.message);
            return;
        }

        const current = new Map();

        for (const conn of connections) {

            const key = this._connectionKey(conn);
            current.set(key, conn);

            if (!this.previous.has(key) && conn.state === "ESTABLISHED") {

                if (this.eventBus) {
                    this.eventBus.publish(
                        new Event("CONNECTION_ESTABLISHED", conn)
                    );
                }
            }

        }

        for (const [key, conn] of this.previous.entries()) {
            if (!current.has(key)) {

                if (this.eventBus) {
                    this.eventBus.publish(
                        new Event("CONNECTION_CLOSED", conn)
                    );
                }
            }
        }

        this.previous = current;

        return { connections, dnsCache };
    }

}

module.exports = NetworkWatcher;
