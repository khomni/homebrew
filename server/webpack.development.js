require("dotenv").config();

const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");

const APP_DIR = path.join(__dirname, "/src");
const BUILD_DIR = path.join(__dirname, "/public/javascripts");

module.exports = merge(common, {
  mode: "development",
  plugins: [],
  watch: true
});
