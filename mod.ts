#!/usr/bin/env -S deno --unstable --allow-read --allow-write --allow-net --allow-run --allow-env
import type { ITypeInfo } from 'Pagic/deps.ts';
import type { CliffyCommandOptions } from 'PagicUtils/mod.ts';
import { Command, Select, colors } from 'Pagic/deps.ts';
import { PagicLogger, PagicException } from 'PagicUtils/mod.ts';
import { default as Pagic } from 'Pagic/src/Pagic.ts';
export { Pagic };
const initCommandResources = ['theme', 'site', 'plugin'];
// interface cmdMap {
//   // base?: Command<any, any> | undefined;
//   [key: string]: Command<any, any> | cmd[] | cmd
// }
// interface cmd {
//   [key: string]: Command<any, any> | cmd[] | cmd
// }
const global = { global: true };
const packageJSON = JSON.parse(await Deno.readTextFile('./package.json'));

function pagic(options: CliffyCommandOptions) {
  // l.info('Pagic', options);
  // console.log(pagicEnv);
  const pagic = new Pagic(options);
  pagic.start();
}
// build without prompt
function buildCommand(options: CliffyCommandOptions) {
  pagic({ build: options });
}
// init with prompt
async function initCommand(options: CliffyCommandOptions) {
  // l.info('Pagic', options);
  const parsedOptions: string[] = [];
  if (!options.overwrite) {
    parsedOptions.push(
      await Select.prompt({
        message: 'Init current dir as a',
        options: [
          { name: 'site', value: 'site' },
          { name: 'theme', value: 'theme' },
          { name: 'plugin', value: 'plugin' },
        ],
      }),
    );
  }
  pagic({ init: { ...options, ...{ [parsedOptions[0] as string]: true } } });
}
// init without prompt, needs explicit site|theme|plugin: true
function initSubCommand(options: CliffyCommandOptions) {
  // l.info('Pagic', options);
  pagic({ init: options });
}

function pagicMessage(logger: string, msg: string) {
  console.log(logger + ' ' + msg);
}

function initResourceType({ label, name, value }: ITypeInfo): string {
  console.log(label);
  console.log(name);
  console.log(value);
  if (!initCommandResources.includes(value)) {
    throw new PagicException(
      'default',
      50,
      `${label} ${name} must be in [${initCommandResources.join(', ')}] but got: ${value}`,
      // stack: Error.captureStackTrace(new Error()),
    );
  }
  return value;
}
function commands() {
  // @ts-ignore
  const build = {
    build: new Command()
      .description('Build a static website')
      .option('--watch [watch:boolean]', 'Watch file changes to rebuild')
      .option('--serve [serve:boolean]', 'Start local service, preview static website')
      .option('--port [port:number]', 'Specify the local port of the service')
      .action((options: CliffyCommandOptions) => buildCommand(options)),
  };
  const init = {
    init: new Command()
      .description('Initialize pagic resources')
      .type('resource', initResourceType)
      .arguments('[resource:resource]')
      .action(async (options: CliffyCommandOptions) => await initCommand(options)),
  };
  const theme = {
    theme: new Command()
      .description('Init a new pagic theme')
      .action(
        async (options: CliffyCommandOptions) =>
          await initSubCommand({ ...options, ...{ theme: true, overwrite: undefined } }),
      )
      .option('--overwrite [overwrite:boolean]', 'Acknowledge your destruction with a flag you rogue admin you.', {
        default: false,
        global: true,
      })
      .global(),
  };
  const site = {
    site: new Command()
      .description('Init a new pagic site')
      .action(
        async (options: CliffyCommandOptions) =>
          await initSubCommand({ ...options, ...{ site: true, overwrite: undefined } }),
      ),
  };
  const plugin = {
    theme: new Command()
      .description('Init a new pagic plugin')
      .action(async (options: CliffyCommandOptions) =>
        initSubCommand({ ...options, ...{ plugin: true, overwrite: undefined } }),
      ),
  };
  const base = {
    pagic: new Command()
      .global()
      .name('pagic')
      .version(packageJSON.VERSION)
      .description(packageJSON.description)
      // logPath|PAGIC_LOG_PATH
      .env(
        'PAGIC_LOG_PATH=<logPath:string>',
        `Set file log path with absolute or relative path ending with ${colors.green('.')}`,
      )
      .option(
        '--logPath <logPath:string>',
        'Explicitly set file log path with absolute or relative path ending with .',
        global,
      )
      // logLevel|PAGIC_LOG_LEVEL
      .env(
        'PAGIC_LOG_LEVEL=<logLevel:string>',
        `Set file log level CRITICAL|${colors.green('ERROR')}|WARNING|INFO|DEBUG`,
      )
      .option('--logLevel <logLevel:string>', 'Explicitly set file log level CRITICAL|ERROR|WARNING|INFO|DEBUG', global)
      // logFormat|PAGIC_LOG_FORMAT
      .env('PAGIC_LOG_FORMAT=<logFormat:string>', `Set log file format ${colors.green('json')}|function|string`)
      .option('--logFormat <logFormat:string>', `Explicitly set file log file format json|function|string)}`, global)
      // consoleLevel|PAGIC_CONSOLE_LEVEL
      .env(
        'PAGIC_CONSOLE_LEVEL=<consoleLevel:string>',
        `Set console log level CRITICAL|${colors.green('ERROR')}|WARNING|INFO|DEBUG`,
      )
      .option('--consoleLevel <consoleLevel:string>', 'Explicitly set console log level', global)
      // consoleColor|PAGIC_CONSOLE_COLOR
      .env('PAGIC_CONSOLE_COLOR=<consoleColor:boolean>', `Set log color ${colors.green('true')}|false`)
      .option('--no-color <consoleColor:boolean>', 'Explicitly set log color true|false', global)
      // consoleFormat|PAGIC_CONSOLE_FORMAT
      .env(
        'PAGIC_CONSOLE_FORMAT=<consoleFormat:string>',
        `Set console log format json|function|${colors.green('string')}`,
      )
      .option('--consoleFormat <consoleFormat:string>', 'Set console log format json|function|string', global)
      // srcDir|PAGIC_SOURCE_DIR
      .env('PAGIC_SOURCE_DIR=<srcDir:string>', `Set pagic.config.ts|x directory ${colors.green('.')}`)
      .option('-s --srcDir <srcDir:string>', 'Explicitly set pagic.config.ts|x directory .', global)
      .example('logfile and console enabled with non-colored json output', '')
      .arguments('[-h/--help] [--logPath] [build]'),
  };
  return {
    ...base,
    sub: [
      build,
      {
        ...init,
        sub: [theme, plugin, site],
      },
    ],
  };
}

async function main() {
  // l.error('testing', 'a', 'b', 'c');
  // l.warn('testing', 'a', 'b', 'c');
  // l.success('testing', 'a', 'b', 'c');
  // l.info('testing', 'a', 'b', 'c');
  // l.error('testing');
  // l.info('testing');
  // l.warn('testing');
  // l.success('testing');
  const l = await new PagicLogger().init('Pagic');
  try {
    // const l = await new PagicLogger().init('Pagic');
    if (import.meta.main) {
      l.success('main', 'in meta.main');
      l.error('main', 'in meta.main');
      l.warn('main', 'in meta.main');
      l.info('main', 'in meta.main');
      let cmd = commands();
      l.info('main', cmd);
      let pagic = cmd.pagic;
      if ('sub' in Object.keys(cmd)) {
        cmd.sub.forEach((command: any) => {
          if ('sub' in Object.keys(command)) {
            command.sub.forEach((_command: any) => {
              pagic.command(command.command(_command));
            });
          } else pagic.command(command);
        });
      }
      pagic.parse(Deno.args);
    } else {
      l.info('main', 'NOT in meta.main');
    }
    l.success('main', 'casting pagic chain spells');
  } catch (e) {
    // console.log(
    //   [
    //     `[${name.charAt(0).toString().toUpperCase() + name.slice(1)}]`,
    //     level <= 50 ? msg : undefined,
    //     level <= 20 ? stack : undefined,
    //   ].join(' '),
    // );
    l.error(e);
    l.error(typeof e);
    l.error(e.msg);
    l.error(e.stack);
    // console.log(e.msg);
    // console.log(e.stack);
    l.error('catching pagic dust from your <0 d20 cast');
    // if (typeof promise === Error) {
    //   console.error(promise);
    //   console.error('catching pagic dust from your <0 d20 cast');
    // }
  } finally {
    l.error('finally you can put your robe and wizard hat away', 'test', 'test');
  }
  l.error('casting pagic chain spells');
}
main();
