const { Visitor } = require("@swc/core/Visitor");
const crypto = require("crypto")
const {
  createCallExpression,
  createStringLiteralStatement,
  createExportAllDeclaration,
  createExportDefaultModuleDotExports,
  createImportDefaultExpression,
  createImporterFunction,
  createVerifiedVariableDeclaration,
  createExportDeclaration,
  createExportDefaultObjectExpression,
  createSpan,
  createIdentifier,
} = require("./create");

const randomId = () => "_" + crypto.randomBytes(4).toString("hex");


class CommonJSVisitor extends Visitor {
  _exportNames = [];
  _exportDeclarations = new Map();
  _requireURLs = [];
  _requireNames = [];
  _hasModuleDotExports = false;
  _exportAllDeclarations = new Map();

  visitProgram(program) {
    return this.updatePoregramTree(super.visitProgram(program));
  }

  /**
   *
   * @param {import("@swc/core").CallExpression} expression
   * @returns {import("@swc/core").CallExpression}
   */
  visitCallExpression(expression) {
    const callee = expression.callee.value;

    if (callee === "require" && expression.arguments.length === 1) {
      const url = expression.arguments[0].expression.value;
      const index = this._requireURLs.indexOf(url);
      let name;

      if (index === -1) {
        name = url.split(/[\.\/\\-]/g).join("_") + randomId();
        this._requireURLs.push(url);
        this._requireNames.push(name);
      } else {
        name = this._requireNames[index];
      }

      return createIdentifier(name);
    }

    return expression;
  }

  /**
   *
   * @param {import("@swc/core").ExpressionStatement} statement
   * @returns {import("@swc/core").Statement}
   */
  visitExpressionStatement(statement) {
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
      expression.left.object &&
      expression.left.object.value === "module" &&
      expression.left.property &&
      expression.left.property.value === "exports"
    ) {
      if (
        expression.right.type === "CallExpression" &&
        expression.right.callee.value === "require"
      ) {
        const url = expression.right.arguments[0].expression.value;
        const placeholder = "ExportAllDeclaration_" + randomId();
        this._exportAllDeclarations.set(placeholder, url);

        return createExportAllDeclaration(url);
      } else {
        this._hasModuleDotExports = true;
      }
    }

    if (expression.right && expression.right.type === "CallExpression") {
      expression.right = this.visitCallExpression(expression.right);
    }

    if (
      expression.type === "AssignmentExpression" &&
      expression.left.object &&
      expression.left.object.value === "exports" &&
      expression.left.property
    ) {
      const exportName = expression.left.property.value;

      if (!this._exportNames.includes(exportName)) {
        this._exportNames.push(exportName);
      }

      const placeholder = exportName + randomId();

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
    const importGetters = [];
    const variables = [];
    const exports = [];

    this._requireNames.forEach((name, i) => {
      imports.push(createImportDefaultExpression(name, this._requireURLs[i]));
      importGetters.push(createImporterFunction("get_" + name, name));
    });

    if (this._hasModuleDotExports) {
      variables.push(createVerifiedVariableDeclaration("module"));
    }

    if (this._exportNames.length > 0) {
      variables.push(createVerifiedVariableDeclaration("exports"));
    }

    if (this._hasModuleDotExports) {
      exports.push(createExportDefaultModuleDotExports());
    } else if (this._exportNames.length > 0) {
      exports.push(createExportDefaultObjectExpression(this._exportNames));
    }

    const body = program.body.map((statement) => {
      const literal =
        statement.type === "ExpressionStatement" &&
        statement.expression &&
        statement.expression.type === "StringLiteral" &&
        statement.expression.value;

      if (literal !== false && this._exportDeclarations.has(literal)) {
        const { name, init } = this._exportDeclarations.get(literal);
        return createExportDeclaration(name, init);
      }

      return statement;
    });

    program.body = imports.concat(variables, importGetters, body, exports);

    return program;
  }
}

module.exports = { CommonJSVisitor, createSpan };
