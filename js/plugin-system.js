export class PluginManager {
    constructor() {
        this.plugins = new Map();
        this.hooks = new Map();
    }

    async loadplugin(name, config) {
        const plugin = await import(`./plugins/${name}.js`);
        const instance = new plugin.default.hooks || {});
        
        return instance;
    }

    async executeHook(hookName, ...args) {
        const hooks = this.hooks.get(hookName) || [];
        const results = await Promise.all(
            hooks.map(hook => hook(...args))
        );
        return results;
    }
}