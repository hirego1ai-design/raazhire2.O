import { createLogger, format, transports } from 'winston';

const logger = createLogger({
    level: 'error',
    format: format.combine(format.timestamp(), format.json()),
    transports: [new transports.Console()]
});

/**
 * Centralized Express error handler.
 * In production: returns only generic error messages (no stack traces, no internal details).
 * In development: returns detailed error messages for debugging.
 *
 * Must be registered AFTER all routes:
 *   app.use(errorHandler);
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
    const isProd = process.env.NODE_ENV === 'production';
    const status = err.status || err.statusCode || 500;

    // Log the full error internally (never expose to client in production)
    logger.error('Unhandled error', {
        message: err.message,
        stack: isProd ? undefined : err.stack,
        path: req.path,
        method: req.method,
        status
    });

    if (status === 401) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (status === 403) {
        return res.status(403).json({ error: 'Access denied' });
    }

    if (status === 404) {
        return res.status(404).json({ error: isProd ? 'Not found' : err.message || 'Not found' });
    }

    if (status === 429) {
        return res.status(429).json({ error: 'Too many requests, please try again later.' });
    }

    // 5xx or unknown — return generic message in production
    return res.status(status >= 400 && status < 600 ? status : 500).json({
        error: isProd ? 'Internal server error' : (err.message || 'Internal server error')
    });
}
