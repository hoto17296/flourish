const ORM = require('../lib/ORM');
const redis = require('../stores/redis');

class Reply extends ORM {
  fetchLikes() {
    return new Promise((resolve, reject) => {
      redis.smembers('like:reply:' + this.id, (err, data) => {
        if (err) return reject(err);
        this.liked_users = data;
        resolve(this);
      });
    });
  }

  toggleLike(userId) {
    return new Promise((resolve, reject) => {
      const key = 'like:reply:' + this.id;
      redis.sismember(key, userId, (err, isMember) => {
        isMember
          ? redis.srem(key, userId, (err) => err ? reject(err) : resolve())
          : redis.sadd(key, userId, (err) => err ? reject(err) : resolve());
      });
    })
  }
}

Reply.prototype._table = {
  name: 'replies',
  pk: 'id',
  schema: ['id', 'comment_id', 'text', 'created_by'],
}

module.exports = Reply;
