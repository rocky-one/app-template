'use strict'

const path = require('path')

module.exports = {
  port: '8086',
  secret: 'secret',
  publicDir: path.resolve(__dirname, './public'),
  logPath: path.resolve(__dirname, './logs/koa-template.log'),
  mongoDB: {
    database: 'ai',
    username: 'ai',
    password: 'smileAa.12',
    host: '101.43.209.196',
    port: 27017
  }
}
