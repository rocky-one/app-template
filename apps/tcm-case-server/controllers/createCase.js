'use strict'
const fs = require('fs');
const dayjs = require('dayjs');

const createCase = {};

createCase.createCase = async (ctx, next) => {
  ctx.set('Content-Type', 'application/octet-stream');
  const body = { ...ctx.request.body };
  const time = new Date().getTime();
  const date = dayjs().format('YYYY-MM-DD');
  const fileName = `${time}-${body.name}`;
  const root = process.cwd()
  if (!fs.existsSync(`${root}/json/${date}`)) {
    fs.mkdirSync(`${root}/json/${date}`);
  }
  body.date = date;
  body.time = time;
  fs.writeFileSync(`${root}/json/${date}/${fileName}.json`, JSON.stringify(body, null, '\t'), 'utf8');
  ctx.result = body;
  return next();
}

createCase.updateCase = async (ctx, next) => {
  ctx.set('Content-Type', 'application/octet-stream');
  const body = { ...ctx.request.body };
  const fileName = `${body.time}-${body.name}`;
  const root = process.cwd()
  if (body.name !== body.oldName) {
    fs.renameSync(`${root}/json/${body.date}/${fileName}.json`, `${root}/json/${body.date}/${body.name}.json`);
  }
  fs.writeFileSync(`${root}/json/${body.date}/${fileName}.json`, JSON.stringify(body, null, '\t'), 'utf8');
  ctx.result = body;
  return next();
}

module.exports = createCase;
