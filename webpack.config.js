var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');
var path = require("path");

module.exports = {
  context: __dirname,
  
  entry: [
    'webpack-dev-server/client?http://0.0.0.0:3000', // WebpackDevServer host and port
    'webpack/hot/only-dev-server',
    './ditto/static/chat/js/base.js',
  ],
  
  output: {
    path: path.resolve('./ditto/static/bundles/'),
    filename: "[name]-[hash].js",
    publicPath: 'http://localhost:3000/assets/bundles/', // Tell django to use this URL to load packages and not use STATIC_URL + bundle_name
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ["react-hot", "babel-loader?optional[]=es7.comprehensions&optional[]=es7.classProperties&optional[]=es7.objectRestSpread&optional[]=es7.decorators"],
        include: [path.join(__dirname, 'ditto/static')]
      },
      // installing a dev package with npm link breaks hot loader, not sure why. So split it out here to main code above can still be hot loaded
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ["babel-loader?optional[]=es7.comprehensions&optional[]=es7.classProperties&optional[]=es7.objectRestSpread&optional[]=es7.decorators"],
        include: [path.join(__dirname, '../lib')]
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new BundleTracker({filename: './webpack-stats.json'}),
  ],
  resolve: {
    fallback: path.join(__dirname, 'node_modules'),
    extensions: ['', '.js', '.jsx']
  }
};
