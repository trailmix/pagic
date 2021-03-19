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
export type Colors =
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'
  | 'gray'
  | 'brightBlack'
  | 'brightRed'
  | 'brightGreen'
  | 'brightYellow'
  | 'brightBlue'
  | 'brightMagenta'
  | 'brightCyan'
  | 'brightWhite'
  | 'clear';
export type bgColors =
  | 'bgBlack'
  | 'bgRed'
  | 'bgGreen'
  | 'bgYellow'
  | 'bgBlue'
  | 'bgMagenta'
  | 'bgCyan'
  | 'bgWhite'
  | 'bgBrightBlack'
  | 'bgBrightRed'
  | 'bgBrightGreen'
  | 'bgBrightYellow'
  | 'bgBrightBlue'
  | 'bgBrightMagenta'
  | 'bgBrightCyan'
  | 'bgBrightWhite';
export type Styles = 'bold' | 'italic' | 'dim' | 'underline' | 'strikethrough' | 'hidden' | 'inverse' | 'clear';
export const logColors: Record<LogLevel, Colors> = {
  NOTSET: 'white',
  DEBUG: 'clear',
  INFO: 'blue',
  WARNING: 'yellow',
  ERROR: 'red',
  CRITICAL: 'green',
};
export const logStyles: Record<LogLevel, Styles> = {
  NOTSET: 'clear',
  DEBUG: 'clear',
  INFO: 'clear',
  WARNING: 'clear',
  ERROR: 'clear',
  CRITICAL: 'bold',
};
export const logFunctions: Record<Colors | bgColors | Styles, (str: string) => string> = {
  bold: (str: string) => colors.bold(str),
  italic: (str: string) => colors.italic(str),
  dim: (str: string) => colors.dim(str),
  underline: (str: string) => colors.underline(str),
  strikethrough: (str: string) => colors.strikethrough(str),
  hidden: (str: string) => colors.hidden(str),
  inverse: (str: string) => colors.inverse(str),
  black: (str: string) => colors.black(str),
  red: (str: string) => colors.red(str),
  green: (str: string) => colors.green(str),
  yellow: (str: string) => colors.yellow(str),
  blue: (str: string) => colors.blue(str),
  magenta: (str: string) => colors.magenta(str),
  cyan: (str: string) => colors.cyan(str),
  white: (str: string) => colors.white(str),
  gray: (str: string) => colors.gray(str),
  brightBlack: (str: string) => colors.brightBlack(str),
  brightRed: (str: string) => colors.brightRed(str),
  brightGreen: (str: string) => colors.brightGreen(str),
  brightYellow: (str: string) => colors.brightYellow(str),
  brightBlue: (str: string) => colors.brightBlue(str),
  brightMagenta: (str: string) => colors.brightMagenta(str),
  brightCyan: (str: string) => colors.brightCyan(str),
  brightWhite: (str: string) => colors.brightWhite(str),
  bgBlack: (str: string) => colors.bgBlack(str),
  bgRed: (str: string) => colors.bgRed(str),
  bgGreen: (str: string) => colors.bgGreen(str),
  bgYellow: (str: string) => colors.bgYellow(str),
  bgBlue: (str: string) => colors.bgBlue(str),
  bgMagenta: (str: string) => colors.bgMagenta(str),
  bgCyan: (str: string) => colors.bgCyan(str),
  bgWhite: (str: string) => colors.bgWhite(str),
  bgBrightBlack: (str: string) => colors.bgBrightBlack(str),
  bgBrightRed: (str: string) => colors.bgBrightRed(str),
  bgBrightGreen: (str: string) => colors.bgBrightGreen(str),
  bgBrightYellow: (str: string) => colors.bgBrightYellow(str),
  bgBrightBlue: (str: string) => colors.bgBrightBlue(str),
  bgBrightMagenta: (str: string) => colors.bgBrightMagenta(str),
  bgBrightCyan: (str: string) => colors.bgBrightCyan(str),
  bgBrightWhite: (str: string) => colors.bgBrightWhite(str),
  clear: (str: string) => str,
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
      if (level >= logger[1].level || (this.name === 'test' && level === 0)) {
        const _msg = logger[1].format(record);
        // messages.push(_msg);
        if (logger[0] === 'console') {
          messages.push(_msg);
          console.log(_msg);
        } else {
          logger[1].handle(record);
        }
      }
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
        formatter: (logRecord: LogRecord, handler: PagicLogConfig = config) => this._formatter(logRecord, handler),
      });
    else
      return new handlers.BaseHandler(config.level, {
        formatter: (logRecord: LogRecord, handler: PagicLogConfig = config) => {
          let args = this._parseArgs(handler.format, logRecord.args);
          let msg = this._message(logRecord, handler);
          return msg + (args !== undefined ? args : '');
        },
      });
  }
  private _formatter(logRecord: LogRecord, handler: PagicLogConfig): string {
    let msg = this._message(logRecord, handler);
    let args = this._parseArgs(handler.format, logRecord.args);
    if (handler.format === 'json')
      return JSON.stringify(
        {
          logger: this.name,
          date: logRecord.datetime,
          level: handler.level,
          msg: msg,
          args: args,
        },
        null,
        2,
      );
    else if (handler.format === 'function') {
      return logRecord.level + ' ' + msg + (args !== undefined ? args : '');
    } else {
      return (handler.date ? logRecord.datetime + ' ' : '') + msg + (args !== undefined ? args : '');
    }
  }
  private _message(logRecord: LogRecord, handler: PagicLogConfig): string {
    let msg = `[${this.name}] ${logRecord.msg}`;
    // let args: string | undefined = this._parseArgs(handler.format, logRecord.args);
    // console.log('logrecord.Args: ' + logRecord.args);
    // console.log('after' + args);
    // console.log(consoleMsg);
    if (handler.format !== 'function' && handler.color && logRecord.levelName !== 'DEBUG') {
      const colored = logFunctions[logColors[logRecord.levelName as LogLevel]](logRecord.msg);
      const name = logFunctions[logColors[logRecord.levelName as LogLevel]](this.name);
      if (logRecord.levelName === 'CRITICAL') {
        msg = `[${logFunctions.bold(name)}] ${logFunctions.bold(colored)}`;
      } else {
        msg = `[${name}] ${colored}`;
      }
    }
    return msg;
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
