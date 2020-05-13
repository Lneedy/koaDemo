const Koa = require('koa')
const {Routes, allowedMethods, server} = require('./router')
const Static = require('koa-static')
const BodyParser = require('koa-bodyparser')
const CORS = require('koa2-cors')
const {url, port} = require('./config/dev.config')
const redisConn = require('./lib/redis')
const mysqlConn = require('./lib/mysql')
const amqpConn = require('./lib/amqp')
const log = require('./lib/index').log
const error = require('./lib/index').error
const app = new Koa()

// redis 监听错误
redisConn.on('error', (err) => {
  error('[redis Error] - ', err)
})

// 监听消息进行消费
amqpConn.on('ready', () => {
  log('[amqp ready]')
  amqpConn.queue('orderQueue', {
    durable: true, // 持久化
    autoDelete: false // 自动清除被消费的消息
  }, (queue) => {
    // 连接数据库
    mysqlConn.connect()
    // 订阅
    queue.subscribe((msg, header, deliveryInfo) => {
      if (msg.data) {
        let message = msg.data.toString()
        let data = JSON.parse(message)
        let sql = 'select * from `address` where `id`=' + parseInt(data.address) + 'and `user_id` = ' + data.user_id

        // 数据库执行查询sql
        mysqlConn.query(sql, (err, result) => {
          if (err) {
            error('[select address Error] - ', err.message)
            return
          }
          // 如果有结果
          if (result) {
            data.address = JSON.stringify(result[0])
            // 插入订单
            let { user_id, orderno, goods_id, address, status, amount, ip, express, invoice, message, create_time, update_time} = data
            let sql = 'insert into `order` (`user_id`, `orderno`, `goods_id`, `address`, `amount`, `ip`, `express`, `invoice`, `message`, `create_time`, `update_time`) value ( ?,?,?,?,?,?,?,?,?,?,?)'
            let params = [user_id, orderno, goods_id, address, status, amount, ip, express, invoice, message, create_time, update_time]
            mysqlConn.query(sql, params, (err, result) => {
              if (err) {
                error('[insert order Error] - ' , err.message)
                return
              } else {
                // 操作库存
                let sql = 'update `goods` set `stock` = `stock` - 1, `sold` = `sold` + 1 where `id` = ?'
                let params = [goods_id]
                mysqlConn.query(sql, params, (err, result) => {
                  if (err) {
                    error('[update goods stock Error] - ', err.message)
                    return
                  }
                  // 关闭数据库连接
                  mysqlConn.end()
                })
              }
            })
          }
        })
      }
    })
  })
})

const CorsOptions = {
  origin: ctx => {
    if (ctx.url === '/test') return false
    return '*'
  },
  exposeHeaders: ['linzexin-Authenticate'],
  maxAge: 1800,
  credentails: true,
  allowMethods: ['GET', 'POST', 'DELETE', 'PUT', ' PATCH', 'HEAD'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept']
}

app
  .use(BodyParser())
  .use(CORS(CorsOptions))
  .use(Static(__dirname + '/public'))
  .use(Routes)
  .use(allowedMethods)
  .use(async (ctx, next) => {
    const start = Date.now()
    await next()
    const ms = Date.now() - start
    ctx.set('X-Response-Time', `${ms}ms`)
  })
  .use(async (ctx, next) => {
    const start = Date.now()
    await next()
    const ms = Date.now() - start
    log(`${ctx.method} ${ctx.url} - ${ms}ms`)
  })

app.on('error', err => {
  error('server error', err)
})
server.applyMiddleware({app})
app.listen({port: port.default}, () =>
  log(`The Server is listen to ${url}`)
)
