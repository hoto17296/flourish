const router = require('express').Router();
const auth = require('../lib/auth');

router.get('/', auth.required, (req, res) => {
  res.sendStatus(200);
});

module.exports = router;
