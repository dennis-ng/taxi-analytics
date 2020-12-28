require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const app = express()

let port = process.env.PORT || 8080

app.use(helmet())
app.use(bodyParser.json())
/* API Routes */
let routes   = require('./app/routes')
app.use('/', routes)

app.listen(port, () => console.log(`App listening on port ${port}...`))

module.exports = app