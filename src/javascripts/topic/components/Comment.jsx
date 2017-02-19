var React = require('react');
var TopicActions = require('../actions/TopicActions');
var TopicStore = require('../stores/TopicStore');
var Reply = require('./Reply.jsx');
var ReplyForm = require('./ReplyForm.jsx');
var timeago = require('../utils/timeago');
var text2dom = require('./mixins/text2dom');
var HtmlClassManager = require('html-class-manager');

module.exports = React.createClass({

  mixins: [ text2dom ],

  shoudShowReplyForm: function() {
    return TopicStore.get().replyFormShowingComment == this.props.id;
  },

  showReplyForm: function(e) {
    e.preventDefault();
    TopicActions.showReplyForm( this.props.id );
  },

  toggleLike: function(e) {
    TopicActions.toggleCommentLike( this.props.id );
    e.preventDefault();
  },

  getLikeButtonClasses: function() {
    var classes = 'like-button fa fa-star';
    var uid = document.body.dataset.uid; // TODO このユーザーIDの取得の仕方キモい
    // 既に いいね！ していたら liked クラスを付加する
    if ( this.props.liked_users.indexOf(uid) !== -1 ) {
      classes += ' liked';
    }
    return classes;
  },

  deleteConfirm: function(e) {
    e.preventDefault();
    var result = confirm('コメントに返信された投稿もすべて削除されます。\n本当に削除しますか？');

    if ( result ) {
      TopicActions.deleteComment(this.props.id);
    }
  },

  render: function() {
    var comment = this.props;

    var classes = new HtmlClassManager();
    classes.add('comment panel panel-default');
    if ( comment.is_question ) {
      classes.add('comment-question');
    }

    if ( comment.deleted ) {
      classes.add('comment-deleted');
      return (
        <div className={classes}>
          <div className='panel-body'>
            <p className='text'>このコメントは削除されました</p>
            <footer>
              <div className='info'>
                {comment.created_by_organization} {comment.created_by_name} ({timeago( comment.created_at )})
              </div>
            </footer>
          </div>
        </div>
      );
    }

    var replyForm = this.shoudShowReplyForm() ? <ReplyForm commentId={comment.id} /> : null;
    var replies = comment.replies.map(function(reply) {
      return <Reply {...reply} key={reply.id} />;
    });
    replies = replies.length > 0
      ? <div className='replies panel-body'>{replies}</div>
      : null;

    var deleteButton = null;
    if ( document.body.dataset.uid == comment.created_by ) {
      deleteButton = <a onClick={this.deleteConfirm} className="fa fa-trash-o">削除</a>;
    }

    return (
      <div className={classes}>
        <div className='panel-body'>
          <p className='text'>
            {this.text2dom(comment.text)}
          </p>
          <footer>
            <div className='info'>
              {comment.created_by_organization} {comment.created_by_name} ({timeago( comment.created_at )}) {deleteButton}
            </div>
            <a onClick={this.showReplyForm} className='reply-button fa fa-reply'> 返信する</a>
            <a onClick={this.toggleLike} className={this.getLikeButtonClasses()} title='いいね！'>
              {this.props.liked_users.length}
            </a>
            {replyForm}
          </footer>
        </div>
        {replies}
      </div>
    );
  }

});
