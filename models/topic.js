const ORM = require('../lib/orm');

class Topic extends ORM {
}

Topic._table = {
  name: 'topics',
  pk: 'id',
}

module.exports = Topic;
