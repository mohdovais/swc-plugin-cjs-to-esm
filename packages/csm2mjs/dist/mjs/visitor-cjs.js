import { Visitor } from "@swc/core/Visitor";
import crypto from "crypto";
import { createStringLiteralStatement, createExportAllDeclaration, createImportDeclaration, createExportDefaultExpression, createExportDefaultObjectExpression, createExportDeclaration, createIdentifier, createAssignmentExpressionStatement, createVariableDeclaration, createExpressionStatement, } from "./create";
const randomId = () => "_" + crypto.randomBytes(4).toString("hex");
class CommonJSVisitor extends Visitor {
    constructor() {
        super(...arguments);
        this._exportDeclarationNames = new Map();
        this._exportDeclarations = new Map();
        this._requireURLs = [];
        this._requireNames = [];
        this._hasModuleDotExports = false;
        this._exportAllDeclarations = new Map();
    }
    visitProgram(program) {
        return this.updatePoregramTree(super.visitProgram(program));
    }
    visitCallExpression(expression, empty = false) {
        const callee = expression.callee.type === "Identifier" && expression.callee.value;
        if (callee === "require" &&
            expression.arguments.length === 1 &&
            expression.arguments[0].expression.type === "StringLiteral") {
            const url = expression.arguments[0].expression.value;
            const index = this._requireURLs.indexOf(url);
            let name;
            if (index === -1) {
                name = empty ? "" : url.split(/[\.\/\\-]/g).join("_") + randomId();
                this._requireURLs.push(url);
                this._requireNames.push(name);
            }
            else {
                name = this._requireNames[index];
            }
            return createIdentifier(name);
        }
        return expression;
    }
    // @ts-ignore
    visitExpressionStatement(statement) {
        const { expression } = statement;
        if (expression.type === "StringLiteral" &&
            expression.value === "use strict") {
            return {
                type: "EmptyStatement",
                span: statement.span,
            };
        }
        if (expression.type === "AssignmentExpression" &&
            expression.left &&
            expression.left.type === "MemberExpression" &&
            expression.left.object &&
            expression.left.object.type === "Identifier" &&
            expression.left.object.value === "module" &&
            expression.left.property &&
            expression.left.property.type === "Identifier" &&
            expression.left.property.value === "exports") {
            if (expression.right.type === "CallExpression" &&
                expression.right.callee.type === "Identifier" &&
                expression.right.callee.value === "require" &&
                expression.right.arguments.length === 1 &&
                expression.right.arguments[0].expression.type === "StringLiteral") {
                const url = expression.right.arguments[0].expression.value;
                const placeholder = "ExportAllDeclaration_" + randomId();
                this._exportAllDeclarations.set(placeholder, url);
                return createExportAllDeclaration(url);
            }
            else {
                this._hasModuleDotExports = true;
                return createExportDefaultExpression(expression.right);
            }
        }
        if (expression.type === "AssignmentExpression" &&
            expression.right &&
            expression.right.type === "CallExpression") {
            expression.right = this.visitCallExpression(expression.right);
        }
        if (expression.type === "CallExpression" &&
            expression.callee &&
            expression.callee.type === "Identifier" &&
            expression.callee.value === "require") {
            return createExpressionStatement(this.visitCallExpression(expression, true));
        }
        if (expression.type === "AssignmentExpression" &&
            expression.left &&
            expression.left.type === "MemberExpression" &&
            expression.left.object &&
            expression.left.object.type === "Identifier" &&
            expression.left.object.value === "exports" &&
            expression.left.property &&
            expression.left.property.type === "Identifier") {
            const exportName = expression.left.property.value;
            const placeholder = exportName + randomId();
            this._exportDeclarationNames.set(exportName, this._exportDeclarationNames.has(exportName)
                ? this._exportDeclarationNames.get(exportName) + 1
                : 1);
            this._exportDeclarations.set(placeholder, {
                name: exportName,
                init: expression.right,
            });
            return createStringLiteralStatement(placeholder);
        }
        return statement;
    }
    /**
     *
     * @param {import("@swc/core").Program} program
     * @returns {import("@swc/core").Program}
     */
    updatePoregramTree(program) {
        const imports = [];
        const variables = [];
        const exports = [];
        this._requireNames.forEach((name, i) => {
            imports.push(createImportDeclaration(name, this._requireURLs[i]));
        });
        if (!this._hasModuleDotExports && this._exportDeclarationNames.size > 0) {
            exports.push(createExportDefaultObjectExpression(Array.from(this._exportDeclarationNames.keys())));
        }
        const body = program.body.map((statement) => {
            const literal = statement.type === "ExpressionStatement" &&
                statement.expression &&
                statement.expression.type === "StringLiteral" &&
                statement.expression.value;
            if (literal !== false && this._exportDeclarations.has(literal)) {
                const { name, init } = this._exportDeclarations.get(literal);
                const count = this._exportDeclarationNames.get(name);
                if (count === 1) {
                    return createExportDeclaration(name, init);
                }
                else {
                    variables.push(createVariableDeclaration(name, undefined));
                    exports.push(createExportDeclaration(name, undefined));
                    return createAssignmentExpressionStatement(name, init);
                }
            }
            return statement;
        });
        // @ts-ignore
        program.body = [].concat(imports, variables, body, exports);
        return program;
    }
}
export { CommonJSVisitor };
