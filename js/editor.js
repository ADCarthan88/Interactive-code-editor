class CodeEditor {
    constructor() {
        this.editor = document.getElementById('code-editor');
        this.output = document.getElementById('console-content');
        this.lineNumbers = document.getElementById('line-numbers');
        this.languageSelect = document.getElementById('language-select');
        
        if (!this.editor || !this.output || !this.lineNumbers || !this.languageSelect) {
            throw new Error('Required DOM elements not found');
        }
        
        // Initialize security manager
        this.security = new SecurityManager();
        this.rateLimiter = this.security.createRateLimiter(5, 10000); // 5 executions per 10 seconds
        
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
        try {
            // Rate limiting check
            this.rateLimiter();
            
            const code = this.editor.value;
            const language = this.languageSelect.value;
            
            // Input validation
            if (!code || code.trim().length === 0) {
                this.showMessage('No code to execute', 'error');
                return;
            }
            
            if (code.length > 10000) {
                this.showMessage('Code too long (max 10,000 characters)', 'error');
                return;
            }
            
            this.output.innerHTML = '';
            
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
            this.showMessage(`Error: ${this.security.escapeOutput(error.message)}`, 'error');
        }
    }
    
    runJavaScript(code) {
        // Security validation
        const validation = this.security.validateJavaScript(code);
        if (!validation.isValid) {
            this.showMessage(`Security violation: ${validation.violations.join(', ')}`, 'error');
            return;
        }
        
        const originalLog = console.log;
        let output = '';
        
        console.log = (...args) => {
            output += args.map(arg => this.security.escapeOutput(String(arg))).join(' ') + '\n';
        };
        
        try {
            // Create completely isolated execution context
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.sandbox = 'allow-scripts';
            document.body.appendChild(iframe);
            
            const iframeWindow = iframe.contentWindow;
            const iframeConsole = {
                log: (...args) => {
                    output += args.map(arg => this.security.escapeOutput(String(arg))).join(' ') + '\n';
                }
            };
            
            // Execute in sandboxed iframe
            const script = iframeWindow.document.createElement('script');
            script.textContent = `
                const console = ${JSON.stringify(iframeConsole)};
                try {
                    ${code}
                } catch (error) {
                    parent.postMessage({type: 'error', message: error.message}, '*');
                }
            `;
            
            // Listen for errors from iframe
            const errorHandler = (event) => {
                if (event.data && event.data.type === 'error') {
                    this.showMessage(`JavaScript Error: ${this.security.escapeOutput(event.data.message)}`, 'error');
                }
                window.removeEventListener('message', errorHandler);
                document.body.removeChild(iframe);
            };
            
            window.addEventListener('message', errorHandler);
            iframeWindow.document.head.appendChild(script);
            
            // Clean up after execution
            setTimeout(() => {
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
                window.removeEventListener('message', errorHandler);
            }, 1000);
            
            if (output) {
                this.showMessage(output, 'success');
            } else {
                this.showMessage('Code executed successfully', 'success');
            }
        } catch (error) {
            this.showMessage(`JavaScript Error: ${this.security.escapeOutput(error.message)}`, 'error');
        } finally {
            console.log = originalLog;
        }
    }
    
    isCodeSafe(code) {
        const dangerousPatterns = [
            /eval\s*\(/,
            /Function\s*\(/,
            /setTimeout\s*\(/,
            /setInterval\s*\(/,
            /document\./,
            /window\./,
            /global\./,
            /process\./,
            /require\s*\(/,
            /import\s*\(/
        ];
        
        return !dangerousPatterns.some(pattern => pattern.test(code));
    }
    
    runHTML(code) {
        const previewFrame = document.getElementById('preview-frame');
        if (previewFrame) {
            const sanitizedCode = this.security.sanitizeHTML(code);
            
            // Additional security: wrap in secure HTML template
            const secureHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'none'; object-src 'none';">
                    <title>Preview</title>
                </head>
                <body>
                    ${sanitizedCode}
                </body>
                </html>
            `;
            
            const blob = new Blob([secureHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            previewFrame.src = url;
            
            previewFrame.onload = () => {
                URL.revokeObjectURL(url);
            };
            
            this.showMessage('HTML rendered in secure preview', 'success');
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
        // Comprehensive HTML sanitization
        const dangerousTags = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /<iframe\b[^>]*>/gi,
            /<object\b[^>]*>/gi,
            /<embed\b[^>]*>/gi,
            /<form\b[^>]*>/gi,
            /<input\b[^>]*>/gi,
            /<meta\b[^>]*>/gi
        ];
        
        const dangerousAttributes = [
            /on\w+\s*=/gi,  // onclick, onload, etc.
            /javascript:/gi,
            /data:/gi,
            /vbscript:/gi
        ];
        
        let sanitized = html;
        
        // Remove dangerous tags
        dangerousTags.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '');
        });
        
        // Remove dangerous attributes
        dangerousAttributes.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '');
        });
        
        return sanitized;
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