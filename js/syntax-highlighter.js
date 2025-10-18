export class SyntaxHighlighter {
    constructor() {
        this.languages = {
            javascript: {
                keywords: /\b(const|let|var|function|class|if|else|for|while|return|import|export)\b/g,
                strings: /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g,
                comments: /\/\/.*$|\/\*[\s\S]*?\*\//gm,
                numbers: /\b\d+\.?\d*\b/g
            }
        };
    }

    highlight(code, language) {
        try {
            const rules = this.languages[language];
            if (!rules) return this.escapeHtml(code);

            // Escape HTML first to prevent XSS
            let escapedCode = this.escapeHtml(code);

            return escapedCode
                .replace(rules.comments, '<span class="comment">$&</span>')
                .replace(rules.strings, '<span class="string">$&</span>')
                .replace(rules.keywords, '<span class="keyword">$&</span>')
                .replace(rules.numbers, '<span class="number">$&</span>');
        } catch (error) {
            console.error('Syntax highlighting error:', error);
            return this.escapeHtml(code);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}