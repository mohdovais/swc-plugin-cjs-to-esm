"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCsm2MjsPlugin = void 0;
const visitor_use_strict_1 = require("./visitor-use-strict");
const visitor_iife_unwrap_1 = require("./visitor-iife-unwrap");
const visitor_replace_1 = require("./visitor-replace");
const visitor_binary_expression_1 = require("./visitor-binary-expression");
const visitor_if_statement_1 = require("./visitor-if-statement");
const visitor_cjs_1 = require("./visitor-cjs");
const visitor_cleanup_1 = require("./visitor-cleanup");
function createCsm2MjsPlugin(config) {
    const { replace = {} } = config;
    return (program) => {
        const useStrictVisitor = new visitor_use_strict_1.UseStrictVisitor();
        const unwrapIFFEVisitor = new visitor_iife_unwrap_1.UnwrapIFFEVisitor();
        const replaceVisitor = new visitor_replace_1.ReplaceVisitor({ replace });
        const binaryVisitor = new visitor_binary_expression_1.BinaryExpressionVisitor();
        const ifVisitor = new visitor_if_statement_1.IfStatementVisitor();
        const cjsVisitor = new visitor_cjs_1.CommonJSVisitor();
        const cleanupVisitor = new visitor_cleanup_1.CleanupVisitor();
        // sequence matter
        const result = [
            useStrictVisitor.visitProgram.bind(useStrictVisitor),
            replaceVisitor.visitProgram.bind(replaceVisitor),
            binaryVisitor.visitProgram.bind(binaryVisitor),
            ifVisitor.visitProgram.bind(ifVisitor),
            unwrapIFFEVisitor.visitProgram.bind(unwrapIFFEVisitor),
            cjsVisitor.visitProgram.bind(cjsVisitor),
            cleanupVisitor.visitProgram.bind(cleanupVisitor),
        ].reduce((prog, fn) => fn(prog), program);
        return result;
    };
}
exports.createCsm2MjsPlugin = createCsm2MjsPlugin;
