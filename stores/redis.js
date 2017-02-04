const redis = require('redis');
const url = process.env.REDIS_URL;
module.exports = redis.createClient(url); // Singleton
