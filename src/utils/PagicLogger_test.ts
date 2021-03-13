import { asserts } from '../../deps.ts';

import { default as PagicLogger } from './PagicLogger.ts';

const ogConsole = console.log;
enum strings {
  bold_prefix = '\x1b[1m',
  bold_suffix = '\x1b[22m',
  underline_prefix = '\x1b[4m',
  underline_suffix = '\x1b[24m',
  color_suffix = '\x1b[39m',
}
// eslint-disable-next-line max-params
function color(
  s: string,
  prefix: string,
  bold = false,
  underline = false,
  suffix: strings | string = strings.color_suffix,
) {
  return `${bold ? strings.bold_prefix : ''}${underline ? strings.underline_prefix : ''}${
    Number(prefix) > 0 ? `\x1b[${prefix}m` : ''
  }${s}${suffix}${underline ? strings.underline_suffix : ''}${bold ? strings.bold_suffix : ''}`;
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

const tests = {
  default: [
    color('CRITICAL success ""', colors.red, true),
    color('ERROR error ""', colors.red),
    color('WARNING warn ""', colors.yellow),
    color('INFO info ""', colors.blue),
    // 'default',
    color('DEBUG debug ""', colors.white),
  ],
  init: [
    `[${color('default', colors.green, true)}] ${color('success', colors.green, true)} ""`,
    `[${color('default', colors.red)}] ${color('error', colors.red)} ""`,
    `[${color('default', colors.yellow)}] ${color('warn', colors.yellow)} ""`,
    `[${color('default', colors.blue)}] ${color('info', colors.blue)} ""`,
    `[default] debug ""`,
  ],
  Pagic: [
    `[${color('Pagic', colors.green, true)}] ${color('success', colors.green, true)} ""`,
    `[${color('Pagic', colors.red)}] ${color('error', colors.red)} ""`,
    `[${color('Pagic', colors.yellow)}] ${color('warn', colors.yellow)} ""`,
    `[${color('Pagic', colors.blue)}] ${color('info', colors.blue)} ""`,
    `[Pagic] debug ""`,
  ],
  PagicConfiguration: [
    `[${color('PagicConfiguration', colors.green, true)}] ${color('success', colors.green, true)} ""`,
    `[${color('PagicConfiguration', colors.red)}] ${color('error', colors.red)} ""`,
    `[${color('PagicConfiguration', colors.yellow)}] ${color('warn', colors.yellow)} ""`,
    `[${color('PagicConfiguration', colors.blue)}] ${color('info', colors.blue)} ""`,
    `[PagicConfiguration] debug ""`,
  ],
};
let testCases: string[] | string | any = [];

function consoleMock(...data: string[]) {
  // ogConsole(`ogConsole: ${data}`);
  let value = Array.isArray(testCases) ? testCases.filter((test) => test === data.join(' ')).toString() : testCases;
  // ogConsole(`ogConsole: ${value}`);

  if (value !== 'mockFailure') {
    asserts.assertStrictEquals(data.join(' '), value);
  } else asserts.assertStrictEquals(data.join(' '), 'NOT');
}

Object.entries(tests).forEach((test) => {
  Deno.test({
    name: `[${test[0]}]`,
    fn: async () => {
      testCases = test[1];
      console.log = consoleMock;
      ogConsole(`${test[0]}: testing ${testCases}`);
      let l: PagicLogger | undefined | any;
      switch (test[0]) {
        case 'default':
          l = new PagicLogger();
          break;
        case 'init':
          l = await new PagicLogger().init('default');
          break;
        default:
          l = await new PagicLogger().init(test[0]);
          break;
      }
      // ogConsole(l);
      l.success('success');
      l.error('error');
      l.warn('warn');
      l.info('info');
      l.debug('debug');
      testCases = [];
      console.log = ogConsole;
      l = undefined;
    },
    sanitizeResources: false,
    sanitizeOps: false,
  });
});
