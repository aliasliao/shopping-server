const Router = require('koa-router')
const utils = require('utility')

let router = new Router();

router
    .get('/', async (ctx, next) => {
        ctx.path = 'index.html'
        await next()
    })
    .get('/test', async (ctx, next) => {
        let sql = 'SELECT * FROM `news`'
        let [rows] = await ctx.conn.query(sql).catch(err => { console.log('[@_@]' + err.message) })
        ctx.body = rows
        await next()
    })

module.exports = router