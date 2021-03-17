import { fs, path, colors } from '../../deps.ts';

export const REGEXP_PAGE = /[\/\\][^_][^\/\\]*\.(md|tsx)$/;
export const REGEXP_LAYOUT = /[\/\\]_[^\/\\]+\.tsx$/;
// list of pagic themes
export const REGEXP_PAGIC_THEMES = /^(docs|default|blog)+$/;
// updir = '../'
export const REGEXP_UPDIR = /^(\.\.\/){1}([a-zA-Z0-9_\\\/-])*(\/){1}/;
// checks if the directory is a hidden updir
// hidden = '/.github/'
// hidden updir = '../.github/'
export const REGEXP_HIDDEN_UPDIR = /^(\.\.\/){1}([a-zA-Z0-9_\\\/-])*(\/\.){1}/;

// #region Common types
export type AnyFunction = (...args: any[]) => any;
export type Tree<T = any> = T & {
  children?: Tree<T>[];
};
// #endregion

// #region Basic utils
/** Remove same items in an array */
export function unique(arr: any[]) {
  return Array.from(new Set(arr));
}
/** Pick the specific items of an object */
export function pick(obj: any, keys: string[]) {
  if (!obj) {
    return obj;
  }
  let result: any = {};
  Object.keys(obj)
    .filter((key) => keys.includes(key))
    .forEach((key) => {
      result[key] = obj[key];
    });
  return result;
}
/** Omit the specific items of an object */
export function omit(obj: any, keys: string[]) {
  if (!obj) {
    return obj;
  }
  let result: any = {};
  Object.keys(obj)
    .filter((key) => !keys.includes(key))
    .forEach((key) => {
      result[key] = obj[key];
    });
  return result;
}
/** Traversal a tree or tree[] */
export function depthFirstTraversal<T>(tree: Tree<T> | Tree<T>[], callback: (item: T) => void) {
  let remain = Array.isArray(tree) ? [...tree] : [tree];
  while (remain.length > 0) {
    const current = remain.shift()!;
    if (current.children) {
      remain = [...current.children, ...remain];
    }
    callback(current);
  }
}
// #endregion

// #region Log utils
// pass string or string[] return a string underlined with optional delimiter
export function underline(strings: string | string[], delimiter = ' | ') {
  if (Array.isArray(strings)) {
    return strings.length > 0
      ? strings.reduce((p, c, i) => {
          return `${i === 1 ? colors.underline(p) : p}${delimiter}${colors.underline(c)}`;
        })
      : colors.underline('');
  } else return colors.underline(strings);
}

enum logLevel {
  'info' = 0,
  'warn' = 1,
  'success' = 2,
  'error' = 3,
}

export const logger = {
  info: (...args: string[]) => {
    console.log('[Pagic]', ...args);
  },
  warn: (first: string, ...args: string[]) => {
    console.log(colors.yellow('[Pagic]'), colors.yellow(first), ...args);
  },
  error: (first: string, ...args: string[]) => {
    console.log(colors.red('[Pagic]'), colors.red(first), ...args);
  },
  success: (first: string, ...args: string[]) => {
    console.log(colors.green('[Pagic]'), colors.green(first), ...args);
  },
};
// #endregion

// #region Pagic specific utils
/**
 * input:  [{name:'a'}, {name:'b'}, {name:'c',insert:'before:b'}]
 * output: [{name:'a'}, {name:'c',insert:'before:b'}, {name:'b'}]
 */
export function sortByInsert<
  T extends {
    name: string;
    insert?: string;
    index?: number;
  }
>(arr: T[]) {
  let restItems: T[] = [];
  arr.forEach((item, index) => {
    item.index = index;
    if (typeof item.insert !== 'undefined') {
      restItems.push(item);
    }
  });
  let baseDelta = 1;
  while (restItems.length > 0) {
    // Each `while` loop, baseDelta becomes half
    baseDelta = baseDelta / 2;
    restItems.forEach((item, index) => {
      // before:layout
      const [insertCond, insertName] = item.insert!.split(':');
      const delta = insertCond === 'before' ? -baseDelta : insertCond === 'after' ? baseDelta : 0;
      const insertItem = arr.find(({ name }) => name === insertName);
      if (typeof insertItem === 'undefined') {
        restItems.splice(index, 1);
      } else if (!restItems.includes(insertItem)) {
        item.index = insertItem.index! + delta;
        restItems.splice(index, 1);
      }
    });
  }
  return arr
    .sort((a, b) => a.index! - b.index!)
    .map((item) => {
      delete item.index;
      return item;
    });
}

export async function getPagicConfigPath(srcDir = '.') {
  let pagicConfigPath = path.resolve(`${srcDir}/pagic.config.tsx`);
  if (!(await fs.exists(pagicConfigPath))) {
    pagicConfigPath = path.resolve(`${srcDir}/pagic.config.ts`);
    if (!(await fs.exists(pagicConfigPath))) {
      throw new Error('pagic.config.ts not exist');
    }
  }
  return pagicConfigPath;
}
// #endregion
