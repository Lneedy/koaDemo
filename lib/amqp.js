
const amqp = require('amqp')
// rabbitMq
const amqpConn = amqp.createConnection({
  url: 'amqp:guest:guest@127.0.0.1:5672'
})
module.exports = amqpConn
