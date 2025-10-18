// Security utilities for the code editor
class SecurityManager {
    constructor() {
        this.csrfToken = this.generateCSRFToken();
        this.setupCSP();
    }

    // Generate CSRF token
    generateCSRFToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // Setup Content Security Policy
    setupCSP() {
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src fonts.gstatic.com; img-src 'self' data:; connect-src 'self';";
        document.head.appendChild(meta);
    }

    // Sanitize HTML content
    sanitizeHTML(html) {
        // Create a temporary DOM element to parse HTML safely
        const temp = document.createElement('div');
        temp.textContent = html; // This escapes all HTML
        let sanitized = temp.innerHTML;

        // Remove dangerous patterns
        const dangerousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /<iframe\b[^>]*>/gi,
            /<object\b[^>]*>/gi,
            /<embed\b[^>]*>/gi,
            /<form\b[^>]*>/gi,
            /<input\b[^>]*>/gi,
            /<meta\b[^>]*>/gi,
            /on\w+\s*=/gi,
            /javascript:/gi,
            /data:/gi,
            /vbscript:/gi
        ];

        dangerousPatterns.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '');
        });

        return sanitized;
    }

    // Validate and sanitize JavaScript code
    validateJavaScript(code) {
        const dangerousPatterns = [
            /eval\s*\(/i,
            /Function\s*\(/i,
            /setTimeout\s*\(/i,
            /setInterval\s*\(/i,
            /document\./i,
            /window\./i,
            /global\./i,
            /process\./i,
            /require\s*\(/i,
            /import\s*\(/i,
            /fetch\s*\(/i,
            /XMLHttpRequest/i,
            /WebSocket/i,
            /localStorage/i,
            /sessionStorage/i
        ];

        const violations = [];
        dangerousPatterns.forEach((pattern, index) => {
            if (pattern.test(code)) {
                violations.push(`Potentially unsafe operation detected: ${pattern.source}`);
            }
        });

        return {
            isValid: violations.length === 0,
            violations: violations
        };
    }

    // Add CSRF token to requests
    addCSRFToken(headers = {}) {
        return {
            ...headers,
            'X-CSRF-Token': this.csrfToken,
            'Content-Type': 'application/json'
        };
    }

    // Escape output for display
    escapeOutput(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Rate limiting for API calls
    createRateLimiter(maxCalls = 10, timeWindow = 60000) {
        const calls = [];
        
        return function() {
            const now = Date.now();
            // Remove calls outside the time window
            while (calls.length > 0 && calls[0] < now - timeWindow) {
                calls.shift();
            }
            
            if (calls.length >= maxCalls) {
                throw new Error('Rate limit exceeded. Please wait before making more requests.');
            }
            
            calls.push(now);
            return true;
        };
    }
}

// Export for use in other modules
window.SecurityManager = SecurityManager;