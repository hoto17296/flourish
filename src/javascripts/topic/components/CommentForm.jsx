var React = require('react');
var TopicActions = require('../actions/TopicActions');

module.exports = React.createClass({

  getInitialState: function() {
    return {
      text: '',
    };
  },

  componentDidMount: function() {
    // 表示したときにフォーカスを合わせる
    this.refs.commentTextarea.getDOMNode().focus();
  },

  onChangeText: function(e) {
    e.preventDefault();
    this.setState({ text: e.target.value });
  },

  onSubmit: function(e) {
    e.preventDefault();
    var text = e.target.text.value.trim();
    var is_question = e.target.is_question.checked;
    if ( text ) {
      TopicActions.comment(text, is_question);
      this.setState({ text: '' });
    }
  },

  render: function() {
    var textareaOpts = {
      name:        'text',
      onChange:    this.onChangeText,
      value:       this.state.text,
      ref:         'commentTextarea',
      placeholder: 'コメント内容を入力してください',
      className: 'form-control',
    };
    return (
      <form onSubmit={this.onSubmit} className='comment-form'>
        <textarea {...textareaOpts} />
        <div className='buttons form-group'>
          <button type='button' onClick={TopicActions.hideCommentForm} className='btn btn-default'>キャンセル</button>
          <input type='submit' value='コメントを投稿' className='btn btn-success' />
          <label className='is_question'>
            <input type='checkbox' name='is_question' defaultChecked={false} />
            質問として投稿する
          </label>
        </div>
      </form>
    );
  }

});
