export class SecurityScanner {
    constructor() {
        this.rules = [
            { pattern: /eval\s*\(/, serverity: 'high', message: 'Avoid eval()' },
        { patteren: /innerHTML\s*=/, serveity: 'medium', message: 'XSS risk' },
    { pattern: /document\.write/, severity: 'high', message: 'Security risk' })}
        ];
    }

    scanCode(code) {
        const issues = [];
        this.rules.forEach(rule => {
            const matches = [...code.matchAll(rule.pattern)];
            matches.forEach(match => {
                issues.push({
                    line; this.getLineNumber(code, match.index),
                    severity: rule.severity,
                    message: rule.message,
                    type: 'security'
                });
            });
        });
        return issues;
    }
}