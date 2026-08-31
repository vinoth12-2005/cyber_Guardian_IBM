const UnifiedSecurityEvent = require("../core/events/UnifiedSecurityEvent");
const EventNormalizer = require("../core/events/EventNormalizer");
const EventBus = require("../core/events/EventBus");

describe("Unified Security Events & EventBus Tests", () => {

    test("should construct UnifiedSecurityEvent with valid defaults and UUID", () => {
        const event = new UnifiedSecurityEvent({
            event_type: UnifiedSecurityEvent.EVENT_TYPES.PROCESS_STARTED,
            severity: "high",
            confidence: 0.9,
            process: { pid: "1234", name: "malware.exe" }
        });

        expect(event.event_id).toBeDefined();
        expect(event.timestamp).toBeDefined();
        expect(event.severity).toBe("high");
        expect(event.confidence).toBe(0.9);
        expect(event.process.name).toBe("malware.exe");
    });

    test("should normalize raw process, network, and file telemetry", () => {
        const rawProc = { ProcessId: 4444, ParentProcessId: 1000, ProcessName: "powershell.exe", CommandLine: "powershell.exe -enc" };
        const normProc = EventNormalizer.normalizeProcess(rawProc);
        expect(normProc.process.pid).toBe("4444");
        expect(normProc.process.ppid).toBe("1000");
        expect(normProc.process.name).toBe("powershell.exe");

        const rawNet = { local_addr: "127.0.0.1", local_port: "8080", remote_addr: "1.2.3.4", remote_port: "443", protocol: "tcp" };
        const normNet = EventNormalizer.normalizeNetwork(rawNet);
        expect(normNet.network.remote_ip).toBe("1.2.3.4");
        expect(normNet.network.remote_port).toBe("443");

        const rawFile = { filePath: "/tmp/sample.sh", fileName: "sample.sh", size: 1024 };
        const normFile = EventNormalizer.normalizeFile(rawFile, "CREATED");
        expect(normFile.file.path).toBe("/tmp/sample.sh");
        expect(normFile.event_type).toBe(UnifiedSecurityEvent.EVENT_TYPES.FILE_CREATED);
    });

    test("EventBus should publish and receive events asynchronously with wildcard support", () => {
        const bus = new EventBus();
        const received = [];

        bus.subscribe("process_started", (e) => {
            received.push(e);
        });

        const wildcardReceived = [];
        bus.subscribe("*", (e) => {
            wildcardReceived.push(e);
        });

        const evt = new UnifiedSecurityEvent({
            event_type: UnifiedSecurityEvent.EVENT_TYPES.PROCESS_STARTED,
            process: { pid: "5000", name: "test.exe" }
        });

        bus.publish(evt);

        expect(received).toHaveLength(1);
        expect(received[0].process.pid).toBe("5000");
        expect(wildcardReceived).toHaveLength(1);
        expect(bus.getHistory()).toHaveLength(1);
    });

    test("EventBus should isolate subscriber errors and not throw to publisher", () => {
        const bus = new EventBus();
        bus.subscribe("file_created", () => {
            throw new Error("Subscriber crash simulation");
        });

        const evt = new UnifiedSecurityEvent({ event_type: "file_created" });
        expect(() => bus.publish(evt)).not.toThrow();
    });
});
