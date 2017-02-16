const express = require('express');
const app = express();

// override request method with POST having ?_method=DELETE
const methodOverride = require('method-override');
app.use( methodOverride('_method') );

const bodyParser = require('body-parser');
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({ extended: false }) );

const session = require('express-session');
const SessionStore = require('./lib/SessionStore')(session);
app.use(session({
  store: SessionStore,
  key: 'session_id',
  secret: process.env.SESSION_SECRET || 'flourish',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
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

module.exports = app;
