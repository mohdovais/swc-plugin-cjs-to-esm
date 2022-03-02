import { Visitor } from "@swc/core/Visitor";
import { Expression, MemberExpression, parseSync } from "@swc/core";
import { isEqual } from "./utils";

const find = parse("process.env.NODE_ENV");
const replace = parse(JSON.stringify("development"));

function parse(str: string): Expression {
  const module = parseSync(str);

  if (
    module.body.length === 1 &&
    module.body[0].type === "ExpressionStatement"
  ) {
    return module.body[0].expression;
  }

  throw `cannot parse "${str}"`;
}

export type ReplaceConfig = {
  replace?: Record<string, string>;
};

class ReplaceVisitor extends Visitor {
  __replace: Map<Expression, Expression>;

  constructor(config: ReplaceConfig = {}) {
    super();
    const { replace = {} } = config;
    const replaceMap = new Map();
    Object.keys(replace).forEach((key) => {
      replaceMap.set(parse(key), parse(replace[key]));
    });

    this.__replace = replaceMap;
  }

  visitMemberExpression(expression: MemberExpression): Expression {
    for (const [find, replace] of this.__replace) {
      return isEqual(expression, find) ? replace : expression;
    }
    return expression;
  }
}

export { ReplaceVisitor };
