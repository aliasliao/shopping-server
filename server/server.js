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

app.use(bodyParser({
    enableTypes: ['json', 'form', 'text']
}))

// initial log, conn, consumer id
app.use(async (ctx, next) => {
    ctx.conn = await pool.getConnection()
    ctx.consumerId = ctx.cookies.get('consumerId')  // TODO: check password here

    ctx.log = `[${new Date().toLocaleTimeString()}] ${ctx.method} ${decodeURI(ctx.path)}  [${ctx.consumerId}]
    [${ctx.request.headers['user-agent']}]
    ${JSON.stringify(ctx.request.body).slice(0,40)}... ==> `

    console.log('\n***********************************************')  // ensure this line is always top

    await next()

    await ctx.conn.release()
    console.log(ctx.log)
})

app.use(router.routes())

app.use(async (ctx) => {
    if (fs.existsSync(join(PUBLIC, ctx.path))) {
        await send(ctx, ctx.path, {root: PUBLIC})
    }
    else {
        if (ctx.body !== undefined)
            ctx.path = JSON.stringify(ctx.body).slice(0, 80) + '...'
        else
            ctx.path = 'not found'
    }

    ctx.log += decodeURI(ctx.path)
})

app.listen(PORT, () => {
    console.log(`\nKoa server is listening on port ${PORT}...\n`)
})