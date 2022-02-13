const { Visitor } = require("@swc/core/Visitor");
const { parseSync } = require("@swc/core");
const { isEqual } = require("./utils");

const parse = (str) => parseSync(str).body[0].expression;

const find = parse("process.env.NODE_ENV");
const replace = parse(JSON.stringify("development"));

class ReplaceVisitor extends Visitor {
  visitMemberExpression(expression) {
    return isEqual(expression, find) ? replace : expression;
  }
}

module.exports = { ReplaceVisitor };
