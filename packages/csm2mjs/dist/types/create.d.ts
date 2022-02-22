import type { BooleanLiteral, CallExpression, EmptyStatement, ExportAllDeclaration, ExportDeclaration, ExportDefaultExpression, Expression, ExpressionStatement, Identifier, ImportDeclaration, Span, StringLiteral, VariableDeclaration, VariableDeclarationKind } from "@swc/core";
declare function createSpan({ start, end, ctxt }?: {
    start?: number | undefined;
    end?: number | undefined;
    ctxt?: number | undefined;
}): Span;
declare function createBooleanLiteral(value: boolean): BooleanLiteral;
declare function createEmptyStatement(): EmptyStatement;
declare function createIdentifier(name: string): Identifier;
declare function createExpressionStatement(expression: Expression): ExpressionStatement;
declare function createAssignmentExpressionStatement(name: string, value: Expression): ExpressionStatement;
declare function createExportAllDeclaration(url: string): ExportAllDeclaration;
declare function createVariableDeclaration(name: string, expression?: Expression, kind?: VariableDeclarationKind): VariableDeclaration;
declare function createCallExpression(callee: string, args?: never[]): CallExpression;
declare function createExportDefaultExpression(expression: Expression): ExportDefaultExpression;
declare function createStringLiteral(value: string): StringLiteral;
declare function createStringLiteralStatement(literal: string): ExpressionStatement;
declare function createExportDefaultObjectExpression(names: string[]): ExportDefaultExpression;
declare function createImportDeclaration(specifier: string | string[], url: string): ImportDeclaration;
declare function createExportDeclaration(name: string, expression: Expression | undefined): ExportDeclaration;
declare function createImporterFunction(fnName: string, ref: string): VariableDeclaration;
/**
 *
 * @param {string} name
 * @returns {VariableDeclaration}
 */
declare function createVerifiedVariableDeclaration(name: string): VariableDeclaration;
export { createBooleanLiteral, createEmptyStatement, createExpressionStatement, createSpan, createIdentifier, createStringLiteral, createVariableDeclaration, createAssignmentExpressionStatement, createCallExpression, createExportDefaultExpression, createExportDeclaration, createStringLiteralStatement, createExportAllDeclaration, createImportDeclaration, createImporterFunction, createVerifiedVariableDeclaration, createExportDefaultObjectExpression, };
