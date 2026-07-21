/**
 * server/utils/validate.js
 * Lightweight, dependency-free input validation helper.
 *
 * Usage:
 *   import { validate } from '../utils/validate.js';
 *
 *   const { error, value } = validate(req.body, {
 *       email:    { type: 'string', required: true, maxLen: 254, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
 *       password: { type: 'string', required: true, minLen: 8, maxLen: 128 },
 *       role:     { type: 'string', enum: ['admin', 'candidate', 'employer'] },
 *       age:      { type: 'number', min: 0, max: 150 }
 *   });
 *   if (error) return res.status(400).json({ error });
 */

/**
 * @typedef {Object} FieldRule
 * @property {'string'|'number'|'boolean'} [type]
 * @property {boolean} [required]
 * @property {number}  [minLen]    - string minimum length
 * @property {number}  [maxLen]    - string maximum length (also trims to this)
 * @property {number}  [min]       - number minimum value
 * @property {number}  [max]       - number maximum value
 * @property {RegExp}  [pattern]   - string regex test
 * @property {Array}   [enum]      - allowed values
 * @property {boolean} [strip]     - strip HTML/script tags from strings (default: true)
 */

const HTML_TAG_RE = /[<>"'`]/g;

/**
 * Validate and sanitize a data object against a schema of FieldRules.
 * @param {Object} data   - raw input (e.g. req.body)
 * @param {Object} schema - map of fieldName → FieldRule
 * @returns {{ error: string|null, value: Object }}
 */
export function validate(data, schema) {
    const value = {};

    for (const [field, rule] of Object.entries(schema)) {
        let raw = data == null ? undefined : data[field];

        // Required check
        if (rule.required && (raw === undefined || raw === null || raw === '')) {
            return { error: `'${field}' is required`, value: null };
        }

        // Skip optional absent fields
        if (raw === undefined || raw === null) continue;

        // Type coercion / check
        if (rule.type === 'string') {
            if (typeof raw !== 'string') {
                return { error: `'${field}' must be a string`, value: null };
            }
            raw = raw.trim();

            if (rule.minLen !== undefined && raw.length < rule.minLen) {
                return { error: `'${field}' must be at least ${rule.minLen} characters`, value: null };
            }
            if (rule.maxLen !== undefined && raw.length > rule.maxLen) {
                raw = raw.substring(0, rule.maxLen); // silently truncate to max
            }
            if (rule.pattern && !rule.pattern.test(raw)) {
                return { error: `'${field}' has an invalid format`, value: null };
            }
            // Strip dangerous characters unless explicitly disabled
            if (rule.strip !== false) {
                raw = raw.replace(HTML_TAG_RE, '');
            }
        } else if (rule.type === 'number') {
            const n = Number(raw);
            if (isNaN(n)) {
                return { error: `'${field}' must be a number`, value: null };
            }
            if (rule.min !== undefined && n < rule.min) {
                return { error: `'${field}' must be at least ${rule.min}`, value: null };
            }
            if (rule.max !== undefined && n > rule.max) {
                return { error: `'${field}' must be at most ${rule.max}`, value: null };
            }
            raw = n;
        } else if (rule.type === 'boolean') {
            raw = Boolean(raw);
        }

        // Enum check (works for any type)
        if (rule.enum && !rule.enum.includes(raw)) {
            return { error: `'${field}' must be one of: ${rule.enum.join(', ')}`, value: null };
        }

        value[field] = raw;
    }

    return { error: null, value };
}

/**
 * Express middleware factory — validates req.body against a schema.
 * Returns 400 JSON on failure, calls next() on success and attaches
 * the sanitized data to req.validated.
 *
 * Usage:
 *   app.post('/api/my-route', validateBody({ name: { type: 'string', required: true } }), handler);
 */
export function validateBody(schema) {
    return (req, res, next) => {
        const { error, value } = validate(req.body, schema);
        if (error) return res.status(400).json({ error });
        req.validated = value;
        next();
    };
}
