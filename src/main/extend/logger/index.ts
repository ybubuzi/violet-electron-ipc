import winston, { type transport } from "winston";
import path from "path";
import DailyRotateFile from "winston-daily-rotate-file";

if (!(global as unknown as { logger?: unknown }).logger) {
  /** 判定是否为开发环境 */
  const isDev = process.env.NODE_ENV_ELECTRON_VITE === "development";
  /** 当前执行程序所在目录,开发环境为当前源码路径 */
  const EXECUTABLE_PATH = isDev ? process.cwd() : path.parse(process.execPath).dir;
  /** 当前打印级别 */
  const LOGGER_LEVEL = process.env.LOGGER_LEVEL || (isDev ? "debug" : "info");
  /** 日志文件路径 */
  const LOG_FILE_ROOT_PATH = path.join(EXECUTABLE_PATH, "logs");

  const fileTransport = new DailyRotateFile({
    filename: path.join(LOG_FILE_ROOT_PATH, "app-%DATE%.log"),
    datePattern: "YYYY-MM-DD-HH",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "30d",
  });

  const transports: transport[] = [fileTransport];
  if (isDev) {
    transports.push(new winston.transports.Console());
  }

  const logger = winston.createLogger({
    level: LOGGER_LEVEL,
    format: winston.format.combine(
      winston.format.timestamp({ format: "HH:mm:ss.SSS" }),
      winston.format.errors({ stack: true }),
      winston.format.printf((info) => {
        return `${info.timestamp} ${info.level} ${info.message}`;
      }),
    ),
    transports,
  });
  (global as unknown as { logger?: unknown }).logger = logger;
}
