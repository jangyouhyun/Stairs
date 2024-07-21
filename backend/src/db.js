const mysql = require('mysql');
const pool = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'stair',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;