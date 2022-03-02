import { UseStrictVisitor } from "./visitor-use-strict";
import { UnwrapIFFEVisitor } from "./visitor-iife-unwrap";
import { ReplaceVisitor } from "./visitor-replace";
import { BinaryExpressionVisitor } from "./visitor-binary-expression";
import { IfStatementVisitor } from "./visitor-if-statement";
import { CommonJSVisitor } from "./visitor-cjs";
import { CleanupVisitor } from "./visitor-cleanup";
function createCsm2MjsPlugin(config) {
    const { replace = {} } = config;
    return (program) => {
        const useStrictVisitor = new UseStrictVisitor();
        const unwrapIFFEVisitor = new UnwrapIFFEVisitor();
        const replaceVisitor = new ReplaceVisitor({ replace });
        const binaryVisitor = new BinaryExpressionVisitor();
        const ifVisitor = new IfStatementVisitor();
        const cjsVisitor = new CommonJSVisitor();
        const cleanupVisitor = new CleanupVisitor();
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
export { createCsm2MjsPlugin };
