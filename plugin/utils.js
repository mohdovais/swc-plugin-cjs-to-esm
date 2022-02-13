"use strict";

const toString = Object.prototype.toString;

function isEqual(objectA, objectB) {
  if (objectA !== objectB) {
    if (toString.call(objectA) !== toString.call(objectB)) {
      return false;
    }

    if (Array.isArray(objectA)) {
      for (let i = 0, length = objectA.length; i < length; i++) {
        if (!isEqual(objectA[i], objectB[i])) {
          return false;
        }
      }
    }

    if (typeof objectA === "object") {
      const keys = Object.keys(objectA);
      for (let i = 0, length = keys.length; i < length; i++) {
        const key = keys[i];
        if (key !== "span" && !isEqual(objectA[key], objectB[key])) {
          return false;
        }
      }
    }
  }

  return true;
}

module.exports = { isEqual };
