const router = require('express').Router();
const passport = require('passport');

router.get('/login', (req, res) => {
  res.render('auth/login', { title: 'ログイン' });
});

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/login');
});

router.get(
  '/auth/google',
  passport.authenticate('google', { scope: [ 'profile', 'email' ] }),
  (req, res) => {}
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { successRedirect: '/', failureRedirect: '/login' })
);

module.exports = router;
