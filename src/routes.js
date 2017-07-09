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
        let sql = 'INSERT INTO `consumer` ' +
            '(`id`, `name`, `password`, `address`, `accountNum`, `phone`, `email`) ' +
            'VALUES (?, ?, ?, ?, ?, ?, ?)'

        let data, result
        try {
            data = [
                'cons' + utils.randomString(4, '1234567890'),
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

        let maxAge = moment.duration(3, 'hours').asMilliseconds()
        if (result) {
            ctx.body = 'success'
            ctx.cookies.set('consumerId', data[0], {maxAge: maxAge})
                .set('hp', data[2], {maxAge: maxAge})
        }

        await next()
    })

    // consumer login
    .post('/consumer/login', async (ctx, next) => {
        let formData = ctx.request.body
        let sql = 'SELECT `id`, `password` FROM `consumer` WHERE `name`=?'

        if (formData.name === undefined || formData.password === undefined) {
            ctx.body = '用户信息不完整'
            await next()
            return
        }

        let rows
        try {
            ;[rows] = await ctx.conn.query(sql, [formData.name])
        } catch (err) {
            ctx.body = `[${err.code}] ${err.message}`
        }

        let maxAge = moment.duration(3, 'hours').asMilliseconds()
        if (rows.length > 0) {
            let hp = utils.md5(formData.password)
            if (rows[0].password === hp) {
                ctx.body = 'success'
                ctx.cookies.set('consumerId', rows[0].id, {maxAge: maxAge})
                    .set('hp', hp, {maxAge: maxAge})
            }
            else {
                ctx.body = '密码错误！'
            }
        }
        else {
            ctx.body = '用户名不存在！'
        }

        await next()
    })

    // fetch consumer info
    .get('/consumer/info', async (ctx, next) => {
        if (ctx.consumerId === undefined) {
            ctx.body = 'no consumer logged in'
            await next()
            return
            //ctx.consumerId = 'user3821'
        }

        let sql = 'SELECT `name`, `imageUrl`, `phone`, `address`, `accountNum`, `money`, `freeLimit` FROM ' +
            '`consumer` WHERE `id`=?'

        try {
            let [rows] = await ctx.conn.query(sql, ctx.consumerId)
            ctx.body = rows[0]
        } catch (err) {
            ctx.body = `[${err.code}] ${err.message}`
        }

        await next()
    })

    // consumer modify consumer info
    .post('/consumer/modifyInfo', async (ctx, next) => {
        if (ctx.consumerId === undefined) {
            ctx.body = 'no consumer logged in'
            await next()
            return
            //ctx.consumerId = 'user3821'
        }

        let formData = ctx.request.body

        let sql = 'UPDATE `consumer` SET `name`=?, `imageUrl`=?, `phone`=?, `address`=?, `accountNum`=?, `freeLimit`=? WHERE `id`=?'
        try {
            let data = [formData.name, formData.imageUrl, formData.phone, formData.address, formData.accountNum, formData.freeLimit, ctx.consumerId]
            await ctx.conn.query(sql, data)
            ctx.body = 'success'
        } catch (err) {
            ctx.body = `[${err.code}] ${err.message}`
        }

        await next()
    })

    // consumer fetch order list
    .get('/consumer/order', async (ctx, next) => {
        if (ctx.consumerId === undefined) {
            ctx.body = 'no consumer logged in'
            await next()
            return
        }

        let sql = 'SELECT order.id, order.time, order.state, goods.name AS goodsName, goods.imageUrl AS goodsImageUrl, goods.price AS goodsPrice, merchant.name AS merchantName ' +
            'FROM `order` ' +
            'INNER JOIN `merchant` ON order.merchantId=merchant.id ' +
            'INNER JOIN `goods` ON order.goodsId=goods.id ' +
            'WHERE order.consumerId=?'

        try {
            let [rows] = await ctx.conn.query(sql, [ctx.consumerId])
            ctx.body = rows
        } catch (err) {
            ctx.body = `[${err.code}] ${err.message}`
        }

        await next()
    })

    // consumer fetch goodsInfo with goods id
    .get('/consumer/goodsInfo/:goodsId', async (ctx, next) => {
        let goodsId = decodeURI(ctx.params.goodsId)
        goodsId = goodsId.slice(0, 8)  // TODO: hack here
        console.log(goodsId.length)
        console.log(goodsId === 'good0000')

        let sql = 'SELECT goods.name AS goodsName, goods.price AS goodsPrice, goods.imageUrl AS goodsImageUrl, merchant.name AS merchantName ' +
            'FROM `goods` ' +
            'INNER JOIN `merchant` ON goods.merchantId=merchant.id ' +
            'WHERE goods.id=?'
        console.log(sql)

        try {
            let [rows] = await ctx.conn.query(sql, [goodsId])
            ctx.body = rows[0]
        } catch (err) {
            ctx.body = `[${err.code}] ${err.message}`
        }

        await next()
    })

    // consumer make order
    .post('/consumer/makeOrder', async (ctx, next) => {

    })

module.exports = router