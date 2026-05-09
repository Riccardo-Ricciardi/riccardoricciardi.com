type LogLevel = "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

function format(level: LogLevel, message: string, context?: LogContext): string {
  const base = `[${level.toUpperCase()}] ${message}`;
  if (!context) return base;
  try {
    return `${base} ${JSON.stringify(context)}`;
  } catch {
    return base;
  }
}

export const logger = {
  info: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.info(format("info", message, context));
    }
  },
  warn: (message: string, context?: LogContext) => {
    // eslint-disable-next-line no-console
    console.warn(format("warn", message, context));
  },
  error: (message: string, context?: LogContext) => {
    // eslint-disable-next-line no-console
    console.error(format("error", message, context));
  },
};
