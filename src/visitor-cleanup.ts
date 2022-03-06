import { Visitor } from "@swc/core/Visitor";
import { Expression, MemberExpression } from "@swc/core";
import { createIdentifier } from "./create";

class CleanupVisitor extends Visitor {
  visitMemberExpression(expression: MemberExpression): Expression {

    // convert "exports.name" to "name"
    if (
      expression.object.type === "Identifier" &&
      expression.object.value === "exports" &&
      expression.property.type === "Identifier"
    ) {
      return createIdentifier(expression.property.value);
    }
    return expression;
  }
}

export { CleanupVisitor };
