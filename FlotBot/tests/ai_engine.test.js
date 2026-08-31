const AIEngine = require("../core/ai/AIEngine");
const MockProvider = require("../providers/MockProvider");

describe("AIEngine Dual-Engine & Routing Tests", () => {
    let aiEngine;
    let mockChat;
    let mockAnalysis;

    beforeEach(() => {
        mockChat = new MockProvider();
        mockAnalysis = new MockProvider();
        aiEngine = new AIEngine({
            chatProvider: mockChat,
            analysisProvider: mockAnalysis,
            mode: "auto"
        });
    });

    test("should initialize mode properly and support 1-click mode switching", () => {
        expect(aiEngine.getMode()).toBe("auto");
        const res1 = aiEngine.setMode("offline");
        expect(res1.success).toBe(true);
        expect(aiEngine.getMode()).toBe("offline");

        const res2 = aiEngine.setMode("online");
        expect(res2.success).toBe(true);
        expect(aiEngine.getMode()).toBe("online");
    });

    test("should route chat strictly to offline provider when mode is offline", async () => {
        aiEngine.setMode("offline");
        const res = await aiEngine.chat("test-session", "What is the weather today?");
        expect(res.success).toBe(true);
        expect(res.mode).toBe("offline");
    });

    test("should handle /mode slash commands in chat", async () => {
        const res = await aiEngine.chat("test-session", "/mode offline");
        expect(res.success).toBe(true);
        expect(aiEngine.getMode()).toBe("offline");
        expect(res.reply).toContain("Offline");
    });

    test("should list available models for online and offline engines", async () => {
        const models = await aiEngine.listAvailableModels();
        expect(models).toHaveProperty("gemini");
        expect(models).toHaveProperty("ollama");
        expect(models.gemini.models).toContain("gemini-2.0-flash");
    });

    test("should respond to instant greetings with zero lag", async () => {
        const res = await aiEngine.chat("greet-session", "hello");
        expect(res.success).toBe(true);
        expect(res.provider).toBe("instant");
        expect(res.reply).toContain("FlotBot");
    });
});
