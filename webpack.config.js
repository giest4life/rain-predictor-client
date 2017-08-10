const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: {
        app: "./src/index.js"
    },
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "dist")
    },
    devtool: "inline-source-map",
    devServer: {
        contentBase: "./dist",
        compress: true,
        port: 9000,
        proxy: {
            "/api": {
                target: "http://localhost:8080/rain-predictor"
            }
        }
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    "css-loader"
                ]
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            jQuery: "jquery",
            $: "jquery",
            jquery: "jquery",
            Tether: "tether",
            typeahead: "typeahead"
        }),
        new HtmlWebpackPlugin({
            template: "index.html",
            indject: "body"
        })
    ]
};
