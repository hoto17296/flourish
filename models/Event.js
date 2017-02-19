const ORM = require('../lib/ORM');
const Topic = require('./Topic');

class Event extends ORM {
  static findBy(key, val) {
    return super.findBy(key, val).then((event) => {
      if ( ! event ) return Promise.resolve(event);
      return Topic.findAllBy('event_id', event.id).then((topics) => {
        event.topics = topics;
        return Promise.resolve(event);
      });
    });
  }

  static create(params) {
    return super.create(params).then((event) => {
      if ( ! params.topics ) return Promise.resolve(event);
      params.topics.forEach((topic) => topic.event_id = event.id);
      return Promise.all( params.topics.map( Topic.create.bind(Topic) ) ).then((topics) => {
        event.topics = topics;
        return Promise.resolve(event);
      });
    });
  }
}

Event.prototype._table = {
  name: 'events',
  pk: 'id',
  schema: ['id', 'title', 'convened_at', 'created_by'],
}

module.exports = Event;
