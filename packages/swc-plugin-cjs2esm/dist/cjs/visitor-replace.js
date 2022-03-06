"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplaceVisitor = void 0;
const Visitor_1 = require("@swc/core/Visitor");
const core_1 = require("@swc/core");
const utils_1 = require("./utils");
const find = parse("process.env.NODE_ENV");
const replace = parse(JSON.stringify("development"));
function parse(str) {
    const module = (0, core_1.parseSync)(str);
    if (module.body.length === 1 &&
        module.body[0].type === "ExpressionStatement") {
        return module.body[0].expression;
    }
    throw `cannot parse "${str}"`;
}
class ReplaceVisitor extends Visitor_1.Visitor {
    __replace;
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
            return (0, utils_1.isEqual)(expression, find) ? replace : expression;
        }
        return expression;
    }
}
exports.ReplaceVisitor = ReplaceVisitor;
