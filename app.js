const express = require('express');
const mysql = require('mysql');

const app = express();

const db = mysql.createPool( process.env.MYSQL_URL || 'mysql://root@localhost/flourish' );
app.set('db', db);

module.exports = app;
