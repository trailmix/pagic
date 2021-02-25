import { PagicWatcher, logger, unique, underline } from './mod.ts';
import type { PagicConfig } from '../Pagic.ts';
import { REGEXP_PAGE, REGEXP_LAYOUT } from '../../mod.ts';
import { fs, path, colors } from '../../deps.ts';

export default class PagicWatcherFactory {
  // #region properties
  public watchers: Array<PagicWatcher> = [];
  private config: Partial<PagicConfig> = {};
  private pagicConfigPath = '';
  private timeoutHandler: number | undefined = undefined;
  private changedPaths: string[] = [];
  private srcDir = '';
  private theme = '';
  // #endregion
  public constructor(config: Partial<PagicConfig> = {}, pagicConfigPath: string) {
    this.init(config, pagicConfigPath);
  }
  public init(config: Partial<PagicConfig> = {}, pagicConfigPath: string) {
    this.config = config;
    this.pagicConfigPath = pagicConfigPath;
    this.srcDir = this.config.srcDir === undefined ? '.' : this.config.srcDir;
    this.theme = this.config.theme === undefined ? 'default' : this.config.theme;
    logger.info('watcher', 'factory', 'init', underline([this.srcDir, this.pagicConfigPath]));
    // construct watcher for config file and srcDir
    this.addWatcher([this.srcDir, this.pagicConfigPath]);
    // construct watcher for config if local
    if (!/^(docs|default|blog)+$/.test(this.theme)) {
      const themePath = path.resolve(`${this.srcDir.replace(/\.+$/, this.theme)}`);
      logger.info('watcher', 'factory', 'init', 'theme', underline(themePath + '/.'));
      this.addWatcher(themePath + '/.');
    }
  }

  public addWatcher(dirs: string | string[]) {
    this.watchers.push(new PagicWatcher(dirs));
  }
  public removeWatchers() {
    while (this.watchers.length) {
      this.watchers.pop();
    }
  }
  public async watch(callback: (status: string) => void) {
    this.pagicCallback = callback;
    this.watchers.forEach(async (watcher: PagicWatcher) => {
      for await (const event of watcher.watcher) {
        // pagic.config.ts modified, rebuild
        if (event.kind === 'modify' && event.paths.includes(this.pagicConfigPath)) {
          clearTimeout(this.timeoutHandler);
          this.timeoutHandler = setTimeout(async () => {
            callback('rebuild');
          }, 100);
          continue;
        }
        // @ts-ignore
        let eventPaths: string[] = event.paths.map((eventPath: string) => path.relative(this.config.srcDir, eventPath));
        this.config.include?.forEach((glob) => {
          eventPaths = eventPaths.filter(
            (eventPath) => path.globToRegExp(glob).test(eventPath) || path.globToRegExp(`${glob}/**`).test(eventPath),
          );
        });
        this.config.exclude?.forEach((glob) => {
          eventPaths = eventPaths.filter(
            (eventPath) =>
              !/^([a-zA-Z0-9_\\\/\-]*\.\.\/){1}([a-zA-Z0-9_\\\/-])*(\/\.){1}/.test(eventPath) ||
              (!path.globToRegExp(glob).test(eventPath) && !path.globToRegExp(`${glob}/**`).test(eventPath)),
          );
        });
        this.handleFileChange(eventPaths);
      }
    });
  }
  private pagicCallback: (status: string, path?: string) => void = () => {};
  private async handleFileChange(filePaths: string[]) {
    if (filePaths.length === 0) {
      return;
    }
    this.changedPaths = unique([...this.changedPaths, ...filePaths]);
    clearTimeout(this.timeoutHandler);
    this.timeoutHandler = setTimeout(async () => {
      for await (const changedPath of this.changedPaths) {
        // @ts-ignore
        const fullChangedPath = path.resolve(this.config.srcDir, changedPath);
        if (!fs.existsSync(fullChangedPath)) {
          logger.warn(`${changedPath} removed, start rebuild`);
          this.pagicCallback('rebuild');
          break;
        } else if (Deno.statSync(fullChangedPath).isDirectory) {
          logger.warn(`Directory ${colors.underline(changedPath)} changed, start rebuild`);
          this.pagicCallback('rebuild');
          break;
        } else if (REGEXP_LAYOUT.test(fullChangedPath)) {
          this.pagicCallback('layoutPaths', changedPath);
          break;
        } else if (REGEXP_PAGE.test(fullChangedPath)) {
          this.pagicCallback('pagePaths', changedPath);
        } else {
          this.pagicCallback('staticPaths', changedPath);
        }
      }
    }, 100);
  }
}
