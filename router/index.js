const Router = require('koa-router')
const {ApolloServer, gql} = require('apollo-server-koa')
const schema = require('../schema/index')

const router = new Router()
const order = require('../controller/secondkill').index

// 首页
router.get('/', (ctx, next) => {
  ctx.body = '<h1 style="text-align:center">Hello App!</h1>'
})

// 用户登录
router.get('/form', (ctx, next) => {
  ctx.body = `
  <form action="/api" method="POST">
  <input type="text" name="username" placeholder="用户名"><br><br>
  <input type="text" name="password" placeholder="密码">
  <input type="submit" value="提交">
  </form>
  `
})

// 请求下单
router.post('/order', (ctx, next) => order(ctx))

module.exports = {
  Routes: router.routes(),
  allowedMethods: router.allowedMethods(),
  server: new ApolloServer({schema})
}
