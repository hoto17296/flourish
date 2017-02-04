const mysql = require('mysql');
const url = process.env.MYSQL_URL || 'mysql://root@localhost/flourish';
module.exports = mysql.createPool(url); // Singleton
