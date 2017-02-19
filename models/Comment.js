const ORM = require('../lib/ORM');
const mysql = require('../stores/mysql');
const redis = require('../stores/redis');
const Reply = require('./Reply');

class Comment extends ORM {
  static findAllBy(key, val) {
    // fetch all comments. (contains deleted comments)
    return new Promise((resolve, reject) => {
      const sql = 'SELECT c.*, u.name AS created_by_name, u.organization AS created_by_organization'
        + ' FROM ?? AS c JOIN users AS u ON u.id = c.created_by'
        + ' WHERE ?? = ? ORDER BY created_at DESC';
      mysql.query(sql, [ this.prototype._table.name, key, val ], (err, results) => {
        if (err) return reject(err);
        const comments = results.map((result) => {
          const comment = new this(result);
          comment.is_question = !! comment.is_question;
          comment.replies = [];
          comment.user = {
            name: result.created_by_name,
            organization: result.created_by_organization,
          }
          return comment;
        });
        resolve(comments);
      });
    })
    // fetch comment likes.
    .then((comments) => Promise.all(comments.map((comment) => comment.fetchLikes())))
    // fetch all replies without N+1 query.
    .then((comments) => {
      return new Promise((resolve, reject) => {
        if ( comments.length === 0 ) return resolve([]);
        const ids = comments.map((comment) => comment.id);
        const sql = 'SELECT r.*, u.name AS created_by_name, u.organization AS created_by_organization'
          + ' FROM ?? AS r JOIN users AS u ON u.id = r.created_by'
          + ' WHERE comment_id IN (?) ORDER BY created_at DESC';
        mysql.query(sql, [ Reply.prototype._table.name, ids ], (err, results) => {
          if (err) return reject(err);
          const replies = results.map((result) => {
            const reply = new Reply(result);
            reply.user = {
              name: result.created_by_name,
              organization: result.created_by_organization,
            }
            return reply;
          });
          resolve(replies);
        });
      })
      .then((replies) => Promise.all( replies.map((reply) => reply.fetchLikes()) ))
      .then((replies) => {
        replies.forEach((reply) => {
          const comment = comments.filter((c) => c.id == reply.comment_id)[0];
          if ( ! comment ) throw new Error();
          comment.replies.push(reply);
        });
        return Promise.resolve(comments);
      });
    });
  }

  fetchLikes() {
    return new Promise((resolve, reject) => {
      redis.smembers('like:comment:' + this.id, (err, data) => {
        if (err) return reject(err);
        this.liked_users = data;
        resolve(this);
      });
    });
  }

  reply(text, userId) {
    return Reply
      .create({ comment_id: this.id, text: text, created_by: userId })
      .then((reply) => this._sendReplyNotification(reply));
  }

  _sendReplyNotification(reply) {
    const topic_url = URL_BASE + '/topic/' + this.topic_id;
    // コメントしたユーザにメール通知を送る
    if ( this.created_by != reply.created_by ) {
      return User.find( this.created_by ).then((user) => {
        if ( ! user.email || ! user.notify ) return Promise.resolve();
        const message = "あなたのコメントに返信がありました。\n" + topic_url;
        return sendMail(message, user.email);
      });
    }
    // コメントに返信したユーザにメール通知を送る
    return Reply.findAllBy('comment_id', this.id).then((replies) => {
      const userIds = replies
        .filter((reply) => ! reply.deleted) // 削除された返信には通知しない
        .map((reply) => reply.created_by) // 返信のユーザ ID のみを取り出す
        .filter((x, i, self) => self.indexOf(x) === i) // 同じユーザに重複して送らない
        .filter((id) => id != reply.created_by) // 投稿者自身には送らない
        .filter((id) => id != this.created_by); // コメント投稿者には送らない
      return Promise.all(userIds.map((id) => {
        return User.find(id).then((user) => {
          if ( ! user.email || ! user.notify ) return Promise.resolve();
          const message = "あなたが返信したコメントに返信がありました。\n" + topic_url;
          return this._sendMail(message, user.email);
        });
      }));
    })
  }

  _sendMail(message, email) {
    return Promise.resolve(); // TODO
  }

  toggleLike(userId) {
    return new Promise((resolve, reject) => {
      const key = 'like:comment:' + this.id;
      redis.sismember(key, userId, (err, isMember) => {
        isMember
          ? redis.srem(key, userId, (err) => err ? reject(err) : resolve())
          : redis.sadd(key, userId, (err) => err ? reject(err) : resolve());
      });
    })
  }
}

Comment.prototype._table = {
  name: 'comments',
  pk: 'id',
  schema: ['id', 'topic_id', 'text', 'is_question', 'created_by'],
}

module.exports = Comment;
