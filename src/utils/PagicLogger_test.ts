import { asserts, getLevelByName } from '../../deps.ts';

import type { LogLevel } from './PagicLogger.ts';
import { default as PagicLogger } from './PagicLogger.ts';
import { default as PagicConfiguration } from './PagicConfiguration.ts';

const ogConsole = console.log;
enum strings {
  bold_prefix = '\x1b[1m',
  bold_suffix = '\x1b[22m',
  underline_prefix = '\x1b[4m',
  underline_suffix = '\x1b[24m',
  color_suffix = '\x1b[39m',
}
enum colors {
  clear = '0',
  black = '30',
  red = '31',
  green = '32',
  yellow = '33',
  blue = '34',
  magenta = '35',
  cyan = '36',
  white = '37',
  BGblack = '40',
  BGred = '41',
  BGgreen = '42',
  BGyellow = '43',
  BGblue = '44',
  BGmagenta = '45',
  BGcyan = '46',
  BGwhite = '47',
}
// eslint-disable-next-line max-params
function color(
  s: string,
  prefix: strings | colors = colors.clear,
  suffix: strings | string = strings.color_suffix,
  bold = false,
  underline = false,
) {
  return `${bold ? strings.bold_prefix : ''}${underline ? strings.underline_prefix : ''}${
    Number(prefix) > 0 ? `\x1b[${prefix}m` : ''
  }${s}${suffix !== '0' ? suffix : ''}${underline ? strings.underline_suffix : ''}${bold ? strings.bold_suffix : ''}`;
}

/**
 * pass in logger name and level and get a string color
 * @param level LogLevel object
 * @param logger logger name string
 * @returns colors
 */
function colorLog(level: LogLevel = 'ERROR', logger = 'default'): colors {
  let color = colors.red;
  switch (level) {
    case 'CRITICAL':
      color = logger === 'undefined' ? colors.red : colors.green;
      break;
    case 'ERROR':
      color = colors.red;
      break;
    case 'WARNING':
      color = colors.yellow;
      break;
    case 'INFO':
      color = colors.blue;
      break;
    case 'DEBUG':
      color = colors.clear;
      break;
    case 'NOTSET':
      color = colors.white;
      break;
  }
  return color;
}
/**
 * pass in logger level, name, and message and get a parsed message
 * @param log log message to log
 * @param level LogLevel object
 * @param logger logger name string
 * @returns formatted log message
 */
function logString(log: string, level: LogLevel = 'ERROR', logger = 'default'): string {
  const logColor = colorLog(level, logger);
  const colorSuffix = logColor === '0' ? '0' : strings.color_suffix;
  const bold = level === 'CRITICAL' ? true : false;
  let msg = '';
  let _log = level === 'NOTSET' && logger === 'test' ? 'deDEBUG:' + log : log;
  switch (logger) {
    case 'undefined':
      msg = color(`${level} ${_log}`, logColor, colorSuffix, bold);
      break;
    default:
      msg = `[${color(logger, logColor, colorSuffix, bold)}] ${color(_log, logColor, colorSuffix, bold)}`;
      break;
  }
  return msg;
}
/**
 * create new pagic configuration and logger based on logger name and level
 * then test messages per level
 * @param logger logger name string
 * @param level LogLevel object
 */
function testLoggerLevels(logger = 'default', level: LogLevel = 'ERROR', l: PagicLogger) {
  let levelNum = getLevelByName(level);
  if (logger === 'test') testCases = [logString('debug', 'NOTSET', logger)];
  if (levelNum <= 10) {
    testCases.push(logString('debug', 'DEBUG', logger));
    l.debug('debug');
  }
  if (levelNum <= 20) {
    testCases = [logString('info', 'INFO', logger)];
    l.info('info');
  }
  if (levelNum <= 30) {
    testCases = [logString('warn', 'WARNING', logger)];
    l.warn('warn');
  }
  if (levelNum <= 40) {
    testCases = [logString('error', 'ERROR', logger)];
    l.error('error');
  }
  if (levelNum <= 50) {
    testCases = [logString('success', 'CRITICAL', logger)];
    l.success('success');
  }
}
const tests = {
  // CRITICAL: ['undefined', 'test', 'Pagic', 'PagicConfiguration', 'PagicWatcherFactory', 'PagicWatcher'],
  // ERROR: ['undefined', 'test', 'Pagic', 'PagicConfiguration', 'PagicWatcherFactory', 'PagicWatcher'],
  // WARNING: ['undefined', 'test', 'Pagic', 'PagicConfiguration', 'PagicWatcherFactory', 'PagicWatcher'],
  // INFO: ['undefined', 'test', 'Pagic', 'PagicConfiguration', 'PagicWatcherFactory', 'PagicWatcher'],
  // DEBUG: ['undefined', 'test', 'Pagic', 'PagicConfiguration', 'PagicWatcherFactory', 'PagicWatcher'],
  // CRITICAL: ['undefined'],
  // ERROR: ['undefined'],
  CRITICAL: ['default', 'test', 'Pagic', 'PagicConfiguration', 'PagicWatcherFactory', 'PagicWatcher'],
  ERROR: ['default', 'test', 'Pagic', 'PagicConfiguration', 'PagicWatcherFactory', 'PagicWatcher'],
  WARNING: ['default', 'test', 'Pagic', 'PagicConfiguration', 'PagicWatcherFactory', 'PagicWatcher'],
  INFO: ['default', 'test', 'Pagic', 'PagicConfiguration', 'PagicWatcherFactory', 'PagicWatcher'], // undefined default is info
  DEBUG: ['default', 'test', 'Pagic', 'PagicConfiguration', 'PagicWatcherFactory', 'PagicWatcher'], // test will enable deDEBUG
  // string: ['string'],
  // object: [
  //   {
  //     test: 'test',
  //   },
  // ],
  // boolean: [true],
  // array: [
  //   [1, 2, 3],
  //   [123, 456, 789],
  //   ['1', '2', '3'],
  //   ['a', 'b', 'c'],
  //   ['abc', 'dce', 'xyz'],
  //   [true, false],
  //   [true, false, undefined],
  //   [undefined, undefined, undefined],
  //   [{ test1: 'test' }, { test2: ['a', true, 3] }, { test3: { testInner: 'test' } }],
  // ],
};
let testCases: string[] = [];
function consoleMock(...data: string[]) {
  let value = Array.isArray(testCases) ? testCases.filter((test) => test === data.join(' ')).toString() : testCases;
  ogConsole(`\nogConsole.data ${data}\t===\togConsole.value ${value}`);
  return value;
}
function successConsoleMock(...data: string[]) {
  asserts.assertStrictEquals(data.join(' '), consoleMock(...data));
}
function failureConsoleMock(...data: string[]) {
  // ogConsole(...data);
  asserts.assertStrictEquals(data.join(' '), 'NOTa');
}

for await (const test of Object.entries(tests)) {
  ogConsole(test);
  for await (const logger of test[1]) {
    ogConsole(logger);
    // ogConsole(`${test[0]}: testing logger: \n\n\t\x1b[${colors.green}m${logger}${strings.color_suffix}`);
    Deno.test({
      name: `\tlevel:${test[0]} \tlogger:${logger}`,
      async fn() {
        console.log = successConsoleMock;
        const level: LogLevel | undefined = test[0] as LogLevel;
        const config: PagicConfiguration | undefined | any = new PagicConfiguration();
        const l: PagicLogger | undefined | any = await new PagicLogger().init(
          logger,
          await config.merge({
            consoleLevel: level,
          }).log,
        );
        testLoggerLevels(logger, level, l);
        testCases = [];
        ogConsole('done');
        // console.log = ogConsole;
      },
      sanitizeResources: false,
      sanitizeOps: false,
    });
  }
}
// Deno.test({
// name: `[${test[0]}]`,
// fn: async () => {
// testCases = test[1];
// ogConsole(
//   `${test[0]}: testing cases: \n\n\t\x1b[${colors.green}m${testCases.join(
//     `${strings.color_suffix}\n\t\x1b[${colors.green}m`,
//   )}${strings.color_suffix}`,
// );
// switch (test[0]) {
//   case 'default':
//     l = await new PagicLogger();
//     l.success('success');
//     l.error('error');
//     l.warn('warn');
//     l.info('info');
//     break;
//   case 'init':
//     l = await new PagicLogger().init('default');
//     l.success('success');
//     l.error('error');
//     break;
//   case 'test':
//     // create a new configuration with DEBUG enabled explicitly
//     config = await new PagicConfiguration().merge({
//       consoleLevel: 'DEBUG',
//     });
//     // create a new logger with the new configuration
//     l = await new PagicLogger().init('default', config.log);
//     l.success('success');
//     l.error('error');
//     // now that debug is enabled these should appear
//     l.warn('warn');
//     l.info('info');
//     l.debug('debug');
//     // // unassign current logger
//     // l = undefined;
//     config = await new PagicConfiguration().merge();
//     // we create logger with 'test' in constructor,
//     // this allows deDEBUG messages
//     l = await new PagicLogger('test').init();
//     // this will show up only if PagicLogger is created with 'test'
//     // it will prefix 'deDEBUG:' to the string and make it colors.white
//     l.debug('debug');
//     break;
//   default:

//     break;
// }
// ogConsole(l);
// }
// sanitizeResources: false,
// sanitizeOps: false,
// });
// }
