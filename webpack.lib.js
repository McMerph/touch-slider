const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const common = require('./webpack.common.js');

module.exports = merge(common, {
    entry: './src/lib/index.ts',
    devtool: 'source-map',
    plugins: [
        new CleanWebpackPlugin(['dist']),
        new UglifyJSPlugin({
            sourceMap: true
        }),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new CopyWebpackPlugin([
            {from: 'src/lib/index.d.ts'},
            {from: 'src/lib/index.css'}
        ])
    ],
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'slider.js',
        libraryTarget: 'umd',
        libraryExport: 'default',
        library: 'slider'
    }
});
