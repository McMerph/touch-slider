const webpack = require('webpack');
// const reloadPlugin = require('reload-html-webpack-plugin'); // Reload on html-changes
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    devtool: 'inline-source-map',
    devServer: {
        host: '0.0.0.0',
        disableHostCheck: true,
        hot: true,
        useLocalIp: true
    },
    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin()
        // new reloadPlugin() // Reload on html-changes
    ]
});
