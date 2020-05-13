const redis = require('redis')
const radisClient = redis.createClient('6379', '127.0.0.1')
// redis
module.exports = radisClient