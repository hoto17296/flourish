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
}

Comment.prototype._table = {
  name: 'comments',
  pk: 'id',
  schema: ['id', 'topic_id', 'text', 'is_question', 'created_by'],
}

module.exports = Comment;
