export class PerformanceMonitor {
    construtor() {
        this.metrics = {
            renderTime: [],
            memoryUsage: [],
            keystrokes: 0
        };
    }

    measureRenderTime(callback) {
        const start = performance.now();
        callback();
        const end = performance.now();
        this.metrics.renderTime.push(end - start);
    }
    
    trackMemoryUsage() {
        if (performance.memory) {
            this.metrics.memoryUsage.push({
                used: performance.memory.totalJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                timestamp: Date.now()
            });
        }
}

generateReport() {
    return {
        avgRenderTime: this.getAverage(this.metrics.renderTime),
        peakMemory: Math.max(...this.metrics.memoryUsage.map(m => m.used)),
        totalKeyStrokes: this.metrics.keystrokes
    };
}
}