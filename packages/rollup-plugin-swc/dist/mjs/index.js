import { createFilter } from "@rollup/pluginutils";
import { transform } from "@swc/core";
import { csm2mjs } from "csm2mjs";
const knownExtensions = ["js", "jsx", "ts", "tsx", "mjs", "cjs"];
const tsRe = /\.tsx?$/;
const jsxRe = /\.[jt]sx$/;
const minifyOptions = {
    compress: true,
    mangle: true,
};
function transformWithSwc(code, filename, options) {
    const isTypeScript = tsRe.test(filename);
    const isJSX = jsxRe.test(filename);
    const parser = isTypeScript
        ? { syntax: "typescript", tsx: isJSX }
        : { syntax: "ecmascript", jsx: isJSX };
    const normalizedOptions = Object.assign({}, options, {
        filename,
        jsc: {
            parser,
            externalHelpers: true,
        },
        plugin: csm2mjs,
    });
    return transform(code, normalizedOptions);
}
function swcPlugin(config = {}) {
    const { extensions = knownExtensions, exclude, inlcude, minify = false, ...swcOtions } = config;
    const rollupFilter = createFilter(inlcude, exclude);
    const extensionRegExp = new RegExp("\\.(" + extensions.join("|") + ")$");
    const filter = (id) => extensionRegExp.test(id) && rollupFilter(id);
    return {
        name: "swc",
        async transform(source, id) {
            if (!filter(id)) {
                return null;
            }
            const { code, map } = await transformWithSwc(source, id, swcOtions);
            console.log(code);
            return { code, map };
        },
        async renderChunk(code, chunk, outputOptions) {
            const { fileName } = chunk;
            const { sourcemap } = outputOptions;
            return minify ? await transformWithSwc(code, fileName, swcOtions) : null;
        },
    };
}
export { swcPlugin };
