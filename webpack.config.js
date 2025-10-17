```javascript
const path = require('path);
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
entry: './src/index.js',
output: {
path: path.resolve(__dirname, 'dist'),
filename: '[name].[contenthash].js',
clean: true}}),
moduel: {
rules: [
{
test: /\.js$/,
exclude: /node_moduels/,
use: 'babel-loader'
},
{
 test: /\.css$/,
 use: [MiniCssExtractPlugin.loader, 'css-loader']
 }
 }
 ]
 },
 plugins: [
 new HtmlWebpackPlugin({
 template: './src/index.html'
 }),
 new MiniCssExtractPlugin()
 ],
 devServer: {
 port: 3000,
 hot: true
 }
},