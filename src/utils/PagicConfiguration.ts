// import type { default as Pagic } from '../Pagic.ts';
// import type { CliffyCommandOptions } from '../../mod.ts';
// import { default as PagicLogger, LogLevels } from './PagicLogger.ts';
import type { LogLevel, LogFormat } from 'PagicUtils/mod.ts';
import type { React } from 'Pagic/deps.ts';
import {
  REGEXP_PAGE,
  REGEXP_LAYOUT,
  pick,
  unique,
  sortByInsert,
  importDefault,
  walk,
  getPagicConfigPath,
  importPlugin,
  importTheme,
  getGitBranch,
} from 'PagicUtils/mod.ts';
export interface PagicConfig {
  // cmd
  cmd: PagicCommand;
  // base
  srcDir: string;
  outDir: string;
  include?: string[];
  exclude?: string[];
  root: string;
  theme: string;
  plugins: string[];

  // theme config
  title?: string;
  description?: string;
  head?: React.ReactElement | null;
  github?: string;
  tocAd?: React.ReactElement;
  tools?: {
    editOnGitHub: boolean;
    backToTop: boolean;
  };
  branch?: string;

  // plugins
  nav?: {
    text: string;
    link: string;
    icon?: string;
    target?: '_blank' | string;
    popover?: React.ReactElement;
    align?: 'left' | 'right';
  }[];
  sidebar?: PagicConfigSidebar;
  md?: {
    anchorLevel?: (1 | 2 | 3 | 4 | 5 | 6)[];
    tocEnabled?: boolean;
    tocLevel?: (1 | 2 | 3 | 4 | 5 | 6)[];
  };
  ga?: GaProps;
  gitalk?: GitalkProps;
  blog?: {
    root: string;
    social?: {
      github: string;
      email: string;
      twitter: string;
      v2ex: string;
      zhihu: string;
    };
  };
  i18n?: {
    languages: { code: string; name: string; root: string }[];
    overrides?: Record<string, any>;
    resources?: Record<string, { translation: Record<string, string> }>;
  };

  [key: string]: any;
}
// #region plugins
export interface PagicPlugin {
  name: string;
  insert?: string;
  fn: (ctx: PagicConfig) => Promise<void>;
}
export type PagicLayout<T = Record<string, any>> = React.FC<PageProps & T>;
export interface PageProps {
  // md
  title: string;
  content: React.ReactElement | null;
  contentTitle?: React.ReactElement;
  contentBody?: React.ReactElement;
  toc?: React.ReactElement | null;
  author?: string;
  contributors?: string[];
  date?: Date | string;
  updated?: Date | string | null;
  excerpt?: string;
  cover?: string;
  tags?: string[];
  categories?: string[];

  // init
  config: PagicConfig;
  pagePath: string;
  layoutPath: string;
  outputPath: string;
  head: React.ReactElement | null;
  script: React.ReactElement | null;

  // script
  loading?: boolean;

  // other plugins
  sidebar?: PagePropsSidebar;
  prev?: PagePropsSidebar[0];
  next?: PagePropsSidebar[0];
  ga?: React.ReactElement;
  gitalk?: React.ReactElement;
  blog?: PagePropsBlog;
  language?: { code: string; name: string; root: string };

  [key: string]: any;
}
// #region sidebar
export type PagicConfigSidebar = Record<string, OnePagicConfigSidebar>;

export type OnePagicConfigSidebar = (
  | {
      text?: string;
      link?: string;
      children?: OnePagicConfigSidebar;
      expanded?: boolean;
    }
  | string
)[];

export type PagePropsSidebar = {
  text: string;
  link?: string;
  pagePath?: string;
  expanded?: boolean;
  children?: PagePropsSidebar;
}[];
// #endregion
// #region blog
export interface PagePropsBlog {
  isPost: boolean;
  posts: {
    pagePath: string;
    title: string;
    link: string;
    date: Date | string;
    updated: Date | string;
    author?: string;
    contributors: string[];
    categories?: string[];
    tags?: string[];
    excerpt?: string;
    cover?: string;
  }[];
  categories: {
    name: string;
    count: number;
  }[];
  tags: {
    name: string;
    count: number;
  }[];
}
// #endregion
// #region ga
export interface GaProps {
  id: string;
}
// #endregion
// #region gi
export interface GitalkProps {
  clientID: string;
  clientSecret: string;
  repo: string;
  owner: string;
  admin: string[];
  pagerDirection: 'last' | 'first';
  id?: string;
  title?: string;
}
// #endregion
// #endregion
// #region environment
export interface PagicEnvironment {
  PAGIC_LOG_PATH?: string;
  PAGIC_LOG_LEVEL?: LogLevel;
  PAGIC_LOG_FORMAT?: LogFormat;
  PAGIC_CONSOLE_LEVEL?: LogLevel;
  PAGIC_CONSOLE_COLOR?: string;
  PAGIC_CONSOLE_FORMAT?: LogFormat;
  PAGIC_SOURCE_DIR?: string;
  /**
   * leaving this commented out
   * "for security" allowing all envVars at this entry point
   * seems like a long term headache if we have functions
   * that iterate over an implementation of this
   * think similar to SQL injection like thinking
   * and an attack that might be "escape by envVar"
   * this is explicitly pre-emptive
   */
  // [key: string]: string;
}
// #endregion
// #region commands

export interface CliffyCommandOptions {
  [key: string]: string | boolean | number | CliffyCommandOptions | undefined;
}
/** Configuration pertaining to command input
 */
export interface PagicCommand {
  /** Contains environmental variables defined. */
  env: PagicEnvironment;
  /** Contains vars for 'pagic build'. */
  build: PagicBuildCommandConfig;
  /** Contains vars for 'pagic init'. */
  init: PagicInitCommandConfig;
}
export interface PagicInitCommandConfig {
  site?: boolean;
  theme?: boolean;
  plugin?: boolean;
  overwrite?: boolean;
}
export interface PagicBuildCommandConfig {
  watch?: boolean;
  serve?: boolean;
  port?: number;
}
// #endregion
// #region configuration
/** Configuration pertaining to Pagic:
 * Includes logging config, source and out directories,
 * theme name, and include and excluded files.
 */
export interface PagicBaseConfig {
  srcDir: string;
  outDir: string;
  include?: string[] | undefined;
  exclude?: string[] | undefined;
  root: string;
  theme: string;
  plugins: string[];
}
export interface PagicLogConfigMap {
  [key: string]: PagicLogConfig;
}
export interface PagicLogConfig {
  level: LogLevel;
  format: LogFormat;
  path?: string;
  color?: boolean;
}
/** Configuration pertaining to Pagic theme. */
export interface PagicThemeConfig {
  title?: string;
  description?: string;
  head?: React.ReactElement | null;
  github?: string;
  tocAd?: React.ReactElement;
  tools?: {
    editOnGitHub: boolean;
    backToTop: boolean;
  };
  files?: string[];
  branch?: string;
}
/** Configuration pertaining to Pagic plugins. */
export interface PagicPluginsConfig {
  nav?: {
    text: string;
    link: string;
    icon?: string;
    target?: '_blank' | string;
    popover?: React.ReactElement;
    align?: 'left' | 'right';
  }[];
  sidebar?: PagicConfigSidebar;
  md?: {
    anchorLevel?: (1 | 2 | 3 | 4 | 5 | 6)[];
    tocEnabled?: boolean;
    tocLevel?: (1 | 2 | 3 | 4 | 5 | 6)[];
  };
  ga?: GaProps;
  gitalk?: GitalkProps;
  blog?: {
    root: string;
    social?: {
      github: string;
      email: string;
      twitter: string;
      v2ex: string;
      zhihu: string;
    };
  };
  i18n?: {
    languages: { code: string; name: string; root: string }[];
    overrides?: Record<string, any>;
    resources?: Record<string, { translation: Record<string, string> }>;
  };
}
// export interface PagicConfiguration {
//   base: PagicBaseConfig;
//   log: PagicLogConfig;
//   _theme?: PagicThemeConfig;
//   _plugins?: PagicPluginsConfig;
// }

// #endregion
export default class PagicConfiguration {
  public static get cmd(): PagicCommand {
    return {
      env: {
        PAGIC_LOG_PATH: Deno.env.get('PAGIC_LOG_PATH'),
        PAGIC_LOG_LEVEL: Deno.env.get('PAGIC_LOG_LEVEL') as LogLevel,
        PAGIC_LOG_FORMAT: Deno.env.get('PAGIC_LOG_FORMAT') as LogFormat,
        PAGIC_CONSOLE_LEVEL: Deno.env.get('PAGIC_CONSOLE_LEVEL') as LogLevel,
        PAGIC_CONSOLE_COLOR: Deno.env.get('PAGIC_CONSOLE_COLOR'),
        PAGIC_CONSOLE_FORMAT: Deno.env.get('PAGIC_CONSOLE_FORMAT') as LogFormat,
        PAGIC_SOURCE_DIR: Deno.env.get('PAGIC_SOURCE_DIR'),
      },
      build: {
        serve: false,
        port: 8000,
        watch: false,
      },
      init: {
        site: false,
        theme: false,
        plugin: false,
      },
    };
  }
  public get cmd(): PagicCommand {
    return Object.assign(PagicConfiguration.cmd, this._config.cmd);
  }
  public set cmd(cmd: PagicCommand) {
    this._config.cmd = Object.assign(PagicConfiguration.cmd, cmd);
  }
  // @ts-ignore
  public static log: PagicLogConfigMap = {
    ...(PagicConfiguration.cmd.env.PAGIC_LOG_PATH !== undefined
      ? {
          file: {
            level: PagicConfiguration.cmd.env.PAGIC_LOG_LEVEL ?? 'ERROR',
            format: PagicConfiguration.cmd.env.PAGIC_LOG_FORMAT ?? 'json',
            path: PagicConfiguration.cmd.env.PAGIC_LOG_PATH,
          },
        }
      : {}),
    ...{
      console: {
        level: PagicConfiguration.cmd.env.PAGIC_CONSOLE_LEVEL ?? 'ERROR',
        format: PagicConfiguration.cmd.env.PAGIC_CONSOLE_FORMAT ?? 'string',
        color: PagicConfiguration.cmd.env.PAGIC_CONSOLE_COLOR?.toString() === 'false' ? false : true,
      },
    },
  };
  public get log(): PagicLogConfigMap {
    return this._log;
  }
  // public set log(config: PagicLogConfigMap) {
  //   this._log = Object.assign(PagicConfiguration.log, this._log, config);
  // }
  public static get base(): PagicBaseConfig {
    return {
      srcDir: PagicConfiguration.cmd.env.PAGIC_SOURCE_DIR ?? '.',
      outDir: 'dist',
      include: undefined,
      exclude: [
        // Dot files
        '**/.*',
        // Node common files
        '**/package.json',
        '**/package-lock.json',
        '**/node_modules',
        'pagic.config.ts',
        'pagic.config.tsx',
        // https://docs.npmjs.com/using-npm/developers.html#keeping-files-out-of-your-package
        '**/config.gypi',
        '**/CVS',
        '**/npm-debug.log',

        // ${config.outDir} will be added later
      ],
      root: '/',
      theme: 'default',
      plugins: ['clean', 'init', 'md', 'tsx', 'script', 'layout', 'out'],
    };
  }
  public get base(): PagicBaseConfig {
    return Object.assign(PagicConfiguration.base, this._config.base);
  }
  public set base(config: PagicBaseConfig) {
    this._config.base = Object.assign(PagicConfiguration.base, config);
  }
  public static get config(): PagicConfig {
    return {
      ...PagicConfiguration.base,
      cmd: PagicConfiguration.cmd,
      // ...PagicConfiguration.log,
      // ...this._theme,
      // ...this._plugins,
    };
  }
  public get config(): PagicConfig {
    return Object.assign(PagicConfiguration.config, {
      ...this.base,
      cmd: this.cmd,
      ...this._theme,
      ...this._plugins,
    });
  }
  public pagicConfigPath = '';
  public runtimeConfig: Partial<PagicConfig> = {};
  public projectConfig: Partial<PagicConfig> = {};
  public writeFiles: Record<string, string> = {};
  public pagePaths: string[] = [];
  public layoutPaths: string[] = [];
  public staticPaths: string[] = [];
  public pagePropsMap: Record<string, PageProps> = {};
  private _config: Partial<PagicConfig> = {};
  // public set config(config: PagicConfig) {
  //   this.cmd = config.cmd;
  //   this.base = config.base;
  //   this._theme = ;
  //   this._plugins = config._plugins;
  // }
  // private logger: Promise<PagicLogger> = new PagicLogger().init('PagicConfiguration');
  private _log: PagicLogConfigMap = PagicConfiguration.log;
  private _theme: PagicThemeConfig = {};
  private _plugins: PagicPluginsConfig = {};

  public constructor(cmd: CliffyCommandOptions = {}) {
    // this.logger.then((l) => {
    //   l.success('made it');
    //   // this.cmd = cmd?.build;
    //   this.merge(cmd);
    //   l.success('merged');
    //   this.initPaths();
    //   l.success('inited');
    // });
    if (cmd !== {}) {
      this.merge(cmd);
      this.initPaths();
    }
  }
  /* Merges a default config, constructor config, and command line options into a single configuration object */
  // eslint-disable-next-line max-params
  public async merge(
    // config: PagicConfiguration = {
    //   base: this.base,
    //   log: this.log,
    //   _theme: this._theme,
    //   _plugins: this._plugins,
    // },
    // env: Partial<PagicEnvironment> = pagicEnv,
    cmd: CliffyCommandOptions = {},
  ) {
    this.pagicConfigPath = await getPagicConfigPath(
      PagicConfiguration.cmd.env.PAGIC_SOURCE_DIR ?? PagicConfiguration.base.srcDir,
    );
    this.projectConfig = await importDefault(this.pagicConfigPath, {
      reload: true,
    });
    if (typeof this._theme.branch === 'undefined') {
      const branch = await getGitBranch();
      this._theme.branch = branch;
    }
    // console.log(JSON.stringify(cmd));
    this._log = {
      ...{
        ...(cmd.logPath !== undefined
          ? {
              file: {
                level: (cmd.logPath as LogLevel) ?? PagicConfiguration.log.file?.level,
                format: (cmd.logLevel as LogFormat) ?? PagicConfiguration.log.file?.format,
                path: (cmd.logFormat as string) ?? PagicConfiguration.log.file?.path,
              },
            }
          : {}),
        ...{
          console: {
            level: (cmd.consoleLevel as LogLevel) ?? PagicConfiguration.log.console?.level,
            format: (cmd.consoleFormat as LogFormat) ?? PagicConfiguration.log.console?.format,
            color: (cmd.consoleColor as boolean) ?? PagicConfiguration.log.console?.color,
          },
        },
      },
    };
    // console.log(JSON.stringify(this._log));
    // console.log(
    //   JSON.stringify({
    //     ...PagicConfiguration.log,
    //     ...{
    //       ...(cmd.logPath !== undefined
    //         ? {
    //             file: {
    //               level: cmd.logPath,
    //               format: cmd.logLevel,
    //               path: cmd.logFormat,
    //             },
    //           }
    //         : {}),
    //       ...{
    //         console: {
    //           level: cmd.consoleLevel,
    //           format: cmd.consoleFormat,
    //           color: cmd.consoleColor,
    //         },
    //       },
    //     },
    //   }),
    // );
    // this._log = {
    //   ...PagicConfiguration.log,
    //   ...{
    //     ...(cmd.logPath !== undefined
    //       ? {
    //           file: {
    //             level: cmd.logPath,
    //             format: cmd.logLevel,
    //             path: cmd.logFormat,
    //           },
    //         }
    //       : {}),
    //     ...{
    //       console: {
    //         level: cmd.consoleLevel,
    //         format: cmd.consoleFormat,
    //         color: cmd.consoleColor,
    //       },
    //     },
    //   },
    // };
    // console.log(JSON.stringify(PagicConfiguration.log));
    // console.log(JSON.stringify(this._log));
    // this.base = {
    //   srcDir: cmd.srcDir,
    // };
    this._theme = {
      ...this._theme,
      // ...this.projectConfig._theme,
    };
    return this;
  }
  public async runPlugins(pagic: PagicConfig) {
    if (this.pagePaths.length === 0 && this.staticPaths.length === 0) return;

    let sortedPlugins: PagicPlugin[] = [];
    for (let pluginName of PagicConfiguration.base.plugins) {
      if (pluginName.startsWith('-')) {
        continue;
      }
      let plugin = await importPlugin(pluginName);
      sortedPlugins.push(plugin);
    }
    sortedPlugins = sortByInsert(sortedPlugins);
    const removedPlugins = PagicConfiguration.base.plugins.filter((pluginName) => pluginName.startsWith('-'));
    sortedPlugins = sortedPlugins.filter((plugin) => !removedPlugins.includes(`-${plugin.name}`));

    for (let plugin of sortedPlugins) {
      await plugin.fn(pagic);
    }
  }
  private async initPaths() {
    // @ts-ignore
    const { files: themeFiles } = await importTheme(this.config.theme);
    this.pagePaths = await walk(PagicConfiguration.base.srcDir, {
      ...pick(PagicConfiguration.base, ['include', 'exclude']),
      match: [REGEXP_PAGE],
    });
    this.layoutPaths = unique([
      ...(await walk(PagicConfiguration.base.srcDir, {
        ...pick(PagicConfiguration.base, ['include', 'exclude']),
        match: [REGEXP_LAYOUT],
      })), // @ts-ignore
      ...themeFiles.filter((filename) => REGEXP_LAYOUT.test(`/${filename}`)),
    ]).sort();
    this.staticPaths = unique([
      ...(await walk(PagicConfiguration.base.srcDir, {
        ...pick(PagicConfiguration.base, ['include', 'exclude']),
        skip: [REGEXP_PAGE, REGEXP_LAYOUT],
      })), // @ts-ignore
      ...themeFiles.filter((filename) => !REGEXP_PAGE.test(`/${filename}`) && !REGEXP_LAYOUT.test(`/${filename}`)),
    ]).sort();
  }
}
// export class PagicConfigure extends PagicConfig {
//   /** A map stored all pageProps */
//   // private pagePropsMap: Record<string, PageProps> = {};
//   public get(pagePath?: string) {
//     if (typeof pagePath === 'undefined') {
//       return this.config;
//     }
//     return this.pagePropsMap[pagePath].config;
//   }
//   // public async log(name: string) {
//   //   const logger = await new PagicLogger(pagicEnv).init();
//   // }
//   // private async init() {
//   //   await this.logger;
//   // }

//   private async rebuild(pagic: Pagic) {
//     this.pagePropsMap = {};
//     this.writeFiles = {};

//     await this.initConfig();
//     await this.initPaths();
//     await this.runPlugins(pagic);
//   }
//   /** Deep merge defaultConfig, projectConfig and runtimeConfig, then sort plugins */
//   // private async initConfig() {
//   //   // pass runtime srcDir, should be "." but can be overridden with --srcDir/-s
//   //   this.pagicConfigPath = await getPagicConfigPath(this.runtimeConfig.srcDir);
//   //   this.projectConfig = await importDefault(this.pagicConfigPath, {
//   //     reload: true,
//   //   });
//   //   let config = {
//   //     ...defaultConfig,
//   //     ...this._projectConfig,
//   //     ...this._runtimeConfig,
//   //   };
//   //   if (typeof config.branch === 'undefined') {
//   //     const branch = await getGitBranch();
//   //     config.branch = branch;
//   //   }
//   //   config.exclude = unique([
//   //     ...(defaultConfig.exclude ?? []),
//   //     ...(this._projectConfig.exclude ?? []),
//   //     ...(this._runtimeConfig.exclude ?? []),
//   //     config.outDir,
//   //   ]);
//   //   config.plugins = unique([
//   //     ...defaultConfig.plugins,
//   //     ...(this._projectConfig.plugins ?? []),
//   //     ...(this._runtimeConfig.plugins ?? []),
//   //   ]);
//   //   this._config = config;
//   // }
//   // private async initPaths() {
//   //   // @ts-ignore
//   //   const { files: themeFiles } = await importTheme(this.config.theme);
//   //   this._pagePaths = await walk(this._config.srcDir, {
//   //     ...pick(this._config, ['include', 'exclude']),
//   //     match: [REGEXP_PAGE],
//   //   });
//   //   this._layoutPaths = unique([
//   //     ...(await walk(this._config.srcDir, {
//   //       ...pick(this._config, ['include', 'exclude']),
//   //       match: [REGEXP_LAYOUT],
//   //     })), // @ts-ignore
//   //     ...themeFiles.filter((filename) => REGEXP_LAYOUT.test(`/${filename}`)),
//   //   ]).sort();
//   //   this._staticPaths = unique([
//   //     ...(await walk(this._config.srcDir, {
//   //       ...pick(this._config, ['include', 'exclude']),
//   //       skip: [REGEXP_PAGE, REGEXP_LAYOUT],
//   //     })), // @ts-ignore
//   //     ...themeFiles.filter((filename) => !REGEXP_PAGE.test(`/${filename}`) && !REGEXP_LAYOUT.test(`/${filename}`)),
//   //   ]).sort();
//   // }
//   private async runPlugins(pagic: Pagic) {
//     if (this._pagePaths.length === 0 && this._staticPaths.length === 0) return;

//     let sortedPlugins: PagicPlugin[] = [];
//     for (let pluginName of this._config.plugins) {
//       if (pluginName.startsWith('-')) {
//         continue;
//       }
//       let plugin = await importPlugin(pluginName);
//       sortedPlugins.push(plugin);
//     }
//     sortedPlugins = sortByInsert(sortedPlugins);
//     const removedPlugins = this._config.plugins.filter((pluginName) => pluginName.startsWith('-'));
//     sortedPlugins = sortedPlugins.filter((plugin) => !removedPlugins.includes(`-${plugin.name}`));

//     for (let plugin of sortedPlugins) {
//       name.success('Plugin', plugin.name, 'start');
//       await plugin.fn(pagic);
//     }
//   }
// }
// goals
// - pass in env, commands, and file and resolve configuration to provide common config for the application
// - gate configuration between sources
// - - plugins should be restricted
// - - themes should be more restricted than plugins
// - - site should be more restricted than themes
// - - default should be constructor and least permissions

// config = new PagicConfig()
// config.cmd = 'pagic init this that'

// config.log.console.level = 'ERROR'
// config.log.console.level = 20

// config.log.console - should spread to console vars
// config.log.file - should spread to file vars

// config.cmd.env - should spread to PagicEnvironment
// config.cmd.build - should spread to PagicInitCommandConfig
// config.cmd.init - should spread to PagicBuildCommandConfig

// config.base - should spread to
/*
  srcDir: string;
  outDir: string;
  include?: string[];
  exclude?: string[];
  root: string;
  theme: string;
  plugins: string[];
 */

// config.theme - should spread to
/*
  title?: string;
  description?: string;
  head?: React.ReactElement | null;
  github?: string;
  tocAd?: React.ReactElement;
  tools?: {
    editOnGitHub: boolean;
    backToTop: boolean;
  };
  files: PagicThemeConfig,
  branch?: string;
*/
// config.plugins - should spread to
/*
  nav?: {
    text: string;
    link: string;
    icon?: string;
    target?: '_blank' | string;
    popover?: React.ReactElement;
    align?: 'left' | 'right';
  }[];
  sidebar?: PagicConfigSidebar;
  md?: {
    anchorLevel?: (1 | 2 | 3 | 4 | 5 | 6)[];
    tocEnabled?: boolean;
    tocLevel?: (1 | 2 | 3 | 4 | 5 | 6)[];
  };
  ga?: GaProps;
  gitalk?: GitalkProps;
  blog?: {
    root: string;
    social?: {
      github: string;
      email: string;
      twitter: string;
      v2ex: string;
      zhihu: string;
    };
  };
  i18n?: {
    languages: { code: string; name: string; root: string }[];
    overrides?: Record<string, any>;
    resources?: Record<string, { translation: Record<string, string> }>;
  };

*/
