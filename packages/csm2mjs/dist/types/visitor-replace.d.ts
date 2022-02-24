import { Visitor } from "@swc/core/Visitor";
import { Expression, MemberExpression } from "@swc/core";
declare class ReplaceVisitor extends Visitor {
    visitMemberExpression(expression: MemberExpression): Expression;
}
export { ReplaceVisitor };
