"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupVisitor = void 0;
const Visitor_1 = require("@swc/core/Visitor");
const create_1 = require("./create");
class CleanupVisitor extends Visitor_1.Visitor {
    visitMemberExpression(expression) {
        // convert "exports.name" to "name"
        if (expression.object.type === "Identifier" &&
            expression.object.value === "exports" &&
            expression.property.type === "Identifier") {
            return (0, create_1.createIdentifier)(expression.property.value);
        }
        return expression;
    }
}
exports.CleanupVisitor = CleanupVisitor;
