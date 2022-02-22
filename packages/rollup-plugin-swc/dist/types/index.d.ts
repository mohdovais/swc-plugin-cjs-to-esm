import type { Options } from "@swc/core";
import type { FilterPattern } from "@rollup/pluginutils";
import type { Plugin } from "rollup";
interface SwcPluginConfig extends Omit<Options, "exclude"> {
    inlcude?: FilterPattern;
    exclude?: FilterPattern;
    minify?: boolean;
    extensions?: string[];
}
declare function swcPlugin(config?: SwcPluginConfig): Plugin;
export { swcPlugin };
