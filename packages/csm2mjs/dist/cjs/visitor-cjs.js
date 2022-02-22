"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonJSVisitor = void 0;
const Visitor_1 = require("@swc/core/Visitor");
const crypto_1 = __importDefault(require("crypto"));
const create_1 = require("./create");
const randomId = () => "_" + crypto_1.default.randomBytes(4).toString("hex");
class CommonJSVisitor extends Visitor_1.Visitor {
    _exportDeclarationNames = new Map();
    _exportDeclarations = new Map();
    _requireURLs = [];
    _requireNames = [];
    _hasModuleDotExports = false;
    _exportAllDeclarations = new Map();
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
            return (0, create_1.createIdentifier)(name);
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
                return (0, create_1.createExportAllDeclaration)(url);
            }
            else {
                this._hasModuleDotExports = true;
                return (0, create_1.createExportDefaultExpression)(expression.right);
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
            return (0, create_1.createExpressionStatement)(this.visitCallExpression(expression, true));
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
            return (0, create_1.createStringLiteralStatement)(placeholder);
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
            imports.push((0, create_1.createImportDeclaration)(name, this._requireURLs[i]));
        });
        if (!this._hasModuleDotExports && this._exportDeclarationNames.size > 0) {
            exports.push((0, create_1.createExportDefaultObjectExpression)(Array.from(this._exportDeclarationNames.keys())));
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
                    return (0, create_1.createExportDeclaration)(name, init);
                }
                else {
                    variables.push((0, create_1.createVariableDeclaration)(name, undefined));
                    exports.push((0, create_1.createExportDeclaration)(name, undefined));
                    return (0, create_1.createAssignmentExpressionStatement)(name, init);
                }
            }
            return statement;
        });
        // @ts-ignore
        program.body = [].concat(imports, variables, body, exports);
        return program;
    }
}
exports.CommonJSVisitor = CommonJSVisitor;
