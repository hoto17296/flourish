const router = require('express').Router();
const auth = require('../lib/auth');
const Event = require('../models/event');

// イベント詳細画面
router.get('/:id', auth.required, (req, res) => {
  Event.find( req.params.id ).then((event) => {
    res.render('event/show', {
      title: 'トピックリスト',
      event: event,
    });
  }).catch((err) => { throw err; });
});

module.exports = router;
