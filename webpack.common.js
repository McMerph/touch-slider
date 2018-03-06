const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');

module.exports = {
    entry: {
        app: './src/demo/index.ts'
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new HtmlWebpackPlugin({
                template: './src/demo/index.html'
            }
        ),
        new StyleLintPlugin({
            configFile: './.stylelintrc.json',
            context: 'src',
            files: '**/*.css',
            failOnError: false,
            quiet: false,
        })
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
            },
            {
                test: /\.ts$/,
                exclude: path.resolve(__dirname, "node_modules"),
                use: ['babel-loader', 'awesome-typescript-loader']
            }
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    }
};
