const router = require('express').Router();
const auth = require('../lib/auth');
const Topic = require('../models/Topic');
const Comment = require('../models/Comment');
const Reply = require('../models/Reply');

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

    function broadcastTopicUpdate() {
      return Topic.findWithDetails(id).then((topic) => io.to(room).emit('update', topic));
    }

    function handleError(err) {
      console.error(err);
    }

    socket.on('evaluateTopic', (data) => {
      Topic.find(id)
        .then((topic) => topic.evaluate(data.value, user.id))
        .then(() => Topic.findWithDetails(id))
        .then((topic) => socket.emit('update', topic))
        .catch(handleError);
    });

    socket.on('saveComment', (data) => {
      Topic.find(id)
        .then((topic) => topic.comment(data.text, user.id, data.is_question))
        .then(broadcastTopicUpdate)
        .catch(handleError);
    });

    socket.on('deleteComment', (data) => {
      Comment.find( data.commentId )
        .then((comment) => comment.delete())
        .then(broadcastTopicUpdate)
        .catch(handleError);
    });

    socket.on('saveReply', (data) => {
      Comment.find( data.comment_id )
        .then((comment) => comment.reply(data.text, user.id))
        .then(broadcastTopicUpdate)
        .catch(handleError);
    });

    socket.on('toggleCommentLike', (data) => {
      Comment.find( data.comment_id )
        .then((comment) => comment.toggleLike( user.id ))
        .then(broadcastTopicUpdate)
        .catch(handleError);
    });

    socket.on('toggleReplyLike', (data) => {
      Reply.find( data.reply_id )
        .then((reply) => reply.toggleLike( user.id ))
        .then(broadcastTopicUpdate)
        .catch(handleError);
    });

    socket.on('deleteReply', (data) => {
      Reply.find( data.replyId )
        .then((reply) => reply.delete())
        .then(broadcastTopicUpdate)
        .catch(handleError);
    });

  });
};

module.exports = router;
