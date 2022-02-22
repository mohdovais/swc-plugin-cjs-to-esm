import { createVariableDeclaration } from "./create";
import { Visitor } from "@swc/core/Visitor";
import type {
  BlockStatement,
  CallExpression,
  FunctionExpression,
  Identifier,
  ModuleItem,
  Param,
  ParenthesisExpression,
  Program,
  Statement,
  VariableDeclaration,
} from "@swc/core";

function unwrapIIFE(statement: ModuleItem) {
  // (function(){})()
  if (
    statement.type === "ExpressionStatement" &&
    statement.expression.type === "CallExpression" &&
    statement.expression.callee.type === "ParenthesisExpression" &&
    statement.expression.callee.expression.type === "FunctionExpression"
  ) {
    const expression = statement.expression;
    const callee = expression.callee as ParenthesisExpression;
    const calleeExpression = callee.expression as FunctionExpression;

    const params: Param[] = calleeExpression.params;

    const variables = params.map((param, i) =>
      createVariableDeclaration(
        (param.pat as Identifier).value,
        expression.arguments[i].expression
      )
    );

    return Array.prototype.concat.call(variables, calleeExpression.body.stmts);
  }

  // (function(){}())
  if (
    statement.type === "ExpressionStatement" &&
    statement.expression.type === "ParenthesisExpression" &&
    statement.expression.expression.type === "CallExpression"
  ) {
    const callExpression = statement.expression.expression as CallExpression;
    const callee = callExpression.callee as FunctionExpression;

    const variables = callee.params.map((param, i) =>
      createVariableDeclaration(
        (param.pat as Identifier).value,
        callExpression.arguments[i].expression
      )
    );

    return ([] as (VariableDeclaration | Statement)[]).concat(
      variables,
      (callee.body as BlockStatement).stmts
    );
  }

  return [statement];
}

class UnwrapIFFEVisitor extends Visitor {
  visitProgram(program: Program) {
    const body = program.body.filter((p) => p.type !== "EmptyStatement");
    if (body.length === 1) {
      program.body = unwrapIIFE(body[0]);
    }
    return program;
  }
}

export { UnwrapIFFEVisitor };
