const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');

module.exports = {
    entry: {
        app: './src/index.ts'
    },
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new HtmlWebpackPlugin({
                template: './src/index.html'
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
                    {loader: 'style-loader'},// adds CSS to the DOM by injecting a <style> tag
                    {loader: 'css-loader'} // interprets @import and url() like import/require() and will resolve them
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
