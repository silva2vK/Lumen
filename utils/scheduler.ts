
/**
 * Lectorium/Lumen Core - Task Scheduler
 * Implements the Prioritized Task Scheduling API pattern.
 * Use this to break up long-running tasks or defer non-critical rendering.
 */

export type TaskPriority = 'user-blocking' | 'user-visible' | 'background';

interface SchedulerPostTaskOptions {
    priority?: TaskPriority;
    delay?: number;
    signal?: AbortSignal;
}

/**
 * Schedules a task to be executed based on priority.
 * 
 * @param callback The function to execute.
 * @param priority 'user-blocking' (immediate), 'user-visible' (default), or 'background' (idle).
 * @param delay Optional delay in ms.
 * @returns A promise that resolves with the callback result.
 */
export const scheduleTask = <T>(
    callback: () => T | Promise<T>, 
    priority: TaskPriority = 'user-visible',
    delay: number = 0
): Promise<T> => {
    // 1. Native Scheduler API (Chrome, Edge, etc.)
    // Cast to any to avoid conflict with capabilities.ts definition which might be partial
    const scheduler = (window as any).scheduler;
    if (scheduler && 'postTask' in scheduler) {
        return scheduler.postTask(callback, { priority, delay });
    }

    // 2. Polyfill / Fallback Strategy
    return new Promise((resolve, reject) => {
        const execute = async () => {
            try {
                const result = await callback();
                resolve(result);
            } catch (err) {
                reject(err);
            }
        };

        if (priority === 'background' && 'requestIdleCallback' in window) {
            // @ts-ignore
            window.requestIdleCallback((deadline) => {
                if (delay > 0) {
                    setTimeout(execute, delay);
                } else {
                    execute();
                }
            }, { timeout: 1000 });
        } else {
            // Standard setTimeout fallback
            // 'user-blocking' aims for immediate execution, 'user-visible' is standard macro-task
            setTimeout(execute, delay);
        }
    });
};

/**
 * Yields control back to the main thread to allow input handling/rendering.
 * Useful inside heavy loops.
 */
export const yieldToMain = async () => {
    // Use scheduler.yield() if available (Chrome 115+)
    const scheduler = (window as any).scheduler;
    if (scheduler?.yield) {
        return scheduler.yield();
    }
    
    // Fallback: minimal timeout
    return new Promise(resolve => {
        setTimeout(resolve, 0);
    });
};
