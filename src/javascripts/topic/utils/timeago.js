var moment = require('moment');

moment.locale('ja', {
  relativeTime : {
    future: "%s後",
    past: "%s前",
    s:  "%d秒",
    m:  "1分",
    mm: "%d分",
    h:  "1時間",
    hh: "%d時間",
    d:  "1日",
    dd: "%d日",
    M:  "1ヶ月",
    MM: "%dヶ月",
    y:  "1年",
    yy: "%d年"
  }
});

module.exports = function(time, suffix) {
  return moment(time).fromNow(suffix);
};
