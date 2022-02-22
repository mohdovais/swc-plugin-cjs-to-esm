import { createFilter } from "@rollup/pluginutils";
import { transform } from "@swc/core";
import { csm2mjs } from "csm2mjs";

import type { Options, JsMinifyOptions, ParserConfig } from "@swc/core";
import type { FilterPattern } from "@rollup/pluginutils";
import type { NormalizedOutputOptions, Plugin, RenderedChunk } from "rollup";

const knownExtensions = ["js", "jsx", "ts", "tsx", "mjs", "cjs"];
const tsRe = /\.tsx?$/;
const jsxRe = /\.[jt]sx$/;
const minifyOptions: JsMinifyOptions = {
  compress: true,
  mangle: true,
};

interface SwcPluginConfig extends Omit<Options, "exclude"> {
  inlcude?: FilterPattern;
  exclude?: FilterPattern;
  minify?: boolean;
  extensions?: string[];
}

function transformWithSwc(code: string, filename: string, options: Options) {
  const isTypeScript = tsRe.test(filename);
  const isJSX = jsxRe.test(filename);

  const parser: ParserConfig = isTypeScript
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

function swcPlugin(config: SwcPluginConfig = {}): Plugin {
  const {
    extensions = knownExtensions,
    exclude,
    inlcude,
    minify = false,
    ...swcOtions
  } = config;
  const rollupFilter = createFilter(inlcude, exclude);
  const extensionRegExp = new RegExp("\\.(" + extensions.join("|") + ")$");
  const filter = (id: string) => extensionRegExp.test(id) && rollupFilter(id);

  return {
    name: "swc",

    async transform(source: string, id: string) {
      if (!filter(id)) {
        return null;
      }

      const { code, map } = await transformWithSwc(source, id, swcOtions);

      console.log(code);

      return { code, map };
    },

    async renderChunk(
      code: string,
      chunk: RenderedChunk,
      outputOptions: NormalizedOutputOptions
    ) {
      const { fileName } = chunk;
      const { sourcemap } = outputOptions;

      return minify ? await transformWithSwc(code, fileName, swcOtions) : null;
    },
  };
}

export { swcPlugin };
