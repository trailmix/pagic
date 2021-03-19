import { PagicLogger, PagicConfiguration, logLevels, loggerNames, stringifyBigInt } from 'PagicUtils/mod.ts';
import type { LogLevel, PagicLogConfigMap } from 'PagicUtils/mod.ts';
import { getLevelByName, asserts } from 'Pagic/deps.ts';
import { logString, strings, colorLog } from 'PagicTest/utils.ts';
// import { Table } from 'https://deno.land/x/cliffy@v0.16.0/table/mod.ts';
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
// eslint-disable-next-line max-params
function testLoggerLevels(
  logger = 'default',
  level: LogLevel = 'ERROR',
  l: PagicLogger,
  msg: unknown,
  ...args: unknown[]
) {
  let levelNum = getLevelByName(level);
  let actual = 0;
  let message: string =
    typeof msg === 'string'
      ? msg
      : msg instanceof Error
      ? msg.stack!
      : typeof msg === 'object'
      ? JSON.stringify(msg, stringifyBigInt)
      : String(msg);
  // ogConsole(message);
  if (logger === 'test') {
    testCases = [logString(message, 'NOTSET', logger, ...args)];
    actual++;
  }
  if (levelNum <= 10) {
    testCases.push(logString(message, 'DEBUG', logger, ...args));
    l.debug(msg, ...args);
    actual++;
  }
  if (levelNum <= 20) {
    testCases = [logString(message, 'INFO', logger, ...args)];
    l.info(msg, ...args);
    actual++;
  }
  if (levelNum <= 30) {
    testCases = [logString(message, 'WARNING', logger, ...args)];
    l.warn(msg, ...args);
    actual++;
  }
  if (levelNum <= 40) {
    testCases = [logString(message, 'ERROR', logger, ...args)];
    l.error(msg, ...args);
    actual++;
  }
  if (levelNum <= 50) {
    testCases = [logString(message, 'CRITICAL', logger, ...args)];
    l.success(msg, ...args);
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
  // const expected = testCases[testCases.length - 1];
  // ogConsole(data);
  // ogConsole(testCases[testCases.length - 1]);
  // ogConsole(testCases);
  const expected = Array.isArray(testCases) ? testCases.filter((test) => test === data.join(''))[0] : testCases;
  asserts.assertNotEquals(expected, '', `Did not find matching string in [testCases]\n ${JSON.stringify(testCases)}`);
  const actual = data.join('');
  // ogConsole(`\n${new Table([actual, expected]).maxColWidth(100).border(true).padding(1).indent(2)}`);
  asserts.assertStrictEquals(
    actual,
    expected,
    `console.log() message failure: (actual !== expected)\n "${actual}" !== "${expected}"`,
  );
}

const messageTests = {
  string: ['string', `${Deno.env.get('HOME')}`, Object.keys(Deno)[0]],
  numbers: [
    1,
    Number.MAX_SAFE_INTEGER, // max number
    9007199254740999007199254740990n, // bigint
  ],
  boolean: [true, false],
  undefined: [undefined],
  null: [null],
  object: [
    new RangeError('Uh-oh!'),
    {
      test1: 'test',
    },
    {
      test2: ['a', true, 3],
    },
    {
      test3: { testInner: 'test' },
    },
    Deno.version,
    {
      deno: { ...Deno.version, ...Deno.build },
    },
    {
      deno: [Deno.version, Deno.build],
    },
    {
      deno: {
        version: Deno.version,
        build: Deno.build,
      },
    },
  ],
};
const args = [
  ...messageTests.string,
  ...messageTests.numbers,
  ...messageTests.boolean,
  ...messageTests.undefined,
  ...messageTests.null,
  ...messageTests.object,
  messageTests.string,
  messageTests.numbers,
  messageTests.boolean,
  messageTests.undefined,
  messageTests.null,
  messageTests.object,
  [
    messageTests.string,
    messageTests.numbers,
    messageTests.boolean,
    messageTests.undefined,
    messageTests.null,
    messageTests.object,
  ],
];
console.log('Testing PagicLogger.ts...');
for await (const level of logLevels) {
  for await (const logger of loggerNames) {
    for await (const args of ['string', undefined])
      Deno.test({
        sanitizeResources: false,
        sanitizeExit: false,
        sanitizeOps: false,
        name: `PagicLogger.ts Logger test for \x1b[47m\x1b[30m${logger}${strings.ansi_reset} at level \x1b[${colorLog(
          level as LogLevel,
          logger,
        )}m${level}${strings.color_suffix}${
          args !== undefined ? ' with args ' + JSON.stringify(args, stringifyBigInt) : ''
        }\n`,
        async fn() {
          console.log = consoleMock;
          const log: PagicLogConfigMap = new PagicConfiguration({
            consoleLevel: level,
            logPath: '.',
            logLevel: level,
          }).log;
          asserts.assertStrictEquals(
            level,
            log.console.level,
            `PagicConfiguration logLevel not set: ${level} !== ${log.console.level}`,
          );
          const l: PagicLogger = await new PagicLogger(logger, log).init();
          asserts.assertStrictEquals(
            level,
            l.pConfig.console.level,
            `PagicLogger logLevel not set: ${level} !== ${l.pConfig.console.level}`,
          );
          testLoggerLevels(logger, level as LogLevel, l, level, args);
          // testCases = [];
          // JSON.stringify(msg)Count = 0;
        },
      });
  }
}
for await (const level of logLevels) {
  for await (const test of Object.entries(messageTests)) {
    for await (const arg of args) {
      for await (const item of test[1]) {
        Deno.test({
          sanitizeResources: false,
          sanitizeExit: false,
          sanitizeOps: false,
          name: `PagicLogger.ts Message test for \x1b[47m\x1b[30m${test[0]}:${item}${
            strings.ansi_reset
          } at level \x1b[${colorLog(level as LogLevel, 'default')}m${level}${strings.color_suffix}${
            arg !== undefined ? ' with args ' + JSON.stringify(arg, stringifyBigInt) : ''
          }\n`,
          async fn() {
            console.log = consoleMock;
            const log: PagicLogConfigMap = new PagicConfiguration({
              consoleLevel: level,
              logPath: '.',
              logLevel: level,
            }).log;
            asserts.assertStrictEquals(
              level,
              log.console.level,
              `PagicConfiguration logLevel not set: ${level} !== ${log.console.level}`,
            );
            const l: PagicLogger = await new PagicLogger('test', log).init();
            asserts.assertStrictEquals(
              level,
              l.pConfig.console.level,
              `PagicLogger logLevel not set: ${level} !== ${l.pConfig.console.level}`,
            );
            testLoggerLevels('test', level as LogLevel, l, item, arg);
            testCases = [];
          },
        });
      }
    }
  }
}

// Deno.test({
//   name: `[${test[0]}]`,
//   fn: async () => {
//     testCases = test[1];
//     ogConsole(
//       `${test[0]}: testing cases: \n\n\t\x1b[${colors.green}m${testCases.join(
//         `${strings.color_suffix}\n\t\x1b[${colors.green}m`,
//       )}${strings.color_suffix}`,
//     );
//     switch (test[0]) {
//       case 'default':
//         l = await new PagicLogger();
//         l.success('success');
//         l.error('error');
//         l.warn('warn');
//         l.info('info');
//         break;
//       case 'init':
//         l = await new PagicLogger().init('default');
//         l.success('success');
//         l.error('error');
//         break;
//       case 'test':
//         // create a new configuration with DEBUG enabled explicitly
//         config = await new PagicConfiguration().merge({
//           consoleLevel: 'DEBUG',
//         });
//         // create a new logger with the new configuration
//         l = await new PagicLogger().init('default', config.log);
//         l.success('success');
//         l.error('error');
//         // now that debug is enabled these should appear
//         l.warn('warn');
//         l.info('info');
//         l.debug('debug');
//         // // unassign current logger
//         // l = undefined;
//         config = await new PagicConfiguration().merge();
//         // we create logger with 'test' in constructor,
//         // this allows deDEBUG messages
//         l = await new PagicLogger('test').init();
//         // this will show up only if PagicLogger is created with 'test'
//         // it will prefix 'deDEBUG:' to the string and make it colors.white
//         l.debug('debug');
//         break;
//       default:
//         break;
//     }
//   },
//   sanitizeResources: false,
//   sanitizeOps: false,
// });
