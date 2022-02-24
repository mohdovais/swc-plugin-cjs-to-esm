import type { IfStatement, Statement } from "@swc/core";
import { Visitor } from "@swc/core/Visitor";
declare class IfStatementVisitor extends Visitor {
    visitIfStatement(expression: IfStatement): Statement;
}
export { IfStatementVisitor };
