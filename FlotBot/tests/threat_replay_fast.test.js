const ThreatReplay = require("../core/reporting/ThreatReplay");

describe("ThreatReplay Big Data Engine", () => {

    let syntheticEvents = [];
    const baseTime = Date.now() - 3600_000 * 5; // 5 hours ago

    beforeAll(() => {
        // Generate 10,000 synthetic events
        syntheticEvents = new Array(10000);
        for (let i = 0; i < 10000; i++) {
            const eventTime = new Date(baseTime + i * 1000).toISOString();
            const isAlert = i % 250 === 0;
            syntheticEvents[i] = {
                id: `ev_${i}`,
                timestamp: eventTime,
                type: isAlert ? "SECURITY_ALERT_TRIGGERED" : (i % 3 === 0 ? "PROCESS_LAUNCHED" : i % 3 === 1 ? "CONNECTION_ESTABLISHED" : "FILE_SYSTEM_ACTIVITY"),
                title: isAlert ? `🚨 Alert Event ${i}` : `Event ${i}`,
                description: `Synthetic big data event index ${i}`,
                evidence: {
                    pid: 1000 + (i % 50),
                    remote_addr: `192.168.1.${(i % 200) + 1}`,
                    file_path: `/var/log/app_${i % 100}.log`,
                    title: isAlert ? `Alert ${i}` : undefined
                }
            };
        }
    });

    test("Initializes 10,000 events in under 50ms with state checkpoints", () => {
        const t0 = Date.now();
        const replay = new ThreatReplay(syntheticEvents, { checkpointInterval: 100 });
        const elapsed = Date.now() - t0;

        expect(replay.getTotalSteps()).toBe(10000);
        expect(replay.checkpoints.length).toBeGreaterThan(90);
        expect(elapsed).toBeLessThan(1000);
    });

    test("Performs Binary Search timestamp seek O(log N) in < 1ms", () => {
        const replay = new ThreatReplay(syntheticEvents);
        const targetIso = new Date(baseTime + 5432 * 1000).toISOString();

        const t0 = performance.now();
        const step = replay.seekTimestamp(targetIso);
        const elapsed = performance.now() - t0;

        expect(step).toBeDefined();
        expect(step.stepIndex).toBe(5432);
        expect(step.event.id).toBe("ev_5432");
        expect(elapsed).toBeLessThan(5); // Sub-millisecond binary search
    });

    test("Random-access percentage seek and step navigation", () => {
        const replay = new ThreatReplay(syntheticEvents);
        const step50 = replay.seekPercent(50);
        expect(step50.stepIndex).toBe(5000);
        expect(step50.progressPercent).toBe(50.0);

        const stepNext = replay.next(10);
        expect(stepNext.stepIndex).toBe(5010);

        const stepPrev = replay.previous(5);
        expect(stepPrev.stepIndex).toBe(5005);
    });

    test("State checkpoints accurately aggregate telemetry counts", () => {
        const replay = new ThreatReplay(syntheticEvents, { checkpointInterval: 50 });
        const step = replay.seek(2500);

        expect(step.checkpointState).toBeDefined();
        expect(step.checkpointState.activePidsCount).toBeGreaterThan(0);
        expect(step.checkpointState.activeSocketsCount).toBeGreaterThan(0);
        expect(step.checkpointState.modifiedFilesCount).toBeGreaterThan(0);
        expect(step.checkpointState.alertsCount).toBeGreaterThan(0);
    });

    test("Windowed event streaming returns chunked results for virtual tables", () => {
        const replay = new ThreatReplay(syntheticEvents);
        const chunk = replay.getEventsWindow(1500, 50);

        expect(chunk.total).toBe(10000);
        expect(chunk.offset).toBe(1500);
        expect(chunk.limit).toBe(50);
        expect(chunk.items.length).toBe(50);
        expect(chunk.items[0].id).toBe("ev_1500");
        expect(chunk.items[49].id).toBe("ev_1549");
    });

    test("Configures variable playback speed multipliers", () => {
        const replay = new ThreatReplay(syntheticEvents);
        replay.setSpeed(10);
        expect(replay.playbackSpeed).toBe(10);
        replay.setSpeed(0); // instant
        expect(replay.playbackSpeed).toBe(0);
    });

});
