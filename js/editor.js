class CodeEditor {
    constructor() {
        this.editor = document.getElementById('code-editor');
        this.output = document.getElementById('console-content');
        this.lineNumbers = document.getElementById('line-numbers');
        this.languageSelect = document.getElementById('language-select');
        
        if (!this.editor || !this.output || !this.lineNumbers || !this.languageSelect) {
            throw new Error('Required DOM elements not found');
        }
        
        this.initializeEventListeners();
        this.updateLineNumbers();
    }
    
    initializeEventListeners() {
        this.editor.addEventListener('input', () => {
            this.updateLineNumbers();
            this.updateCursorPosition();
        });
        
        this.editor.addEventListener('scroll', () => {
            this.lineNumbers.scrollTop = this.editor.scrollTop;
        });
        
        document.getElementById('run-btn')?.addEventListener('click', () => {
            this.runCode();
        });
        
        document.getElementById('clear-btn')?.addEventListener('click', () => {
            this.clearEditor();
        });
        
        document.getElementById('save-btn')?.addEventListener('click', () => {
            this.saveCode();
        });
        
        this.editor.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                this.insertTab();
            }
        });
    }
    
    updateLineNumbers() {
        const lines = this.editor.value.split('\n');
        const lineCount = lines.length;
        
        let lineNumbersHtml = '';
        for (let i = 1; i <= lineCount; i++) {
            lineNumbersHtml += i + '\n';
        }
        
        this.lineNumbers.textContent = lineNumbersHtml;
    }
    
    updateCursorPosition() {
        const cursorPos = this.editor.selectionStart;
        const textBeforeCursor = this.editor.value.substring(0, cursorPos);
        const lines = textBeforeCursor.split('\n');
        const line = lines.length;
        const col = lines[lines.length - 1].length + 1;
        
        const posElement = document.getElementById('cursor-position');
        if (posElement) {
            posElement.textContent = `Ln ${line}, Col ${col}`;
        }
    }
    
    insertTab() {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        
        this.editor.value = this.editor.value.substring(0, start) + 
                           '    ' + 
                           this.editor.value.substring(end);
        
        this.editor.selectionStart = this.editor.selectionEnd = start + 4;
    }
    
    runCode() {
        const code = this.editor.value;
        const language = this.languageSelect.value;
        
        this.output.innerHTML = '';
        
        try {
            switch (language) {
                case 'javascript':
                    this.runJavaScript(code);
                    break;
                case 'html':
                    this.runHTML(code);
                    break;
                default:
                    this.showMessage(`${language} execution not implemented`, 'info');
            }
        } catch (error) {
            this.showMessage(`Error: ${this.sanitizeOutput(error.message)}`, 'error');
        }
    }
    
    runJavaScript(code) {
        const originalLog = console.log;
        let output = '';
        
        console.log = (...args) => {
            output += args.map(arg => this.sanitizeOutput(String(arg))).join(' ') + '\n';
        };
        
        try {
            // Create safe execution context
            const safeEval = new Function('console', code);
            safeEval({ log: console.log });
            
            if (output) {
                this.showMessage(output, 'success');
            } else {
                this.showMessage('Code executed successfully', 'success');
            }
        } catch (error) {
            this.showMessage(`JavaScript Error: ${this.sanitizeOutput(error.message)}`, 'error');
        } finally {
            console.log = originalLog;
        }
    }
    
    runHTML(code) {
        const previewFrame = document.getElementById('preview-frame');
        if (previewFrame) {
            const sanitizedCode = this.sanitizeHTML(code);
            previewFrame.srcdoc = sanitizedCode;
            this.showMessage('HTML rendered in preview', 'success');
        } else {
            this.showMessage('Preview frame not available', 'error');
        }
    }
    
    sanitizeOutput(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    sanitizeHTML(html) {
        // Basic HTML sanitization - in production, use DOMPurify
        return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    
    showMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `console-message ${type}`;
        messageElement.textContent = message;
        this.output.appendChild(messageElement);
        this.output.scrollTop = this.output.scrollHeight;
    }
    
    clearEditor() {
        this.editor.value = '';
        this.output.innerHTML = '';
        this.updateLineNumbers();
    }
    
    saveCode() {
        const code = this.editor.value;
        const language = this.languageSelect.value;
        const filename = `code.${this.getFileExtension(language)}`;
        
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showMessage(`File saved as ${filename}`, 'success');
    }
    
    getFileExtension(language) {
        const extensions = {
            'javascript': 'js',
            'typescript': 'ts',
            'html': 'html',
            'css': 'css',
            'python': 'py',
            'java': 'java',
            'cpp': 'cpp',
            'json': 'json',
            'markdown': 'md'
        };
        return extensions[language] || 'txt';
    }
}

// Initialize editor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.codeEditor = new CodeEditor();
    } catch (error) {
        console.error('Failed to initialize code editor:', error);
    }
});