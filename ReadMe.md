# swc-plugin-cjs2esm

SWC plugin to convert cjs to esm [Experiment]

> This plugin is is written as a part of [rollup-plugin-swc-core](https://www.npmjs.com/package/rollup-plugin-swc-core).

This is an experiment to convert CommonJS module to ESM module. It is slippery slope with many gotchas but the intention is to make it work for day-to-day used packages.

It is using multi-pass approche, traversing AST multiple times, may not good for performance. The initial _attempt is to make it work_ and not focussing on performance, code quality etc.

The Rust based plugin system for SWC is evolving, once stable, it can be re-written in Rust for better perf.

# Usage

```console
npm i swc-plugin-cjs2esm -D
```

```javascript
const swc = require("@swc/core");
const { createCsm2MjsPlugin } = require("swc-plugin-cjs2esm");

swc
  .transform("common js source code", {
    filename,
    jsc: {
      parser: {
        syntax: "ecmascript",
      },
      transform: {},
    },
    plugin: createCsm2MjsPlugin({
      replace: {
        "process.env.NODE_ENV": JSON.stringify("production"),
      },
    }),
  })
  .then(({ code }) => {
    console.log(code);
  });
```
