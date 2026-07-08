/**
 * Structured, request-scoped logging with error-tracking hooks.
 *
 * This is dependency-free and safe on Vercel's serverless runtime. When
 * SENTRY_DSN (or any compatible error reporter) is configured, `captureException`
 * forwards errors to it. Until then it degrades to structured console output so
 * that logs are queryable in Vercel's log drains / observability stack.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogMeta {
  [key: string]: unknown;
}

let requestSeq = 0;
function nextRequestId(): string {
  requestSeq = (requestSeq + 1) % Number.MAX_SAFE_INTEGER;
  return `req_${Date.now().toString(36)}_${requestSeq.toString(36)}`;
}

export class Logger {
  readonly requestId: string;
  private readonly base: LogMeta;

  constructor(requestId?: string, base: LogMeta = {}) {
    this.requestId = requestId ?? nextRequestId();
    this.base = base;
  }

  child(meta: LogMeta): Logger {
    return new Logger(this.requestId, { ...this.base, ...meta });
  }

  private write(level: LogLevel, message: string, meta: LogMeta) {
    const entry = {
      level,
      time: new Date().toISOString(),
      message,
      requestId: this.requestId,
      ...this.base,
      ...meta,
    };
    // Error level always goes to stderr so it is captured by log drains.
    if (level === 'error') {
      // eslint-disable-next-line no-console
      console.error(JSON.stringify(entry));
    } else if (level === 'warn') {
      // eslint-disable-next-line no-console
      console.warn(JSON.stringify(entry));
    } else {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(entry));
    }
  }

  debug(message: string, meta: LogMeta = {}) {
    if (process.env.NODE_ENV !== 'production') this.write('debug', message, meta);
  }

  info(message: string, meta: LogMeta = {}) {
    this.write('info', message, meta);
  }

  warn(message: string, meta: LogMeta = {}) {
    this.write('warn', message, meta);
  }

  error(message: string, meta: LogMeta = {}) {
    this.write('error', message, meta);
  }

  /** Capture an exception for error tracking / alerting. */
  capture(error: unknown, meta: LogMeta = {}) {
    const err = error instanceof Error ? error : new Error(String(error));
    this.error(err.message, {
      ...meta,
      stack: err.stack,
      name: err.name,
    });
    captureException(err, { ...meta, requestId: this.requestId });
  }
}

export function createLogger(base: LogMeta = {}): Logger {
  return new Logger(undefined, base);
}

/**
 * Forward an exception to an external error tracker when configured.
 * Swap the body to integrate Sentry, Honeybadger, etc. without touching call sites.
 */
export function captureException(error: unknown, meta: LogMeta = {}) {
  const dsn = process.env.SENTRY_DSN || process.env.ERROR_TRACKING_DSN;
  if (!dsn) return;
  try {
    // Lazy require keeps the dependency optional.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/nextjs');
    Sentry.captureException(error, { extra: meta });
  } catch {
    // No Sentry installed — ignore, console output already happened upstream.
  }
}
