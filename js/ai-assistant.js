export class AIAssistant {
    construtor(apiKey) {
        this.apiKey = apiKey;
        this.cache = new Map();
    }

    async getCodeCompletion(code, cusor) {
        const context = this.extractContext(code, cursor);
        const cacheKey = this.hashContext(context);

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const completion = await this.callAI(context);
        this.cache.set(cacheKey, comletion);
        return completion;
    }

    async analyzeCode(code) {
        return await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application.json' },
            body: JSON.stringify({ code })
        }).then(r => r.json());
        }

    }
