/**
 * @typedef {import("@swc/core").IfStatement} IfStatement
 * @typedef {import("@swc/core").ExpressionStatement} ExpressionStatement
 * @typedef {import("@swc/core").BlockStatement} BlockStatement
 *
 */

const { Visitor } = require("@swc/core/Visitor");
const { createEmptyStatement } = require("./create");

/**
 *
 * @param {ExpressionStatement | BlockStatement} statement
 */
const get = (statement) => {
  switch (statement.type) {
    case "ExpressionStatement":
      return statement;
    case "BlockStatement":
      return statement.stmts.length === 1 ? statement.stmts[0] : statement;
  }

  return statement;
};

class IfStatementVisitor extends Visitor {
  /**
   *
   * @param {IfStatement} expression
   * @returns {IfStatement}
   */
  visitIfStatement(expression) {
    if (expression.test.type === "BooleanLiteral") {
      return expression.test.value
        ? get(expression.consequent)
        : expression.alternate
        ? get(expression.alternate)
        : createEmptyStatement();
    }

    return expression;
  }
}

module.exports = { IfStatementVisitor };

//ExpressionStatement
