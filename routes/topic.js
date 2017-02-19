const router = require('express').Router();
const auth = require('../lib/auth');
const Topic = require('../models/Topic');

router.get('/:id', auth.required, (req, res) => {
  Topic.findWithDetails( req.params.id ).then((topic) => {
    res.render('topic/show', {
      title: topic.title,
      topic: topic,
      user: req.user,
    });
  }).catch((err) => {
    console.error(err);
    res.sendStatus(500);
  });
});

module.exports = router;
