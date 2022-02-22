"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IfStatementVisitor = void 0;
const Visitor_1 = require("@swc/core/Visitor");
const create_1 = require("./create");
const get = (statement) => {
    switch (statement.type) {
        case "ExpressionStatement":
            return statement;
        case "BlockStatement":
            return statement.stmts.length === 1 ? statement.stmts[0] : statement;
    }
    return statement;
};
class IfStatementVisitor extends Visitor_1.Visitor {
    visitIfStatement(expression) {
        if (expression.test.type === "BooleanLiteral") {
            return expression.test.value
                ? get(expression.consequent)
                : expression.alternate
                    ? get(expression.alternate)
                    : (0, create_1.createEmptyStatement)();
        }
        return expression;
    }
}
exports.IfStatementVisitor = IfStatementVisitor;
