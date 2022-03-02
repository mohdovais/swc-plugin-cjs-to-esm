"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swcPlugin = void 0;
const pluginutils_1 = require("@rollup/pluginutils");
const core_1 = require("@swc/core");
const csm2mjs_1 = require("csm2mjs");
const utils_1 = require("./utils");
const knownExtensions = ["js", "jsx", "ts", "tsx", "mjs", "cjs"];
const tsRe = /\.tsx?$/;
const jsxRe = /\.[jt]sx$/;
function createSwcOptions(options = {}) {
    const minify = options.minify === true;
    const defaults = {
        sourceMaps: true,
        jsc: {
            externalHelpers: true,
            target: "es2022",
            loose: false,
            transform: {
                react: {
                    runtime: "automatic",
                },
                optimizer: {
                    //@ts-ignore
                    simplify: false,
                    globals: {
                        vars: {
                            "process.env.NODE_ENV": JSON.stringify(minify ? "production" : "development"),
                        },
                    },
                },
            },
            minify: minify
                ? {
                    compress: true,
                    mangle: true,
                }
                : {},
        },
    };
    return (0, utils_1.mergeDeep)(defaults, options);
}
function transformWithSwc(code, filename, options, transformCommonJS = false) {
    const isTypeScript = tsRe.test(filename);
    const isJSX = jsxRe.test(filename);
    const parser = isTypeScript
        ? { syntax: "typescript", tsx: isJSX }
        : { syntax: "ecmascript", jsx: isJSX };
    if (options.jsc != null) {
        options.jsc.parser = parser;
    }
    options.filename = filename;
    options.plugin = transformCommonJS
        ? (0, csm2mjs_1.createCsm2MjsPlugin)({
            replace: options.jsc?.transform?.optimizer?.globals?.vars,
        })
        : undefined;
    return (0, core_1.transform)(code, options);
}
function swcPlugin(config = {}) {
    const { extensions = knownExtensions, exclude, inlcude, minify = false, replace = {}, jscConfig = {}, } = config;
    const rollupFilter = (0, pluginutils_1.createFilter)(inlcude, (0, utils_1.excludeHelpers)(exclude));
    const extensionRegExp = new RegExp("\\.(" + extensions.join("|") + ")$");
    const filter = (id) => extensionRegExp.test(id) && rollupFilter(id);
    const swcOptions = createSwcOptions({
        minify,
        jsc: (0, utils_1.mergeDeep)({}, jscConfig, {
            transform: {
                optimizer: {
                    globals: {
                        vars: replace,
                    },
                },
            },
        }),
    });
    return {
        name: "swc",
        async transform(source, id) {
            if (!filter(id)) {
                return null;
            }
            const options = JSON.parse(JSON.stringify(swcOptions));
            options.minify = false;
            if (options.jsc != null) {
                options.jsc.minify = { compress: false, mangle: false };
                options.jsc.externalHelpers = true;
            }
            const result = await transformWithSwc(source, id, options, true);
            return result;
        },
        async renderChunk(source, chunk, outputOptions) {
            if (minify) {
                const { fileName } = chunk;
                const options = JSON.parse(JSON.stringify(swcOptions));
                options.minify = true;
                if (options.jsc != null) {
                    options.jsc.externalHelpers = false;
                    options.jsc.target = "es2022";
                    options.jsc.transform = {};
                }
                return await transformWithSwc(source, fileName, options);
            }
            return null;
        },
    };
}
exports.swcPlugin = swcPlugin;
