'use strict'

const Router = require('koa-router');
const controllers = require('../controllers');

const router = new Router();
router.prefix('/api');

router.get('/test', controllers.test.test);
router.post('/create-case', controllers.createCase.createCase);
router.post('/update-case', controllers.createCase.updateCase);
router.get('/search-case', controllers.searchCase.search);

module.exports = router;
