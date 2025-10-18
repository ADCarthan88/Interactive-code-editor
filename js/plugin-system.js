export class PluginManager {
    constructor() {
        this.plugins = new Map();
        this.hooks = new Map();
        this.allowedPlugins = new Set(['syntax-highlighter', 'formatter', 'linter']);
    }

    async loadPlugin(pluginName, config) {
        try {
            if (!this.isValidPluginName(pluginName)) {
                throw new Error(`Invalid plugin name: ${pluginName}`);
            }

            if (!this.allowedPlugins.has(pluginName)) {
                throw new Error(`Plugin not allowed: ${pluginName}`);
            }

            const pluginModule = await import(`./plugins/${encodeURIComponent(pluginName)}.js`);
            
            if (!pluginModule.default || typeof pluginModule.default !== 'function') {
                throw new Error('Invalid plugin format');
            }

            const instance = new pluginModule.default(config);
            
            this.plugins.set(pluginName, instance);
            this.registerHooks(pluginName, instance.hooks || {});
            
            return instance;
        } catch (error) {
            console.error(`Failed to load plugin ${pluginName}:`, error);
            throw error;
        }
    }

    isValidPluginName(name) {
        return /^[a-zA-Z0-9-]+$/.test(name) && name.length <= 50;
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