module.exports = {
  entry: './src/charcoal.js',
  node: {
      fs: 'empty',
  },
  output: {
    filename: './dist/charcoal.js'
  },
  module: {
         loaders: [{
             test: /\.js$/,
             exclude: /node_modules/,
             loader: 'babel-loader'
         }]
     }
}