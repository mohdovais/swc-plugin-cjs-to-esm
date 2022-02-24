import { Visitor } from "@swc/core/Visitor";
import { parseSync } from "@swc/core";
import { isEqual } from "./utils";
const find = parse("process.env.NODE_ENV");
const replace = parse(JSON.stringify("production"));
function parse(str) {
    const module = parseSync(str);
    if (module.body.length === 1 &&
        module.body[0].type === "ExpressionStatement") {
        return module.body[0].expression;
    }
    throw `cannot parse "${str}"`;
}
class ReplaceVisitor extends Visitor {
    visitMemberExpression(expression) {
        return isEqual(expression, find) ? replace : expression;
    }
}
export { ReplaceVisitor };
