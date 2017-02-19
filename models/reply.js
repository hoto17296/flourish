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
}

Reply.prototype._table = {
  name: 'replies',
  pk: 'id',
  schema: ['id', 'comment_id', 'text', 'created_by'],
}

module.exports = Reply;
