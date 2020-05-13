const hostname = 'http://localhost'
const port = {
  api: '9000',
  default: '3000'
}
const apiUrl = `${hostname}:${port.api}`
const url = `${hostname}:${port.default}`

module.exports = {
  hostname,
  port,
  apiUrl,
  url
}
