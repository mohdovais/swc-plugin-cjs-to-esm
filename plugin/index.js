const { UseStrictVisitor } = require("./visitor-use-strict");
const { UnwrapIFFEVisitor } = require("./visitor-iife-unwrap");
const { ReplaceVisitor } = require("./visitor-replace");
const { BinaryExpressionVisitor } = require("./visitor-binary-expression");
const { IfStatementVisitor } = require("./visitor-if-statement");

const { CommonJSVisitor } = require("./visitor-cjs");

/**
 *
 * @param {import("@swc/core").Program} program
 * @returns {import("@swc/core").Program}
 */
module.exports = (program) => {
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

  require("fs").writeFileSync("./ast.json", JSON.stringify(result));

  return result;
};
