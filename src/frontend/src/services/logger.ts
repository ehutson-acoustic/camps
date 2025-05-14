// src/frontend/src/services/logger.ts
import log from 'loglevel';
import prefix from 'loglevel-plugin-prefix';
import {v4 as uuidV4} from 'uuid';

// Initialize session ID to track logs across page refreshes
const SESSION_ID_KEY = 'camps_session_id';
let sessionId = localStorage.getItem(SESSION_ID_KEY);
if (!sessionId) {
    sessionId = uuidV4();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
}

// Configure log levels based on environment
const DEFAULT_LEVEL = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';

// Set up loglevel with a custom prefix
prefix.reg(log);
prefix.apply(log, {
    format(level, name, timestamp) {
        return `[${timestamp}] [${level}] ${name}:`;
    },
    timestampFormatter(date) {
        return date.toISOString();
    },
    levelFormatter(level) {
        return level.toUpperCase();
    },
});

// Configure default level
log.setLevel(DEFAULT_LEVEL);

// Create a typed logger interface with context
export interface LogContext {
    module?: string;
    userId?: string;
    teamId?: string;
    employeeId?: string;
    requestId?: string;

    [key: string]: any;
}

// Function to create a logger with context for better tracing
export function createLogger(context: LogContext = {}) {
    const loggerName = context.module ?? 'CAMPS';
    const logger = log.getLogger(loggerName);

    // Create wrapper functions to include context
    const wrapLoggerMethod = (method: 'debug' | 'info' | 'warn' | 'error' | 'trace') => {
        return (...args: any[]) => {
            const enrichedContext = {
                ...context,
                sessionId,
                timestamp: new Date().toISOString(),
            };

            // Log a normal message with context appended
            (logger[method] as (...msg: any[]) => void)(...args, enrichedContext);

            // Send the log to the remote logger if configured
            if (remoteLogger.isEnabled) {
                remoteLogger.send({
                    level: method,
                    message: args.map(arg =>
                        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                    ).join(' '),
                    context: enrichedContext,
                    timestamp: new Date().toISOString()
                });
            }
        };
    };

    // Return wrapped logger with contextual methods
    return {
        debug: wrapLoggerMethod('debug'),
        info: wrapLoggerMethod('info'),
        warn: wrapLoggerMethod('warn'),
        error: wrapLoggerMethod('error'),
        trace: wrapLoggerMethod('trace'),
        setLevel: (level: log.LogLevelDesc) => logger.setLevel(level),
        getLevel: () => logger.getLevel(),
        addContext: (newContext: LogContext) => {
            return createLogger({...context, ...newContext});
        }
    };
}

// Remote logger interface
export interface LogEntry {
    level: string;
    message: string;
    context: LogContext;
    timestamp: string;
}

// Placeholder for remote logger (to be implemented)
export const remoteLogger = {
    isEnabled: false,
    queue: [] as LogEntry[],
    batchSize: 10,

    configure(options: { endpoint?: string, batchSize?: number }) {
        if (options.endpoint) {
            this.isEnabled = true;
            if (options.batchSize) {
                this.batchSize = options.batchSize;
            }
        }
    },

    send(entry: LogEntry) {
        if (!this.isEnabled) return;

        this.queue.push(entry);

        // Send logs in batches
        if (this.queue.length >= this.batchSize) {
            this.flush();
        }
    },

    flush() {
        if (this.queue.length === 0) return;

        // To be replaced with actual remote logging
        console.info(`[REMOTE LOGGER] Would send ${this.queue.length} logs to remote server`);
        this.queue = [];
    }
};

// The default logger
export default createLogger();
