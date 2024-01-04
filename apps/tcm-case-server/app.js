'use strict'

const Koa = require('koa')
const bodyParser = require('koa-bodyparser')()
const staticCache = require('koa-static-cache')
const cors = require('koa2-cors')
const helmet = require("koa-helmet")

const config = require('./config')
const publicRouter = require('./routes/public')
const { loggerMiddleware } = require('./middlewares/logger')
const { errorHandler, responseHandler } = require('./middlewares/response')
const { corsHandler } = require('./middlewares/cors')
const app = new Koa()
app.use(loggerMiddleware)

app.use(errorHandler)

app.use(bodyParser)
app.use(staticCache(config.publicDir, {
    gzip: false
}))
app.use(helmet())

app.use(cors(corsHandler))

app.use(publicRouter.routes(), publicRouter.allowedMethods())

app.use(responseHandler)

module.exports = app
