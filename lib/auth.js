const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const mysql = require('../stores/mysql');
const User = require('../models/user');

function initPassport() {
  passport.serializeUser((req, id, done) => done(null, id));

  passport.deserializeUser((req, id, done) => {
    User.find(id).then((user) => done(null, user)).catch(done);
  });

  const strategyOpts = {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL,
  };
  passport.use( new GoogleStrategy(strategyOpts, onVerified) );

  return passport;
}

function onVerified(accessToken, refreshToken, profile, done) {
  const params = {
    uid:   profile.id,
    name:  profile.displayName,
    email: profile.emails[0].value,
  };

  // TODO ドメイン制限

  User.findBy('uid', params.uid)
    .then((user) => user ? user : User.create(params))
    .then((user) => done(null, user.id))
    .catch((err) => done(err));
};

// express middleware
function authRequired(req, res, next) {
  req.isAuthenticated() ? next() : res.redirect('/login');
}

module.exports = {
  initPassport: initPassport,
  required: authRequired,
};
