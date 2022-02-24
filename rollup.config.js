import { swcPlugin } from "rollup-plugin-swc";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "./tests/tsx/main.tsx",
  output: {
    dir: "test-builds/tsx",
    entryFileNames: "app.js",
    manualChunks(id) {
      if (id.includes("node_modules")) {
        return "vendor";
      }
    },
  },

  plugins: [
    nodeResolve({
      extensions: [".js", ".json", ".tsx", ".ts"],
    }),
    swcPlugin({ minify: true }),
  ],
};
