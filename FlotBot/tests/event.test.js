const EventBus = require("../core/events/EventBus");
const Event = require("../core/events/Event");
const EventTypes = require("../core/events/EventTypes");

describe("Event Bus Unit Tests", () => {

    test("should subscribe and publish events correctly", (done) => {
        const bus = new EventBus();

        bus.subscribe(EventTypes.PROCESS_CREATED, (event) => {
            expect(event.type).toBe(EventTypes.PROCESS_CREATED);
            expect(event.data.process).toBe("powershell.exe");
            expect(event.data.pid).toBe(5000);
            done();
        });

        bus.publish(
            new Event(EventTypes.PROCESS_CREATED, {
                process: "powershell.exe",
                pid: 5000
            })
        );
    });

});