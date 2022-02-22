"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEqual = void 0;
const toString = Object.prototype.toString;
function isEqual(objectA, objectB) {
    if (objectA === objectB) {
        return true;
    }
    if (toString.call(objectA) !== toString.call(objectB)) {
        return false;
    }
    if (typeof objectA === "object") {
        const aKeys = Object.keys(objectA);
        const bKeys = Object.keys(objectB);
        for (let i = 0, length = aKeys.length; i < length; i++) {
            const key = aKeys[i];
            if (key !== "span" && !isEqual(objectA[key], objectB[key])) {
                return false;
            }
        }
        if (aKeys.length !== bKeys.length) {
            for (let i = 0, length = aKeys.length; i < length; i++) {
                const key = bKeys[i];
                if (key !== "span" && !isEqual(objectA[key], objectB[key])) {
                    return false;
                }
            }
        }
        return true;
    }
    return false;
}
exports.isEqual = isEqual;
