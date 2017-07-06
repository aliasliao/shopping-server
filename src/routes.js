const Router = require('koa-router')
const pool = require('./DATABASE')
const utils = require('utility')

let router = new Router();

router
    .get('/', async (ctx, next) => {
        ctx.path = 'index.html'
        await next()
    })
    .get('/test', async (ctx, next) => {
        let conn = await pool.getConnection()
        let sql = 'SELECT * FROM `news`'
        let [rows] = await conn.query(sql).catch(err => { console.log('[@_@]' + err.message) })
        ctx.body = rows[0]
        await conn.release()
        await next()
    })

module.exports = router