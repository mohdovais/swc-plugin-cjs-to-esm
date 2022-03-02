// @ts-check
const { resolve } = require("path");
const swc = require("@swc/core");
const { readFile, writeFile } = require("fs/promises");
const { createCsm2MjsPlugin } = require("csm2mjs");

function transformString(source, { minify = false, filename = "" } = {}) {
  return swc.transform(source, {
    filename,
    module: { type: "es6" },
    minify: false,
    jsc: {
      parser: {
        syntax: "ecmascript",
      },
      target: "es2018",
      loose: false,
      transform: {},
      minify: minify
        ? {
            mangle: {},
            compress: {},
          }
        : {},
    },
    plugin: createCsm2MjsPlugin({}),
  });
}

function transform(filename, { minify = false } = {}) {
  return readFile(filename, "utf-8").then((string) =>
    transformString(string, { minify, filename })
  );
}

console.time("transform");
//const filename = "./node_modules/object-assign/index.js";
const filename = "./node_modules/react/cjs/react.development.js"

transform(filename, {
  minify: false,
}).then((output) => {
  console.timeEnd("transform");
  return writeFile("debug/" + filename.split("/").pop(), output.code);
});
