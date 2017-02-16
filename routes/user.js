const router = require('express').Router();
const auth = require('../lib/auth');
const User = require('../models/user');

router.get('/settings', auth.required, (req, res) => {
  User.find( req.user.id ).then((user) => {
    res.render('user/edit', {
      title: 'ユーザー設定',
      user: user,
    });
  }).catch((err) => {
    console.error(err);
    res.sendStatus(500);
  });
});

router.patch('/', auth.required, (req, res) => {
  User.find( req.user.id ).then((user) => {
    user.name         = req.body.name;
    user.organization = req.body.organization;
    user.email        = req.body.email;
    user.notify       = !! req.body.notify;
    return user.update();
  })
  .then((user) => res.redirect('/'))
  .catch((err) => {
    console.error(err);
    res.sendStatus(500);
  });
});

module.exports = router;
