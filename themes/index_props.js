import projectConfig from '/pagic.config.js';
var _a, _b;
export default {
    config: { "root": "/", ...projectConfig, ...(_b = (_a = projectConfig.i18n) === null || _a === void 0 ? void 0 : _a.overrides) === null || _b === void 0 ? void 0 : _b['en'] },
    'pagePath': "themes/README.md",
    'layoutPath': "_layout.tsx",
    'outputPath': "themes/index.html",
    'title': "Themes",
    'content': React.createElement("article", { dangerouslySetInnerHTML: {
            __html: '<h1>Themes</h1>'
        } }),
    'contentTitle': React.createElement("h1", { key: "0" }, "Themes"),
    'contentBody': React.createElement("article", { dangerouslySetInnerHTML: {
            __html: ''
        } }),
    'head': React.createElement(React.Fragment, null,
        React.createElement("script", { src: "/i18n.js", type: "module" })),
    'script': React.createElement(React.Fragment, null,
        React.createElement("script", { src: "https://cdn.pagic.org/react@16.13.1/umd/react.production.min.js" }),
        React.createElement("script", { src: "https://cdn.pagic.org/react-dom@16.13.1/umd/react-dom.production.min.js" }),
        React.createElement("script", { src: "/index.js", type: "module" })),
    'toc': null,
    'language': {
        "code": "en",
        "name": "English",
        "path": ""
    },
    'contentHasKatex': false,
    'date': "2020-10-15T13:55:58.000Z",
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