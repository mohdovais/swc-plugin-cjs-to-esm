import type { FilterPattern } from "@rollup/pluginutils";
import type { Options } from "@swc/core";
declare function excludeHelpers(exclude?: FilterPattern): any[];
declare function mergeDeep<T extends Record<string, any>>(target: T, ...sources: (undefined | Partial<T>)[]): T;
declare function createSwcOptions(options?: Options): Options;
export { mergeDeep, excludeHelpers, createSwcOptions };
