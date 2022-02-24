import type {
  CallExpression,
  Declaration,
  ExpressionStatement,
  FunctionDeclaration,
  Identifier,
  ModuleDeclaration,
  ModuleItem,
  Program,
  VariableDeclaration,
} from "@swc/core";
import { Visitor } from "@swc/core/Visitor";
import crypto from "crypto";
import * as create from "./create";
const {
  createExportAllDeclaration,
  createImportDeclaration,
  createExportDefaultExpression,
  createExportDefaultObjectExpression,
  createIdentifier,
  createAssignmentExpressionStatement,
  createVariableDeclaration,
  createExpressionStatement,
  creatExportNamedDeclaration,
} = create;

const randomId = () => "_" + crypto.randomBytes(4).toString("hex");

class CommonJSVisitor extends Visitor {
  _exportDeclarationNames: string[] = [];
  _requireURLs: string[] = [];
  _requireNames: string[] = [];
  _functions: string[] = [];
  _exportAll: string[] = []; //for default

  _hasModuleDotExports = false;

  visitProgram(program: Program) {
    return this.updateProgramTree(super.visitProgram(program));
  }

  visitCallExpression(
    expression: CallExpression,
    empty = false
  ): CallExpression | Identifier {
    const callee =
      expression.callee.type === "Identifier" && expression.callee.value;

    if (
      callee === "require" &&
      expression.arguments.length === 1 &&
      expression.arguments[0].expression.type === "StringLiteral"
    ) {
      const url = expression.arguments[0].expression.value;
      const index = this._requireURLs.indexOf(url);
      let name;

      if (index === -1) {
        name = empty ? "" : url.split(/[\.\/\\-]/g).join("_") + randomId();
        this._requireURLs.push(url);
        this._requireNames.push(name);
      } else {
        name = this._requireNames[index];
      }

      return createIdentifier(name);
    }

    return expression;
  }

  // @ts-ignore
  visitExpressionStatement(statement: ExpressionStatement) {
    const { expression } = statement;
    if (
      expression.type === "StringLiteral" &&
      expression.value === "use strict"
    ) {
      return {
        type: "EmptyStatement",
        span: statement.span,
      };
    }

    if (
      expression.type === "AssignmentExpression" &&
      expression.left &&
      expression.left.type === "MemberExpression" &&
      expression.left.object &&
      expression.left.object.type === "Identifier" &&
      expression.left.object.value === "module" &&
      expression.left.property &&
      expression.left.property.type === "Identifier" &&
      expression.left.property.value === "exports"
    ) {
      if (
        expression.right.type === "CallExpression" &&
        expression.right.callee.type === "Identifier" &&
        expression.right.callee.value === "require" &&
        expression.right.arguments.length === 1 &&
        expression.right.arguments[0].expression.type === "StringLiteral"
      ) {
        const url = expression.right.arguments[0].expression.value;
        this._exportAll.push(url);

        return create.createEmptyStatement();

        //return createExportAllDeclaration(url);
      } else {
        this._hasModuleDotExports = true;
        return createExportDefaultExpression(expression.right);
      }
    }

    if (
      expression.type === "AssignmentExpression" &&
      expression.right &&
      expression.right.type === "CallExpression"
    ) {
      expression.right = this.visitCallExpression(expression.right);
    }

    if (
      expression.type === "CallExpression" &&
      expression.callee &&
      expression.callee.type === "Identifier" &&
      expression.callee.value === "require"
    ) {
      return createExpressionStatement(
        this.visitCallExpression(expression, true)
      );
    }

    // exports.name = itentifier
    if (
      expression.type === "AssignmentExpression" &&
      expression.left &&
      expression.left.type === "MemberExpression" &&
      expression.left.object &&
      expression.left.object.type === "Identifier" &&
      expression.left.object.value === "exports" &&
      expression.left.property &&
      expression.left.property.type === "Identifier"
    ) {
      const exportName = expression.left.property.value;
      if (!this._exportDeclarationNames.includes(exportName)) {
        this._exportDeclarationNames.push(exportName);
      }
      return createAssignmentExpressionStatement(exportName, expression.right);
    }

    return statement;
  }

  visitFunctionDeclaration(decl: FunctionDeclaration): Declaration {
    this._functions.push(decl.identifier.value);
    return decl;
  }

  /**
   *
   * @param {import("@swc/core").Program} program
   * @returns {import("@swc/core").Program}
   */
  updateProgramTree(program: Program) {
    let hasDefaultExport = false;

    const importDeclarations = this._requireNames.map((name, i) => {
      return createImportDeclaration(name, this._requireURLs[i]);
    });

    const variableDeclarations: VariableDeclaration[] = [];
    this._exportDeclarationNames.forEach((name) => {
      if (!this._functions.includes(name)) {
        variableDeclarations.push(createVariableDeclaration(name, undefined));
      }
    });

    var exportDeclarations: ModuleDeclaration[] = [];
    if (this._exportDeclarationNames.length > 0) {
      exportDeclarations = [
        creatExportNamedDeclaration(this._exportDeclarationNames),
      ];

      if (!this._hasModuleDotExports) {
        hasDefaultExport = true;
        exportDeclarations.push(
          createExportDefaultObjectExpression(this._exportDeclarationNames)
        );
      }
    }

    this._exportAll.forEach((url) => {
      exportDeclarations.push(createExportAllDeclaration(url));

      if (!hasDefaultExport) {
        hasDefaultExport = true;
        exportDeclarations.push(
          creatExportNamedDeclaration(
            ["default"],
            create.createStringLiteral(url)
          )
        );
      }
    });

    program.body = ([] as ModuleItem[]).concat(
      importDeclarations,
      variableDeclarations,
      program.body,
      exportDeclarations
    );

    return program;
  }
}

export { CommonJSVisitor };
