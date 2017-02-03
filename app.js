const app = require('express')();
const http = require('http').Server(app);

const io = require('socket.io')(http);
app.set('io', io);

const db = require('mysql').createPool( process.env.MYSQL_URL || 'mysql://root@localhost/flourish' );
app.set('db', db);

const redis = require('redis').createClient( process.env.REDIS_URL );
app.set('redis', redis);

const session = require('express-session');
const RedisStore = require('connect-redis')(session);
app.use(session({
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET || 'flourish',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true },
}));

module.exports = http;
