const swc = require("@swc/core");
const { readFile, writeFile } = require("fs/promises");
const csm2mjs = require("./plugin");

function transformString(source, { minify = false, filename = "" } = {}) {
  return swc.transform(source, {
    filename,
    module: { type: "es6" },
    minify,
    jsc: {
      parser: {
        syntax: "ecmascript",
      },
      target: "es2018",
      transform: {
        optimizer: {
          globals: {
            vars: {
              "process.env.NODE_ENV": JSON.stringify("production"),
            },
          },
        },
      },
      minify: minify
        ? {
            mangle: true,
            toplevel: true,
            ecma: 2022,
          }
        : {},
    },
    plugin: csm2mjs,
  });
}

function transform(filename, { minify = false } = {}) {
  return readFile(filename, "utf-8").then((string) =>
    transformString(string, { minify, filename })
  );
}

console.time("transform");
const filename = "./node_modules/object-assign/index.js";
const files = [
  "./node_modules/object-assign/index.js",
]
transform(filename, {
  minify: true,
}).then((output) => {
  console.timeEnd("transform");
  return writeFile("build/" + filename.split("/").pop(), output.code);
});
