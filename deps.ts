// export { default as Pagic } from './src/Pagic.ts';
export { LoggerConfig, Logger, setup as setupLogger, getLogger, handlers as loggerHandlers } from 'log/mod.ts';
export type { BaseHandler, FileHandler } from 'log/handlers.ts';
export { getLevelByName } from 'log/levels.ts';
export { LogRecord } from 'log/logger.ts';

export { v4 } from 'uuid/mod.ts';

export * as fs from 'fs/mod.ts';
export * as path from 'path/mod.ts';
export * as colors from 'fmt/colors.ts';
export * as server from 'http/server.ts';
export * as asserts from 'testing/asserts.ts';

// export { fs, path, colors, server, asserts };

export type { ITypeInfo } from 'cliffy/flags';
export { Confirm } from 'cliffy/prompt/confirm.ts';
export { Select } from 'cliffy/prompt/select.ts';
export { Command } from 'cliffy/command';

// @deno-types="https://cdn.pagic.org/@types/react@16.9.50/index.d.ts"
import * as React from 'react';
// @deno-types="https://cdn.pagic.org/@types/react-dom@16.9.8/index.d.ts"
import * as ReactDOM from 'reactDOM';
// @deno-types="https://cdn.pagic.org/@types/react-dom@16.9.8/server/index.d.ts"
import * as ReactDOMServer from 'reactDOMServer';

(window as any).React = React;
(window as any).ReactDOM = ReactDOM;

export { React, ReactDOM, ReactDOMServer };

// @deno-types="./src/types/any.d.ts"
import frontMatter from 'frontMatter';
// @deno-types="./src/types/any.d.ts"
import htmlToTextMod from 'htmlToTextMod';
const { htmlToText } = htmlToTextMod;
// @deno-types="./src/types/any.d.ts"
import MarkdownIt from 'markdownIt';
// @deno-types="./src/types/any.d.ts"
import reactElementToJSXStringMod from 'reactElementToJSXString';
const reactElementToJSXString = reactElementToJSXStringMod.default;
// @deno-types="./src/types/any.d.ts"
import reactHtmlParserMod from 'reactHtmlParserMod';
const reactHtmlParser = reactHtmlParserMod.default;
// @deno-types="./src/types/any.d.ts"
import * as typescriptMod from 'typescriptMod';
const typescript = typescriptMod.default;

export { frontMatter, htmlToText, MarkdownIt, reactElementToJSXString, reactHtmlParser, typescript };
