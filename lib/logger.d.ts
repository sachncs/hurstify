/**
 * Type declarations for `lib/logger.js`.
 */
export declare enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
  SILENT,
}
export declare function setLogLevel(level: LogLevel): void;
export declare function getLogLevel(): LogLevel;
export declare function debug(...args: unknown[]): void;
export declare function info(...args: unknown[]): void;
export declare function warn(...args: unknown[]): void;
export declare function error(...args: unknown[]): void;
