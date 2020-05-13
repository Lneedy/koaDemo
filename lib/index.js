const jsonRes = (ctx, status, message, data) => {
  ctx.body = {status, message, data}
}
const log = console.log
const info = console.info
const error = console.error
module.exports = {
  jsonRes,
  log,
  info,
  error
}