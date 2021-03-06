const ORM = require('../lib/ORM');
const redis = require('../stores/redis');
const Comment = require('./Comment');

class Topic extends ORM {
  static findWithDetails(id) {
    return this.find(id).then((topic) => {
      return topic.fetchComments()
        .then(() => topic.fetchEvaluations())
        .then(() => Promise.resolve(topic));
    });
  }

  fetchComments() {
    return Comment.findAllBy('topic_id', this.id).then((comments) => {
      this.comments = comments;
      return Promise.resolve(this);
    });
  }

  fetchEvaluations() {
    return new Promise((resolve, reject) => {
      redis.hgetall('evaluation:' + this.id, (err, rawData) => {
        if (err) return reject(err);
        rawData = rawData || {};
        const data = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
        var length = 0;
        var total = 0;
        for ( let i in rawData ) {
          let val = ~~rawData[i] + 1; // 最小値を 1 にするために 1 増やす
          data[ val - 1 ]++;
          length++;
          total += val;
        }
        this.evaluations = {
          raw: rawData,
          data: data,
          length: length,
          average: length !== 0 ? total / length : null,
        };
        resolve(this);
      });
    });
  }

  evaluate(value, userId) {
    return new Promise((resolve, reject) => {
      const key = 'evaluation:' + this.id;
      redis.hset(key, userId, ~~value, (err, data) => err ? reject(err) : resolve(data));
    })
  }

  comment(text, userId, isQuestion) {
    return Comment.create({
      topic_id: this.id,
      text: text,
      created_by: userId,
      is_question: !! isQuestion,
    });
  }
}

Topic.prototype._table = {
  name: 'topics',
  pk: 'id',
  schema: ['id', 'event_id', 'title', 'presentator', 'reference_url', 'time', 'created_by'],
}

module.exports = Topic;
