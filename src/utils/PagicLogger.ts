import type { PagicLogConfig, PagicLogConfigMap } from 'PagicUtils/mod.ts';
import type { Logger, BaseHandler, FileHandler, LoggerConfig } from 'Pagic/deps.ts';
import { PagicConfiguration } from 'PagicUtils/mod.ts';
import { colors, setupLogger, getLogger, loggerHandlers as handlers, LogRecord } from 'Pagic/deps.ts';
// #region logging
export const Loggers = ['default', 'test', 'PagicConfiguration', 'PagicWatcherFactory', 'PagicWatcher', 'Pagic'];
export const LogLevels = ['NOTSET', 'DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'];
export type LogFormat = 'json' | 'function' | 'string';
export type LogLevel = 'NOTSET' | 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
export interface PagicMessage {
  logger: string;
  level: number;
  msg: string;
}
export type LogColors = 'white' | 'clear' | 'blue' | 'yellow' | 'red' | 'green';
enum logColors {
  'NOTSET' = 'white',
  'DEBUG' = 'clear',
  'INFO' = 'blue',
  'WARNING' = 'yellow',
  'ERROR' = 'red',
  'CRITICAL' = 'green',
}
// #endregion
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
  private static _loggers: string[] = Loggers; // init static logger list
  private static _config: PagicLogConfigMap = PagicConfiguration.log; // init static log config
  public name = 'default';
  public logger: Logger = getLogger(); // set logger to default logger
  private _config: PagicLogConfigMap = PagicLogger._config;
  /** Construct the default logger.
   * @public
   * @constructor
   */
  public constructor(name = 'default') {
    this.name = name;
    this.logger = getLogger();
  }
  /** Initialize the loggers and handlers.
   * @public
   * @example
   * // returns Pagic logger
   * const l = await new PagicLogger().init('Pagic')
   */
  public async init(name = this.name, config: PagicLogConfigMap = this._config): Promise<PagicLogger> {
    this._config = config;
    await setupLogger({ handlers: this._handlers, loggers: this._loggers });
    this.name = name;
    this.logger = getLogger(name);
    return this;
  }
  /** DEBUG _message
   * @public
   * @example
   * const l = await new PagicLogger().init('Pagic')
   * l.debug('main','_message')
   */
  public debug(first: string, ...args: any[]): string {
    if (this.name === 'test') this._dedebug([first, args].join(' '), ...args);
    return this.logger.debug(first, ...args);
  }
  /** INFO _message
   * @public
   * @example
   * const l = await new PagicLogger().init('Pagic')
   * l.info('main','_message')
   */
  public info(first: string, ...args: any[]): string {
    return this.logger.info(first, ...args);
  }
  /** WARN _message
   * @public
   * @example
   * const l = await new PagicLogger().init('Pagic')
   * l.warn('main','_message')
   */
  public warn(first: string, ...args: any[]): string {
    return this.logger.warning(first, ...args);
  }
  /** ERROR _message
   * @public
   * @example
   * const l = await new PagicLogger().init('Pagic')
   * l.error('main','_message')
   */
  public error(first: string, ...args: any[]): string {
    return this.logger.error(first, ...args);
  }
  /** SUCCESS _message
   * @public
   * @example
   * const l = await new PagicLogger().init('Pagic')
   * l.success('main','_message')
   */
  public success(first: string, ...args: any[]): string {
    return this.logger.critical(first, ...args);
  }
  /** deDEBUG _message - only works in 'test'
   * @private
   * @example
   * const l = await new PagicLogger('test').init('Pagic')
   * l.debug('main','_message')
   */
  private _dedebug(msg: string, ...args: any[]): string {
    return this._message(
      new LogRecord({
        level: 0,
        msg: 'deDEBUG:' + msg,
        args: args,
        loggerName: this.name,
      }),
      this._config.console,
      'console',
    );
  }
  private get _loggers(): { [x: string]: LoggerConfig } {
    return PagicLogger._loggers.reduce((prev: any, current: any) => {
      return {
        ...(typeof prev === 'string' ? this._getLogger(prev, Object.keys(this._handlers)) : prev),
        ...(typeof current === 'string' ? this._getLogger(current, Object.keys(this._handlers)) : {}),
      };
    }, {});
  }
  private get _handlers(): { [x: string]: BaseHandler | FileHandler } {
    return Object.entries(this._config).reduce((prev: any, current: any, i) => {
      return {
        ...(i === 0 ? {} : prev),
        ...{
          [current[0]]: this._getHandler(current[0], current[1]),
        },
      };
    }, {});
  }
  private _getLogger(name = this.name, handlers: string[] = ['console']): { [x: string]: LoggerConfig } {
    return {
      [name]: {
        level: 'DEBUG',
        handlers: handlers,
      },
    };
  }
  private _getHandler(type = 'console', config: PagicLogConfig): BaseHandler | FileHandler {
    if (type === 'file')
      return new handlers.FileHandler(config.level, {
        filename: config.path + `/Pagic.${config.format === 'json' ? 'json' : 'log'}`,
        formatter: (logRecord: LogRecord, handler: PagicLogConfig = config, type: 'file' | 'console' = 'file') => {
          let msg = this._message(logRecord, handler, type);
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
        formatter: (logRecord: LogRecord, handler: PagicLogConfig = config, type: 'file' | 'console' = 'console') => {
          return this._message(logRecord, handler, type);
        },
      });
  }
  private _message(logRecord: LogRecord, handler: PagicLogConfig, type: 'file' | 'console' = 'console') {
    let msg = '';
    let consoleMsg = '';
    if (handler.color) {
      if (logRecord.levelName in logColors && logRecord.levelName !== 'DEBUG') {
        // @ts-ignore
        let colored = colors[logColors[logRecord.levelName]](logRecord.msg.split(' ')[0]);
        let notColored = logRecord.msg.split(' ').slice(1).join(' ');
        if (logRecord.levelName === 'CRITICAL') {
          msg = `\x1b[1m${colored}\x1b[22m${notColored.length > 0 ? ' ' + notColored : ''}`;
          // @ts-ignore
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
      if (type === 'console') console.log(consoleMsg);
    } else msg = logRecord.msg;
    if (handler.format === 'function')
      // @ts-ignore
      logRecord.args.forEach((arg, index) => {
        msg += `, arg${index}: ${arg}`;
      });
    return msg;
  }
}
