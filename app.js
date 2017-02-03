const app = require('express')();
const http = require('http').Server(app);

const io = require('socket.io')(http);
app.set('io', io);

const db = require('mysql').createPool( process.env.MYSQL_URL || 'mysql://root@localhost/flourish' );
app.set('db', db);

module.exports = http;
