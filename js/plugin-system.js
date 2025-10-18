export class PluginManager {
    constructor() {
        this.plugins = new Map();
        this.hooks = new Map();
        this.allowedPlugins = new Set(['syntax-highlighter', 'formatter', 'linter']);
    }

    async loadPlugin(pluginName, config) {
        try {
            // Enhanced validation
            if (!this.isValidPluginName(pluginName)) {
                throw new Error(`Invalid plugin name: ${pluginName}`);
            }

            if (!this.allowedPlugins.has(pluginName)) {
                throw new Error(`Plugin not allowed: ${pluginName}`);
            }

            // Prevent path traversal attacks
            const safePath = pluginName.replace(/[^a-zA-Z0-9-]/g, '');
            if (safePath !== pluginName || pluginName.includes('..') || pluginName.includes('/')) {
                throw new Error('Invalid characters in plugin name');
            }
            
            // Rate limiting for plugin loading
            if (!this.pluginLoadLimiter) {
                this.pluginLoadLimiter = this.createRateLimiter(3, 60000); // 3 plugins per minute
            }
            this.pluginLoadLimiter();
            
            // Validate plugin exists in whitelist before attempting import
            const pluginPath = `./plugins/${safePath}.js`;
            
            const pluginModule = await import(pluginPath);
            
            if (!pluginModule.default || typeof pluginModule.default !== 'function') {
                throw new Error('Invalid plugin format');
            }

            // Validate config object
            if (config && typeof config !== 'object') {
                throw new Error('Invalid plugin configuration');
            }

            const instance = new pluginModule.default(this.sanitizeConfig(config));
            
            this.plugins.set(pluginName, instance);
            this.registerHooks(pluginName, instance.hooks || {});
            
            console.log(`Plugin ${pluginName} loaded successfully`);
            return instance;
        } catch (error) {
            console.error(`Failed to load plugin ${pluginName}:`, error);
            throw error;
        }
    }
    
    sanitizeConfig(config) {
        if (!config) return {};
        
        // Remove potentially dangerous properties
        const sanitized = { ...config };
        delete sanitized.__proto__;
        delete sanitized.constructor;
        delete sanitized.prototype;
        
        return sanitized;
    }
    
    createRateLimiter(maxCalls, timeWindow) {
        const calls = [];
        
        return function() {
            const now = Date.now();
            while (calls.length > 0 && calls[0] < now - timeWindow) {
                calls.shift();
            }
            
            if (calls.length >= maxCalls) {
                throw new Error('Rate limit exceeded');
            }
            
            calls.push(now);
            return true;
        };
    }

    isValidPluginName(name) {
        return /^[a-zA-Z0-9-]+$/.test(name) && 
               name.length <= 50 && 
               name.length > 0 &&
               !name.includes('..') &&
               !name.startsWith('-') &&
               !name.endsWith('-');
    }

    registerHooks(pluginName, hooks) {
        Object.entries(hooks).forEach(([hookName, hookFn]) => {
            if (typeof hookFn === 'function') {
                if (!this.hooks.has(hookName)) {
                    this.hooks.set(hookName, []);
                }
                this.hooks.get(hookName).push(hookFn);
            }
        });
    }

    async executeHook(hookName, ...args) {
        try {
            const hooks = this.hooks.get(hookName) || [];
            const results = await Promise.all(
                hooks.map(async (hook) => {
                    try {
                        return await hook(...args);
                    } catch (error) {
                        console.error(`Hook ${hookName} failed:`, error);
                        return null;
                    }
                })
            );
            return results.filter(result => result !== null);
        } catch (error) {
            console.error(`Failed to execute hook ${hookName}:`, error);
            return [];
        }
    }
}