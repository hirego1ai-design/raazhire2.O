import { EventEmitter } from 'events';

/**
 * Autonomous AI Traffic Manager (Queue Agent)
 * 
 * Purpose:
 * When traffic gets heavy, sending hundreds of concurrent requests to Gemini or OpenAI
 * will crash the server and result in "429 Too Many Requests" errors.
 * 
 * This agent stays in "Sleep Mode" (0 CPU usage). When a request comes in, 
 * it wakes up in milliseconds, processes the tasks up to the concurrency limit, 
 * queues the rest as backups, and goes back to sleep when done.
 */
class AutonomousQueueAgent {
    constructor(maxConcurrent = 3) {
        this.queue = [];
        this.isProcessing = false;
        this.events = new EventEmitter();
        this.maxConcurrent = maxConcurrent; // Maximum AI tasks happening at the exact same time
        this.activeCount = 0;
        this.totalProcessed = 0;

        // Wake up instantly when a task is added (ms latency)
        this.events.on('wakeup', () => {
            if (!this.isProcessing && this.queue.length > 0) {
                console.log(`[Autonomous Agent] ⚡ Waking up from sleep mode... (Tasks pending Backup: ${this.queue.length})`);
                this.processQueue();
            }
        });
    }

    /**
     * Pushes a task to the autonomous agent. 
     * It will wait in line if traffic is heavy, preventing server crashes.
     */
    async enqueue(taskFn, priority = 'normal', taskName = 'AI Task') {
        return new Promise((resolve, reject) => {
            const task = { taskFn, resolve, reject, priority, taskName, addedAt: Date.now() };

            if (priority === 'high') {
                this.queue.unshift(task); // Put at the front of the line
            } else {
                this.queue.push(task); // Put at the back of the line
            }

            // Wake up the background processor instantly
            this.events.emit('wakeup');
        });
    }

    /**
     * The internal autonomous loop
     */
    async processQueue() {
        this.isProcessing = true;

        while (this.queue.length > 0) {
            // Traffic Control: Prevent overwhelming the AI providers
            if (this.activeCount >= this.maxConcurrent) {
                // Too much traffic! Sleep for 100ms and check again
                await new Promise(r => setTimeout(r, 100));
                continue;
            }

            const task = this.queue.shift();
            this.activeCount++;

            const waitTime = Date.now() - task.addedAt;
            if (waitTime > 500) {
                console.log(`[Autonomous Agent] 🚦 Heavy Traffic Handled: Task '${task.taskName}' was saved in backup and started after ${waitTime}ms wait.`);
            }

            // Execute without blocking the queue loop from picking up other concurrent tasks
            this.executeTask(task);
        }

        this.isProcessing = false;
        console.log(`[Autonomous Agent] 🌙 Traffic cleared. Handled ${this.totalProcessed} tasks total. Going back into sleep mode...`);
    }

    /**
     * Executes the actual AI function safely
     */
    async executeTask(task) {
        try {
            const result = await task.taskFn();
            task.resolve(result);
            this.totalProcessed++;
        } catch (error) {
            console.error(`[Autonomous Agent] ❌ Task '${task.taskName}' failed:`, error.message);
            task.reject(error);
        } finally {
            this.activeCount--;
            // If more tasks came in while executing, ensure we're awake
            if (!this.isProcessing && this.queue.length > 0) {
                this.events.emit('wakeup');
            }
        }
    }

    /**
     * Get system statistics
     */
    getStats() {
        return {
            pending: this.queue.length,
            active: this.activeCount,
            totalProcessed: this.totalProcessed,
            isSleeping: !this.isProcessing && this.activeCount === 0
        };
    }
}

// Export a single global instance 
// (Limit to 3 concurrent AI requests to perfectly balance speed vs rate-limiting)
export const aiTrafficController = new AutonomousQueueAgent(3);
