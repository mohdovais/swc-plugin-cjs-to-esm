import { Visitor } from "@swc/core/Visitor";
import { createIdentifier } from "./create";
class CleanupVisitor extends Visitor {
    visitMemberExpression(expression) {
        // convert "exports.name" to "name"
        if (expression.object.type === "Identifier" &&
            expression.object.value === "exports" &&
            expression.property.type === "Identifier") {
            return createIdentifier(expression.property.value);
        }
        return expression;
    }
}
export { CleanupVisitor };
