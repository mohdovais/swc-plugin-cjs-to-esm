import { createFilter } from "@rollup/pluginutils";
import { transform } from "@swc/core";
import { csm2mjs } from "csm2mjs";
import { excludeHelpers, mergeDeep } from "./utils";
const knownExtensions = ["js", "jsx", "ts", "tsx", "mjs", "cjs"];
const tsRe = /\.tsx?$/;
const jsxRe = /\.[jt]sx$/;
function createSwcOptions(options = {}) {
    const minify = options.minify === true;
    const defaults = {
        jsc: {
            externalHelpers: true,
            target: "es2018",
            transform: {
                react: {
                    runtime: "automatic",
                },
                optimizer: {
                    globals: {
                        vars: {
                            "process.env.NODE_ENV": JSON.stringify(minify ? "production" : "development"),
                        },
                    },
                },
            },
            minify: minify
                ? {
                    compress: {},
                    mangle: {},
                }
                : {},
        },
    };
    return mergeDeep(defaults, options);
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
    options.plugin = transformCommonJS ? csm2mjs : undefined;
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
                options.jsc.minify = {};
                options.jsc.externalHelpers = true;
            }
            return await transformWithSwc(source, id, options, true);
        },
        async renderChunk(source, chunk, outputOptions) {
            if (minify) {
                const { fileName } = chunk;
                const { sourcemap } = outputOptions;
                const options = JSON.parse(JSON.stringify(swcOptions));
                options.minify = true;
                options.sourceMaps = !!sourcemap;
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
