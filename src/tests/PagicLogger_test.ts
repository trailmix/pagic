import { PagicLogger, PagicConfiguration, LogLevels, Loggers } from 'PagicUtils/mod.ts';
import type { LogLevel, PagicLogConfigMap } from 'PagicUtils/mod.ts';
import { getLevelByName, asserts } from 'Pagic/deps.ts';
import { logString, strings, colorLog } from 'PagicTest/utils.ts';
let testCases: string[] = [];
const ogConsole = console.log;
/**
 * test logger based on logger name and level
 * then test messages to ensure that
 * message counts are correct per level
 * @param logger logger name string
 * @param level LogLevel object
 * @param l PagicLogger object
 */
function testLoggerLevels(logger = 'default', level: LogLevel = 'ERROR', l: PagicLogger) {
  let levelNum = getLevelByName(level);
  let actual = 0;
  if (logger === 'test') {
    testCases = [logString('debug', 'NOTSET', logger)];
    actual++;
  }
  if (levelNum <= 10) {
    testCases.push(logString('debug', 'DEBUG', logger));
    l.debug('debug');
    actual++;
  }
  if (levelNum <= 20) {
    testCases = [logString('info', 'INFO', logger)];
    l.info('info');
    actual++;
  }
  if (levelNum <= 30) {
    testCases = [logString('warn', 'WARNING', logger)];
    l.warn('warn');
    actual++;
  }
  if (levelNum <= 40) {
    testCases = [logString('error', 'ERROR', logger)];
    l.error('error');
    actual++;
  }
  if (levelNum <= 50) {
    testCases = [logString('success', 'CRITICAL', logger)];
    l.success('success');
    actual++;
  }
  // divide level by 10
  let expected = levelNum / 10;
  // subtract max(50/10)+1 from sum
  expected = 6 - expected;
  // add 1 if 'test' to sum for deDEBUG messages
  expected += logger === 'test' ? 1 : 0;
  // subtract 1 from sum if NOTSET, default is INFO
  expected -= levelNum === 0 ? 1 : 0;
  asserts.assertStrictEquals(actual, expected, `Message count failure:\t ${actual} !== ${expected}`);
}
/**
 * this function is meant to be used to override
 * console.log() so you can ensure it is messaging
 * the console correctly with custom colored strings
 * or bold for example
 * @param data string array of console.log message
 */
function consoleMock(...data: string[]) {
  const expected = Array.isArray(testCases)
    ? testCases.filter((test) => test === data.join(' ')).toString()
    : testCases;
  const actual = data.join(' ');
  // ogConsole(`ogConsole.data ${data}\t===\togConsole.value ${value}`);
  asserts.assertStrictEquals(
    actual,
    expected,
    `console.log() message failure: (actual !== expected)\n ${actual} !== ${expected}`,
  );
}
const messageTests = {
  string: ['string', `${Deno.env.get('HOME')}`, Object.keys(Deno)[0]],
  object: [
    {
      test1: 'test',
    },
    {
      test2: ['a', true, 3],
    },
    {
      test3: { testInner: 'test' },
    },
  ],
  boolean: [true, false, undefined],
  array: [
    [1, 2, 3],
    [123, 456, 789],
    ['1', '2', '3'],
    ['a', 'b', 'c'],
    ['abc', 'dce', 'xyz'],
    [true, false],
    [true, false, undefined],
    [undefined, undefined, undefined],
    [{ test1: 'test' }, { test2: ['a', true, 3] }, { test3: { testInner: 'test' } }],
  ],
};

// ogConsole(
//   `${test[0]}: testing cases: \n\n\t\x1b[${colors.green}m${testCases.join(
//     `${strings.color_suffix}\n\t\x1b[${colors.green}m`,
//   )}${strings.color_suffix}`,
// );
console.log('Testing PagicLogger.ts...');
for await (const logger of Loggers) {
  for await (const level of LogLevels) {
    Deno.test({
      name: `PagicLogger.ts Logger test for \x1b[47m\x1b[30m${logger}${strings.ansi_reset} at level \x1b[${colorLog(
        level as LogLevel,
        logger,
      )}m${level}${strings.color_suffix}.\n`,
      async fn() {
        console.log = consoleMock;
        const log: PagicLogConfigMap = new PagicConfiguration({
          consoleLevel: level,
        }).log;
        asserts.assertStrictEquals(
          level,
          log.console.level,
          `PagicConfiguration logLevel not set: ${level} !== ${log.console.level}`,
        );
        const l: PagicLogger = await new PagicLogger().init(logger, log);
        asserts.assertStrictEquals(
          level,
          l.config.console.level,
          `PagicLogger logLevel not set: ${level} !== ${l.config.console.level}`,
        );
        testLoggerLevels(logger, level as LogLevel, l);
        // testCases = [];
        // msgCount = 0;
      },
    });
  }
}
// for await (const test of Object.entries(messageTests)) {
//   for await (const item of test[1]) {
//     for await (const level of LogLevels) {
//       Deno.test({
//         name: `PagicLogger.ts\tlevel:${test[0]} \tlogger:${logger}`,
//         async fn() {
//           console.log = successConsoleMock;
//           // const level: LogLevel = test[0] as LogLevel;
//           const log: PagicLogConfigMap = new PagicConfiguration({
//             consoleLevel: level,
//           }).log;
//           asserts.assertStrictEquals(level, log.console.level, 'PagicConfiguration level not set!');
//           const l: PagicLogger = await new PagicLogger().init(logger, log);
//           asserts.assertStrictEquals(level, l.config.console.level, 'PagicLogger level not set!');
//           testLoggerLevels(logger, level, l);
//         },
//       });
//     }
//   }
// }
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
