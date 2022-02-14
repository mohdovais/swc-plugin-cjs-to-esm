const swc = require("@swc/core");
const fs = require("fs");
const csm2mjs = require("./plugin");

const src = fs.readFileSync(
  "./node_modules/react/cjs/react-jsx-dev-runtime.production.min.js",
  "utf-8"
);

//console.log(src)

function transform(src, { minify = false } = {}) {
  return swc.transform(src, {
    filename: "input.js",
    module: { type: "es6" },
    minify,
    jsc: {
      parser: {
        syntax: "ecmascript",
      },
      target: "es2022",
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
          }
        : {},
    },
    plugin: csm2mjs,
  });
}

console.time("transform");
transform(src, { minify: true }).then((output) => {
  console.timeEnd("transform");
  require("fs").writeFileSync("transformed.js", output.code);
});
