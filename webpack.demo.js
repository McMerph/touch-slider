const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const common = require('./webpack.common.js');

module.exports = merge(common, {
    entry: './src/demo/index.ts',
    devtool: 'inline-source-map',
    plugins: [
        new HtmlWebpackPlugin({
                template: './src/demo/index.html'
            }
        ),
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    // adds CSS to the DOM by injecting a <style> tag
                    {loader: 'style-loader'},
                    // interprets @import and url() like import/require() and will resolve them
                    {loader: 'css-loader'}
                ]
            }
        ]
    },
    devServer: {
        host: '0.0.0.0',
        disableHostCheck: true,
        hot: true,
        useLocalIp: true
    }
});
