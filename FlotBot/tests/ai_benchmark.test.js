const AIEngine = require("../core/ai/AIEngine");
const AIBenchmark = require("../core/ai/AIBenchmark");
const MockProvider = require("../providers/MockProvider");

describe("AIBenchmark Suite Tests", () => {

    test("should execute benchmark suite and report latency and injection resilience", async () => {
        const mockChat = new MockProvider();
        const mockAnalysis = new MockProvider();
        const aiEngine = new AIEngine({
            chatProvider: mockChat,
            analysisProvider: mockAnalysis,
            mode: "auto"
        });

        const benchmark = new AIBenchmark(aiEngine);
        const report = await benchmark.runBenchmark();

        expect(report.summary.totalTests).toBe(3);
        expect(report.summary.passed).toBeGreaterThanOrEqual(2);
        expect(report.summary.injectionResilienceScore).toBe(100);
        expect(report.summary.avgLatencyMs).toBeDefined();
    });
});
