const ORM = require('../lib/orm');
const Topic = require('./topic');

class Event extends ORM {
  static findBy(key, val) {
    return new Promise((resolve, reject) => {
      super.findBy(key, val).then((event) => {
        if ( ! event ) return resolve(event);
        Topic.findAllBy('event_id', event.id).then((topics) => {
          event.topics = topics;
          resolve(event);
        }).catch(reject);
      }).catch(reject);
    });
  }
}

Event._table = {
  name: 'events',
  pk: 'id',
}

module.exports = Event;
