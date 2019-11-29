const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


module.exports = (env, argv) => {
    console.log("renderer:", argv.mode || 'develop');
    const isProd = (argv.mode === 'production' );

    return {
        target: "electron-renderer",
        mode: 'development',
        watch: isProd ? false : true,
        node: {
            __dirname: false
        },
        entry: {
            "renderer": './src/renderer/renderer.ts',
            "site": './src/renderer/site.css'
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
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                hmr: !isProd,
                            },
                        },
                        'css-loader',
                    ],
                },
            ],
        },
        resolve: {
            extensions: ['.js', '.ts', '.tsx', '.jsx', '.json']
        },
        plugins: [
            new MiniCssExtractPlugin(),
            new HtmlWebpackPlugin(
                {
                    filename: 'index.html',
                    template: 'src/renderer/index.html'
                }
            )
        ],
         devtool: 'source-map'
    }
};