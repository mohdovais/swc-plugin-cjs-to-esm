"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swcPlugin = void 0;
const pluginutils_1 = require("@rollup/pluginutils");
const core_1 = require("@swc/core");
const csm2mjs_1 = require("csm2mjs");
const utils_1 = require("./utils");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const knownExtensions = ["js", "jsx", "ts", "tsx", "mjs", "cjs"];
const tsRe = /\.tsx?$/;
const jsxRe = /\.[jt]sx$/;
// @revisit
function createSwcOptions(options = {}) {
    const minify = options.minify === true;
    const defaults = {
        jsc: {
            externalHelpers: false,
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
    return (0, utils_1.mergeDeep)(defaults, options);
}
function transformWithSwc(code, filename, options, transformCommonJS = false) {
    const isTypeScript = tsRe.test(filename);
    const isJSX = jsxRe.test(filename);
    const parser = isTypeScript
        ? { syntax: "typescript", tsx: isJSX }
        : { syntax: "ecmascript", jsx: isJSX };
    //@ts-ignore
    options.jsc.parser = parser;
    options.filename = filename;
    options.plugin = transformCommonJS ? csm2mjs_1.csm2mjs : undefined;
    console.log(JSON.stringify(options, null, 2));
    return (0, core_1.transform)(code, options);
}
function swcPlugin(config = {}) {
    const { extensions = knownExtensions, exclude, inlcude, minify = false, replace = {}, jscConfig = {}, } = config;
    const rollupFilter = (0, pluginutils_1.createFilter)(inlcude, (0, utils_1.excludeHelpers)(exclude));
    const extensionRegExp = new RegExp("\\.(" + extensions.join("|") + ")$");
    const filter = (id) => extensionRegExp.test(id) && rollupFilter(id);
    const swcOptions = createSwcOptions({
        minify,
        jsc: (0, utils_1.mergeDeep)(jscConfig, {
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
            // @ts-ignore
            options.jsc.minify = {};
            options.minify = false;
            // @ts-ignore
            options.jsc.externalHelpers = true;
            const { code, map } = await transformWithSwc(source, id, options, true);
            const tempId = path_1.default.join(process.cwd(), "temp", id.replace("/Users/ovais/Projects/swc-plugin-cjs2esm/", ""));
            const tempDir = path_1.default.dirname(tempId);
            if (!fs_1.default.existsSync(tempDir)) {
                fs_1.default.mkdirSync(tempDir, { recursive: true });
            }
            fs_1.default.writeFileSync(tempId, code);
            return { code, map };
        },
        async renderChunk(source, chunk, outputOptions) {
            if (minify) {
                const { fileName } = chunk;
                const { sourcemap } = outputOptions;
                const options = JSON.parse(JSON.stringify(swcOptions));
                options.minify = true;
                options.sourceMaps = true;
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
