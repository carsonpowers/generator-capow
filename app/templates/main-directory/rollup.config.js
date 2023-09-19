import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import browsersync from "rollup-plugin-browsersync"

export default {
  input: "src/index.js",
  plugins: [resolve(), commonjs(), browsersync()],
  output: {
    file: "dist/bundle.js",
    format: "umd",
    name: "lodash-test",
  },
}
