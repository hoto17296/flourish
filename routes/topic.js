const router = require('express').Router();
const auth = require('../lib/auth');
const Topic = require('../models/topic');

router.get('/:id', auth.required, (req, res) => {
  Topic.find( req.params.id ).then((topic) => {
    return topic.fetchComments()
      .then(() => topic.fetchEvaluations())
      .then(() => Promise.resolve(topic));
  }).then((topic) => {
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
