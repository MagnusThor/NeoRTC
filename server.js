const express = require('express')
const app = express()
const https = require('https')
const fs = require('fs')
const port = 8443

app.use('/',express.static('.'));

const httpsOptions = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
}
const server = https.createServer(httpsOptions, app).listen(port, () => {
  console.log('server running at ' + port)
})