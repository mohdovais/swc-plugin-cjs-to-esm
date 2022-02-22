import type { ExpressionStatement } from "@swc/core";
import { Visitor } from "@swc/core/Visitor";
import { createEmptyStatement } from "./create";

class UseStrictVisitor extends Visitor {
  visitExpressionStatement(statement: ExpressionStatement) {
    const { expression } = statement;
    if (
      expression.type === "StringLiteral" &&
      expression.value === "use strict"
    ) {
      return createEmptyStatement();
    }

    return statement;
  }
}

export { UseStrictVisitor };
