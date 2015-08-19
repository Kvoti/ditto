var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');
var path = require("path");

module.exports = {
    context: __dirname,
    
    entry: [
        './ditto/static/chat/js/base.js',
    ],
    
    output: {
        path: path.resolve('./ditto/static/dist'),
        publicPath: '/static/dist/', // This will override the url generated by django's staticfiles
        filename: "[name]-[hash].js",
    },

    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loaders: ["babel-loader?optional[]=es7.comprehensions&optional[]=es7.classProperties&optional[]=es7.objectRestSpread&optional[]=es7.decorators"],
            }
        ]
    },
    plugins: [
        new BundleTracker({filename: './webpack-stats-prod.json'}),

        // removes a lot of debugging code in React
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }}),

        // keeps hashes consistent between compilations
        new webpack.optimize.OccurenceOrderPlugin(),

        // minifies your code
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
                warnings: false
            }
        })
    ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
};
