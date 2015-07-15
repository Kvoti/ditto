module.exports = {
    entry: './ditto/static/chat/js/base.js',
    output: {
        filename: 'ditto/static/chat/js/base-bundle.js'       
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                query: {
                    optional: ['es7.comprehensions', 'es7.classProperties'],
                }
            }
        ]
    }
};
