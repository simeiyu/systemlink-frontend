const express = require('express')
const path = require('path')
const {createProxyMiddleware} = require('http-proxy-middleware');
const app = express()
// app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, '../../dist')))
app.use(createProxyMiddleware('/systemlink', {
  target: 'http://10.88.36.131:8080/',
  ws: true,
  changeOrigin: true
},));


app.listen(8086, () => console.log('app listening on port 8086!'))
