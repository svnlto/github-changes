var getAllCommits = require('./getAllCommits');
var getPullRequests = require('./getPullRequests');

module.exports = function (self, opts) {

  if (opts.data === 'commits') {
    return getAllCommits.call(this, opts);
  }

  return getPullRequests.call(this, self, opts);
};

