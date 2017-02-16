const express = require('express');
const app = express();
const http = require('http').Server(app);

const isProd = process.env.NODE_ENV === 'production';
app.set('isProd', isProd);

const io = require('socket.io')(http);
app.set('io', io);

const db = require('./stores/mysql');
app.set('db', db);

const redis = require('./stores/redis');
app.set('redis', redis);

// override request method with POST having ?_method=DELETE
const methodOverride = require('method-override');
app.use( methodOverride('_method') );

const bodyParser = require('body-parser');
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({ extended: false }) );

const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const sessionStore = new RedisStore({ client: redis });
app.use(session({
  store: sessionStore,
  key: 'session_id',
  secret: process.env.SESSION_SECRET || 'flourish',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

io.use(require('passport.socketio').authorize({
  cookieParser: require('cookie-parser'),
  key: 'session_id',
  secret: process.env.SESSION_SECRET || 'flourish',
  store: sessionStore,
}));

app.set('view engine', 'ejs');

const passport = require('./lib/auth').initPassport();
app.use( passport.initialize() );
app.use( passport.session() );

app.use( express.static('public') );
app.use('/', require('./routes'));
app.use('/', require('./routes/auth'));
app.use('/user', require('./routes/user'));
app.use('/event', require('./routes/event'));
app.use('/topic', require('./routes/topic'));

app.locals.sitename = process.env.SITENAME || 'flourish';
app.locals.moment = require('moment');

const Entities = require('html-entities').XmlEntities;
app.locals.entities = new Entities();

http.start = function(port) {
  port = port || process.env.PORT;
  http.listen(port, () => {
    if ( isProd ) return;
    const url = 'http://localhost:' + port;
    console.log('flourish server starting on ' + url);
  });
}

module.exports = http;
