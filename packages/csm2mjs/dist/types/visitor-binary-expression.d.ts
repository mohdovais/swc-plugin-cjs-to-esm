import { BinaryExpression } from "@swc/core";
import { Visitor } from "@swc/core/Visitor";
declare class BinaryExpressionVisitor extends Visitor {
    /**
     *
     * @param {BinaryExpression} expression
     * @returns {BinaryExpression | BooleanLiteral}
     */
    visitBinaryExpression(expression: BinaryExpression): import("@swc/core").BooleanLiteral | BinaryExpression;
}
export { BinaryExpressionVisitor };
