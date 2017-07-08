const Router = require('koa-router')
const utils = require('utility')
const moment = require('moment')
const newsPool = require('./NEWSDATA')


let router = new Router();

router
    .get('/', async (ctx, next) => {
        ctx.path = 'index.html'
        await next()
    })
    .get('/test', async (ctx, next) => {
        let sql = 'SELECT `title`, `abstract`, `url`, `image`, `time` FROM `news` ORDER BY `time` DESC LIMIT 30'
        let newsConn = await newsPool.getConnection()
        let [rows] = await newsConn.query(sql).catch(err => { console.log('[@_@]' + err.message) })
        let adjust = rows.map(item => ({
            title: item.title,
            abstract: item.abstract,
            contentUrl: item.url,
            imageUrl: item.image,
            time: moment(item.time).locale('zh-cn').fromNow()
        }))
        ctx.body = adjust

        await newsConn.release()
        await next()
    })

    // consumer register
    .post('/consumer/register', async(ctx, next) => {
        let formData = ctx.request.body
        console.log('\n' + JSON.stringify(formData))
        let sql = 'INSERT INTO `consumer` ' +
            '(`id`, `name`, `password`, `address`, `accountNum`, `phone`, `email`)' +
            'VALUES (?, ?, ?, ?, ?, ?, ?)'

        let data, result
        try {
            data = [
                'user' + utils.randomString(4, '1234567890'),
                formData.name,
                utils.md5(formData.password),
                formData.address,
                formData.accountNum,
                formData.phone,
                formData.email
            ]

            result = await ctx.conn.query(sql, data)
        } catch(err) {
            ctx.body = `[${err.code}] ${err.message}`
        }

        if (result) {
            ctx.body = 'success'
            ctx.cookies.set('consumerId', data[0])
            ctx.cookies.set('hp', data[2])
        }

        await next()
    })

    // consumer login
    .post('/consumer/login', async (ctx, next) => {
        let formData = ctx.request.body
        console.log(JSON.stringify(formData))
        let sql = 'SELECT `id`, `password` FROM `consumer` WHERE `name`=?'

        if (formData.name === undefined || formData.password === undefined) {
            ctx.body = 'information not complete'
            await next()
            return
        }

        let rows
        try {
            ;[rows] = await ctx.conn.query(sql, [formData.name])
        } catch (err) {
            ctx.body = `[${err.code}] ${err.message}`
        }

        if (rows.length > 0) {
            let hp = utils.md5(formData.password)
            if (rows[0].password === hp) {
                ctx.body = 'success'
                ctx.cookies.set('consumerId', rows[0].id)
                ctx.cookies.set('hp', hp)
            }
            else {
                ctx.body = 'wrong password'
            }
        }
        else {
            ctx.body = 'consumer name not exist'
        }

        await next()
    })

    // fetch consumer info
    .get('/consumer/info', async (ctx, next) => {
        if (ctx.consumerId === undefined) {
            ctx.body = 'no consumer logged in'
            //await next()
        }

        let sql = 'SELECT `name`, `imageUrl`, `phone`, `address`, `accountNum`, `money`, `freeLimit` FROM' +
            '`consumer` WHERE `id`=?'

        try {
            let [rows] = await ctx.conn.query(sql, ['user3821'])  // TODO: consumerId here
            ctx.body = rows[0]
        } catch (err) {
            ctx.body = `[${err.code}] ${err.message}`
        }

        await next()
    })

module.exports = router