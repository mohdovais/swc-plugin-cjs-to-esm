import type { CallExpression, ExpressionStatement, Identifier, Program } from "@swc/core";
import { Visitor } from "@swc/core/Visitor";
declare class CommonJSVisitor extends Visitor {
    _exportDeclarationNames: Map<any, any>;
    _exportDeclarations: Map<any, any>;
    _requireURLs: string[];
    _requireNames: string[];
    _hasModuleDotExports: boolean;
    _exportAllDeclarations: Map<any, any>;
    visitProgram(program: Program): Program;
    visitCallExpression(expression: CallExpression, empty?: boolean): CallExpression | Identifier;
    visitExpressionStatement(statement: ExpressionStatement): ExpressionStatement | import("@swc/core").ExportAllDeclaration | import("@swc/core").ExportDefaultExpression | {
        type: string;
        span: import("@swc/core").Span;
    };
    /**
     *
     * @param {import("@swc/core").Program} program
     * @returns {import("@swc/core").Program}
     */
    updatePoregramTree(program: Program): Program;
}
export { CommonJSVisitor };
