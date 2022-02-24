import { createFilter } from "@rollup/pluginutils";
import { transform } from "@swc/core";
import { csm2mjs } from "csm2mjs";
import { excludeHelpers, mergeDeep } from "./utils";

import type { Options, JscConfig, ParserConfig } from "@swc/core";
import type { FilterPattern } from "@rollup/pluginutils";
import type { NormalizedOutputOptions, Plugin, RenderedChunk } from "rollup";

const knownExtensions = ["js", "jsx", "ts", "tsx", "mjs", "cjs"];
const tsRe = /\.tsx?$/;
const jsxRe = /\.[jt]sx$/;

function createSwcOptions(options: Options = {}): Options {
  const minify = options.minify === true;
  const defaults: Options = {
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
              "process.env.NODE_ENV": JSON.stringify(
                minify ? "production" : "development"
              ),
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

interface SwcPluginConfig {
  inlcude?: FilterPattern;
  exclude?: FilterPattern;
  minify?: boolean;
  extensions?: string[];
  jscConfig?: JscConfig;
  replace?: Record<string, string>;
}

function transformWithSwc(
  code: string,
  filename: string,
  options: Options,
  transformCommonJS = false
) {
  const isTypeScript = tsRe.test(filename);
  const isJSX = jsxRe.test(filename);

  const parser: ParserConfig = isTypeScript
    ? { syntax: "typescript", tsx: isJSX }
    : { syntax: "ecmascript", jsx: isJSX };

  if (options.jsc != null) {
    options.jsc.parser = parser;
  }

  options.filename = filename;
  options.plugin = transformCommonJS ? csm2mjs : undefined;

  return transform(code, options);
}

function swcPlugin(config: SwcPluginConfig = {}): Plugin {
  const {
    extensions = knownExtensions,
    exclude,
    inlcude,
    minify = false,
    replace = {},
    jscConfig = {},
  } = config;

  const rollupFilter = createFilter(inlcude, excludeHelpers(exclude));
  const extensionRegExp = new RegExp("\\.(" + extensions.join("|") + ")$");
  const filter = (id: string) => extensionRegExp.test(id) && rollupFilter(id);
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

    async transform(source: string, id: string) {
      if (!filter(id)) {
        return null;
      }

      const options: Options = JSON.parse(JSON.stringify(swcOptions));

      options.minify = false;
      if (options.jsc != null) {
        options.jsc.minify = {};
        options.jsc.externalHelpers = true;
      }

      return await transformWithSwc(source, id, options, true);
    },

    async renderChunk(
      source: string,
      chunk: RenderedChunk,
      outputOptions: NormalizedOutputOptions
    ) {
      if (minify) {
        const { fileName } = chunk;
        const { sourcemap } = outputOptions;

        const options: Options = JSON.parse(JSON.stringify(swcOptions));
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
