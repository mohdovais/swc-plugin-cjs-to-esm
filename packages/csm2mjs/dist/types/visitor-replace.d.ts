import { Visitor } from "@swc/core/Visitor";
import { Expression, MemberExpression } from "@swc/core";
export declare type ReplaceConfig = {
    replace?: Record<string, string>;
};
declare class ReplaceVisitor extends Visitor {
    __replace: Map<Expression, Expression>;
    constructor(config?: ReplaceConfig);
    visitMemberExpression(expression: MemberExpression): Expression;
}
export { ReplaceVisitor };
