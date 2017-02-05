const router = require('express').Router();
const auth = require('../lib/auth');
const Event = require('../models/event');

router.get('/', auth.required, (req, res) => {
  // TODO 初回ログインユーザはプロフィール編集画面へリダイレクト
  Event.all().then((events) => {
    res.render('event/index', {
      title: 'イベント',
      events: events,
    });
  }).catch((err) => { throw err; });
});

module.exports = router;
