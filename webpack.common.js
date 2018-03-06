const path = require('path');
const StyleLintPlugin = require('stylelint-webpack-plugin');

module.exports = {
    plugins: [
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
