const path = require('path');

module.exports = {
  context: path.resolve(__dirname, 'src/javascripts'),
  entry: {
    topic: './topic/index.jsx',
  },
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: '[name].js',
  },
}
