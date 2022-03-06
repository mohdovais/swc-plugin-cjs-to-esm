import type { ExpressionStatement } from "@swc/core";
import { Visitor } from "@swc/core/Visitor";
declare class UseStrictVisitor extends Visitor {
    visitExpressionStatement(statement: ExpressionStatement): import("@swc/core").EmptyStatement | ExpressionStatement;
}
export { UseStrictVisitor };
