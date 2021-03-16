import { default as PagicWatcher } from './PagicWatcher.ts';
import {
  REGEXP_PAGE,
  REGEXP_LAYOUT,
  REGEXP_PAGIC_THEMES,
  REGEXP_UPDIR,
  REGEXP_HIDDEN_UPDIR,
  logger,
  unique,
  underline,
} from './mod.ts';
import type { PagicConfig } from './PagicConfiguration.ts';
import { fs, path, colors } from '../../deps.ts';
import { v4 } from 'https://deno.land/std@0.88.0/uuid/mod.ts';
export default class PagicWatcherFactory {
  // #region properties
  public watchers: Array<PagicWatcher> = [];
  private config: Partial<PagicConfig> = {};
  private pagicConfigPath = '';
  private timeoutHandler: number | undefined;
  private changedPaths: string[] = [];
  private srcDir = '';
  private theme = '';
  private id = '';
  // #endregion
  public constructor(config: Partial<PagicConfig> = {}, pagicConfigPath: string) {
    this.id = v4.generate().substring(28, 36);
    this.init(config, pagicConfigPath);
  }
  // figures out srcDir, and theme location
  // if theme is not bundled will add a watcher to theme location
  public init(config: Partial<PagicConfig> = {}, pagicConfigPath: string) {
    this.config = config;
    this.pagicConfigPath = pagicConfigPath;
    this.srcDir = this.config.srcDir === undefined ? '.' : this.config.srcDir;
    this.theme = this.config.theme === undefined ? 'default' : this.config.theme;
    logger.info('watcher', `factory:${colors.red(this.id)}`, 'init', underline([this.srcDir, this.pagicConfigPath]));
    // construct watcher and optional theme watcher if theme is not bundled
    this.addWatcher([this.srcDir, this.pagicConfigPath]);
    if (!REGEXP_PAGIC_THEMES.test(this.theme)) {
      const themePath = path.resolve(`${this.srcDir.replace(/\.+$/, this.theme)}`);
      logger.info('watcher', `factory:${colors.red(this.id)}`, 'init', 'theme', underline(themePath + '/.'));
      this.addWatcher(themePath + '/.');
    }
  }
  // add a watcher to the factory with a dir, file, or list of either. (this.watchers.push(dirs))
  // if providing a dir, you must end with '/.' for example './Pagic/.' or 'Pagic/.'
  // will check if watcher exists, but doesn't know if another watcher might share the file/dir
  public addWatcher(dirs: string | string[]) {
    if (this.watchers.filter((watcher) => watcher.watchDirs === (Array.isArray(dirs) ? dirs : [dirs])).length !== 1) {
      logger.info('watcher', `factory:${colors.red(this.id)}`, 'addWatcher', `${underline(dirs)}`);
      this.watchers.push(new PagicWatcher(dirs));
    }
  }
  // remove all watchers in the factory (this.watchers.pop(all))
  public removeWatchers() {
    while (this.watchers.length) {
      this.watchers.pop();
    }
    logger.info('watcher', `factory:${colors.red(this.id)}`, 'removeWatchers', `finalCount:${this.watchers.length}`);
  }
  // call watchers that have been init'ed to watch their dirs
  // pass in a callback to handle FsEvents in Pagic object.  ex: "rebuild"
  public async watch(callback: (status: string) => void) {
    this.pagicCallback = callback;
    this.watchers.forEach(async (watcher: PagicWatcher) => {
      for await (const event of watcher.watcher) {
        // handle the watcher event
        await this.handleEvent(event, watcher);
      }
    });
  }
  // watchers call this when an event occurs from watch
  // pass in an FsEvent and a PagicWatcher to handle and event that the watcher causes
  private async handleEvent(event: Deno.FsEvent, watcher: PagicWatcher) {
    // get original paths length
    const pathLength = this.changedPaths.length;
    // set changedPaths to new paths if they don't exist
    this.parseEventPaths(event.paths.map((eventPath: string) => path.relative(this.srcDir, eventPath))).forEach(
      (path) => {
        if (this.changedPaths.indexOf(path) === -1) this.changedPaths.push(path);
      },
    );
    switch (event.kind) {
      case 'any': // not sure what 'any' case applies to
        logger.error('watcher', `${colors.red(this.id)}${colors.red(watcher.id)}`, event.kind, underline(event.paths));
        break;
      case 'create': // if a watched file is created, rebuild?
        logger.info(watcher.id, event.kind, underline(event.paths));
        break;
      case 'access': // access shouldn't be tracked afaik
        break;
      case 'modify': // if a watched file is modified, reload
        break;
      case 'remove': // if a watched file is removed, reload
        break;
      default:
        logger.error(watcher.id, 'unknown event', event.kind, underline(event.paths));
        break;
    }
    // if length changed, handle change
    if (unique(this.changedPaths).length !== pathLength) this.handleFileChange();
  }
  // use current changedPaths to call the pagicCallback to trigger a rebuild or reload
  private handleFileChange() {
    // this.changedPaths = unique([...this.changedPaths, ...filePaths]);
    clearTimeout(this.timeoutHandler);
    this.timeoutHandler = setTimeout(async () => {
      for await (const changedPath of this.changedPaths) {
        const fullChangedPath = path.resolve(this.srcDir, changedPath);
        if (!fs.existsSync(fullChangedPath)) {
          logger.warn(`${changedPath} removed, start rebuild`);
          this.pagicCallback('rebuild');
          break;
        } else if (fullChangedPath.includes(this.pagicConfigPath)) {
          this.pagicCallback('rebuild');
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
  // pass in list of paths, will output paths that pass include and exclude filters
  private parseEventPaths(eventPaths: string[]): string[] {
    let paths: string[] = [];
    this.config.include?.forEach((glob) => {
      paths = eventPaths.filter(
        (eventPath) => path.globToRegExp(glob).test(eventPath) || path.globToRegExp(`${glob}/**`).test(eventPath),
      );
    });
    this.config.exclude?.forEach((glob) => {
      paths = eventPaths.filter(
        (eventPath) =>
          // if it matches exclude glob
          !path.globToRegExp(glob).test(eventPath) &&
          // if prefixed with ../somedir/ then ignore glob/** test and only check if hidden dir
          ((REGEXP_UPDIR.test(eventPath) && !REGEXP_HIDDEN_UPDIR.test(eventPath)) ||
            (!REGEXP_UPDIR.test(eventPath) && !path.globToRegExp(`${glob}/**`).test(eventPath))),
      );
    });
    return paths;
  }
  // empty function for a callback to the Pagic object for watcher changes (rebuild/plugins)
  private pagicCallback: (status: string, path?: string) => void = () => {};
}
