

const mysql = require('mysql')
// mysql
const mysqlConn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'order'
})

module.exports = mysqlConn