const router = require('express').Router();
const auth = require('../lib/auth');
const Event = require('../models/event');

router.get('/', auth.required, (req, res) => {
  if ( ! req.user.organization ) {
    return res.redirect('/user/settings');
  }
  Event.all().then((events) => {
    res.render('event/index', {
      title: 'イベント',
      events: events,
    });
  }).catch((err) => { throw err; });
});

module.exports = router;
