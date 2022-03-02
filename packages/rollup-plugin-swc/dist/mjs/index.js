import { createFilter } from "@rollup/pluginutils";
import { transform } from "@swc/core";
import { createCsm2MjsPlugin } from "csm2mjs";
import { excludeHelpers, mergeDeep } from "./utils";
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
    return mergeDeep(defaults, options);
}
function transformWithSwc(code, filename, options, transformCommonJS = false) {
    var _a, _b, _c, _d;
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
        ? createCsm2MjsPlugin({
            replace: (_d = (_c = (_b = (_a = options.jsc) === null || _a === void 0 ? void 0 : _a.transform) === null || _b === void 0 ? void 0 : _b.optimizer) === null || _c === void 0 ? void 0 : _c.globals) === null || _d === void 0 ? void 0 : _d.vars,
        })
        : undefined;
    return transform(code, options);
}
function swcPlugin(config = {}) {
    const { extensions = knownExtensions, exclude, inlcude, minify = false, replace = {}, jscConfig = {}, } = config;
    const rollupFilter = createFilter(inlcude, excludeHelpers(exclude));
    const extensionRegExp = new RegExp("\\.(" + extensions.join("|") + ")$");
    const filter = (id) => extensionRegExp.test(id) && rollupFilter(id);
    const swcOptions = createSwcOptions({
        minify,
        jsc: mergeDeep({}, jscConfig, {
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
export { swcPlugin };
