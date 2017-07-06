const Router = require('koa-router')
const utils = require('utility')
const moment = require('moment')

let router = new Router();

router
    .get('/', async (ctx, next) => {
        ctx.path = 'index.html'
        await next()
    })
    .get('/test', async (ctx, next) => {
        let sql = 'SELECT `title`, `abstract`, `url`, `image`, `time` FROM `news` ORDER BY `time` DESC LIMIT 30'
        let [rows] = await ctx.conn.query(sql).catch(err => { console.log('[@_@]' + err.message) })
        let adjust = rows.map(item => ({
            title: item.title,
            abstract: item.abstract,
            contentUrl: item.url,
            imageUrl: item.image,
            time: moment(item.time).locale('zh-cn').fromNow()
        }))
        ctx.body = adjust
        await next()
    })

module.exports = router