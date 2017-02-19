const router = require('express').Router();
const auth = require('../lib/auth');
const redis = require('../stores/redis');
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

router.socket = function(io) {
  io.of('/topic').on('connection', (socket) => {
    const id = socket.handshake.query.id;
    const user = socket.request.user;

    // Join Room
    const room = '/topic/' + id;
    socket.join(room);

    socket.on('evaluateTopic', (data) => {
      new Promise((resolve, reject) => {
        const key = 'evaluation:' + id;
        const value = parseInt( data.value );
        redis.hset(key, user.id, value, (err, data) => err ? reject(err) : resolve(data));
      })
      .then(() => Promise.resolve( Topic.findWithDetails(id) ))
      .then((topic) => socket.emit('update', topic))
      .catch((err) => { console.error(err); })
    });

  });
};

module.exports = router;
