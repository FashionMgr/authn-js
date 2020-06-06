import filesize from "rollup-plugin-filesize"
import uglify from "rollup-plugin-uglify"

export default [
  {
    input: "./lib/index.js",
    output: {
      file: "./dist/fm-authn.js",
      format: "cjs"
    },
    plugins: [filesize()]
  },
  {
    input: "./lib/index.js",
    output: {
      file: "./dist/fm-authn.umd.js",
      format: "umd"
    },
    name: "FMAuthN",
    plugins: []
  },
  {
    input: "./lib/index.js",
    output: {
      file: "./dist/fm-authn.min.js",
      format: "umd"
    },
    name: "FMAuthN",
    plugins: [uglify(), filesize()]
  },
  {
    input: "./lib/index.js",
    output: {
      file: "./dist/fm-authn.module.js",
      format: "es"
    },
    plugins: [filesize()]
  }
]
