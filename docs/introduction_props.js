import projectConfig from '/pagic.config.js';
var _a, _b;
export default {
    'prev': null,
    'next': {
        "title": "Usage",
        "link": "docs/usage.html"
    },
    'sidebar': [
        {
            "title": "Introduction",
            "link": "docs/introduction.html",
            "pagePath": "docs/introduction.md"
        },
        {
            "title": "Usage",
            "link": "docs/usage.html",
            "pagePath": "docs/usage.md"
        },
        {
            "title": "Config",
            "link": "docs/config.html",
            "pagePath": "docs/config.md"
        },
        {
            "title": "Content",
            "link": "docs/content.html",
            "pagePath": "docs/content.md"
        },
        {
            "title": "_layout.tsx",
            "link": "docs/layout.html",
            "pagePath": "docs/layout.md"
        },
        {
            "title": "Themes",
            "link": "docs/themes.html",
            "pagePath": "docs/themes.md"
        },
        {
            "title": "Plugins",
            "link": "docs/plugins.html",
            "pagePath": "docs/plugins.md"
        },
        {
            "title": "Deployment",
            "link": "docs/deployment.html",
            "pagePath": "docs/deployment.md"
        },
        {
            "title": "Demos",
            "link": "docs/demos.html",
            "pagePath": "docs/demos.md"
        },
        {
            "title": "Limitations",
            "link": "docs/limitations.html",
            "pagePath": "docs/limitations.md"
        }
    ],
    config: { "root": "/", ...projectConfig, ...(_b = (_a = projectConfig.i18n) === null || _a === void 0 ? void 0 : _a.overrides) === null || _b === void 0 ? void 0 : _b['en'] },
    'pagePath': "docs/introduction.md",
    'layoutPath': "_layout.tsx",
    'outputPath': "docs/introduction.html",
    'title': "Introduction",
    'content': React.createElement("article", { dangerouslySetInnerHTML: {
            __html: '<h1>Introduction</h1>\n<p>Pagic is a static site generator powered by Deno + React.</p>\n<p>It is easy to configure, supports rendering <code>md/tsx</code> to static HTML page, and has a large number of official or third-party themes and plugins.</p>\n<h2 id="features">Features<a class="anchor" href="#features">§</a></h2>\n<h3 id="easy-to-configure">Easy to configure<a class="anchor" href="#easy-to-configure">§</a></h3>\n<p>Pagic follows the principle of <a href="https://en.wikipedia.org/wiki/Convention_over_configuration">Convention over configuration</a>, to reduce config options as much as possible, through some intuitive design, reduce the user\'s understanding cost, without losing flexibility.</p>\n<h3 id="support-md-and-tsx">Support md and tsx<a class="anchor" href="#support-md-and-tsx">§</a></h3>\n<p>Pagic not only supports rendering <code>md/tsx</code> to static HTML page, but also runs React Hooks in <code>tsx</code>. With the programmability of React components, it greatly expands the capabilities of static websites.</p>\n<p>It is worth noting that each page generated by Pagic has its own pre-rendered static HTML, providing great loading performance and is SEO-friendly. Yet, once the page is loaded, React takes over the static content and turns it into a full Single-Page Application (SPA). Extra pages are fetched on demand as the user navigates around the site.</p>\n<h3 id="themes-and-plugins">Themes and plugins<a class="anchor" href="#themes-and-plugins">§</a></h3>\n<p>Pagic has official themes default/docs/blog. We can use the official theme to easily generate a website, also we can easily create a personalized theme, and even extend a theme-these capabilities are all thanks to Pagic’s intuitive <code>_layout.tsx</code> design.</p>\n<p>The plugin is one of Pagic\'s core features. Pagic splits the entire build process into built-in plugins, allowing other plugins to be inserted at any position in the build process, and even completely change Pagic\'s build process by replacing the built-in plugins, which provides Pagic with unparalleled flexibility.</p>\n<p>Pagic refers to the design of Deno and requires users to import third-party themes or plugins through a complete URL.</p>\n<h2 id="compare-to-others">Compare to others<a class="anchor" href="#compare-to-others">§</a></h2>\n<p>As a &quot;static site generator fanatic&quot;, I have used most of the popular static site generators. They are all excellent, but Pagic tried some new design concepts. Here are some key differences:</p>\n<table>\n<thead>\n<tr>\n<th></th>\n<th>Pagic</th>\n<th>VuePress</th>\n<th>Hexo</th>\n<th>Jekyll</th>\n<th>Hugo</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>Support md</td>\n<td>✓</td>\n<td>✓</td>\n<td>✓</td>\n<td>✓</td>\n<td>✓</td>\n</tr>\n<tr>\n<td>React/Vue</td>\n<td>✓</td>\n<td>✓</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>SPA</td>\n<td>✓</td>\n<td>✓</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>...</td>\n<td></td>\n<td></td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n</tbody>\n</table>\n<p>Pagic stands on the shoulders of giants and refers to the config options and documents of some other static site generators. Hereby, I would like to express my sincere thanks to these open source projects and communities.</p>'
        } }),
    'contentTitle': React.createElement("h1", { key: "0" }, "Introduction"),
    'contentBody': React.createElement("article", { dangerouslySetInnerHTML: {
            __html: '<p>Pagic is a static site generator powered by Deno + React.</p>\n<p>It is easy to configure, supports rendering <code>md/tsx</code> to static HTML page, and has a large number of official or third-party themes and plugins.</p>\n<h2 id="features">Features<a class="anchor" href="#features">§</a></h2>\n<h3 id="easy-to-configure">Easy to configure<a class="anchor" href="#easy-to-configure">§</a></h3>\n<p>Pagic follows the principle of <a href="https://en.wikipedia.org/wiki/Convention_over_configuration">Convention over configuration</a>, to reduce config options as much as possible, through some intuitive design, reduce the user\'s understanding cost, without losing flexibility.</p>\n<h3 id="support-md-and-tsx">Support md and tsx<a class="anchor" href="#support-md-and-tsx">§</a></h3>\n<p>Pagic not only supports rendering <code>md/tsx</code> to static HTML page, but also runs React Hooks in <code>tsx</code>. With the programmability of React components, it greatly expands the capabilities of static websites.</p>\n<p>It is worth noting that each page generated by Pagic has its own pre-rendered static HTML, providing great loading performance and is SEO-friendly. Yet, once the page is loaded, React takes over the static content and turns it into a full Single-Page Application (SPA). Extra pages are fetched on demand as the user navigates around the site.</p>\n<h3 id="themes-and-plugins">Themes and plugins<a class="anchor" href="#themes-and-plugins">§</a></h3>\n<p>Pagic has official themes default/docs/blog. We can use the official theme to easily generate a website, also we can easily create a personalized theme, and even extend a theme-these capabilities are all thanks to Pagic’s intuitive <code>_layout.tsx</code> design.</p>\n<p>The plugin is one of Pagic\'s core features. Pagic splits the entire build process into built-in plugins, allowing other plugins to be inserted at any position in the build process, and even completely change Pagic\'s build process by replacing the built-in plugins, which provides Pagic with unparalleled flexibility.</p>\n<p>Pagic refers to the design of Deno and requires users to import third-party themes or plugins through a complete URL.</p>\n<h2 id="compare-to-others">Compare to others<a class="anchor" href="#compare-to-others">§</a></h2>\n<p>As a &quot;static site generator fanatic&quot;, I have used most of the popular static site generators. They are all excellent, but Pagic tried some new design concepts. Here are some key differences:</p>\n<table>\n<thead>\n<tr>\n<th></th>\n<th>Pagic</th>\n<th>VuePress</th>\n<th>Hexo</th>\n<th>Jekyll</th>\n<th>Hugo</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>Support md</td>\n<td>✓</td>\n<td>✓</td>\n<td>✓</td>\n<td>✓</td>\n<td>✓</td>\n</tr>\n<tr>\n<td>React/Vue</td>\n<td>✓</td>\n<td>✓</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>SPA</td>\n<td>✓</td>\n<td>✓</td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n<tr>\n<td>...</td>\n<td></td>\n<td></td>\n<td></td>\n<td></td>\n<td></td>\n</tr>\n</tbody>\n</table>\n<p>Pagic stands on the shoulders of giants and refers to the config options and documents of some other static site generators. Hereby, I would like to express my sincere thanks to these open source projects and communities.</p>'
        } }),
    'head': React.createElement(React.Fragment, null,
        React.createElement("script", { src: "/i18n.js", type: "module" })),
    'script': React.createElement(React.Fragment, null,
        React.createElement("script", { src: "https://cdn.pagic.org/react@16.13.1/umd/react.production.min.js" }),
        React.createElement("script", { src: "https://cdn.pagic.org/react-dom@16.13.1/umd/react-dom.production.min.js" }),
        React.createElement("script", { src: "/index.js", type: "module" })),
    'toc': React.createElement("aside", { dangerouslySetInnerHTML: {
            __html: '<nav class="toc"><ol><li><a href="#features">Features</a><ol><li><a href="#easy-to-configure">Easy to configure</a></li><li><a href="#support-md-and-tsx">Support md and tsx</a></li><li><a href="#themes-and-plugins">Themes and plugins</a></li></ol></li><li><a href="#compare-to-others">Compare to others</a></li></ol></nav>'
        } }),
    'language': {
        "code": "en",
        "name": "English",
        "path": ""
    },
    'date': "2020-10-12T13:36:11.000Z",
    'updated': null,
    'author': "xcatliu",
    'contributors': [
        "xcatliu"
    ],
    'blog': {
        "isPost": false,
        "isPosts": false,
        "posts": [
            {
                "pagePath": "blog/design_pagic_config_ts.md",
                "title": "Design pagic.config.ts",
                "link": "blog/design_pagic_config_ts.html",
                "date": "2020-07-12T00:00:00.000Z",
                "updated": null
            }
        ]
    }
};
