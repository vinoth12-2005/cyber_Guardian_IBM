const EventBus = require("../core/events/EventBus");
const EventTypes = require("../core/events/EventTypes");
const SystemWatcher = require("../modules/system/watcher");

describe("SystemWatcher State Integration Tests", () => {

    test("should detect and emit new process creation events", async () => {
        const mockCollector = {
            collect: jest.fn()
                .mockResolvedValueOnce([
                    { pid: "100", image: "explorer.exe" }
                ])
                .mockResolvedValueOnce([
                    { pid: "100", image: "explorer.exe" },
                    { pid: "200", image: "cmd.exe" }
                ])
        };

        const eventBus = new EventBus();
        const creationEvents = [];

        eventBus.subscribe(EventTypes.PROCESS_CREATED, (event) => {
            creationEvents.push(event);
        });

        const watcher = new SystemWatcher(mockCollector, eventBus);

        // Initial scan (populates history)
        await watcher.scan();
        expect(creationEvents).toHaveLength(1); // explorer.exe created first time

        // Second scan (detects cmd.exe)
        await watcher.scan();
        expect(creationEvents).toHaveLength(2);
        expect(creationEvents[1].data.image).toBe("cmd.exe");
    });

});