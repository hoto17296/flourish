const router = require('express').Router();
const auth = require('../lib/auth');
const Event = require('../models/Event');
const Topic = require('../models/Topic');

router.get('/new', auth.required, (req, res) => {
  res.render('event/new', {
    title: 'イベント作成',
  });
});

router.post('/', auth.required, (req, res) => {
  const params = {
    title:       req.body.title,
    convened_at: req.body.convened,
    created_by:  req.user.id,
    topics: [],
  };

  for ( let i = 0; i < 30; i++) {
    let topic = {
      title:         req.body['title' + i],
      presentator:   req.body['presentator' + i],
      time:          req.body['time' + i],
      reference_url: req.body['reference_url' + i],
      created_by:    req.user.id,
    };
    if ( topic.presentator || topic.title ) params.topics.push(topic);
  }

  Event.create(params)
    .then((event) => res.redirect('/event/' + event.id))
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});

router.get('/:id/edit', auth.required, (req, res) => {
  Event.find( req.params.id ).then((event) => {
    res.render('event/edit', {
      title: 'イベントの編集',
      event: event,
    });
  }).catch((err) => {
    console.error(err);
    res.sendStatus(500);
  });
});

router.patch('/:id', auth.required, (req, res) => {
  Event.find(req.params.id).then((event) => {
    event.title       = req.body.title;
    event.convened_at = req.body.convened;
    return event.update().then((event) => {
      const promises = [];
      for ( let i = 0; i < 30; i++ ) {
        let topic = {
          id:            req.body['topic_id' + i],
          event_id:      event.id,
          presentator:   req.body['presentator' + i],
          title:         req.body['title' + i],
          time:          req.body['time' + i],
          reference_url: req.body['reference_url' + i],
          deleted:       req.body['delete' + i],
        };
        if ( ! topic.id && ! topic.title && ! topic.presentator ) continue;
        if ( topic.id ) {
          topic = new Topic(topic);
          promises.push( topic.deleted == 1 ? topic.delete() : topic.update() );
        }
        else {
          topic.created_by = req.user.id;
          promises.push( Topic.create(topic) );
        }
      }
      return Promise.all(promises).then((topics) => {
        event.topics = topics;
        return Promise.resolve(event);
      });
    });
  })
  .then((event) => res.redirect('/event/' + event.id))
  .catch((err) => {
    console.error(err);
    res.sendStatus(500);
  });
});

router.delete('/:id', auth.required, (req, res) => {
  Event.find( req.params.id )
    .then((event) => event.delete())
    .then(() => res.redirect('/'))
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
});

router.get('/:id', auth.required, (req, res) => {
  Event.find( req.params.id ).then((event) => {
    res.render('event/show', {
      title: 'トピック一覧',
      event: event,
    });
  }).catch((err) => {
    console.error(err);
    res.sendStatus(500);
  });
});

router.get('/:id/evaluations', auth.required, (req, res) => {
  Event.find( req.params.id ).then((event) => {
    return Promise
      .all( event.topics.map((topic) => topic.fetchEvaluations()) )
      .then(() => Promise.resolve(event));
  }).then((event) => {
    res.render('event/evaluations', {
      title: '集計結果',
      event: event,
    });
  }).catch((err) => {
    console.error(err);
    res.sendStatus(500);
  });
});

module.exports = router;
