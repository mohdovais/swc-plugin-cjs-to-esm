import { swcPlugin } from "rollup-plugin-swc";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "./src/main.tsx",
  output: {
    file: "build/app.js",
  },
  plugins: [
    nodeResolve({
      extensions: [".tsx", ".ts"],
    }),
    swcPlugin(),
  ],
};
