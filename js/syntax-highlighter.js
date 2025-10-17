export class SyntaxHighlighter {
    constructor() {
        this.languages = {
            javascript:
            keywords:  /\b(const|let|var|function|class|if|else|for|while|return|import|export)\b/g,
            strings: /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g,
            comments: /\/\/.*$|\/\*[\s\S]*?\*\//gm,
            numbers: /\b\d+\.?\d*\b/g
        }
 :   }
}

highlight(code, language) {
    const rules = this.languages[language];
    if (!rules) return code;

    return code
        .replace(rules.comments, '<span class="comment">&</span>')
        .replace(rules.strings, '<span class="string">&</span>')
        .replace(rules.keywords, '<span class="keyword">&</span>')
        .replace(rules.numbers, '<span class="number">&</span>');
}