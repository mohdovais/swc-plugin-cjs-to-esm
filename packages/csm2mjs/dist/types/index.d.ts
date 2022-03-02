import type { Program } from "@swc/core";
import { ReplaceConfig } from "./visitor-replace";
declare type Config = {
    replace?: ReplaceConfig["replace"];
};
declare function createCsm2MjsPlugin(config: Config): (program: Program) => Program;
export { createCsm2MjsPlugin };
