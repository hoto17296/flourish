var AppDispatcher = require('../dispatcher/AppDispatcher');
var TopicConstants = require('../constants/TopicConstants');
var TopicStore = require('../stores/TopicStore');

module.exports = {

  // ソケットの update イベントを受け取ってトピックを更新する
  handleUpdate: function() {
    window.socket.on('update', function(data) {
      AppDispatcher.dispatch({
        actionType: TopicConstants.UPDATE_TOPIC,
        topic: data,
      });
    });
  },

  showCommentForm: function() {
    AppDispatcher.dispatch({
      actionType: TopicConstants.SHOW_COMMENT_FORM,
    });
  },

  hideCommentForm: function() {
    AppDispatcher.dispatch({
      actionType: TopicConstants.HIDE_COMMENT_FORM,
    });
  },

  comment: function(text, is_question) {
    AppDispatcher.dispatch({
      actionType: TopicConstants.HIDE_COMMENT_FORM,
    });
    window.socket.emit('saveComment', { text: text, is_question: is_question });
  },

  deleteComment: function(commentId) {
    window.socket.emit('deleteComment', { commentId: commentId });
  },

  showReplyForm: function(commentId) {
    AppDispatcher.dispatch({
      actionType: TopicConstants.SHOW_REPLY_FORM,
      commentId: commentId,
    });
  },

  hideReplyForm: function() {
    AppDispatcher.dispatch({
      actionType: TopicConstants.SHOW_REPLY_FORM,
      commentId: null,
    });
  },

  updateReplyForm: function(value) {
    AppDispatcher.dispatch({
      actionType: TopicConstants.UPDATE_REPLY_FORM,
      value: value,
    });
  },

  reply: function(commentId, text) {
    var params = { comment_id: commentId, text: text };
    window.socket.emit('saveReply', params);
  },

  toggleCommentLike: function(commentId) {
    window.socket.emit('toggleCommentLike', { comment_id: commentId });
  },

  toggleReplyLike: function(replyId) {
    window.socket.emit('toggleReplyLike', { reply_id: replyId });
  },

  evaluate: function(value) {
    var currentValue = TopicStore.get().evaluations[ window.current_user_id ];
    window.socket.emit('evaluateTopic', { value: value });
    // 最初に評価したときにコメントフォームを表示する
    if ( currentValue === undefined ) {
      this.showCommentForm();
    }
  },

  deleteReply: function(replyId) {
    window.socket.emit('deleteReply', { replyId: replyId });
  },

};
