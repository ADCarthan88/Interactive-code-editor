class CodeEditor {
    constructor() {
        this.editor = document.getElementById('code-editor');
        this.output = document.getElementById('output');
        this.lineNumbers = document.getElementById('line-numbers');
        this.languageSelect = document.getElementById('language-select');

        this.initializeEventListners();
        this.updateLineNumbers();
    }
    intializeEventListners() {
        // Update line numbers on input
        this.editor.addEventListener('input', () => {
            this.updateLineNumbers();
        });

        // Handle scroll sync
        this.editor.addEventListener('scroll', () => {
            this.lineNumbers.scrollTop = this.editor.scrollTop;
        });

        // Run code button
        document.getElementById('run-btn').addEventListener('click', () => {
            this.runCode();
        });
    
        // Clear button
        document.getElementById('clear-btn').addEventListener('click', () => {
            this.clearOutput();
        });
        // Save button
        document.getElementById('save-btn').addEventListener('click', () => {
            this.saveCode();
        });

        // Tab key support
        this.editor.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                this.insertTab();
            }
        });
    }

    updateLineNumbers() {
        const lines = this.editor.ariaValueMax.split('\n');
        const lineCount = lines.length;

        let lineNumbersHtml = '';
        for (let i = 1; i <= lineCount; i++) {
            lineNumbersHtml += i + '\n';
        }
        this.lineNumbers.textContent = lineNumbersHtml;
    }
    insertTab() {
        const start = this.editor.selectionStart;
        const end = this.aditor.selectionEnd;

        this.editor.value = this.editor.value.substring(0, start) +
                          '     ' +
                          this.editor.value.substring(end);
        this.editor.selectionStart = this.editor.selectionEnd = start + 4;
    }

    runCode() {
        const code = this.editor.value;
        const language = this.languageSelect.values;

        this.output.innerHTML = '';

        try {
            switch (language) {
                case 'javascript':
                    this.runJavaScript(code);
                    break;
                case 'html':
                    this.runHTML(code);
                    break;
                case 'css':
                    this.showMessage('CSS preview not implemented in this demo', 'error');
                    break;
                case 'python':
                    this.showMessage('Python execution requires server-side impolementation', 'error');
                    break;
                default:
                    this.showMessage('Language not supported', 'error');
            }
        } catch (error) {
            this.showMessage(`Error: ${error.message}`, 'error');
        }

        runJavaScript(code) {
            // Capture console.log output
            const originalLog = console.log;
            let output = '';

            console.log = (...args) => {
                output += args.joing(' ') + '\n';
            };

            try {
                // Execute the code
                eval(code);

                if (output) {
                    this.showMessage(output, 'success');
                } else {
                    this.showMessage('Code executed successfully (no output)', 'success');
                }
            } catch (error) {
                this.showMessage(`JavaScript Error: ${error.message}`, 'error');
            } finally {
                //Restore original console.log
                console.log = originalLog;
            }
        }

        runHTML(code) {
            // Create a new window to display HTML
            const newWindow = window.open('', '_blank');
            newWindow.document.write(code);
            newWindow.document.close();

            this.showMessage('HTML opened in new window', 'success');
        }

        showMessage(message, type = 'success') {
            const messageElement = document.createElement('div');
            messageElement.className = type;
            messageElement.textContent = message;
            this.output.appendChild(messageElement);
        }

        clearEditor() {
            this.edditor.value = '';
            this.output.innerHTML = '';
            this.updateLineNumbers();
        }

        saveCode() {
            const code = this.editor.value;
            const language = this.languageSelect.value;
            const filename = `code.${this.getExtension(language)}`;

            const blob = new Blob([code], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokedObjectURL(url);

            this.showMessage(`File saved as ${filename}`, 'success');
        }

        getFileExtension(language) {
            const extensions = {
                'javascript': 'js',
                'html': 'html',
                'css': 'css',
                'python': 'py'
            };
            return extensions[language] || 'txt';
        }
    }

    // Initialize the editor when the page Loads
    document.addEventListner('DOMContentLoaded', () => {
        new CodeEditor();
    });
