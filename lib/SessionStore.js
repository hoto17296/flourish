const redis = require('../stores/redis');

module.exports = function(session) {
  const RedisStore = require('connect-redis')(session);
  return new RedisStore({ client: redis });
};
