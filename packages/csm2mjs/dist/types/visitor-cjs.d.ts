import type { CallExpression, Declaration, ExpressionStatement, FunctionDeclaration, Identifier, Program } from "@swc/core";
import { Visitor } from "@swc/core/Visitor";
declare class CommonJSVisitor extends Visitor {
    _exportDeclarationNames: string[];
    _requireURLs: string[];
    _requireNames: string[];
    _functions: string[];
    _exportAll: string[];
    _hasModuleDotExports: boolean;
    visitProgram(program: Program): Program;
    visitCallExpression(expression: CallExpression, empty?: boolean): CallExpression | Identifier;
    visitExpressionStatement(statement: ExpressionStatement): ExpressionStatement | import("@swc/core").ExportDefaultExpression | {
        type: string;
        span: import("@swc/core").Span;
    };
    visitFunctionDeclaration(decl: FunctionDeclaration): Declaration;
    /**
     *
     * @param {import("@swc/core").Program} program
     * @returns {import("@swc/core").Program}
     */
    updateProgramTree(program: Program): Program;
}
export { CommonJSVisitor };
