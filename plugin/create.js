/**
 *
 * @typedef {import("@swc/core").Span} Span
 * @typedef {import("@swc/core").Expression} Expression
 * @typedef {import("@swc/core").VariableDeclarationKind} VariableDeclarationKind
 * @typedef {import("@swc/core").VariableDeclaration} VariableDeclaration
 * @typedef {import("@swc/core").CallExpression} CallExpression
 * @typedef {import("@swc/core").Argument} Argument
 * @typedef {import("@swc/core").ExportDefaultExpression} ExportDefaultExpression
 * @typedef {import("@swc/core").ImportDeclaration} ImportDeclaration
 * @typedef {import("@swc/core").ExportDeclaration} ExportDeclaration
 * @typedef {import("@swc/core").ExpressionStatement} ExpressionStatement
 * @typedef {import("@swc/core").ExportAllDeclaration} ExportAllDeclaration
 */

/**
 *
 * @param {Span} param0
 * @returns {Span}
 */
const createSpan = ({ start = 0, end = 0, ctxt = 0 } = {}) => ({
  start,
  end,
  ctxt,
});

function createEmptyStatement() {
  return {
    type: "EmptyStatement",
    span: createSpan(),
  };
}
/**
 *
 * @param {string} name
 * @returns {import("@swc/core").Identifier}
 */
function createIdentifier(name) {
  return {
    type: "Identifier",
    span: createSpan(),
    value: name,
  };
}

function createExpressionStatement(expression) {
  return {
    type: "ExpressionStatement",
    span: createSpan(),
    expression,
  };
}

/**
 *
 * @param {string} name
 * @param {Expression} value
 * @returns {ExpressionStatement}
 */
function createAssignmentExpressionStatement(name, value) {
  return createExpressionStatement({
    type: "AssignmentExpression",
    span: createSpan(),
    operator: "=",
    left: {
      type: "Identifier",
      span: createSpan(),
      value: name,
      optional: false,
      typeAnnotation: null,
    },
    right: value,
  });
}

/**
 *
 * @param {string} url
 * @returns {ExportAllDeclaration}
 */
function createExportAllDeclaration(url) {
  return {
    type: "ExportAllDeclaration",
    span: createSpan(),
    source: {
      type: "StringLiteral",
      span: createSpan(),
      value: url,
      hasEscape: false,
      kind: {
        type: "normal",
        containsQuote: true,
      },
    },
    asserts: null,
  };
}

/**
 *
 * @param {string} name
 * @param {Expression} expression
 * @param {VariableDeclarationKind} kind
 * @returns {VariableDeclaration}
 */
function createVariableDeclaration(name, expression, kind = "var") {
  return {
    type: "VariableDeclaration",
    span: createSpan(),
    kind,
    declare: false,
    declarations: [
      {
        type: "VariableDeclarator",
        span: createSpan(),
        id: {
          type: "Identifier",
          span: createSpan(),
          value: name,
          optional: false,
          typeAnnotation: null,
        },
        init: expression,
      },
    ],
  };
}

/**
 *
 * @param {string} callee
 * @param {Argument[]} args
 * @returns {CallExpression}
 */
function createCallExpression(callee, args = []) {
  return {
    type: "CallExpression",
    span: createSpan(),
    callee: {
      type: "Identifier",
      span: createSpan(),
      value: callee,
    },
    arguments: args,
  };
}

/**
 *
 * @param {Expression} expression
 * @returns {ExportDefaultExpression}
 */
function createExportDefaultExpression(expression) {
  return {
    type: "ExportDefaultExpression",
    span: createSpan(),
    expression,
  };
}

/**
 *
 * @param {string} value
 * @returns {import("@swc/core").StringLiteral}
 */
function createStringLiteral(value) {
  return {
    type: "StringLiteral",
    span: createSpan(),
    value,
  };
}

/**
 *
 * @param {string} literal
 * @returns {ExpressionStatement}
 */
function createStringLiteralStatement(literal) {
  return {
    type: "ExpressionStatement",
    span: createSpan(),
    expression: createStringLiteral(literal),
  };
}

/**
 *
 * @param {string[]} names
 * @returns {ExportDefaultExpression}
 */
function createExportDefaultObjectExpression(names) {
  return createExportDefaultExpression({
    type: "ObjectExpression",
    span: createSpan(),
    properties: names.map((value) => ({
      type: "Identifier",
      span: createSpan(),
      value,
    })),
  });
}

/**
 *
 * @param {string | string[]} specifier
 * @param {string} url
 * @returns {import("@swc/core").ImportDeclaration}
 */
function createImportDeclaration(specifier, url) {
  return {
    type: "ImportDeclaration",
    span: createSpan(),
    specifiers: Array.isArray(specifier)
      ? specifier.map((spec) => ({
          type: "ImportSpecifier",
          span: createSpan(),
          local: {
            type: "Identifier",
            span: createSpan(),
            value: "",
            optional: false,
          },
        }))
      : specifier === ""
      ? []
      : [
          {
            type: "ImportDefaultSpecifier",
            span: createSpan(),
            local: {
              type: "Identifier",
              span: createSpan(),
              value: specifier,
            },
          },
        ],
    source: {
      type: "StringLiteral",
      span: createSpan(),
      value: url,
      hasEscape: false,
      kind: {
        type: "normal",
        containsQuote: true,
      },
    },
  };
}


/**
 *
 * @param {string} name
 * @param {expression} Expression
 * @returns {ExportDeclaration}
 */
function createExportDeclaration(name, expression) {
  return {
    type: "ExportDeclaration",
    span: createSpan(),
    declaration: {
      type: "VariableDeclaration",
      span: createSpan(),
      kind: "var",
      declare: false,
      declarations: [
        {
          type: "VariableDeclarator",
          span: createSpan(),
          id: {
            type: "Identifier",
            span: createSpan(),
            value: name,
          },
          init: expression,
          definite: false,
        },
      ],
    },
  };
}

/**
 *
 * @param {string} fnName
 * @param {string} ref
 * @returns {VariableDeclaration}
 */
function createImporterFunction(fnName, ref) {
  return createVariableDeclaration(fnName, {
    type: "ArrowFunctionExpression",
    span: createSpan(),
    params: [],
    body: {
      type: "Identifier",
      span: createSpan(),
      value: ref,
    },
  });
}

/**
 *
 * @param {string} name
 * @returns {VariableDeclaration}
 */
function createVerifiedVariableDeclaration(name) {
  return createVariableDeclaration(name, {
    type: "ConditionalExpression",
    span: createSpan(),
    test: {
      type: "BinaryExpression",
      span: createSpan(),
      operator: "===",
      left: {
        type: "UnaryExpression",
        span: createSpan(),
        operator: "typeof",
        argument: {
          type: "Identifier",
          span: createSpan(),
          value: name,
          optional: false,
        },
      },
      right: {
        type: "StringLiteral",
        span: createSpan(),
        value: "object",
        hasEscape: false,
        kind: {
          type: "normal",
          containsQuote: true,
        },
      },
    },
    consequent: {
      type: "Identifier",
      span: createSpan(),
      value: name,
      optional: false,
    },
    alternate: {
      type: "ObjectExpression",
      span: createSpan(),
      properties: [],
    },
  });
}

////////

module.exports = {
  createEmptyStatement,
  createExpressionStatement,
  createSpan,
  createIdentifier,
  createStringLiteral,
  createVariableDeclaration,
  createAssignmentExpressionStatement,
  createCallExpression,
  createExportDefaultExpression,
  createExportDeclaration,
  createStringLiteralStatement,
  createExportAllDeclaration,

  createImportDeclaration,
  createImporterFunction,
  createVerifiedVariableDeclaration,
  createExportDefaultObjectExpression,
};
