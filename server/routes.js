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
            ctx.body = `${err.message}`
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
            ctx.body = `${err.message}`
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
        }

        let sql = 'SELECT `name`, `imageUrl`, `phone`, `address`, `accountNum`, `money`, `freeLimit` FROM ' +
            '`consumer` WHERE `id`=?'

        try {
            let [rows] = await ctx.conn.query(sql, ctx.consumerId)
            ctx.body = rows[0]
        } catch (err) {
            ctx.body = `${err.message}`
        }

        await next()
    })

    // consumer modify consumer info
    .post('/consumer/modifyInfo', async (ctx, next) => {
        if (ctx.consumerId === undefined) {
            ctx.body = 'no consumer logged in'
            await next()
            return
        }

        let formData = ctx.request.body

        let sql = 'UPDATE `consumer` SET `name`=?, `imageUrl`=?, `phone`=?, `address`=?, `accountNum`=?, `freeLimit`=? WHERE `id`=?'
        try {
            let data = [formData.name, formData.imageUrl, formData.phone, formData.address, formData.accountNum, formData.freeLimit, ctx.consumerId]
            await ctx.conn.query(sql, data)
            ctx.body = 'success'
        } catch (err) {
            ctx.body = `${err.message}`
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

        let sql = 'SELECT order.id, order.time, order.state, goods.id AS goodsId, goods.name AS goodsName, goods.imageUrl AS goodsImageUrl, goods.price AS goodsPrice, merchant.name AS merchantName ' +
            'FROM `order` ' +
            'INNER JOIN `merchant` ON order.merchantId=merchant.id ' +
            'INNER JOIN `goods` ON order.goodsId=goods.id ' +
            'WHERE order.consumerId=? ' +
            'ORDER BY order.time DESC'

        try {
            let [rows] = await ctx.conn.query(sql, [ctx.consumerId])
            rows.map(item => {
                item.time = moment(item.time).locale('zh-cn').fromNow()
                return item
            })
            ctx.body = rows
        } catch (err) {
            ctx.body = `${err.message}`
        }

        await next()
    })

    // consumer fetch goodsInfo with goods id
    .get('/consumer/goodsInfo/:goodsId', async (ctx, next) => {
        let goodsId = decodeURI(ctx.params.goodsId)

        let sql = 'SELECT goods.name AS goodsName, goods.price AS goodsPrice, goods.imageUrl AS goodsImageUrl, merchant.name AS merchantName ' +
            'FROM `goods` ' +
            'INNER JOIN `merchant` ON goods.merchantId=merchant.id ' +
            'WHERE goods.id=?'

        try {
            let [rows] = await ctx.conn.query(sql, [goodsId])
            ctx.body = rows[0]
        } catch (err) {
            ctx.body = `${err.message}`
        }

        await next()
    })

    // consumer make order
    .get('/consumer/makeOrder/:goodsId', async (ctx, next) => {
        if (ctx.consumerId === undefined) {
            ctx.body = 'no consumer logged in'
            await next()
            return
        }

        let goodsId = decodeURI(ctx.params.goodsId)

        let getGoodsInfoSql = 'SELECT `merchantId`, `price` FROM `goods` WHERE `id`=?'
        let getConsumerInfoSql = 'SELECT `money`, `freeLimit` FROM `consumer` WHERE `id`=?'
        let updateOrderSql = 'INSERT INTO `order` ' +
            '(`id`, `consumerId`, `goodsId`, `merchantId`, `time`) ' +
            'VALUES (?, ?, ?, ?, ?)'
        let updateConsumerSql = 'UPDATE `consumer` SET `money`=? WHERE `id`=?'
        let updateMerchantSql = 'UPDATE `merchant` SET `money`=`money`+? WHERE `id`=?'

        try {
            let [goodsRows] = await ctx.conn.query(getGoodsInfoSql, [goodsId])
            let merchantId = goodsRows[0].merchantId
            let goodsPrice = goodsRows[0].price

            let [consumerRows] = await ctx.conn.query(getConsumerInfoSql, [ctx.consumerId])
            let consumerMoney = consumerRows[0].money
            let consumerFreeLImit = consumerRows[0].freeLimit

            if (goodsPrice > consumerMoney) {
                ctx.body = '账户余额不足，请即时充值！'
            }
            else if (goodsPrice > consumerFreeLImit) {
                ctx.body = '商品价格超过免密额度！'
            }
            else {
                await ctx.conn.query(updateOrderSql, [
                    'orde' + utils.randomString(4, '1234567890'),
                    ctx.consumerId,
                    goodsId,
                    merchantId,
                    moment().format('YYYY-MM-DD HH:mm:ss')  // HH means 24 hour time, hh means 12 hour time.
                ])

                await ctx.conn.query(updateConsumerSql, [consumerMoney-goodsPrice, ctx.consumerId])
                await ctx.conn.query(updateMerchantSql, [goodsPrice, merchantId])

                ctx.body = '下单成功！'
            }
        } catch (err) {
            ctx.body = `${err.message}`
        }

        await next()
    })

    // merchant register
    .post('/merchant/register', async (ctx, next) => {
        let formData = ctx.request.body
        let sql = 'INSERT INTO `merchant` (`id`, `name`, `password`, `email`, `phone`, `accountNum`) ' +
            'VALUES (?, ?, ?, ?, ?, ?)'

        let body = {}

        let data, result
        try {
            data = [
                'merc' + utils.randomString(4, '1234567890'),
                formData.name,
                utils.md5(formData.password),
                formData.email,
                formData.phone,
                formData.accountNum,
            ]

            result = await ctx.conn.query(sql, data)
        } catch (err) {
            body.status = err.message
        }

        let maxAge = moment.duration(3, 'hours').asMilliseconds()
        if (result) {
            body.status = 'success'
            body.id = data[0]
            ctx.cookies.set('merchantId', data[0], {maxAge: maxAge})
                .set('hp', data[2], {maxAge: maxAge})
        }

        ctx.body = body

        await next()
    })

    // merchant login
    .post('/merchant/login', async (ctx, next) => {
        let formData = ctx.request.body
        let sql = 'SELECT `id`, `password`, `imageUrl` FROM `merchant` WHERE `name`=?'

        if (formData.name === undefined || formData.password === undefined) {
            ctx.body.status = '用户信息不完整'
            await next()
            return
        }

        let body = {}

        let rows
        try {
            ;[rows] = await ctx.conn.query(sql, [formData.name])
        } catch (err) {
            body.status = err.message
        }

        let maxAge = moment.duration(3, 'hours').asMilliseconds()
        if (rows.length > 0) {
            let hp = utils.md5(formData.password)
            if (rows[0].password === hp) {
                body.status = 'success'
                body.id = rows[0].id
                body.imageUrl = rows[0].imageUrl
                ctx.cookies.set('merchantId', rows[0].id, {maxAge: maxAge})
                    .set('hp', hp, {maxAge: maxAge})
            }
            else {
                body.status = '密码错误！'
            }
        }
        else {
            body.status = '商家名不存在！'
        }

        ctx.body = body

        await next()
    })


    // merchant check state
    .get('/merchant/checkState', async (ctx, next) => {
        let body = {}

        if (ctx.merchantId === undefined) {
            body.status = 'not loggedIn'
        }
        else {
            body.status = 'loggedIn'

            let sql = 'SELECT `name`, `imageUrl` FROM `merchant` WHERE `id`=?'
            try {
                let [rows] = await ctx.conn.query(sql, [ctx.merchantId])

                body.id = ctx.merchantId
                body.name = rows[0].name
                body.imageUrl = rows[0].imageUrl
            } catch (err) {
                body.status = err.message
            }
        }

        ctx.body = body

        await next()
    })


    // merchant logout
    .get('/merchant/logout', async (ctx, next) => {
        if (ctx.merchantId !== undefined) {
            ctx.cookies.set('merchantId')
            ctx.body = 'success'
        }
        else {
            ctx.body = '没有商家登录'
        }
    })

    // merchant fetch order list
    .get('/merchant/order', async (ctx, next) => {
        if (ctx.merchantId === undefined) {
            ctx.body = 'no merchant logged in'
            await next()
            return
        }

        // id, time, state, goodsId, goodsName, goodsImageUrl, goodsPrice, consumerId
        let sql = 'SELECT order.id, order.time, order.state, goods.id AS goodsId, goods.name AS goodsName, goods.imageUrl AS goodsImageUrl, goods.price AS goodsPrice, consumer.id AS consumerId ' +
            'FROM `order` ' +
            'INNER JOIN `consumer` ON order.consumerId=consumer.id ' +
            'INNER JOIN `goods` ON order.goodsId=goods.id ' +
            'WHERE order.merchantId=? ' +
            'ORDER BY order.time DESC'

        try {
            let [rows] = await ctx.conn.query(sql, [ctx.merchantId])
            rows.map(item => {
                item.time = moment(item.time).locale('zh-cn').fromNow()
                return item
            })
            ctx.body = rows
        } catch (err) {
            ctx.body = err.message
        }

        await next()
    })

    // merchant modify order state
    .post('/merchant/updateOrder', async (ctx, next) => {
        if (ctx.merchantId === undefined) {
            ctx.body = 'no merchant logged in'
            await next()
            return
        }

        let formData = ctx.request.body

        let sql = 'UPDATE `order` SET `state`=? WHERE `id`=?'

        try {
            await ctx.conn.query(sql, [formData.state, formData.id])
            ctx.body = 'success'
        } catch (err) {
            ctx.body = err.message
        }
    })

    // merchant fetch info
    .get('/merchant/info', async (ctx, next) => {
        if (ctx.merchantId === undefined) {
            ctx.body = 'no merchant logged in'
            await next()
            return
        }

        let sql = 'SELECT * FROM `merchant` WHERE `id`=?'  // TODO: password!

        try {
            let [rows] = await ctx.conn.query(sql, [ctx.merchantId])
            ctx.body = rows[0]
        } catch (err) {
            ctx.body = err.message
        }

        await next()
    })

    // merchant modify info
    .post('/merchant/modifyInfo', async (ctx, next) => {
        if (ctx.merchantId === undefined) {
            ctx.body = 'no merchant logged in'
            await next()
            return
        }

        let formData = ctx.request.body

        let sql = 'UPDATE `merchant` SET `password`=?, `accountNum`=?, `imageUrl`=?, `email`=?, `phone`=? ' +
            'WHERE `id`=?'

        try {
            let data = [
                utils.md5(formData.password),
                formData.accountNum,
                formData.imageUrl,
                formData.email,
                formData.phone,
                ctx.merchantId
            ]

            await ctx.conn.query(sql, data)
            ctx.body = 'success'
        } catch (err) {
            ctx.body = err.message
        }

        await next()
    })

    // merchant add goods
    .post('/merchant/addGoods', async (ctx, next) => {
        if (ctx.merchantId === undefined) {
            ctx.body = 'no merchant logged in'
            await next()
            return
        }

        let formData = ctx.request.body

        let sql = 'INSERT INTO `goods` (`id`, `merchantId`, `name`, `price`, `imageUrl`) ' +
            'VALUES (?, ?, ?, ?, ?)'

        try {
            let data = [
                'good' + utils.randomString(4, '1234567890'),
                ctx.merchantId,
                formData.name,
                formData.price,
                formData.imageUrl
            ]

            await ctx.conn.query(sql, data)
            ctx.body = 'success'
        } catch (err) {
            ctx.body = err.message
        }

        await next()
    })

    // merchant modify goods  // TODO: finish this if good mood




module.exports = router