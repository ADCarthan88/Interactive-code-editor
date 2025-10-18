export class PerformanceMonitor {
    constructor() {
        this.metrics = {
            renderTime: [],
            memoryUsage: [],
            keystrokes: 0
        };
        this.maxMetrics = 1000; // Prevent memory leaks
    }

    measureRenderTime(callback) {
        try {
            const start = performance.now();
            callback();
            const end = performance.now();
            this.addMetric('renderTime', end - start);
        } catch (error) {
            console.error('Error measuring render time:', error);
        }
    }
    
    trackMemoryUsage() {
        try {
            if (performance.memory) {
                this.addMetric('memoryUsage', {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            console.error('Error tracking memory usage:', error);
        }
    }

    addMetric(type, value) {
        if (this.metrics[type].length >= this.maxMetrics) {
            this.metrics[type].shift(); // Remove oldest metric
        }
        this.metrics[type].push(value);
    }

    getAverage(array) {
        if (!array || array.length === 0) return 0;
        return array.reduce((sum, val) => sum + val, 0) / array.length;
    }

    generateReport() {
        try {
            return {
                avgRenderTime: this.getAverage(this.metrics.renderTime),
                peakMemory: this.metrics.memoryUsage.length > 0 
                    ? Math.max(...this.metrics.memoryUsage.map(m => m.used || 0))
                    : 0,
                totalKeystrokes: this.metrics.keystrokes
            };
        } catch (error) {
            console.error('Error generating report:', error);
            return { avgRenderTime: 0, peakMemory: 0, totalKeystrokes: 0 };
        }
    }
}