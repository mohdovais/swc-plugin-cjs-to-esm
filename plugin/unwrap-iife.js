const { createVariableDeclaration } = require("./create");
const { Visitor } = require("@swc/core/Visitor");

/**
 *
 * @param {import("@swc/core").ExpressionStatement} statement
 */
function unwrapIIFE(statement) {
  // (function(){})()
  if (
    statement.type === "ExpressionStatement" &&
    statement.expression.type === "CallExpression" &&
    statement.expression.callee.type === "ParenthesisExpression" &&
    statement.expression.callee.expression.type === "FunctionExpression"
  ) {
    const args = statement.expression.arguments;

    /**
     * @type {import("@swc/core").Param[]}
     */
    const params = statement.expression.callee.expression.params;

    const variables = params.map((param, i) =>
      createVariableDeclaration(param.pat.value, args[i].expression)
    );

    return variables.concat(statement.expression.callee.expression.body.stmts);
  }

  // (function(){}())
  if (
    statement.type === "ExpressionStatement" &&
    statement.expression.type === "ParenthesisExpression" &&
    statement.expression.expression.type === "CallExpression"
  ) {
    const args = statement.expression.expression.arguments;

    /**
     * @type {import("@swc/core").Param[]}
     */
    const params = statement.expression.expression.callee.params;

    const variables = params.map((param, i) =>
      createVariableDeclaration(param.pat.value, args[i].expression)
    );

    return variables.concat(statement.expression.expression.callee.body.stmts);
  }

  return [statement];
}

class UnwrapIFFEVisitor extends Visitor {
  /**
   *
   * @param {import("@swc/core").Program} program
   */
  visitProgram(program) {
    const body = program.body.filter((p) => p.type !== "EmptyStatement");
    if (body.length === 1) {
      program.body = unwrapIIFE(body[0]);
    }
    return program;
  }
}

module.exports = { UnwrapIFFEVisitor };
