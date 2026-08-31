const EventEmitter = require("events");

/**
 * EventBus  ─  Asynchronous Central Security Event Highway
 * ─────────────────────────────────────────────────────────────
 * Connects Sensors → Normalizer → Detection Engines → Correlation → Risk → AI Router.
 * Supports async subscriber dispatching, topic filtering, wildcard subscriptions,
 * and seamless backwards compatibility with legacy Event classes.
 */
class EventBus {

    constructor() {
        this.emitter = new EventEmitter();
        this.emitter.setMaxListeners(100);
        this._history = [];
        this._maxHistory = 1000;
        this._subscribers = new Map();
    }

    /**
     * Subscribe to a specific event type or wildcard "*"
     * @param {string} eventType
     * @param {Function} handler - (event) => Promise<void> | void
     * @returns {Function} unsubscribe function
     */
    subscribe(eventType, handler) {
        if (typeof handler !== "function") {
            throw new Error("EventBus subscriber handler must be a function");
        }

        const wrappedHandler = (event) => {
            try {
                const res = handler(event);
                if (res && typeof res.then === "function") {
                    res.catch(err => {
                        console.error(`[EventBus] Async subscriber error for '${eventType}':`, err.message);
                    });
                }
            } catch (err) {
                console.error(`[EventBus] Subscriber error for '${eventType}':`, err.message);
            }
        };

        this.emitter.on(eventType, wrappedHandler);

        if (!this._subscribers.has(eventType)) {
            this._subscribers.set(eventType, new Set());
        }
        this._subscribers.get(eventType).add(wrappedHandler);

        return () => {
            this.emitter.removeListener(eventType, wrappedHandler);
            const set = this._subscribers.get(eventType);
            if (set) set.delete(wrappedHandler);
        };
    }

    /**
     * Publish an event onto the bus.
     * @param {object} event
     */
    publish(event) {
        if (!event) return;

        // Determine event channel name (supports both new UnifiedSecurityEvent and legacy Event)
        const eventType = event.event_type || event.type || "security_event";

        // Store in bounded ring buffer history
        this._history.push(event);
        if (this._history.length > this._maxHistory) {
            this._history.shift();
        }

        // Emit specific event type and wildcard topic
        this.emitter.emit(eventType, event);
        this.emitter.emit("*", event);
    }

    /**
     * Get recent event history
     * @param {number} limit
     * @param {string} [eventType]
     * @returns {Array<object>}
     */
    getHistory(limit = 100, eventType = null) {
        let items = this._history;
        if (eventType) {
            items = items.filter(e => (e.event_type || e.type) === eventType);
        }
        return items.slice(-limit);
    }

    /**
     * Clear all subscribers and history
     */
    clear() {
        this.emitter.removeAllListeners();
        this._history = [];
        this._subscribers.clear();
    }
}

module.exports = EventBus;