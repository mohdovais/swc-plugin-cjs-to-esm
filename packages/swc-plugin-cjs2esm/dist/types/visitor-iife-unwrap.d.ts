import { Visitor } from "@swc/core/Visitor";
import type { Program } from "@swc/core";
declare class UnwrapIFFEVisitor extends Visitor {
    visitProgram(program: Program): Program;
}
export { UnwrapIFFEVisitor };
