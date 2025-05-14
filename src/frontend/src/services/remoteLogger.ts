import {LogEntry} from "@/services/logger.ts";

class RemoteLogger {
    private endpoint: string | null = null;
    private batchSize: number = 10;
    private queue: LogEntry[] = [];
    private flushInterval: number = 3000;
    private timer: ReturnType<typeof setInterval> | null = null;

    constructor() {
        // Set up to flush on the window unload event to prevent losing logs
        window.addEventListener('beforeunload', () => this.flush());
    }

    configure(options: {
        endpoint: string;
        batchSize?: number;
        flushInterval?: number;
    }) {
        this.endpoint = options.endpoint;

        if (options.batchSize) {
            this.batchSize = options.batchSize;
        }

        if (options.flushInterval) {
            this.flushInterval = options.flushInterval;
        }

        // Start the flush timer
        if (this.timer) {
            clearInterval(this.timer);
        }

        this.timer = setInterval(() => this.flush(), this.flushInterval);
    }

    get isEnabled(): boolean {
        return !!this.endpoint;
    }

    send(entry: LogEntry) {
        if (!this.isEnabled) return;

        this.queue.push(entry);

        if (this.queue.length >= this.batchSize) {
            this.flush();
        }
    }

    async flush() {
        if (!this.isEnabled || this.queue.length === 0) return;

        const logsToSend = [...this.queue];
        this.queue = [];

        try {
            const response = await fetch(this.endpoint!, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    logs: logsToSend,
                    app: 'camps-frontend',
                    version: import.meta.env.VITE_APP_VERSION ?? 'dev',
                }),
                // Use keepalive to ensure logs are sent even on page unload
                keepalive: true
            });

            if (!response.ok) {
                console.error('Failed to send logs to remote server', response.status);
                // Re-add logs to queue if server error (not 4xx)
                if (response.status >= 500) {
                    this.queue = [...logsToSend, ...this.queue];
                }
            }
        } catch (error) {
            console.error('Error sending logs to remote server', error);
            // Re-add logs to queue on network error
            this.queue = [...logsToSend, ...this.queue];
        }
    }
}

export const remoteLoggerService = new RemoteLogger();