import { CodeEditor } from '../js/editor.js';

describe('CodeEditor', () => {
    let editor;

    beforeEach(() => {
        document.body.innerHTML = '<div id="code-editor"></div>';
        editor = new CodeEditor();
    });

    test('should initialize with default settings', () => {
        expect(editor.language).toBe('javascript');
        expect(editor.theme).toBe('dark');
    });

    test('should update line numbers correctly', () => {
        editor.setValue('line1\nline2\nline3');
        expect(editor.getLineCount()).toBe(3);
    });

    test('should handle syntax highlighting', () => {
        const code = 'const x = 5;';
        const highlighted = editor.hightlightSyntax(code, 'javascript');
        expect(highlighted).toContain('<span class="keyword">const</span>');
    });
});