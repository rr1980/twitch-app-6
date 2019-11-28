const path = require('path');

module.exports = {
    target: "electron-main",
    mode: 'development',
    node: {
        __dirname: false
    },
    entry: {
        "main": './src/main.ts',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                enforce: 'pre',
                loader: 'tslint-loader',
                options: {
                    typeCheck: true,
                    emitErrors: true
                }
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx', '.jsx', '.json']
    },
    devtool: 'source-map',
};