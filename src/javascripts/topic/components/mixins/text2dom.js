/**
 * テキストをブラウザでいい感じに表示できるように変換する React mixin
 * ・ 改行文字を <br/> に置換
 * ・ URL にリンクを貼る
 */
var nl2br = require('react-nl2br');
var autolink = require('react-autolink');

module.exports = {

  mixins: [ autolink ],

  text2dom: function(text) {
    var dom = nl2br(text).map(function(line) {
      return ( typeof line == "string" || line instanceof String )
        ? this.autolink(line, { target: '_blank', rel: 'nofollow' })
        : line;
    }, this);
    return Array.prototype.concat.apply([], dom); // flatten
  },

};
