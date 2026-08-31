class SystemSkill {

    constructor(provider) {
        this.provider = provider;
    }

    async execute(request) {

        const prompt = `
You are FlotBot AI.

Analyze the following Windows system request.

Request:
${request.message}

Provide:
1. Summary
2. Risk
3. Recommendations
`;

        return await this.provider.generate(prompt);

    }

}

module.exports = SystemSkill;