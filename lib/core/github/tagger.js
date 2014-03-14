var moment = require('moment');
var currentDate = moment();

module.exports = function (opts, sortedTags, data) {

  var date = null;
  var current = null;

  if (opts.data === 'commits') {
    date = moment(data.commit.committer.date);
  } else {
    date = moment(data.merged_at);
  }

  for (var i = 0, len = sortedTags.length; i < len; i++) {
    var tag = sortedTags[i];

    if (tag.date < date) {
      break;
    }

    current = tag;
  }

  if (!current) {
    current = {
      name: opts['tag-name'],
      date: currentDate
    };
  }

  return current;
};

