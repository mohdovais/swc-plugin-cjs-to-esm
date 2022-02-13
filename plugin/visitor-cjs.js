const { Visitor } = require("@swc/core/Visitor");
const {
  createCallExpression,
  createStringLiteralStatement,
  createExportAllDeclaration,
} = require("./create");

const randomId = () => "_" + performance.now().toString(32);

const createSpan = ({ start = 0, end = 0, ctxt = 0 } = {}) => ({
  start,
  end,
  ctxt,
});

class CommonJSVisitor extends Visitor {
  _exportNames = [];
  _exportDeclarations = new Map();
  _requireURL = [];
  _requireName = [];
  _hasModuleDotExports = false;
  _exportAllDeclarations = new Map();

  /**
   *
   * @param {import("@swc/core").CallExpression} expression
   * @returns {import("@swc/core").CallExpression}
   */
  visitCallExpression(expression) {
    const callee = expression.callee.value;

    if (callee === "require" && expression.arguments.length === 1) {
      const url = expression.arguments[0].expression.value;
      const name = url.split(/[\.\/\\-]/g).join("_");

      this._requireURL.push(url);
      this._requireName.push(name);

      return createCallExpression("get_" + name);
    }

    return expression;
  }

  /**
   * Remove "use strict"
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
}

module.exports = { CommonJSVisitor, createSpan };
