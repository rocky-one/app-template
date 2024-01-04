'use strict'
const fs = require('fs');
const dayjs = require('dayjs');

const searchCase = {}

const findFilesByName = (filter) => {
  console.log(filter, dayjs(1704269696626), 33322)
  if (!filter.name && !filter.startDate && !filter.endDate) return []
  const root = process.cwd()
  const files = fs.readdirSync(`${root}/json`);
  let list = [];
  for (let i = 0; i < files.length; i++) {
    const dirName = files[i];
    const dirPath = `${root}/json/${dirName}`;
    const stat = fs.lstatSync(dirPath);
    if (stat.isDirectory()) {
      const files2 = fs.readdirSync(dirPath);
      for (let j = 0; j < files2.length; j++) {
        const json = require(`${dirPath}/${files2[j]}`);
          list.push({
          ...json,
          id: `${i}${j}`
        });
      }
    }
  }
  console.log(list, '00000')
  if (filter.name) {
    list = list.filter(item => item.name.indexOf(filter.name) > -1)
  }
  if (filter.startDate && filter.endDate) {
    list = list.filter(item => item.time > filter.startDate && item.time < filter.endDate)
  }
  return list;
}


searchCase.search = async (ctx, next) => {
  ctx.set('Content-Type', 'application/octet-stream');
  const body = ctx.request.query;
  ctx.result = findFilesByName(body)
  return next()
}




module.exports = searchCase
