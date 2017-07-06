const Koa = require('koa')
const send = require('koa-send')
const bodyParser = require('koa-bodyparser')
const { resolve, join } = require('path')
const router = require('./routes')
const fs = require('fs')

let app = new Koa()

const ROOT = resolve(__dirname, '../')  // project root
const PUBLIC = resolve(ROOT, './')  // serve static file here
const PORT = 3000

app.use(bodyParser({
    enableTypes: ['json', 'form', 'text']
}))

app.use(async (ctx, next) => {
    ctx.myLog = `[${new Date().toLocaleTimeString()}] ${ctx.method} ${decodeURI(ctx.path)} => `
    await next()
    console.log(ctx.myLog)
})

app.use(router.routes())

app.use(async (ctx) => {
    if (fs.existsSync(join(PUBLIC, ctx.path))) {
        await send(ctx, ctx.path, {root: PUBLIC})
    }
    else {
        ctx.path = JSON.stringify(ctx.body).slice(0, 20) + '...'
    }

    ctx.myLog += decodeURI(ctx.path)
})

app.listen(PORT, () => {
    console.log(`\nKoa server is listening on port ${PORT}...\n`)
})