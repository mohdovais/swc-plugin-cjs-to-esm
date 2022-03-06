//@ts-check
const swc = require("@swc/core");
const fs = require("fs");
const path = require("path");
const { createCsm2MjsPlugin } = require("..");

__dirname;

const react = [
  "node_modules/react/index.js",
  "node_modules/react/jsx-dev-runtime.js",
  "node_modules/react/jsx-runtime.js",
  "node_modules/react/cjs/react-jsx-dev-runtime.development.js",
  "node_modules/react/cjs/react-jsx-runtime.development.js",
  "node_modules/react/cjs/react.development.js",
  "node_modules/react/cjs/react-jsx-dev-runtime.production.min.js",
  "node_modules/react/cjs/react-jsx-runtime.production.min.js",
  "node_modules/react/cjs/react.production.min.js",
  "node_modules/react/cjs/react-jsx-dev-runtime.profiling.min.js",
  "node_modules/react/cjs/react-jsx-runtime.profiling.min.js",
];

/**
 *
 * @param {string[]} files
 * @param {"production"| "development"} env
 */
function transform(files, env) {
  return files.map((filename) => {
    return swc
      .transform(
        fs.readFileSync(path.resolve(__dirname, "..", filename), "utf-8"),
        {
          filename,
          jsc: {
            parser: {
              syntax: "ecmascript",
            },
            transform: {},
          },
          plugin: createCsm2MjsPlugin({
            replace: {
              "process.env.NODE_ENV": JSON.stringify(env),
            },
          }),
        }
      )
      .then(({ code }) => {
        const destFile = path.resolve("build", env, filename);
        const destDir = path.dirname(destFile);

        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }

        fs.writeFileSync(destFile, code);
      });
  });
}

async function run() {
  await Promise.all(
    transform(react, "development").concat(transform(react, "production"))
  );
}

run();
