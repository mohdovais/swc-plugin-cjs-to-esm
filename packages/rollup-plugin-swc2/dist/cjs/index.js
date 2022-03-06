"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swcPlugin = void 0;
const pluginutils_1 = require("@rollup/pluginutils");
const core_1 = require("@swc/core");
const swc_plugin_cjs2esm_1 = require("swc-plugin-cjs2esm");
const utils_1 = require("./utils");
const defaultExtensions = ["js", "jsx", "ts", "tsx", "mjs", "cjs"];
const tsRegExr = /\.tsx?$/;
const jsxRegExr = /\.[jt]sx$/;
function transformWithSwc(code, filename, options, transformCommonJS = false) {
    const isTypeScript = tsRegExr.test(filename);
    const isJSX = jsxRegExr.test(filename);
    const parser = isTypeScript
        ? { syntax: "typescript", tsx: isJSX }
        : { syntax: "ecmascript", jsx: isJSX };
    if (options.jsc != null) {
        options.jsc.parser = parser;
    }
    options.filename = filename;
    options.plugin = transformCommonJS
        ? (0, swc_plugin_cjs2esm_1.createCsm2MjsPlugin)({
            replace: options.jsc?.transform?.optimizer?.globals?.vars,
        })
        : undefined;
    return (0, core_1.transform)(code, options);
}
function swcPlugin(config = {}) {
    const { extensions = defaultExtensions, exclude, inlcude, minify = false, replace = {}, jscConfig = {}, } = config;
    const rollupFilter = (0, pluginutils_1.createFilter)(inlcude, (0, utils_1.excludeHelpers)(exclude));
    const extensionRegExp = new RegExp("\\.(" + extensions.join("|") + ")$");
    const filter = (id) => extensionRegExp.test(id) && rollupFilter(id);
    const swcOptions = (0, utils_1.createSwcOptions)({
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
