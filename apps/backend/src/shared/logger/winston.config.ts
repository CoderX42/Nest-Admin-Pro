import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';

const logDir = path.resolve(process.cwd(), 'logs');

const fileFmt = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

const consoleFmt = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, context, stack }) => {
    return `${timestamp} [${level}]${context ? ` [${context}]` : ''} ${stack ?? message}`;
  }),
);

export const winstonConfig: winston.LoggerOptions = {
  level: process.env.APP_ENV === 'production' ? 'info' : 'debug',
  format: consoleFmt,
  transports: [
    new winston.transports.Console({ format: consoleFmt }),
    new DailyRotateFile({
      dirname: logDir,
      filename: 'app.%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFmt,
    }),
    new DailyRotateFile({
      level: 'error',
      dirname: logDir,
      filename: 'app-error.%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFmt,
    }),
  ],
};
