var moment = require('moment');
var currentDate = moment();

var _ = require('lodash');

module.exports = function (opts, sortedTags, data) {

  var date = null;
  var current = null;

  if (opts.data === 'commits') {
    date = moment(data.commit.committer.date);
  } else {
    date = moment(data.merged_at);
  }

  _.each(sortedTags, function (item, index) {
    var tag = sortedTags[index];

    if (tag.date < date) {
      return;
    }

    current = tag;
  });


  if (!current) {
    current = {
      name: opts['tag-name'],
      date: currentDate
    };
  }

  return current;
};

