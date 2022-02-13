const { UseStrictVisitor } = require("./visitor-use-strict");
const { UnwrapIFFEVisitor } = require("./unwrap-iife");
const { ReplaceVisitor } = require("./visitor-replace");
const { BinaryExpressionVisitor } = require("./visitor-binary-expression");
const { IfStatementVisitor } = require("./visitor-if-statement");

const { CommonJSVisitor } = require("./visitor-cjs");
const {
  createExportDefaultModuleDotExports,
  createImportDefaultExpression,
  createImporterFunction,
  createVerifiedVariableDeclaration,
  createExportDeclaration,
  createExportDefaultObjectExpression,
} = require("./create");

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

  const imports = [];
  const importGetters = [];
  const variables = [];
  const exports = [];

  cjsVisitor._requireName.forEach((name, i) => {
    imports.push(
      createImportDefaultExpression(name, cjsVisitor._requireURL[i])
    );
    importGetters.push(createImporterFunction("get_" + name, name));
  });

  if (cjsVisitor._hasModuleDotExports) {
    variables.push(createVerifiedVariableDeclaration("module"));
  }

  if (cjsVisitor._exportNames.length > 0) {
    variables.push(createVerifiedVariableDeclaration("exports"));
  }

  if (cjsVisitor._hasModuleDotExports) {
    exports.push(createExportDefaultModuleDotExports());
  } else if (cjsVisitor._exportNames.length > 0) {
    exports.push(createExportDefaultObjectExpression(cjsVisitor._exportNames));
  }

  result.body = result.body.map((statement) => {
    const literal =
      statement.type === "ExpressionStatement" &&
      statement.expression &&
      statement.expression.type === "StringLiteral" &&
      statement.expression.value;

    if (literal !== false && cjsVisitor._exportDeclarations.has(literal)) {
      const { name, init } = cjsVisitor._exportDeclarations.get(literal);
      return createExportDeclaration(name, init);
    }

    return statement;
  });

  result.body = imports.concat(variables, importGetters, result.body, exports);

  require("fs").writeFileSync("./ast.json", JSON.stringify(result));

  return result;


};
