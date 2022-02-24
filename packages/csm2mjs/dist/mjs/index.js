import { UseStrictVisitor } from "./visitor-use-strict";
import { UnwrapIFFEVisitor } from "./visitor-iife-unwrap";
import { ReplaceVisitor } from "./visitor-replace";
import { BinaryExpressionVisitor } from "./visitor-binary-expression";
import { IfStatementVisitor } from "./visitor-if-statement";
import { CommonJSVisitor } from "./visitor-cjs";
/**
 *
 * @param {import("@swc/core").Program} program
 * @returns {import("@swc/core").Program}
 */
function csm2mjs(program) {
    const useStrictVisitor = new UseStrictVisitor();
    const unwrapIFFEVisitor = new UnwrapIFFEVisitor();
    const replaceVisitor = new ReplaceVisitor();
    const binaryVisitor = new BinaryExpressionVisitor();
    const ifVisitor = new IfStatementVisitor();
    const cjsVisitor = new CommonJSVisitor();
    // sequence matter
    const result = [
        useStrictVisitor.visitProgram.bind(useStrictVisitor),
        replaceVisitor.visitProgram.bind(replaceVisitor),
        binaryVisitor.visitProgram.bind(binaryVisitor),
        ifVisitor.visitProgram.bind(ifVisitor),
        unwrapIFFEVisitor.visitProgram.bind(unwrapIFFEVisitor),
        cjsVisitor.visitProgram.bind(cjsVisitor),
    ].reduce((prog, fn) => fn(prog), program);
    //require("fs").writeFileSync("./ast.json", JSON.stringify(result, null, 4));
    return result;
}
export { csm2mjs };
