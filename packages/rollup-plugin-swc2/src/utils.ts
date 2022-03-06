import type { FilterPattern } from "@rollup/pluginutils";
import type { Options } from "@swc/core";
import path from "path";

function excludeHelpers(exclude?: FilterPattern) {
  const excludeArray = Array.isArray(exclude)
    ? exclude
    : exclude == null
    ? []
    : [exclude];

  excludeArray.push(
    new RegExp(path.join("/node_modules", "@swc", "helpers"), "i")
  );
  return excludeArray;
}

function isObject(item: unknown): item is Record<string, unknown> {
  return item != null && typeof item === "object" && !Array.isArray(item);
}

function hasOwnProperty(
  object: Record<string, unknown>,
  key: string
): key is keyof object {
  return (
    Object.prototype.hasOwnProperty.call(object, key) && object[key] != null
  );
}

function mergeDeep<T extends Record<string, any>>(
  target: T,
  ...sources: (undefined | Partial<T>)[]
): T {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!hasOwnProperty(target, key)) {
          //@ts-ignore
          target[key] = {};
        }
        mergeDeep(target[key], source[key]);
      } else {
        //@ts-ignore
        target[key] = source[key];
      }
    }
  }

  return mergeDeep(target, ...sources);
}

function createSwcOptions(options: Options = {}): Options {
  const minify = options.minify === true;
  const defaults: Options = {
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
              "process.env.NODE_ENV": JSON.stringify(
                minify ? "production" : "development"
              ),
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


export { mergeDeep, excludeHelpers, createSwcOptions };
