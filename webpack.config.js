var webpack = require('webpack');

module.exports = {
    entry: {
        'aframe-spritesheet-component': './index.js',
        'aframe-spritesheet-component.min': './index.js',
    },
    output: {
        path: './dist',
        filename: '[name].js',
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            minimize: true
        })
    ],
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            }
        ]
    },
};