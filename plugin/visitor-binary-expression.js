/**
 * @typedef {import("@swc/core").Expression} Expression
 * @typedef {import("@swc/core").BinaryExpression} BinaryExpression
 * @typedef {import("@swc/core").BinaryOperator} BinaryOperator
 * @typedef {import("@swc/core").BooleanLiteral} BooleanLiteral
 */

const { Visitor } = require("@swc/core/Visitor");
const { createSpan } = require("./create");
const UNKOWN = "UNKNOWN_" + Date.now().toString(32);

/**
 *
 * @param {boolean} value
 * @returns {BooleanLiteral}
 */
const booleanLiteral = (value) => ({
  type: "BooleanLiteral",
  span: createSpan(),
  value,
});

/**
 *
 * @param {Expression} expression
 * @param {string|number|boolean}
 */
const getValue = (expression) => {
  switch (expression.type) {
    case "StringLiteral":
    case "NumericLiteral":
    case "BooleanLiteral":
      return expression.value;
    case "Identifier":
      if ((value = expression.value === "undefined")) {
        return undefined;
      }
      break;
    case "NullLiteral":
      return null;
  }

  return UNKOWN;
};

/**
 *
 * @param {*} left
 * @param {*} right
 * @param {BinaryOperator} operator
 * @returns {boolean|UNKOWN}
 */
function compare(left, right, operator) {
  const leftValue = getValue(left);
  const rightValue = getValue(right);

  if (left !== UNKOWN && right !== UNKOWN) {
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
    }
  }

  return UNKOWN;
}

class BinaryExpressionVisitor extends Visitor {
  /**
   *
   * @param {BinaryExpression} expression
   * @returns {BinaryExpression | BooleanLiteral}
   */
  visitBinaryExpression(expression) {
    const result = compare(
      expression.left,
      expression.right,
      expression.operator
    );

    if (result !== UNKOWN) {
      return booleanLiteral(result);
    }

    return expression;
  }
}

module.exports = { BinaryExpressionVisitor };
