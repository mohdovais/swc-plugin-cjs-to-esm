const { Visitor } = require("@swc/core/Visitor");

class UseStrictVisitor extends Visitor {
  /**
   * Remove "use strict"
   *
   * @param {import("@swc/core").ExpressionStatement} statement
   * @returns {import("@swc/core").Statement}
   */
  visitExpressionStatement(statement) {
    const { expression } = statement;
    if (
      expression.type === "StringLiteral" &&
      expression.value === "use strict"
    ) {
      return {
        type: "EmptyStatement",
        span: statement.span,
      };
    }

    return statement;
  }
}

module.exports = { UseStrictVisitor };
