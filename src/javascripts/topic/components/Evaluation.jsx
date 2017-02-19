var React = require('react');

var TopicStore = require('../stores/TopicStore');
var TopicActions = require('../actions/TopicActions');

module.exports = React.createClass({

  renderStars: function() {
    var uid = window.current_user_id;
    var evaluated = this.props.evaluations[uid] !== undefined;
    var value = evaluated ? this.props.evaluations[uid] : null;
    var stars = [];
    for (var i=0; i<10; i++) {
      var icon = ( evaluated && i <= value ) ? 'fa-star' : 'fa-star-o';
      var params = {
        className: 'evalStar fa ' + icon,
        onClick: this.evaluate,
        'data-val': i,
        key: i,
      };
      stars.push(<a {...params} />);
    }
    return stars;
  },

  evaluate: function(e) {
    e.preventDefault();
    TopicActions.evaluate( e.target.dataset.val );
  },

  render: function() {
    return (
      <div className='evaluation'>
        この発表に対して10段階評価をお願いします。
        <div className='evalStars'>
          {this.renderStars()}
        </div>
      </div>
    );
  }

});
