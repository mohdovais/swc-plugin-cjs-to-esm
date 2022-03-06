"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.creatExportNamedDeclaration = exports.createExportDefaultObjectExpression = exports.createVerifiedVariableDeclaration = exports.createImporterFunction = exports.createImportDeclaration = exports.createExportAllDeclaration = exports.createStringLiteralStatement = exports.createExportDeclaration = exports.createExportDefaultExpression = exports.createCallExpression = exports.createAssignmentExpressionStatement = exports.createVariableDeclaration = exports.createStringLiteral = exports.createIdentifier = exports.createSpan = exports.createExpressionStatement = exports.createEmptyStatement = exports.createBooleanLiteral = void 0;
function createSpan({ start = 0, end = 0, ctxt = 0 } = {}) {
    return {
        start,
        end,
        ctxt,
    };
}
exports.createSpan = createSpan;
function createBooleanLiteral(value) {
    return {
        type: "BooleanLiteral",
        span: createSpan(),
        value,
    };
}
exports.createBooleanLiteral = createBooleanLiteral;
function createEmptyStatement() {
    return {
        type: "EmptyStatement",
        span: createSpan(),
    };
}
exports.createEmptyStatement = createEmptyStatement;
function createIdentifier(name) {
    return {
        type: "Identifier",
        span: createSpan(),
        value: name,
        optional: false,
    };
}
exports.createIdentifier = createIdentifier;
function createExpressionStatement(expression) {
    return {
        type: "ExpressionStatement",
        span: createSpan(),
        expression,
    };
}
exports.createExpressionStatement = createExpressionStatement;
function creatExportNamedDeclaration(names, source) {
    return {
        type: "ExportNamedDeclaration",
        span: createSpan(),
        specifiers: names.map((value) => ({
            type: "ExportSpecifier",
            span: createSpan(),
            orig: {
                type: "Identifier",
                span: createSpan(),
                value,
                optional: false,
            },
            exported: null,
        })),
        source,
        //@ts-ignore
        typeOnly: false,
    };
}
exports.creatExportNamedDeclaration = creatExportNamedDeclaration;
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
            typeAnnotation: undefined,
        },
        right: value,
    });
}
exports.createAssignmentExpressionStatement = createAssignmentExpressionStatement;
function createExportAllDeclaration(url) {
    return {
        type: "ExportAllDeclaration",
        span: createSpan(),
        source: {
            type: "StringLiteral",
            span: createSpan(),
            value: url,
            hasEscape: false,
        },
    };
}
exports.createExportAllDeclaration = createExportAllDeclaration;
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
                    typeAnnotation: undefined,
                },
                init: expression,
                definite: false,
            },
        ],
    };
}
exports.createVariableDeclaration = createVariableDeclaration;
function createCallExpression(callee, args = []) {
    return {
        type: "CallExpression",
        span: createSpan(),
        callee: {
            type: "Identifier",
            span: createSpan(),
            value: callee,
            optional: false,
        },
        arguments: args,
    };
}
exports.createCallExpression = createCallExpression;
function createExportDefaultExpression(expression) {
    return {
        type: "ExportDefaultExpression",
        span: createSpan(),
        expression,
    };
}
exports.createExportDefaultExpression = createExportDefaultExpression;
function createStringLiteral(value) {
    return {
        type: "StringLiteral",
        span: createSpan(),
        value,
        hasEscape: false,
    };
}
exports.createStringLiteral = createStringLiteral;
// composite
function createStringLiteralStatement(literal) {
    return {
        type: "ExpressionStatement",
        span: createSpan(),
        expression: createStringLiteral(literal),
    };
}
exports.createStringLiteralStatement = createStringLiteralStatement;
function createExportDefaultObjectExpression(names) {
    return createExportDefaultExpression({
        type: "ObjectExpression",
        span: createSpan(),
        properties: names.map((value) => ({
            type: "Identifier",
            span: createSpan(),
            value,
            optional: false,
        })),
    });
}
exports.createExportDefaultObjectExpression = createExportDefaultObjectExpression;
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
                imported: null,
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
                            optional: false,
                        },
                    },
                ],
        source: {
            type: "StringLiteral",
            span: createSpan(),
            value: url,
            hasEscape: false,
        },
    };
}
exports.createImportDeclaration = createImportDeclaration;
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
                        optional: false,
                    },
                    init: expression,
                    definite: false,
                },
            ],
        },
    };
}
exports.createExportDeclaration = createExportDeclaration;
function createImporterFunction(fnName, ref) {
    return createVariableDeclaration(fnName, {
        type: "ArrowFunctionExpression",
        span: createSpan(),
        params: [],
        body: {
            type: "Identifier",
            span: createSpan(),
            value: ref,
            optional: false,
        },
        async: false,
        generator: false,
    });
}
exports.createImporterFunction = createImporterFunction;
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
exports.createVerifiedVariableDeclaration = createVerifiedVariableDeclaration;
