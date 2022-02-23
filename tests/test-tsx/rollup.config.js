import { swcPlugin } from "rollup-plugin-swc";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "./src/main.tsx",
  output: {
    dir: "build",
    entryFileNames: 'app.js',
    manualChunks(id) {
      if (id.includes("node_modules")) {
        return "vendor";
      }
    },
  },
  
  plugins: [
    nodeResolve({
      extensions: [".tsx", ".ts"],
    }),
    swcPlugin({ minify: true}),
  ],
};
