'use strict'
const test = {}

test.test = async (ctx, next) => {
  // ctx.set('Content-Type', 'application/octet-stream');
  ctx.result = {
    name: 'hello'
  }
  return next()
}

module.exports = test
