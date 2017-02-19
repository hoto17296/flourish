var React = require('react');
var TopicActions = require('../actions/TopicActions');
var timeago = require('../utils/timeago');
var text2dom = require('./mixins/text2dom');

module.exports = React.createClass({

  mixins: [ text2dom ],

  toggleLike: function(e) {
    TopicActions.toggleReplyLike( this.props.id );
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
    var result = confirm('返信を削除しますか？');

    if ( result ) {
      TopicActions.deleteReply(this.props.id);
    }
  },

  render: function() {
    var reply = this.props;

    if ( reply.deleted ) {
      return (
        <div className='reply reply-deleted'>
          <p className='text'>
            この返信は削除されました
          </p>
          <footer>
            <div className='info'>
              {reply.created_by_organization} {reply.created_by_name} ({timeago( reply.created_at )})
            </div>
          </footer>
        </div>
      );
    }

    var deleteButton = null;
    if ( document.body.dataset.uid == reply.created_by ) {
      deleteButton =  <a onClick={this.deleteConfirm} className="fa fa-trash-o">削除</a>;
    }

    return (
      <div className='reply'>
        <p className='text'>
          {this.text2dom(reply.text)}
        </p>
        <footer>
          <div className='info'>
            {reply.created_by_organization} {reply.created_by_name} ({timeago( reply.created_at )}) {deleteButton}
          </div>
          <a onClick={this.toggleLike} className={this.getLikeButtonClasses()} title='いいね！'>
            {this.props.liked_users.length}
          </a>
        </footer>
      </div>
    );
  }

});
