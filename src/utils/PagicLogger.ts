import type { PagicLogConfigMap, PagicLogConfig } from 'PagicUtils/mod.ts';
import type { Logger, BaseHandler, FileHandler, LoggerConfig, LogConfig } from 'Pagic/deps.ts';
import { PagicConfiguration } from 'PagicUtils/mod.ts';
import { colors, setupLogger, getLogger, loggerHandlers as handlers, LogRecord } from 'Pagic/deps.ts';
// #region logging
export const loggerNames = ['default', 'test', 'PagicConfiguration', 'PagicWatcherFactory', 'PagicWatcher', 'Pagic'];
export const logLevels = ['NOTSET', 'DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'];

export type LogFormat = 'json' | 'function' | 'string';
export type LogLevel = 'NOTSET' | 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
export interface PagicMessage {
  logger: string;
  level: number;
  msg: string;
}
export type Colors = 'white' | 'clear' | 'blue' | 'yellow' | 'red' | 'green';
export const logColors: Record<LogLevel, Colors> = {
  NOTSET: 'white',
  DEBUG: 'clear',
  INFO: 'blue',
  WARNING: 'yellow',
  ERROR: 'red',
  CRITICAL: 'green',
};
// #endregion
export function stringifyBigInt(key: string, value: any): string {
  return typeof value === 'bigint' ? String(value) : value;
}
export function parseMessage(value: unknown): string {
  // console.log(typeof value);
  if (typeof value === 'string') return value;
  else if (
    value === null ||
    typeof value === 'number' ||
    typeof value === 'bigint' ||
    typeof value === 'boolean' ||
    typeof value === 'undefined' ||
    typeof value === 'symbol'
  ) {
    return String(value);
  } else if (value instanceof Error) {
    return value.stack!;
  } else if (typeof value === 'object') {
    return JSON.stringify(value, stringifyBigInt);
  }
  return 'undefined';
}
/** Construct a Pagic Logger.
 * @example
 * // returns default logger
 * const l = new PagicLogger()
 * // returns Pagic logger
 * const l = await new PagicLogger().init('Pagic')
 * // log success _message oneliner
 * (await new PagicLogger().init('Pagic')).success('main','_message')
 * // log success _message with object
 * const l = await new PagicLogger().init('Pagic')
 * l.success('main','_message')
 */
export default class PagicLogger {
  private static _loggerNames: string[] = loggerNames; // init static logger list
  public name = 'default';
  public logger: Logger = getLogger(); // set logger to default logger
  // public config: PagicLogConfigMap = PagicLogger._config;
  // public set config(config: LogConfig) {
  //   this._config = config;
  // }
  // public get config(): LogConfig {
  //   return this._config;
  // }
  public pConfig: PagicLogConfigMap = PagicConfiguration.log; // init static log config
  private _config: LogConfig;
  private _loggerNames: string[] = PagicLogger._loggerNames;
  // private handlers: { [x: string]: BaseHandler | FileHandler };
  /** Construct the default logger.
   * @public
   * @constructor
   */
  public constructor(name = 'default', config?: PagicLogConfigMap, loggerNames = PagicLogger._loggerNames) {
    if (config !== undefined) {
      this.pConfig = config;
    }
    this._config = { handlers: this._handlers, loggers: this._loggers };
    this._loggerNames = loggerNames;
    this.set(name);
  }
  public set(name = 'default') {
    this.name = name;
    this.logger = getLogger(name);
  }
  /** Initialize the loggers and handlers.
   * @public
   * @example
   * // returns Pagic logger
   * const l = await new PagicLogger().init('Pagic')
   */
  public async init(name = this.name): Promise<PagicLogger> {
    await setupLogger(this._config);
    if (this.name !== name) this.set(name);
    return this;
  }
  /** DEBUG _message
   * @public
   * @example
   * const l = await new PagicLogger().init('Pagic')
   * l.debug('main','_message')
   */
  public debug(first: unknown, ...args: unknown[]): string | string[] {
    let ret = this._log(10, first, ...args);
    // console.log(ret);
    if (this.name === 'test') {
      const dedebug = this._log(0, first, ...args);
      // console.log(dedebug);
      if (Array.isArray(ret)) {
        ret.concat(Array.isArray(dedebug) ? dedebug : [dedebug]);
      } else [ret].concat(Array.isArray(dedebug) ? dedebug : [dedebug]);
    }
    // console.log('ret ' + ret);
    return ret.length === 1 ? ret[0] : ret;
  }
  /** INFO _message
   * @public
   * @example
   * const l = await new PagicLogger().init('Pagic')
   * l.info('main','_message')
   */
  public info(first: unknown, ...args: unknown[]): string | string[] {
    return this._log(20, first, ...args);
  }
  /** WARN _message
   * @public
   * @example
   * const l = await new PagicLogger().init('Pagic')
   * l.warn('main','_message')
   */
  public warn(first: unknown, ...args: unknown[]): string | string[] {
    return this._log(30, first, ...args);
  }
  /** ERROR _message
   * @public
   * @example
   * const l = await new PagicLogger().init('Pagic')
   * l.error('main','_message')
   */
  public error(first: unknown, ...args: unknown[]): string | string[] {
    // console.log(...args);
    // console.log(args);
    return this._log(40, first, ...args);
  }
  /** SUCCESS _message
   * @public
   * @example
   * const l = await new PagicLogger().init('Pagic')
   * l.success('main','_message')
   */
  public success(first: unknown, ...args: unknown[]): string | string[] {
    return this._log(50, first, ...args);
  }
  /** deDEBUG _message - only works in 'test'
   * @private
   * @example
   * const l = await new PagicLogger('test').init('Pagic')
   * l.debug('main','_message')
   */
  private _log(level: number, msg: unknown, ...args: unknown[]): string | string[] {
    let messages: string[] = [];
    let record = new LogRecord({
      level,
      msg: level === 0 && this.name === 'test' ? 'deDEBUG:' + parseMessage(msg) : parseMessage(msg),
      args: args,
      loggerName: this.name,
    });
    Object.entries(this._config.handlers ?? {}).forEach((logger: [string, BaseHandler | FileHandler]) => {
      const _msg = logger[1].format(record);

      // messages.push(_msg);
      if (logger[0] === 'console') {
        // console.log('msg console: ' + _msg);
        messages.push(_msg);
      }
      logger[1].handle(record);
      //   logger[1].handle(record);
      //   // (logger[1] as FileHandler).flush();
      // }
    }, {});
    // console.log(messages);
    return messages.length === 1 ? messages[0] : messages;
  }
  private get _loggers(): { [name: string]: LoggerConfig } {
    return this._loggerNames.reduce((prev: any, current: any) => {
      return {
        ...(typeof prev === 'string'
          ? this._getLogger(prev, Object.keys(this.pConfig), this.pConfig.console.level)
          : prev),
        ...(typeof current === 'string'
          ? this._getLogger(current, Object.keys(this.pConfig), this.pConfig.console.level)
          : {}),
      };
    }, {});
  }
  private get _handlers(): { [name: string]: BaseHandler | FileHandler } {
    return Object.entries(this.pConfig).reduce((prev: any, current: any, i) => {
      return {
        ...(i === 0 ? {} : prev),
        ...{
          [current[0]]: this._getHandler(current[0], current[1]),
        },
      };
    }, {});
  }

  private _getLogger(
    name = this.name,
    handlers: string[] = ['console'],
    level: LogLevel = 'ERROR',
  ): { [name: string]: LoggerConfig } {
    let config: LoggerConfig = {
      level: level,
      handlers: handlers,
    };
    return {
      [name as string]: config,
    };
  }
  private _getHandler(type = 'console', config: PagicLogConfig): BaseHandler | FileHandler {
    if (type === 'file')
      return new handlers.FileHandler(config.level, {
        mode: 'w',
        filename: config.path + `/Pagic.${config.format === 'json' ? 'json' : 'log'}`,
        formatter: (logRecord: LogRecord, handler: PagicLogConfig = config, type: 'file' | 'console' = 'file') => {
          let msg = this._message(logRecord, handler, type);
          let args = this._parseArgs(handler.format, logRecord.args);
          if (config.format === 'json')
            return JSON.stringify(
              {
                logger: this.name,
                date: logRecord.datetime,
                level: config.level,
                msg: msg,
                args: args,
              },
              null,
              2,
            );
          else return msg + args;
        },
      });
    else
      return new handlers.BaseHandler(config.level, {
        formatter: (logRecord: LogRecord, handler: PagicLogConfig = config, type: 'file' | 'console' = 'console') => {
          let args = this._parseArgs(handler.format, logRecord.args);
          let msg = this._message(logRecord, handler, type);
          console.log(msg + (args !== undefined ? args : ''));
          return msg + (args !== undefined ? args : '');
        },
      });
  }
  private _message(logRecord: LogRecord, handler: PagicLogConfig, type: 'file' | 'console' = 'console'): string {
    let msg = logRecord.msg;
    let consoleMsg = `[${this.name}] ${msg}`;
    // let args: string | undefined = this._parseArgs(handler.format, logRecord.args);
    // console.log('logrecord.Args: ' + logRecord.args);
    // console.log('after' + args);
    // console.log(consoleMsg);
    if (handler.color && logRecord.levelName in logColors && logRecord.levelName !== 'DEBUG') {
      // @ts-ignore
      const colored = colors[logColors[logRecord.levelName]](logRecord.msg);
      // @ts-ignore
      const name = colors[logColors[logRecord.levelName]](this.name);
      // const notColored = logRecord.msg.split(' ').slice(1).join(' ');2
      if (logRecord.levelName === 'CRITICAL') {
        msg = `\x1b[1m${colored}\x1b[22m`;
        consoleMsg = `[\x1b[1m${name}\x1b[22m] ${msg}`;
      } else {
        msg = colored;
        consoleMsg = `[${name}] ${msg}`;
      }
    }
    if (type === 'console') return consoleMsg;
    else return msg;
  }
  private _parseArgs(format: LogFormat, ...args: unknown[]) {
    let msg: string | undefined;
    if (args !== null && args.toString() !== '') {
      if (format === 'function') {
        args.forEach((arg, index) => {
          msg += `, arg${index}: ${arg}`;
        });
      } else if (format === 'string') {
        msg = ' \nArguments:' + JSON.stringify(JSON.parse(JSON.stringify(args[0], stringifyBigInt))[0], null, 2);
      } else if (format === 'json') {
        msg = JSON.parse(JSON.stringify(args[0], stringifyBigInt))[0];
      }
    }
    return msg;
  }
}
