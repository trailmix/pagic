import { asserts } from '../../deps.ts';
import { PagicWatcher, PagicWatcherFactory } from './mod.ts';

const ogConsole = console.log;
enum strings {
  underline_prefix = '\x1b[4m',
  underline_suffix = '\x1b[24m',
  color_suffix = '\x1b[39m',
}
// eslint-disable-next-line max-params
function color(s: string, prefix: string, underline = false, suffix: strings | string = strings.color_suffix) {
  return `${underline ? strings.underline_prefix : ''}${Number(prefix) > 0 ? `\x1b[${prefix}m` : ''}${s}${suffix}${
    underline ? strings.underline_suffix : ''
  }`;
}
enum colors {
  clear = '0',
  red = '31',
  green = '32',
}
const testPaths: { [key: string]: string } = {
  watcher_Found: '.',
  watcher_FoundNamed: '/etc',
  watcher_FoundRelative: '../.',
};
const tests = {
  consoleMock: ['mockSuccess', 'mockFailure'],

  watcher_NotFound: [
    `${color('[Pagic]', colors.red)} ${color('watcher', colors.red)} client ${color(
      'NOT',
      colors.clear,
      true,
      '',
    )} <- These files were not found.`,
  ],
  ...Object.fromEntries(
    Object.entries(testPaths).map((t) => [
      t[0],
      `${color('[Pagic]', colors.green)} ${color('watcher', colors.green)} client ${color(
        t[1],
        colors.clear,
        true,
        '',
      )}`,
    ]),
  ),
  factory_Init: [
    `[Pagic] watcher factory init ${color(
      '.',
      colors.clear,
      true,
      '',
    )} | ${color('/Users/bkillian/repos/pagic/pagic.config.tsx', colors.clear, true, '')}`,
    // '\x1b[32m[Pagic]\x1b[39m \x1b[32mwatcher\x1b[39m client \x1b[4m.\x1b[24m | \x1b[4m/Users/bkillian/repos/testpagic/pagic.config.tsx\x1b[24m',
    `${color('[Pagic]', colors.green)} ${color('watcher', colors.green)} client ${color(
      '.',
      colors.clear,
      true,
      '',
    )} | ${color('/Users/bkillian/repos/pagic/pagic.config.tsx', colors.clear, true, '')}`,
  ],
  factory_Init_themelocal: [
    `[Pagic] watcher factory init ${color(
      '.',
      colors.clear,
      true,
      '',
    )} | ${color('/Users/bkillian/repos/pagic/pagic.config.tsx', colors.clear, true, '')}`,
    `[Pagic] watcher factory init theme ${color('/Users/bkillian/repos/pagic-docs/.', colors.clear, true, '')}`,
    // '\x1b[32m[Pagic]\x1b[39m \x1b[32mwatcher\x1b[39m client \x1b[4m.\x1b[24m | \x1b[4m/Users/bkillian/repos/testpagic/pagic.config.tsx\x1b[24m',
    `${color('[Pagic]', colors.green)} ${color('watcher', colors.green)} client ${color(
      '.',
      colors.clear,
      true,
      '',
    )} | ${color('/Users/bkillian/repos/pagic/pagic.config.tsx', colors.clear, true, '')}`,
    `${color('[Pagic]', colors.green)} ${color('watcher', colors.green)} client ${color(
      '/Users/bkillian/repos/pagic-docs/.',
      colors.clear,
      true,
      '',
    )}`,
  ],
};
let testCases: string[] | string | any = [];
function consoleMock(...data: string[]) {
  let value = Array.isArray(testCases) ? testCases.filter((test) => test === data.join(' ')).toString() : testCases;
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
      let watcher: PagicWatcher | undefined | any;
      switch (test[0]) {
        case 'consoleMock':
          // console doesn't match
          asserts.assertThrows(() => console.log('mockFailure'), asserts.AssertionError);
          // console matches
          console.log('mockSuccess');
          break;
        case 'watcher_NotFound':
          // dir not found
          watcher = new PagicWatcher('NOT');
          break;
        case 'watcher_Found':
          // dir found
          watcher = new PagicWatcher('.');
          break;
        case 'watcher_FoundNamed':
          // dir found
          watcher = new PagicWatcher('/etc');
          break;
        case 'watcher_FoundRelative':
          // dir found
          watcher = new PagicWatcher('../.');
          break;
        case 'factory_Init':
          // dir found
          watcher = new PagicWatcherFactory(
            {
              srcDir: '.',
              theme: 'docs',
              include: [],
              exclude: [],
            },
            '/Users/bkillian/repos/pagic/pagic.config.tsx',
          );
          break;
        case 'factory_Init_themelocal':
          watcher = new PagicWatcherFactory(
            {
              srcDir: '.',
              theme: '../pagic-docs',
              include: [],
              exclude: [],
              themelocal: true,
            },
            '/Users/bkillian/repos/pagic/pagic.config.tsx',
          );
        default:
          break;
      }
      testCases = [];
      console.log = ogConsole;
      watcher = undefined;
    },
    sanitizeResources: false,
    sanitizeOps: false,
  });
});
// Deno.test('[watcher]', async () => {
//   const watchers = new PagicWatcher('');
//   asserts.assertThrows((): void => {
//     console.log('throwing');
//   });
// });

// Deno.test('[factory]', async () => {
//   console.log = consoleMock;
//   asserts.assertThrows(
//     () => {
//       return new PagicWatcherFactory({ srcDir: '', theme: '' }, '');
//     },
//     asserts.AssertionError,
//     'assert',
//   );
//   // asserts.assertThrows((): void => {
//   //   console.log('throwing');
//   // });
// });
