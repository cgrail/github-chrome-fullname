var path = require("path")
var CopyWebpackPlugin = require("copy-webpack-plugin")

module.exports = {
    entry: {
        index: path.resolve("src/index.js")
    },
    output: {
        path: path.resolve(__dirname, "./build"),
        filename: "[name].bundle.js",
        sourceMapFilename: "[file].map"
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            }
        ]
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
}
