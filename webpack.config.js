// @ts-check
/* eslint-disable @typescript-eslint/no-var-requires */

'use strict';

const path = require('path');

const pkg = require('./package.json');

const isProduction = process.env.NODE_ENV === 'production';

/** @type {import('webpack').Configuration} */
const config = {
  target: 'node',
  mode: isProduction ? 'production' : 'none',
  entry: './src/extension.ts',
  output: {
    path: path.dirname(path.resolve(__dirname, pkg.main)),
    filename: path.basename(pkg.main),
    libraryTarget: 'commonjs2',
  },
  devtool: isProduction ? 'hidden-source-map' : 'nosources-source-map',
  externals: {
    vscode: 'commonjs vscode',
    '@commitlint/lint': 'commonjs2 @commitlint/lint',
    '@commitlint/load': 'commonjs2 @commitlint/load',
    '@commitlint/parse': 'commonjs2 @commitlint/parse',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
};

module.exports = config;
