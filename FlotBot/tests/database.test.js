const Database = require("../database/Database");
const { initSchema } = require("../database/schema");
const AlertRepository = require("../database/repositories/AlertRepository");
const Alert = require("../core/alerts/Alert");

describe("Database Integration Tests", () => {

    let db;
    let repository;

    beforeAll(async () => {
        // Connect to in-memory database
        db = new Database(":memory:");
        await db.connect();
        await initSchema(db);
        repository = new AlertRepository(db);
    });

    afterAll(async () => {
        await db.close();
    });

    test("should save and count alerts in SQLite repo", async () => {
        const initialCount = await repository.count();
        expect(initialCount).toBe(0);

        const alert = new Alert({
            title: "SQL Test",
            severity: "LOW",
            category: "TEST",
            source: "DB Suite",
            description: "Evidence description"
        });

        await repository.save(alert);

        const newCount = await repository.count();
        expect(newCount).toBe(1);
    });

    test("should retrieve stored alerts", async () => {
        const alerts = await repository.getAll();
        expect(alerts).toHaveLength(1);
        expect(alerts[0].title).toBe("SQL Test");
    });

    test("should acknowledge alert in database", async () => {
        const alerts = await repository.getAll();
        const alertId = alerts[0].id;

        const unack = await repository.getUnacknowledged();
        expect(unack).toHaveLength(1);

        await repository.acknowledge(alertId);

        const unackAfter = await repository.getUnacknowledged();
        expect(unackAfter).toHaveLength(0);
    });

});
