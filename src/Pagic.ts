// import type { logLevel } from '../mod.ts';
// import type { React } from '../deps.ts';
import { colors, fs, Confirm } from 'Pagic/deps.ts';
import { serve, PagicWatcherFactory, PagicConfiguration } from 'PagicUtils/mod.ts';
import type { PagicLogger, PagicConfig, CliffyCommandOptions } from 'PagicUtils/mod.ts';
// export { PagicConfig } from './utils/PagicConfigure.ts';
// import { default as PagicWatcherFactory } from './utils/PagicWatcherFactory.ts';
// import type { PagicConfig } from './utils/PagicConfiguration.ts';
// import { default as PagicConfiguration } from './utils/PagicConfiguration.ts';
// export type {
//   GaProps,
//   GitalkProps,
//   PagePropsSidebar,
//   PagicConfigSidebar,
//   OnePagicConfigSidebar,
//   PagePropsBlog,
//   PagicLayout,
//   PageProps,
//   PagicConfigInterface,
//   PagicEnvironment,
//   PagicInitCommandConfig,
//   PagicBuildCommandConfig,
//   CliffyCommandOptions,
// } from './mod.ts';
// import type { CliffyCommandOptions } from '../mod.ts';
// export type { Pagic } from './mod.ts';
export default class Pagic extends PagicConfiguration {
  // #region properties
  public rebuilding = true;
  // @ts-ignore
  public config: PagicConfig = {};
  // @ts-ignore
  public logger: PagicLogger = {};
  // @ts-ignore
  private watchers: PagicWatcherFactory = {};
  // private _config: PagicConfigure = {};
  // #endregion

  public constructor(config: Partial<PagicConfig> = {}, cmd: CliffyCommandOptions = {}) {
    // pagic configure should be init'ed here and default name created
    // configure process will utilize default name until it parses config
    // then it will hand the name over to pagic here
    // this.name = await config.logger;
    // pull in PagicConfigure
    super(cmd);
    // this.console.log(config);
    // this._config = config;
    // this.config = config._config;
    // console.log(env);
    // this.runtimeConfig = options;
    // const logger = await new PagicLogger(defaultEnv).init();
    // this.name = new PagicLogger({
    //   logPath: defaultConfig.env?.PAGIC_LOG_PATH ?? defaultConfig.cmd?.pagic.logPath,
    //   logLevel: defaultConfig.env?.PAGIC_LOG_LEVEL ?? defaultConfig.cmd?.pagic.logLevel,
    //   logFormat: defaultConfig.env?.PAGIC_LOG_FORMAT ?? defaultConfig.cmd?.pagic.logFormat,
    //   consoleLevel: defaultConfig.env?.PAGIC_CONSOLE_LEVEL ?? defaultConfig.cmd?.pagic.consoleLevel,
    //   consoleColor: defaultConfig.env?.PAGIC_CONSOLE_COLOR ?? defaultConfig.cmd?.pagic.consoleColor,
    //   consoleFormat: defaultConfig.env?.PAGIC_CONSOLE_FORMAT ?? defaultConfig.cmd?.pagic.consoleFormat,
    // });
    // this.name.init();
  }
  public async start() {
    this.logger = await this.config.l;
    this.logger.success('hello from PAGIC');
  }
  public async build() {
    await this.config.rebuild();
    if (this.config.serve) {
      this.serve();
    }
    if (this.config.watch) {
      await this.watch();
    }
  }
  public async init() {
    // console.log(this.runtimeConfig);
    if (this.config.runtimeConfig.init?.site) {
      if (await fs.exists('pagic.config.ts')) {
        this.logger.warn('pagic.config.ts already exists, exit');
        return;
      }
      if (await fs.exists('pagic.config.tsx')) {
        this.logger.warn('pagic.config.tsx already exists, exit');
        return;
      }
      await Deno.writeTextFile('pagic.config.ts', 'export default {};\n');
    } else if (this.config.runtimeConfig.init?.theme) {
      if (
        (await fs.exists('mod.ts')) &&
        (this.runtimeConfig.init?.overwrite === undefined ? true : !this.runtimeConfig.init?.overwrite)
      ) {
        const confirmed = await Confirm.prompt({
          message: 'mod.ts already exists, do you want to override it?',
          ...(this.config.runtimeConfig.init?.overwrite === undefined
            ? {
                hint: 'You can use --overwrite to make this COMPLETELY autopagic.',
              }
            : { hint: 'You can use pagic init [theme|init|plugin] for autopagic completion.' }),
        });
        if (!confirmed) {
          return;
        }
      }
      this.generateThemeMod();
    } else if (this.config.runtimeConfig.init?.plugin) {
      this.logger.error(`Plugin generation not implemented.`);
    }
  }

  private async generateThemeMod() {
    // this.config = {
    //   ...defaultConfig,
    //   exclude: [...defaultConfig.exclude!, 'mod.ts'],
    // };

    await this.config.initPaths();
    await Deno.writeTextFile(
      './mod.ts',
      `export default {\n  files: [\n${[...this.config.staticPaths, ...this.config.layoutPaths]
        .map((filePath) => `    '${filePath}'`)
        .join(',\n')}\n  ]\n};\n`,
    );
  }

  private async watch() {
    // watch  pagic.config.ts/x, root project, and potential theme
    this.watchers = new PagicWatcherFactory(this.config, this.config.pagicConfigPath);
    await this.watchers.watch(async (status: string, path = '') => {
      this.logger.success(
        'watcher',
        status === 'rebuild' ? 'Rebuilding...' : 'Reloading plugins change to: ',
        colors.underline(path),
      );
      if (status === 'rebuild') {
        await this.watchers.removeWatchers(); // this could go to rebuild function
        this.rebuilding = true;
        await this.config.rebuild();
        this.rebuilding = false;
        await this.watchers.init(this.config, this.config.pagicConfigPath); // this could go to rebuild function
      } else {
        // @ts-ignore if path not in array, push and reload
        // if (this[status].indexOf(path) === -1) this[status].push(path);
        await this.runPlugins().then(() => {
          this.logger.success('watcher', 'Reloaded Plugins');
        });
      }
    });
  }
  private async serve() {
    serve({
      serveDir: this.config.outDir,
      root: this.config.root,
      port: this.config.port,
    });
    this.logger.success(
      'Serve',
      colors.underline(this.config.outDir),
      `on http://127.0.0.1:${this.config.port}${this.config.root}`,
    );
  }
}
