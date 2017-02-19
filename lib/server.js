const app = require('./app');
const server = require('http').Server(app);
const io = require('./io')(server);

const isProd = process.env.NODE_ENV === 'production';

server.start = function(port) {
  port = port || process.env.PORT;
  server.listen(port, () => {
    if ( isProd ) return;
    const url = 'http://localhost:' + port;
    console.log('flourish server starting on ' + url);
  });
}

module.exports = server;
