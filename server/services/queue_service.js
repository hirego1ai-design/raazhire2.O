import * as pgBossModule from 'pg-boss';
const PgBoss = pgBossModule.PgBoss || pgBossModule.default || pgBossModule;
import 'dotenv/config';

// The connection string MUST be a direct Postgres connection string (not the Supabase HTTP URL)
const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!connectionString) {
    console.warn('⚠️  DATABASE_URL or DIRECT_URL not found in .env. pg-boss will not be initialized.');
}

const boss = connectionString ? new PgBoss(connectionString) : null;

if (boss) {
    boss.on('error', error => console.error('[Queue] pg-boss error:', error));
}

let isStarted = false;

/**
 * Initializes the background worker queue.
 */
export async function initQueue() {
    if (!boss) return false;
    try {
        await boss.start();
        isStarted = true;
        console.log('🚀 Background Job Queue (pg-boss) started.');
        return true;
    } catch (err) {
        console.error('❌ Failed to start pg-boss. Check your DATABASE_URL password:', err.message);
        isStarted = false;
        return false;
    }
}

/**
 * Checks if the queue is ready.
 */
export function isQueueReady() {
    return isStarted;
}

/**
 * Sends a job to the background queue.
 */
export async function enqueueJob(name, data, options = {}) {
    if (!boss || !isStarted) {
        console.warn(`[Queue] Cannot enqueue '${name}': pg-boss not initialized or failed to start. Falling back to sync execution if possible.`);
        return null;
    }
    return await boss.send(name, data, options);
}

export default boss;
