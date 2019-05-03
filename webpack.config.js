const path = require('path');
var CopyWebpackPlugin = require("copy-webpack-plugin")

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: [
          /node_modules/
       ]
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'index.bundle.js',
    path: path.resolve(__dirname, 'build')
  },
  plugins: [
    new CopyWebpackPlugin([
        {
            from: path.resolve(__dirname, "src/manifest.json"),
            to: path.resolve(__dirname, "build/manifest.json")
        },
        {
            from: path.resolve(__dirname, "src/img/"),
            to: path.resolve(__dirname, "build/img/")
        }
    ])
]
};
