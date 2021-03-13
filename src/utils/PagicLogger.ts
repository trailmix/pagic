import { colors, setupLogger, getLogger, loggerHandlers as handlers } from '../../deps.ts';
import type { LogRecord, Logger, BaseHandler, FileHandler, LoggerConfig } from '../../deps.ts';
import type { PagicLogConfig } from './PagicConfiguration.ts';
import { default as PagicConfiguration } from './PagicConfiguration.ts';
// #region logging
export type LogFormat = 'json' | 'function' | 'string';
export const LogLevels = ['NOTSET', 'DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'];
export type LogLevel = 'NOTSET' | 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
export interface PagicMessage {
  logger: string;
  level: number;
  msg: string;
}
export type LogColors = 'clear' | 'blue' | 'yellow' | 'red' | 'green';
enum logColors {
  'DEBUG' = 'clear',
  'INFO' = 'blue',
  'WARNING' = 'yellow',
  'ERROR' = 'red',
  'CRITICAL' = 'green',
}
// #endregion

export default class PagicLogger {
  private static _loggers: string[] = ['default', 'PagicConfiguration', 'PagicWatcherFactory', 'PagicWatcher', 'Pagic']; // init static logger list
  private static _config: PagicLogConfig[] = PagicConfiguration.log; // init static log config
  public name = 'Pagic';
  public logger: Logger = getLogger(this.name); // set logger to default logger
  private _handlers: { [x: string]: BaseHandler | FileHandler } = this.getHandlers(); // other handlers
  private _loggers: { [x: string]: LoggerConfig } = this.getLoggers(Object.keys(this._handlers)); // other loggers
  public constructor(name = 'default') {
    this.name = name;
    this.logger = getLogger(name);
    // console.log(this);
  }
  public async init(name = this.name, handlers = this._handlers, loggers = this._loggers): Promise<PagicLogger> {
    await setupLogger({ handlers: handlers, loggers: loggers });
    this.name = name;
    this.logger = getLogger(name);
    // console.log(this);
    return this;
  }
  public debug(first: string, ...args: any[]) {
    this.logger.debug([first, JSON.stringify(args.toString())].join(' '));
  }
  public info(first: string, ...args: any[]) {
    this.logger.info([first, JSON.stringify(args.toString())].join(' '));
  }
  public warn(first: string, ...args: any[]) {
    this.logger.warning([first, JSON.stringify(args.toString())].join(' '));
  }
  public error(first: string, ...args: any[]) {
    this.logger.error([first, JSON.stringify(args.toString())].join(' '));
  }
  public success(first: string, ...args: any[]) {
    this.logger.critical([first, JSON.stringify(args.toString())].join(' '));
  }
  private getLogger(name = this.name, handlers: string[] = ['console']): { [x: string]: LoggerConfig } {
    return {
      [name]: {
        level: 'DEBUG',
        handlers: handlers,
      },
    };
  }
  private getLoggers(handlers: string[]) {
    return PagicLogger._loggers.reduce((prev: any, current: any) => {
      return {
        ...(typeof prev === 'string' ? this.getLogger(prev, handlers) : prev),
        ...(typeof current === 'string' ? this.getLogger(current, handlers) : {}),
      };
    }, {});
  }
  private getHandlers() {
    return PagicLogger._config.reduce((prev: any, current: any, i) => {
      return {
        ...(i === 0 ? {} : prev),
        ...{
          [current.type]: this.getHandler(current),
        },
      };
    }, {});
  }
  private getHandler(config: PagicLogConfig): BaseHandler {
    if (config.type === 'file')
      return new handlers.FileHandler(config.level, {
        filename: config.path + `/Pagic.${config.format === 'json' ? 'json' : 'log'}`,
        formatter: (logRecord: LogRecord, handler: PagicLogConfig = config) => {
          let msg = this.message(logRecord, handler);
          if (config.format === 'json')
            return JSON.stringify(
              {
                logger: this.name,
                date: logRecord.datetime,
                sub: msg.split(' ')[0],
                level: config.level,
                msg: msg.split(' ').slice(1).join(' '),
              },
              null,
              2,
            );
          else return msg;
        },
      });
    else
      return new handlers.BaseHandler(config.level, {
        formatter: (logRecord: LogRecord, handler: PagicLogConfig = config) => this.message(logRecord, handler),
      });
  }
  private message(logRecord: LogRecord, handler: PagicLogConfig) {
    // console.log('in message');
    let msg = '';
    let consoleMsg = '';
    if (handler.color) {
      if (logRecord.levelName in logColors && logRecord.levelName !== 'DEBUG') {
        // @ts-ignore
        let colored = colors[logColors[logRecord.levelName]](logRecord.msg.split(' ')[0]);
        let notColored = logRecord.msg.split(' ').slice(1).join(' ');
        if (logRecord.levelName === 'CRITICAL') {
          msg = `\x1b[1m${colored}\x1b[22m${notColored.length > 0 ? ' ' + notColored : ''}`;
          consoleMsg = `[\x1b[1m${colors[logColors[logRecord.levelName]](this.name)}\x1b[22m] ${msg}`;
        } else {
          msg = `${colored}${notColored.length > 0 ? ' ' + notColored : ''}`;
          // @ts-ignore
          consoleMsg = `[${colors[logColors[logRecord.levelName]](this.name)}] ${msg}`;
        }
      } else {
        msg = logRecord.msg;
        consoleMsg = `[${this.name}] ${msg}`;
      }
      if (handler.type === 'console') console.log(consoleMsg);
    } else msg = logRecord.msg;
    if (handler.format === 'function')
      logRecord.args.forEach((arg, index) => {
        msg += `, arg${index}: ${arg}`;
      });
    return msg;
  }
}
