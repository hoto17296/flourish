const SocketIO = require('socket.io');
const PassportSocketIO = require('passport.socketio');
const CookieParser = require('cookie-parser');
const session = require('express-session');

const SessionStore = require('./SessionStore')(session);

module.exports = function(server) {
  const io = SocketIO(server);

  io.use(PassportSocketIO.authorize({
    cookieParser: CookieParser,
    key: 'session_id',
    secret: process.env.SESSION_SECRET || 'flourish',
    store: SessionStore,
  }));

  return io;
}
