"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UseStrictVisitor = void 0;
const Visitor_1 = require("@swc/core/Visitor");
const create_1 = require("./create");
class UseStrictVisitor extends Visitor_1.Visitor {
    visitExpressionStatement(statement) {
        const { expression } = statement;
        if (expression.type === "StringLiteral" &&
            expression.value === "use strict") {
            return (0, create_1.createEmptyStatement)();
        }
        return statement;
    }
}
exports.UseStrictVisitor = UseStrictVisitor;
