declare const any: any;
export default any;

import {default as PagicLogger} from '../utils/PagicLogger.ts'
import {PagicConfig,
  PagicCommand,
  PagicBaseConfig,
  PagicThemeConfig,
  PagicPluginsConfig,
  PageProps,
  PagicEnvironment,} from '../utils/PagicConfiguration.ts'
export interface Pagic {
  /* merged config object */
  _config: PagicConfig
  cmd: PagicCommand
  base: PagicBaseConfig;
  theme: PagicThemeConfig;
  plugins: PagicPluginsConfig;
  loggers: Record<string,PagicLogger>;
  /** The promise of the default logger */
  _log: Promise<PagicLogger>;
  /** A map stored all pageProps */
  pagePropsMap: Record<string, PageProps>;
  pagicConfigPath: string;
  runtimeEnv: Partial<PagicEnvironment>;
  runtimeConfig: Partial<PagicConfig>;
  projectConfig: Partial<PagicBaseConfig>;

  /** Files that need to be write */
  writeFiles: Record<string, string>;
  /** Pages that need to be build */
  pagePaths: string[];
  layoutPaths: string[];
  staticPaths: string[];
}

// // #region plugins
// export interface PagicPlugin {
//   name: string;
//   insert?: string;
//   fn: (ctx: PagicConfig) => Promise<void>;
// }
// export type PagicLayout<T = Record<string, any>> = React.FC<PageProps & T>;
// export interface PageProps {
//   // md
//   title: string;
//   content: React.ReactElement | null;
//   contentTitle?: React.ReactElement;
//   contentBody?: React.ReactElement;
//   toc?: React.ReactElement | null;
//   author?: string;
//   contributors?: string[];
//   date?: Date | string;
//   updated?: Date | string | null;
//   excerpt?: string;
//   cover?: string;
//   tags?: string[];
//   categories?: string[];

//   // init
//   config: PagicConfig;
//   pagePath: string;
//   layoutPath: string;
//   outputPath: string;
//   head: React.ReactElement | null;
//   script: React.ReactElement | null;

//   // script
//   loading?: boolean;

//   // other plugins
//   sidebar?: PagePropsSidebar;
//   prev?: PagePropsSidebar[0];
//   next?: PagePropsSidebar[0];
//   ga?: React.ReactElement;
//   gitalk?: React.ReactElement;
//   blog?: PagePropsBlog;
//   language?: { code: string; name: string; root: string };

//   [key: string]: any;
// }

// // #region blog
// export interface PagePropsBlog {
//   isPost: boolean;
//   posts: {
//     pagePath: string;
//     title: string;
//     link: string;
//     date: Date | string;
//     updated: Date | string;
//     author?: string;
//     contributors: string[];
//     categories?: string[];
//     tags?: string[];
//     excerpt?: string;
//     cover?: string;
//   }[];
//   categories: {
//     name: string;
//     count: number;
//   }[];
//   tags: {
//     name: string;
//     count: number;
//   }[];
// }
// // #endregion
// // #region ga
// export interface GaProps {
//   id: string;
// }
// // #endregion
// // #region gi
// export interface GitalkProps {
//   clientID: string;
//   clientSecret: string;
//   repo: string;
//   owner: string;
//   admin: string[];
//   pagerDirection: 'last' | 'first';
//   id?: string;
//   title?: string;
// }
// // #endregion
// // #endregion

// #region watcher


// #endregion
// export const defaultConfig: PagicConfig = {
//   srcDir: '.',
//   outDir: 'dist',
//   include: undefined,
//   exclude: [
//     // Dot files
//     '**/.*',
//     // Node common files
//     '**/package.json',
//     '**/package-lock.json',
//     '**/node_modules',
//     'pagic.config.ts',
//     'pagic.config.tsx',
//     // https://docs.npmjs.com/using-npm/developers.html#keeping-files-out-of-your-package
//     '**/config.gypi',
//     '**/CVS',
//     '**/npm-debug.log',

//     // ${config.outDir} will be added later
//   ],
//   root: '/',
//   theme: 'default',
//   plugins: ['clean', 'init', 'md', 'tsx', 'script', 'layout', 'out'],
//   cmd: {
//     env: pagicEnv,
//     pagic: {
//       logLevel: 'ERROR',
//       logFormat: 'console',
//       consoleLevel: 'ERROR',
//       consoleColor: true,
//       consoleFormat: 'json',
//     },
//     init: {
//       site: false,
//       theme: false,
//       plugin: false,
//     },
//     build: {
//       serve: false,
//       port: 8000,
//       watch: false,
//     },
//   },
// };
