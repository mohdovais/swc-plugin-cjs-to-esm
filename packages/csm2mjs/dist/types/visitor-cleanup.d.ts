import { Visitor } from "@swc/core/Visitor";
import { Expression, MemberExpression } from "@swc/core";
declare class CleanupVisitor extends Visitor {
    visitMemberExpression(expression: MemberExpression): Expression;
}
export { CleanupVisitor };
