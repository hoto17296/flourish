var AppDispatcher = require('../dispatcher/AppDispatcher');
var TopicConstants = require('../constants/TopicConstants');
var assign = require('object-assign');
var EventEmitter = require('events').EventEmitter;
var Entities = require('html-entities').XmlEntities;
var entities = new Entities();

var CHANGE_EVENT = 'change';

var _states = JSON.parse(entities.decode( document.getElementById('content-data').textContent ));

var Store = assign({}, EventEmitter.prototype, {

  get: function() {
    return _states;
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  }

});

AppDispatcher.register(function(action) {
  switch(action.actionType) {

    case TopicConstants.UPDATE_TOPIC:
      _states = assign(_states, action.topic);
      Store.emitChange();
      break;

    case TopicConstants.SHOW_COMMENT_FORM:
      _states.showingCommentForm = true;
      Store.emitChange();
      break;

    case TopicConstants.HIDE_COMMENT_FORM:
      _states.showingCommentForm = false;
      Store.emitChange();
      break;

    case TopicConstants.SHOW_REPLY_FORM:
      _states.replyFormShowingComment = action.commentId;
      _states.replyFormValue = '';
      Store.emitChange();
      break;

    case TopicConstants.UPDATE_REPLY_FORM:
      _states.replyFormValue = action.value;
      Store.emitChange();
      break;
  }
});

module.exports = Store;
