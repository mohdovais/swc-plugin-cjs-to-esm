import { FilterPattern } from "@rollup/pluginutils";
declare function excludeHelpers(exclude?: FilterPattern): any[];
declare function mergeDeep<T extends Record<string, any>>(target: T, ...sources: (undefined | Partial<T>)[]): T;
export { mergeDeep, excludeHelpers };
