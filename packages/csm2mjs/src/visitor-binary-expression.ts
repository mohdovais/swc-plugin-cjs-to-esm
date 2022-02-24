import { BinaryExpression, BinaryOperator, Expression } from "@swc/core";
import { Visitor } from "@swc/core/Visitor";
import { createBooleanLiteral } from "./create";
const UNKOWN = "UNKNOWN_" + Date.now().toString(32);

type KnownParseValue = number | string | boolean | undefined | null;
type ParsedValue = KnownParseValue | typeof UNKOWN;

const getValue = (expression: Expression): ParsedValue => {
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

function compare(
  left: Expression,
  right: Expression,
  operator: BinaryOperator
): boolean | typeof UNKOWN {
  const leftValue = getValue(left);
  const rightValue = getValue(right);

  if (
    leftValue === UNKOWN ||
    rightValue === UNKOWN ||
    leftValue == null ||
    rightValue == null
  ) {
    return UNKOWN;
  } else {
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

class BinaryExpressionVisitor extends Visitor {
  /**
   *
   * @param {BinaryExpression} expression
   * @returns {BinaryExpression | BooleanLiteral}
   */
  visitBinaryExpression(expression: BinaryExpression) {
    const result = compare(
      expression.left,
      expression.right,
      expression.operator
    );

    if (typeof result !== "string") {
      return createBooleanLiteral(result);
    }

    return expression;
  }
}

export { BinaryExpressionVisitor };
