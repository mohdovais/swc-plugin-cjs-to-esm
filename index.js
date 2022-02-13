const { transform } = require("@swc/core");
const fs = require("fs");
const csm2mjs = require("./plugin");

const src = fs.readFileSync(
  "./node_modules/react/cjs/react.development.js",
  "utf-8"
);

//console.log(src)

console.time("transform");
transform(src, {
  filename: "input.js",
  module: { type: "es6" },
  minify: false,
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
    minify: false
      ? {
          mangle: true,
        }
      : {},
  },
  plugin: csm2mjs,
}).then((output) => {
  console.timeEnd("transform");
  require("fs").writeFileSync("transformed.js", output.code);
});
