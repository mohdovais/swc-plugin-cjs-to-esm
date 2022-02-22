import { Visitor } from "@swc/core/Visitor";
import { createEmptyStatement } from "./create";
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
export { IfStatementVisitor };
