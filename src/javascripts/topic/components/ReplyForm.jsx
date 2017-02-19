var React = require('react');
var TopicActions = require('../actions/TopicActions');
var TopicStore = require('../stores/TopicStore');

module.exports = React.createClass({

  componentDidMount: function() {
    this.refs.replyTextarea.getDOMNode().focus();
  },

  hideForm: function(e) {
    e.preventDefault();
    TopicActions.hideReplyForm();
  },

  onChange: function(e) {
    TopicActions.updateReplyForm( e.target.value );
  },

  onSubmit: function(e) {
    e.preventDefault();
    var text = e.target.text.value.trim();
    if ( text ) {
      TopicActions.reply( this.props.commentId, text );
      TopicActions.hideReplyForm();
    }
  },

  render: function() {
    var textareaOpts = {
      name:        'text',
      onChange:    this.onChange,
      value:       TopicStore.get().replyFormValue,
      ref:         'replyTextarea',
      placeholder: '返信内容を入力してください',
      className:   'form-control',
    };
    return (
      <form onSubmit={this.onSubmit} className='reply-form'>
        <div className='form-group'>
          <textarea {...textareaOpts} />
        </div>
        <div className='form-group'>
          <button type='button' onClick={this.hideForm} className='btn btn-default'>キャンセル</button>
          <input type='submit' value='返信を投稿' className='btn btn-success' />
        </div>
      </form>
    );
  }

});
