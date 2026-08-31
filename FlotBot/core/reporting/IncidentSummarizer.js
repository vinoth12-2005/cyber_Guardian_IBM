const PromptBuilder = require("../prompts/PromptBuilder");

/**
 * IncidentSummarizer
 * Summarizes security incidents using AI.
 */
class IncidentSummarizer {

    constructor(aiEngine) {
        this.aiEngine      = aiEngine;
        this.promptBuilder = new PromptBuilder();
    }

    /**
     * Generate an incident summary for a list of alerts.
     */
    async summarize(alerts) {

        if (!alerts || alerts.length === 0) {
            return "No active security incidents to summarize.";
        }

        const prompt = this.promptBuilder.buildIncidentSummary(alerts);

        try {

            // Generate using AI engine provider
            const response = await this.aiEngine.provider.generate(prompt);
            return response.text;

        } catch (error) {

            console.error("[IncidentSummarizer] AI generation failure:", error.message);
            return `AI Summary Generation Failed: ${error.message}`;

        }

    }

}

module.exports = IncidentSummarizer;
