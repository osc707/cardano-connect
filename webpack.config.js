const path = require('path');

module.exports = {
  entry: './src/cardano-connect.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'cardano-connect.js',
  },
  experiments: {
    asyncWebAssembly: true,
  }
};