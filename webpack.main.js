const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env, argv) => {
    console.log("main:", argv.mode || 'develop');
    const isProd = (argv.mode === 'production' );

    return {
        target: "electron-main",
        mode: 'development',
        watch: false,
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
        plugins: [
            new CleanWebpackPlugin()
        ],
        devtool: 'source-map'
    }
};