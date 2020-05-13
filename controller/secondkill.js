const redisConn  = require('../lib/redis')
const amqpConn  = require('../lib/amqp')
const jsonRes = require('../lib/index').jsonRes
const error = require('../lib/index').error
const log = require('../lib/index').log

// 获取用户id
const getUserId = (ctx, token, callBack) => {
  if (!token) {
    jsonRes(ctx, 500, '身份证验证失败')
  } else {
    return redisConn.get(token, (err, tokenInfo) => {
      if (err) {
        error('[getUserId Error] - ', err)
      } else {
        if (!tokenInfo) {
          jsonRes(ctx, 500, '身份验证失败, 请重新登录')
        } else {
          let user_id = JSON.parse(tokenInfo).id
          callBack(user_id)
        }
      }
    })
  }
}

// 生成订单号
const getOrderNo = () => {
  let date = new Date()
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  let hour = date.getHours()
  let min = date.getMinutes()
  let sec = date.getSeconds()
  if (month >= 1 && month <= 9) {
    month = '0' + month
  }
  if (day >= 0 && day <= 9) {
    day = '0' + day
  }
  return year + month + day + hour + min + sec + Math.floor(Math.random() * 10000) + ''
}

// 发布下单消息
const publishOrderMsg = (ctx, data) => {
  if (amqpConn) {
    amqpConn.publish('orderQueue', JSON.stringify(data))
  }
}

// 主入口
const index = (ctx) => {
  let { goods_id ='', address_id='', express= '', invoice = '', message= ''} = ctx.request.body
  let id = goods_id
  let token = ctx.request.get('LINZEXIN_TOKEN') || ''
  if (!address_id) {
    jsonRes(ctx, 500, '请选择一个收货地址')
  } else {
    getUserId(ctx, token, (user_id) => {
      let goods_key = 'goods:' + goods_id
      redisConn.get(goods_key, (err, goods) => {
        if (err) {
          error('[getGoodsKey Error] - ', err)
        } else {
          goods = JSON.parse(goods)
          if (goods == null) {
            jsonRes(ctx, '404', '404')
          } else {
            // 秒杀时间
            let time = Date.parse(new Date()) + ''
            time = parseInt(time.substr(0, 10))
            if (goods.end_time < time) {
              jsonRes(ctx, 500, '秒杀结束')
            } else if (goods.start_time > time) {
              jsonRes(ctx, 500, '秒杀未开始')
            } else {
              let goods_stock_key = 'goods_stock:' + goods_id
              redisConn.llen(goods_stock_key, (err, stock) => {
                if (err) {
                  error('[goodsStock Len Error] - ', err)
                } else {
                  // 获取订单
                  let orderno = getOrderNo()
                  let data = {
                    user_id,
                    order_no,
                    goods_id,
                    address,
                    status,
                    amount,
                    ip,
                    express,
                    invoice,
                    message,
                    create_time,
                    update_time
                  }
                  redisConn.lpop(goods_stock_key, (err, ret) => {
                    if (err) {
                      error('[goodsStock Pop Error] - ', err)
                    } else {
                      publishOrderMsg(ctx, data)
                      let resData = {
                        amount,
                        orderno
                      }
                      jsonRes(ctx, 2000, 'ok', resData)
                    }
                  })
                }
              })
            }
          }
        }
      })
    })
  }
}




module.exports = {
  index,
  publishOrderMsg,
  getUserId,
  getOrderNo
}