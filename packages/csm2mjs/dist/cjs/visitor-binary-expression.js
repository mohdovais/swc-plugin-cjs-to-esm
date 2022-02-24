"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinaryExpressionVisitor = void 0;
const Visitor_1 = require("@swc/core/Visitor");
const create_1 = require("./create");
const UNKOWN = "UNKNOWN_" + Date.now().toString(32);
const getValue = (expression) => {
    switch (expression.type) {
        case "StringLiteral":
        case "NumericLiteral":
        case "BooleanLiteral":
            return expression.value;
        case "Identifier":
            if (expression.value === "undefined") {
                return undefined;
            }
            return UNKOWN;
        case "NullLiteral":
            return null;
    }
    return UNKOWN;
};
function compare(left, right, operator) {
    const leftValue = getValue(left);
    const rightValue = getValue(right);
    if (leftValue === UNKOWN ||
        rightValue === UNKOWN ||
        leftValue == null ||
        rightValue == null) {
        return UNKOWN;
    }
    else {
        switch (operator) {
            case "==":
                return leftValue == rightValue;
            case "!=":
                return leftValue != rightValue;
            case "===":
                return leftValue === rightValue;
            case "!==":
                return leftValue !== rightValue;
            case "<":
                return leftValue < rightValue;
            case "<=":
                return leftValue <= rightValue;
            case ">":
                return leftValue > rightValue;
            case ">=":
                return leftValue >= rightValue;
            default:
                return UNKOWN;
        }
    }
}
class BinaryExpressionVisitor extends Visitor_1.Visitor {
    /**
     *
     * @param {BinaryExpression} expression
     * @returns {BinaryExpression | BooleanLiteral}
     */
    visitBinaryExpression(expression) {
        const result = compare(expression.left, expression.right, expression.operator);
        if (typeof result !== "string") {
            return (0, create_1.createBooleanLiteral)(result);
        }
        return expression;
    }
}
exports.BinaryExpressionVisitor = BinaryExpressionVisitor;
