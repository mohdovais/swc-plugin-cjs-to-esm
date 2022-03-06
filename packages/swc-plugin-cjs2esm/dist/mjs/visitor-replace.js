import { Visitor } from "@swc/core/Visitor";
import { parseSync } from "@swc/core";
import { isEqual } from "./utils";
const find = parse("process.env.NODE_ENV");
const replace = parse(JSON.stringify("development"));
function parse(str) {
    const module = parseSync(str);
    if (module.body.length === 1 &&
        module.body[0].type === "ExpressionStatement") {
        return module.body[0].expression;
    }
    throw `cannot parse "${str}"`;
}
class ReplaceVisitor extends Visitor {
    constructor(config = {}) {
        super();
        const { replace = {} } = config;
        const replaceMap = new Map();
        Object.keys(replace).forEach((key) => {
            replaceMap.set(parse(key), parse(replace[key]));
        });
        this.__replace = replaceMap;
    }
    visitMemberExpression(expression) {
        for (const [find, replace] of this.__replace) {
            return isEqual(expression, find) ? replace : expression;
        }
        return expression;
    }
}
export { ReplaceVisitor };
