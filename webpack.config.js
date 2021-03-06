const webpack = require('webpack');
const path = require('path');

const config = {
    mode: 'production',
    entry: './src/App.jsx',
    output: {
        path: path.resolve(__dirname, '.'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.css$/,
                use: [{ loader: 'style-loader' }, { loader: 'css-loader' }]
            }
        ]
    }
};
module.exports = config;
