var React = require('react');

var TopicStore = require('../stores/TopicStore');
var TopicActions = require('../actions/TopicActions');

var Comment = require('./Comment.jsx');
var CommentForm = require('./CommentForm.jsx');
var Evaluation = require('./Evaluation.jsx');

module.exports = React.createClass({

  getInitialState: TopicStore.get,

  // Store の変更を監視
  componentDidMount: function() {
    TopicStore.addChangeListener(this._onChange);

    // ソケットの update イベントを監視
    TopicActions.handleUpdate();
  },
  componentWillUnmount: function() {
    TopicStore.removeChangeListener(this._onChange);
  },

  // Store に変更があった時の処理
  _onChange: function() {
    this.setState( TopicStore.get() );
  },

  render: function() {
    var comments = this.state.comments.map(function(comment) {
      return <Comment {...comment} key={comment.id} />;
    });
    if ( comments.length == 0 ) {
      comments = <p className='empty'>このトピックにはまだコメントがありません。</p>;
    }
    if ( this.state.reference_url ) {
      var reference_url = <a className="fa fa-file-text-o" href={this.state.reference_url} target="_blank"></a>;
    }
    var commentForm = this.state.showingCommentForm ? <CommentForm /> : null;
    return (
      <div className='container-fluid'>
        <header>
          <a className='back fa fa-chevron-left' href={'/event/'+this.state.event_id}></a>
          <div className='title'>{this.state.presentator} {reference_url}</div>
          <a className='post fa fa-pencil-square-o' onClick={TopicActions.showCommentForm}></a>
        </header>
        <Evaluation evaluations={this.state.evaluations} />
        {commentForm}
        <div className='comment-list'>
          {comments}
        </div>
      </div>
    );
  }

});
