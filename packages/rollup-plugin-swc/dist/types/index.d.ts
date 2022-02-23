import type { JscConfig } from "@swc/core";
import type { FilterPattern } from "@rollup/pluginutils";
import type { Plugin } from "rollup";
interface SwcPluginConfig {
    inlcude?: FilterPattern;
    exclude?: FilterPattern;
    minify?: boolean;
    extensions?: string[];
    jscConfig?: JscConfig;
    replace?: Record<string, string>;
}
declare function swcPlugin(config?: SwcPluginConfig): Plugin;
export { swcPlugin };
