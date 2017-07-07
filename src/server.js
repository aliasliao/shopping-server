const Koa = require('koa')
const send = require('koa-send')
const bodyParser = require('koa-bodyparser')
const { resolve, join } = require('path')
const router = require('./routes')
const fs = require('fs')

const pool = require('./DATABASE')


let app = new Koa()

const ROOT = resolve(__dirname, '../')  // project root
const PUBLIC = resolve(ROOT, './')  // serve static file here
const PORT = 3000

app.use(async (ctx, next) => {
    let body = []
    let request = ctx.req
    let bodyPromise = new Promise(resolve => {

        request.on('error', (err) => { console.log(err) })
            .on('data', (chunk) => { body.push(chunk) })
            .on('end', () => {
                body = body.length !== 0
                    ? Buffer.concat(body).toString()
                    : '[nobody]'
                resolve(body)
            })

    })
    body = await bodyPromise
    console.log(body)
    ctx.request.body = JSON.parse(body)
    await next()
})

//app.use(bodyParser({
//    enableTypes: ['json', 'form', 'text']
//}))

app.use(async (ctx, next) => {
    ctx.myLog = `[${new Date().toLocaleTimeString()}] ${ctx.method} ${decodeURI(ctx.path)} => `
    await next()
    console.log(ctx.myLog)
})

app.use(async (ctx, next) => {
    ctx.conn = await pool.getConnection()
    await next()
    await ctx.conn.release()
})

app.use(router.routes())

app.use(async (ctx) => {
    if (fs.existsSync(join(PUBLIC, ctx.path))) {
        await send(ctx, ctx.path, {root: PUBLIC})
    }
    else {
        if (ctx.body !== undefined)
            ctx.path = JSON.stringify(ctx.body).slice(0, 60) + '...'
        else
            ctx.path = 'not found'
    }

    ctx.myLog += decodeURI(ctx.path)
})

app.listen(PORT, () => {
    console.log(`\nKoa server is listening on port ${PORT}...\n`)
})