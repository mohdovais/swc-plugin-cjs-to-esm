import path from "path";
function excludeHelpers(exclude) {
    const excludeArray = Array.isArray(exclude)
        ? exclude
        : exclude == null
            ? []
            : [exclude];
    excludeArray.push(new RegExp(path.join("/node_modules", "@swc", "helpers"), "i"));
    return excludeArray;
}
function isObject(item) {
    return item != null && typeof item === "object" && !Array.isArray(item);
}
function hasOwnProperty(object, key) {
    return (Object.prototype.hasOwnProperty.call(object, key) && object[key] != null);
}
function mergeDeep(target, ...sources) {
    if (!sources.length)
        return target;
    const source = sources.shift();
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!hasOwnProperty(target, key)) {
                    //@ts-ignore
                    target[key] = {};
                }
                mergeDeep(target[key], source[key]);
            }
            else {
                //@ts-ignore
                target[key] = source[key];
            }
        }
    }
    return mergeDeep(target, ...sources);
}
export { mergeDeep, excludeHelpers };
