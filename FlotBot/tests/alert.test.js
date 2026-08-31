const Alert = require("../core/alerts/Alert");
const AlertManager = require("../core/alerts/AlertManager");
const Severity = require("../core/alerts/Severity");
const Category = require("../core/alerts/AlertCategory");

describe("Alert & AlertManager Tests", () => {

    let manager;

    beforeEach(() => {
        // Init manager without DB repository
        manager = new AlertManager(null, { notificationsEnabled: false, soundEnabled: false });
    });

    test("should correctly instantiate an Alert", () => {
        const alert = new Alert({
            title: "Test Alert",
            severity: Severity.HIGH,
            category: Category.EXECUTION,
            source: "Test Suite",
            description: "A test description",
            recommendation: "Review process",
            evidence: { test: true },
            mitre: ["T1059"]
        });

        expect(alert.id).toBeDefined();
        expect(alert.timestamp).toBeInstanceOf(Date);
        expect(alert.title).toBe("Test Alert");
        expect(alert.severity).toBe(Severity.HIGH);
        expect(alert.category).toBe(Category.EXECUTION);
        expect(alert.evidence.test).toBe(true);
        expect(alert.mitre).toContain("T1059");
    });

    test("should add and retrieve alerts in AlertManager", async () => {
        const alert = new Alert({
            title: "PowerShell Warning",
            severity: Severity.MEDIUM,
            category: Category.EXECUTION,
            source: "System Collector",
            description: "Process launch"
        });

        await manager.add(alert);

        const list = manager.getAll();
        expect(list).toHaveLength(1);
        expect(list[0].id).toBe(alert.id);
    });

    test("should acknowledge alert state change", async () => {
        const alert = new Alert({
            title: "Network Threat",
            severity: Severity.CRITICAL,
            category: Category.CONNECTION,
            source: "Network Collector",
            description: "C2 socket"
        });

        await manager.add(alert);
        expect(alert.acknowledged).toBeUndefined();

        await manager.acknowledge(alert.id);
        expect(alert.acknowledged).toBe(true);
        expect(alert.acknowledged_at).toBeInstanceOf(Date);
    });

    test("should filter alerts by severity or category criteria", async () => {
        await manager.add(new Alert({ title: "A", severity: Severity.HIGH, category: Category.EXECUTION, source: "X" }));
        await manager.add(new Alert({ title: "B", severity: Severity.LOW, category: Category.PERSISTENCE, source: "Y" }));

        const filteredHigh = manager.filter({ severity: Severity.HIGH });
        expect(filteredHigh).toHaveLength(1);
        expect(filteredHigh[0].title).toBe("A");

        const filteredPersistence = manager.filter({ category: Category.PERSISTENCE });
        expect(filteredPersistence).toHaveLength(1);
        expect(filteredPersistence[0].title).toBe("B");
    });

});