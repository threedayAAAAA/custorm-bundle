const path = require("path");
const { bundle } = require("bundle");

bundle({
  input: path.resolve(__dirname, "index.js"),
  output: {
    format: "es",
    filename: "builded.js",
  },
});