"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnwrapIFFEVisitor = void 0;
const create_1 = require("./create");
const Visitor_1 = require("@swc/core/Visitor");
function unwrapIIFE(statement) {
    // (function(){})()
    if (statement.type === "ExpressionStatement" &&
        statement.expression.type === "CallExpression" &&
        statement.expression.callee.type === "ParenthesisExpression" &&
        statement.expression.callee.expression.type === "FunctionExpression") {
        const expression = statement.expression;
        const callee = expression.callee;
        const calleeExpression = callee.expression;
        const params = calleeExpression.params;
        const variables = params.map((param, i) => (0, create_1.createVariableDeclaration)(param.pat.value, expression.arguments[i].expression));
        return Array.prototype.concat.call(variables, calleeExpression.body.stmts);
    }
    // (function(){}())
    if (statement.type === "ExpressionStatement" &&
        statement.expression.type === "ParenthesisExpression" &&
        statement.expression.expression.type === "CallExpression") {
        const callExpression = statement.expression.expression;
        const callee = callExpression.callee;
        const variables = callee.params.map((param, i) => (0, create_1.createVariableDeclaration)(param.pat.value, callExpression.arguments[i].expression));
        return [].concat(variables, callee.body.stmts);
    }
    return [statement];
}
class UnwrapIFFEVisitor extends Visitor_1.Visitor {
    visitProgram(program) {
        const body = program.body.filter((p) => p.type !== "EmptyStatement");
        if (body.length === 1) {
            program.body = unwrapIIFE(body[0]);
        }
        return program;
    }
}
exports.UnwrapIFFEVisitor = UnwrapIFFEVisitor;
