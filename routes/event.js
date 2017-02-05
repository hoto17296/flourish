const router = require('express').Router();
const auth = require('../lib/auth');
const Event = require('../models/event');

// イベント作成画面
router.get('/new', auth.required, (req, res) => {
  res.render('event/new', {
    title: 'イベント作成',
  });
});

// イベント作成実行
router.post('/new', auth.required, (req, res) => {
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

// イベント詳細画面
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


module.exports = router;
