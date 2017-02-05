const ORM = require('../lib/orm');

class Topic extends ORM {
}

Topic._table = {
  name: 'topics',
  pk: 'id',
  schema: ['id', 'event_id', 'title', 'presentator', 'reference_url', 'time', 'created_by'],
}

module.exports = Topic;
